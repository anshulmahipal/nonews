const RANDOM_SHORT_CODE_LENGTH = 7;
const MAX_RANDOM_SHORT_CODE_ATTEMPTS = 12;
const SHORT_CODE_ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const UUID_PREFIX_PATTERN = /^[0-9a-f]{8}$/i;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvokeBody {
  limit?: number;
}

interface ArticleRow {
  id: string;
  short_code: string | null;
}

interface SupabaseErrorPayload {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeShortCode(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function preferredShortCodeCandidates(articleId: string): string[] {
  const compactId = articleId.replace(/-/g, "").toLowerCase();
  const [firstSegment = ""] = articleId.split("-");
  const candidates = UUID_PREFIX_PATTERN.test(firstSegment)
    ? [firstSegment.toLowerCase(), compactId.slice(0, 12), compactId.slice(0, 16), compactId]
    : [compactId];

  return [...new Set(candidates.filter((candidate) => candidate.length > 0))];
}

function randomShortCode(length = RANDOM_SHORT_CODE_LENGTH): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (value) => SHORT_CODE_ALPHABET[value % SHORT_CODE_ALPHABET.length]).join("");
}

function buildRestUrl(
  supabaseUrl: string,
  path: string,
  params: Record<string, string | number | boolean>,
): string {
  const url = new URL(`${supabaseUrl}/rest/v1/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function parseError(response: Response): Promise<SupabaseErrorPayload> {
  try {
    return (await response.json()) as SupabaseErrorPayload;
  } catch {
    return { message: response.statusText || "request_failed" };
  }
}

function restHeaders(serviceRoleKey: string, extra: Record<string, string> = {}): HeadersInit {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...extra,
  };
}

async function getArticle(
  supabaseUrl: string,
  serviceRoleKey: string,
  articleId: string,
): Promise<ArticleRow | null> {
  const response = await fetch(
    buildRestUrl(supabaseUrl, "articles", {
      select: "id,short_code",
      id: `eq.${articleId}`,
      limit: 1,
    }),
    {
      headers: restHeaders(serviceRoleKey),
    },
  );

  if (!response.ok) {
    const error = await parseError(response);
    throw new Error(error.message || "failed_to_fetch_article");
  }

  const rows = (await response.json()) as ArticleRow[];
  return rows[0] ?? null;
}

async function listArticlesWithoutShortCode(
  supabaseUrl: string,
  serviceRoleKey: string,
  limit: number,
): Promise<ArticleRow[]> {
  const response = await fetch(
    buildRestUrl(supabaseUrl, "articles", {
      select: "id,short_code",
      or: "(short_code.is.null,short_code.eq.)",
      order: "created_at.asc",
      limit,
    }),
    {
      headers: restHeaders(serviceRoleKey),
    },
  );

  if (!response.ok) {
    const error = await parseError(response);
    throw new Error(error.message || "failed_to_list_articles");
  }

  return (await response.json()) as ArticleRow[];
}

async function trySetShortCode(
  supabaseUrl: string,
  serviceRoleKey: string,
  articleId: string,
  candidate: string,
): Promise<"assigned" | "collision" | "already_set"> {
  const response = await fetch(
    buildRestUrl(supabaseUrl, "articles", {
      id: `eq.${articleId}`,
      or: "(short_code.is.null,short_code.eq.)",
      select: "id,short_code",
    }),
    {
      method: "PATCH",
      headers: restHeaders(serviceRoleKey, {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      }),
      body: JSON.stringify({
        short_code: candidate,
        updated_at: new Date().toISOString(),
      }),
    },
  );

  if (response.ok) {
    const rows = (await response.json()) as ArticleRow[];
    if (rows.length > 0) {
      return "assigned";
    }
  } else {
    const error = await parseError(response);
    if (error.code === "23505") {
      return "collision";
    }
    throw new Error(error.message || "failed_to_update_article");
  }

  const latest = await getArticle(supabaseUrl, serviceRoleKey, articleId);
  if (!latest) {
    throw new Error("article_not_found");
  }

  if (normalizeShortCode(latest.short_code)) {
    return "already_set";
  }

  return "already_set";
}

async function ensureShortCodeForArticle(
  supabaseUrl: string,
  serviceRoleKey: string,
  articleId: string,
): Promise<{ articleId: string; shortCode: string; created: boolean }> {
  const existing = await getArticle(supabaseUrl, serviceRoleKey, articleId);
  if (!existing) {
    throw new Error("article_not_found");
  }

  const existingShortCode = normalizeShortCode(existing.short_code);
  if (existingShortCode) {
    return { articleId, shortCode: existingShortCode, created: false };
  }

  const deterministicCandidates = preferredShortCodeCandidates(articleId);
  for (const candidate of deterministicCandidates) {
    const result = await trySetShortCode(supabaseUrl, serviceRoleKey, articleId, candidate);
    if (result === "assigned") {
      return { articleId, shortCode: candidate, created: true };
    }
    if (result === "already_set") {
      const latest = await getArticle(supabaseUrl, serviceRoleKey, articleId);
      const shortCode = normalizeShortCode(latest?.short_code);
      if (shortCode) {
        return { articleId, shortCode, created: false };
      }
    }
  }

  for (let attempt = 0; attempt < MAX_RANDOM_SHORT_CODE_ATTEMPTS; attempt += 1) {
    const candidate = randomShortCode();
    const result = await trySetShortCode(supabaseUrl, serviceRoleKey, articleId, candidate);
    if (result === "assigned") {
      return { articleId, shortCode: candidate, created: true };
    }
    if (result === "already_set") {
      const latest = await getArticle(supabaseUrl, serviceRoleKey, articleId);
      const shortCode = normalizeShortCode(latest?.short_code);
      if (shortCode) {
        return { articleId, shortCode, created: false };
      }
    }
  }

  throw new Error("short_code_generation_failed");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse({ error: "Missing Supabase env" }, 500);
  }

  let body: InvokeBody = {};
  try {
    body = (await req.json()) as InvokeBody;
  } catch {
    body = {};
  }

  const limit = Number.isFinite(body.limit) ? Math.max(1, Math.min(200, Number(body.limit))) : 50;

  try {
    const rows = (await listArticlesWithoutShortCode(
      supabaseUrl,
      supabaseServiceKey,
      limit,
    )).filter((row) => normalizeShortCode(row.short_code) === null);

    const results = [];
    for (const row of rows) {
      results.push(await ensureShortCodeForArticle(supabaseUrl, supabaseServiceKey, row.id));
    }

    return jsonResponse({
      processed: results.length,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const status = message === "article_not_found" ? 404 : 500;
    return jsonResponse({ error: message }, status);
  }
});
