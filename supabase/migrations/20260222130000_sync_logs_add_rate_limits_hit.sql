ALTER TABLE public.sync_logs
  ADD COLUMN IF NOT EXISTS rate_limits_hit boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.sync_logs.rate_limits_hit IS 'True if Gemini rate limits were hit during this run.';
