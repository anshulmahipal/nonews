# ai-processor Edge Function

Processes articles with `status = 'pending'`: calls Gemini 1.5 Flash for an 80-word summary and author stance, then updates the row to `completed` (or `failed` on error).

## Behavior

1. Fetches all `articles` where `status = 'pending'`.
2. For each article: sets `status = 'processing'`, calls Gemini with System Instruction + **save_to_db** function (summary, stance), waits **4 seconds** (Free Tier rate limit), then updates `ai_summary`, `ai_stance`, and `status = 'completed'` (or `failed` if Gemini/update fails).

## Secrets

Set in Supabase Dashboard → Project Settings → Edge Functions → Secrets (or CLI):

- **GEMINI_API_KEY** – Google AI API key (e.g. from [Google AI Studio](https://makersuite.google.com/app/apikey)).

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set automatically for Edge Functions.

## Invoke

**Dashboard:** Edge Functions → `ai-processor` → Invoke.

**cURL:**

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/ai-processor" \
  -H "Authorization: Bearer <anon-or-service-role-key>" \
  -H "Content-Type: application/json"
```

Response example:

```json
{
  "processed": 5,
  "completed": 4,
  "failed": 1,
  "message": "Processed 5 pending articles: 4 completed, 1 failed."
}
```

## Trigger

Call this after the daily ingestor (e.g. cron or webhook on ingest completion) so new articles get summarized.
