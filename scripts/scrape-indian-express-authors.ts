/**
 * Scrape "About the Author" / writer bio from Indian Express article URLs,
 * then use Gemini to generate a 2-sentence professional bio and upsert into authors table.
 *
 * Usage:
 *   GEMINI_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   npx ts-node scripts/scrape-indian-express-authors.ts [url1] [url2] ...
 *
 * Example (default URLs if none given):
 *   npx ts-node scripts/scrape-indian-express-authors.ts
 *   npx ts-node scripts/scrape-indian-express-authors.ts "https://indianexpress.com/article/opinion/columns/..."
 */

import { createClient } from "@supabase/supabase-js";
import { parseHTML } from "linkedom";

const GEMINI_MODEL = "gemini-2.5-flash";
const USER_AGENT =
  "Mozilla/5.0 (compatible; EditorialQuickRead/1.0; +https://github.com/nonews)";

/** Default Indian Express opinion links to scrape if no URLs provided */
const DEFAULT_URLS = [
  "https://indianexpress.com/article/opinion/columns/the-worlds-pharmacy-has-a-challenge-shifting-from-volume-to-value-10543353/",
  "https://indianexpress.com/article/opinion/columns/what-is-the-per-rupee-supply-of-love-10543358/",
  "https://indianexpress.com/article/opinion/columns/p-b-mehta-writes-as-we-contemplate-possibilities-of-ai-it-is-wreaking-enduring-transformations-in-state-capital-relations-10543349/",
];

interface ScrapedAuthor {
  name: string;
  rawBio: string;
  sourceUrl: string;
}

/**
 * Fetch HTML and extract author name and "About the Author" / "The writer is" bio.
 */
async function scrapeIndianExpressArticle(url: string): Promise<ScrapedAuthor | null> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return null;
  const html = await res.text();
  const { document } = parseHTML(html);

  // Author: "Written by: Name" or link to profile/columnist
  let name: string | null = null;
  const profileLinks = document.querySelectorAll(
    'a[href*="indianexpress.com/profile"], a[href*="/columnist/"], a[href*="/about/"]'
  );
  for (let i = 0; i < profileLinks.length; i++) {
    const a = profileLinks[i];
    const href = a.getAttribute("href") ?? "";
    const text = a.textContent?.trim() ?? "";
    // Skip generic /about/ pages (tags, topics)
    if (href.includes("/about/") && !href.match(/\/about\/[a-z-]+-\d*\/?$/)) continue;
    if (text && text.length < 100 && !/^(columns|opinion|india|world)$/i.test(text)) {
      const parentText = a.parentElement?.textContent ?? "";
      if (parentText.includes("Written by") || parentText.includes("writer")) {
        name = text;
        break;
      }
    }
  }
  if (!name) {
    const bodyText = document.body?.textContent ?? "";
    const writtenByMatch = bodyText.match(/Written by:\s*([^\n]+?)(?:\n|$)/i);
    if (writtenByMatch) name = writtenByMatch[1].trim().replace(/\s+/g, " ");
  }

  // Bio: "The writer is ..." or "About the Author" section
  let rawBio = "";
  const bodyText = document.body?.textContent ?? "";
  const writerIsMatch = bodyText.match(/The writer is\s+([^.]+(?:\.[^.]+)*\.?)/i);
  if (writerIsMatch) rawBio = ("The writer is " + writerIsMatch[1].trim()).replace(/\s+/g, " ");

  if (!rawBio) {
    const aboutHeading = Array.from(document.querySelectorAll("p, div, span")).find(
      (el) =>
        el.textContent?.includes("About the Author") ||
        el.textContent?.includes("Author bio")
    );
    if (aboutHeading) {
      const next = aboutHeading.nextElementSibling ?? aboutHeading.parentElement?.nextElementSibling;
      rawBio = (next?.textContent ?? aboutHeading.textContent ?? "").trim().replace(/\s+/g, " ");
    }
  }

  if (!name || !rawBio) return null;
  return { name, rawBio, sourceUrl: url };
}

/**
 * Call Gemini to produce exactly 2 sentences for a professional author bio.
 */
async function generateBioWithGemini(apiKey: string, authorName: string, rawBio: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const prompt = `You are an editor. Given the following author information from an Indian Express article, write exactly 2 sentences for a professional author bio. Use third person. Be factual and concise. Do not add greetings or meta text—output only the two sentences.

Author name: ${authorName}

Raw bio or description from the article:
${rawBio}

Output (exactly 2 sentences):`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.3,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  if (!text) throw new Error("Gemini returned empty bio");
  return text;
}

async function main() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!geminiKey || !supabaseUrl || !supabaseServiceKey) {
    console.error(
      "Set GEMINI_API_KEY, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY. For local Supabase use SUPABASE_URL=http://127.0.0.1:54321 and get key via: supabase status"
    );
    process.exit(1);
  }

  const urls = process.argv.slice(2).length > 0 ? process.argv.slice(2) : DEFAULT_URLS;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log(`Scraping ${urls.length} Indian Express URL(s)...\n`);

  for (const articleUrl of urls) {
    try {
      const scraped = await scrapeIndianExpressArticle(articleUrl);
      if (!scraped) {
        console.log(`Skip (no author/bio found): ${articleUrl}`);
        continue;
      }
      console.log(`Author: ${scraped.name}`);
      console.log(`Raw bio: ${scraped.rawBio.slice(0, 120)}...`);

      const bio = await generateBioWithGemini(geminiKey, scraped.name, scraped.rawBio);
      console.log(`Generated bio: ${bio}`);

      const { error } = await supabase.from("authors").upsert(
        {
          name: scraped.name,
          bio,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "name" }
      );

      if (error) {
        console.error(`DB error for ${scraped.name}:`, error.message);
      } else {
        console.log(`Upserted author "${scraped.name}" in authors table.\n`);
      }

      await new Promise((r) => setTimeout(r, 1500));
    } catch (e) {
      console.error(`Error processing ${articleUrl}:`, e);
    }
  }

  console.log("Done.");
}

main();
