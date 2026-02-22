/**
 * Run the full morning pipeline: daily-ingestor then ai-processor.
 * Use when the 5 AM cron didn't run or for a one-off sync.
 *
 * Usage (production):
 *   SUPABASE_URL=https://<project-ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<key> npx ts-node scripts/run-morning-pipeline.ts
 *
 * Usage (local):
 *   SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_ANON_KEY=<anon-key> npx ts-node scripts/run-morning-pipeline.ts
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error("Missing SUPABASE_URL (e.g. https://<project-ref>.supabase.co)");
  process.exit(1);
}
if (!SUPABASE_KEY) {
  console.error(
    "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY. Set one of them."
  );
  process.exit(1);
}

const INGESTOR_URL = `${SUPABASE_URL}/functions/v1/daily-ingestor`;
const AI_PROCESSOR_URL = `${SUPABASE_URL}/functions/v1/ai-processor`;

const headers = {
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

async function main() {
  console.log("1. Calling daily-ingestor (all active sources)...");
  const ingestRes = await fetch(INGESTOR_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  const ingestBody = await ingestRes.json();

  if (!ingestRes.ok) {
    console.error("daily-ingestor failed:", ingestRes.status, ingestBody);
    process.exit(1);
  }
  if (ingestBody.error) {
    console.error("daily-ingestor error:", ingestBody.error, ingestBody.details ?? "");
    process.exit(1);
  }

  console.log(
    "   Result:",
    ingestBody.message ??
      `inserted=${ingestBody.inserted ?? 0}, processed=${ingestBody.processed ?? 0}`
  );

  console.log("\n2. Calling ai-processor (pending articles)...");
  const aiRes = await fetch(AI_PROCESSOR_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  const aiBody = await aiRes.json();

  if (!aiRes.ok) {
    console.error("ai-processor failed:", aiRes.status, aiBody);
    process.exit(1);
  }
  if (aiBody.error) {
    console.error("ai-processor error:", aiBody.error, aiBody.details ?? "");
    process.exit(1);
  }

  console.log(
    "   Result:",
    aiBody.message ??
      `completed=${aiBody.completed ?? 0}, failed=${aiBody.failed ?? 0}`
  );
  console.log("\nMorning pipeline finished.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
