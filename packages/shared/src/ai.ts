/**
 * AI helpers for Editorial Quick Read (Gemini 1.5 Flash).
 */

const GEMINI_15_FLASH = "gemini-1.5-flash";
const SIMPLIFY_SYSTEM_PROMPT =
  "You are a helpful teacher. Take this intellectual editorial summary and explain it like I am 5 years old. Use 3 simple bullet points. Avoid jargon. Total word count must be under 50 words.";

/**
 * Calls Gemini 1.5 Flash to simplify an existing AI summary into 3 child-friendly bullet points (under 50 words).
 *
 * @param aiSummary - The existing editorial summary (e.g. from articles.ai_summary).
 * @param apiKey - Google AI (Gemini) API key.
 * @returns A clean string of 3 bullet points.
 */
export async function simplifySummary(
  aiSummary: string,
  apiKey: string
): Promise<string> {
  const trimmed = (aiSummary ?? "").trim();
  if (!trimmed) return "";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_15_FLASH}:generateContent?key=${apiKey}`;
  const body = {
    systemInstruction: { parts: [{ text: SIMPLIFY_SYSTEM_PROMPT }] },
    contents: [
      {
        role: "user",
        parts: [{ text: trimmed }],
      },
    ],
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

  interface GeminiPart {
    text?: string;
  }
  interface GeminiResponse {
    candidates?: Array<{
      content?: { parts?: GeminiPart[] };
    }>;
  }
  const data = (await res.json()) as GeminiResponse;

  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  return normalizeToBullets(text);
}

/**
 * Normalizes model output into a clean string of 3 bullet points.
 */
function normalizeToBullets(raw: string): string {
  const lines = raw
    .trim()
    .split(/\n+/)
    .map((line) => line.replace(/^[\s\-*•·]+\s*/, "").trim())
    .filter((line) => line.length > 0);

  const bullets = lines.slice(0, 3).map((line) => `• ${line}`);
  return bullets.join("\n");
}
