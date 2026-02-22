/**
 * Temporary script to test the local Supabase daily-ingestor Edge Function.
 * Run: SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_ANON_KEY=<your-anon-key> npx ts-node scripts/test-sync.ts
 * Get your local anon key with: supabase status
 */

const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_ANON_KEY. Get it with: supabase status");
  process.exit(1);
}

const INGESTOR_URL = `${SUPABASE_URL}/functions/v1/daily-ingestor`;

async function main() {
  console.log("Calling daily-ingestor...");
  const res = await fetch(INGESTOR_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });

  const body = await res.json();

  if (!res.ok) {
    console.error("Ingestor failed:", res.status, body);
    process.exit(1);
  }

  if (body.error) {
    console.error("Ingestor error:", body.error, body.details ?? "");
    console.log("Articles added: 0");
    process.exit(1);
  }

  const inserted = body.inserted ?? 0;
  console.log(`Articles added to 'articles' table: ${inserted}`);
  if (body.message) console.log(body.message);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
