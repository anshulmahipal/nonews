// Supabase Edge Function: ai-processor
// Fetches pending articles, summarizes with Gemini 1.5 Flash (save_to_db tool), updates DB.
// Sends push notification when Morning Edition is ready.
// 4-second delay between Gemini calls for Free Tier RPM limit.

import { createClient } from "@supabase/supabase-js";
import { sendPushNotifications } from "./NotificationService.ts";

const GEMINI_MODEL = "gemini-2.5-flash";
const DELAY_MS = 4000;
const STANCE_VALUES = ["Supportive", "Critical", "Neutral", "Sarcastic", "Balanced"] as const;

const SYSTEM_INSTRUCTION =
  "You are a master editorial analyst. Summarize this text in exactly 80 words. Identify the author's stance as [Supportive, Critical, Neutral, Sarcastic, or Balanced]. Output ONLY valid JSON using the save_to_db function.";

const SAVE_TO_DB_SCHEMA = {
  name: "save_to_db",
  description: "Save the 80-word summary and author stance to the database.",
  parameters: {
    type: "object",
    properties: {
      summary: { type: "string", description: "Exactly 80 words summary of the article." },
      stance: {
        type: "string",
        enum: [...STANCE_VALUES],
        description: "Author stance: Supportive, Critical, Neutral, Sarcastic, or Balanced.",
      },
    },
    required: ["summary", "stance"],
  },
};

interface PendingArticle {
  id: string;
  raw_content: string | null;
  title: string;
  author: string | null;
}

interface SaveToDbArgs {
  summary: string;
  stance: string;
}

function normalizeAuthorName(name: string | null | undefined): string | null {
  if (!name || typeof name !== "string") return null;
  const trimmed = name.trim();
  return trimmed || null;
}

async function getOrCreateAuthor(
  supabase: ReturnType<typeof createClient>,
  authorName: string
): Promise<string | null> {
  const name = authorName.trim();
  if (!name) return null;

  const { data: existing } = await supabase
    .from("authors")
    .select("id")
    .eq("name", name)
    .single();

  if (existing?.id) return existing.id;

  const { data: inserted, error } = await supabase
    .from("authors")
    .insert({ name })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: retry } = await supabase
        .from("authors")
        .select("id")
        .eq("name", name)
        .single();
      return retry?.id ?? null;
    }
    console.error(`Failed to create author "${name}":`, error.message);
    return null;
  }
  return inserted?.id ?? null;
}

function cleanRawContent(raw: string | null): string {
  if (!raw || typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(apiKey: string, rawContent: string): Promise<SaveToDbArgs | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [{ role: "user", parts: [{ text: cleanRawContent(rawContent) || "No content." }] }],
    tools: [{ functionDeclarations: [SAVE_TO_DB_SCHEMA] }],
    toolConfig: {
      functionCallingConfig: {
        mode: "ANY",
        allowedFunctionNames: ["save_to_db"],
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          functionCall?: { name: string; args?: Record<string, unknown> };
          function_call?: { name: string; args?: Record<string, unknown> };
        }>;
      };
    };
  };

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const fnPart = parts.find(
    (p) => (p.functionCall ?? p.function_call)?.name === "save_to_db"
  );
  const fnCall = fnPart?.functionCall ?? fnPart?.function_call;
  const args = fnCall?.args as SaveToDbArgs | undefined;
  if (!args?.summary || !args?.stance) return null;

  const stance = String(args.stance);
  if (!STANCE_VALUES.includes(stance as (typeof STANCE_VALUES)[number])) {
    throw new Error(`Invalid stance: ${stance}`);
  }
  return { summary: String(args.summary).trim(), stance };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: "Missing GEMINI_API_KEY or Supabase env" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: pendingArticles, error: fetchError } = await supabase
    .from("articles")
    .select("id, raw_content, title, author")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (fetchError) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch pending articles", details: fetchError.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const list = (pendingArticles ?? []) as PendingArticle[];
  let completed = 0;
  let failed = 0;

  for (let i = 0; i < list.length; i++) {
    if (i > 0) await delay(DELAY_MS);

    const row = list[i];
    try {
      const result = await callGemini(apiKey, row.raw_content);
      if (!result) {
        await supabase
          .from("articles")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", row.id);
        failed++;
        continue;
      }

      let authorId: string | null = null;
      const authorName = normalizeAuthorName(row.author);
      if (authorName) {
        authorId = await getOrCreateAuthor(supabase, authorName);
      }

      const updatePayload: Record<string, unknown> = {
        ai_summary: result.summary,
        ai_stance: result.stance,
        status: "completed",
        updated_at: new Date().toISOString(),
      };
      if (authorId) updatePayload.author_id = authorId;

      const { error: updateError } = await supabase
        .from("articles")
        .update(updatePayload)
        .eq("id", row.id);

      if (updateError) {
        await supabase
          .from("articles")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", row.id);
        failed++;
      } else {
        completed++;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`Article ${row.id}: ${message}`);
      await supabase
        .from("articles")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", row.id);
      failed++;
    }
  }

  // Morning Edition ready: send push notification to all registered tokens
  let pushSent = 0;
  if (completed > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("expo_push_token");
    const tokens = (profiles ?? [])
      .map((p: { expo_push_token: string }) => p.expo_push_token)
      .filter(Boolean);

    // Get highest-ranking article (first by published_at desc) for deep link
    const today = new Date().toISOString().split("T")[0];
    const { data: topArticles } = await supabase
      .from("articles")
      .select("id")
      .eq("processed_date", today)
      .eq("status", "completed")
      .order("published_at", { ascending: false })
      .limit(1);
    const topArticleId = (topArticles ?? [])[0]?.id;

    const notification = {
      title: "🗞️ Your Morning Brief is Ready",
      body: "We've summarized today's top 5 editorials for you. Tap to read.",
      ...(topArticleId && { data: { articleId: topArticleId } }),
    };

    if (tokens.length > 0) {
      const { sent, errors } = await sendPushNotifications(tokens, notification);
      pushSent = sent;
      if (errors.length > 0) {
        console.error("Push notification errors:", errors);
      }
    }
  }

  return new Response(
    JSON.stringify({
      processed: list.length,
      completed,
      failed,
      pushSent,
      message: `Processed ${list.length} pending articles: ${completed} completed, ${failed} failed. Push notifications sent: ${pushSent}.`,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
