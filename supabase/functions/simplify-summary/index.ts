// Supabase Edge Function: simplify-summary
// Returns cached ai_simplified_summary if present; otherwise calls Gemini, saves to DB, returns.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_15_FLASH = "gemini-1.5-flash";
const SIMPLIFY_SYSTEM_PROMPT =
  "You are a helpful teacher. Take this intellectual editorial summary and explain it like I am 5 years old. Use 3 simple bullet points. Avoid jargon. Total word count must be under 50 words.";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizeToBullets(raw: string): string {
  const lines = raw
    .trim()
    .split(/\n+/)
    .map((line) => line.replace(/^[\s\-*•·]+\s*/, "").trim())
    .filter((line) => line.length > 0);
  const bullets = lines.slice(0, 3).map((line) => `• ${line}`);
  return bullets.join("\n");
}

async function callGeminiSimplify(apiKey: string, aiSummary: string): Promise<string> {
  const trimmed = (aiSummary ?? "").trim();
  if (!trimmed) return "";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_15_FLASH}:generateContent?key=${apiKey}`;
  const body = {
    systemInstruction: { parts: [{ text: SIMPLIFY_SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: trimmed }] }],
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
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  return normalizeToBullets(text);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: "Missing GEMINI_API_KEY or Supabase env" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let articleId: string;
  try {
    const body = await req.json() as { articleId?: string };
    articleId = body?.articleId;
    if (!articleId || typeof articleId !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid articleId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: article, error: fetchError } = await supabase
    .from("articles")
    .select("ai_summary, ai_simplified_summary")
    .eq("id", articleId)
    .single();

  if (fetchError || !article) {
    return new Response(
      JSON.stringify({ error: "Article not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const existing = (article as { ai_simplified_summary?: string | null }).ai_simplified_summary;
  if (existing && existing.trim()) {
    return new Response(
      JSON.stringify({ simplified: existing.trim() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const aiSummary = (article as { ai_summary?: string | null }).ai_summary;
  if (!aiSummary || !aiSummary.trim()) {
    return new Response(
      JSON.stringify({ error: "Article has no summary to simplify" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let simplified: string;
  try {
    simplified = await callGeminiSimplify(apiKey, aiSummary);
  } catch (e) {
    console.error("Gemini simplify error:", e);
    return new Response(
      JSON.stringify({ error: "AI simplification failed" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  await supabase
    .from("articles")
    .update({ ai_simplified_summary: simplified })
    .eq("id", articleId);

  return new Response(
    JSON.stringify({ simplified }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
