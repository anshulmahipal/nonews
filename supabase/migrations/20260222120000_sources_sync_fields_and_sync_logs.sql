-- Enum for source health status (5:00 AM batch sync)
CREATE TYPE source_status AS ENUM ('healthy', 'failing', 'inactive');

-- Add sync tracking and status to sources
ALTER TABLE public.sources
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_error_message text,
  ADD COLUMN IF NOT EXISTS status source_status NOT NULL DEFAULT 'inactive';

COMMENT ON COLUMN public.sources.last_synced_at IS 'When this source was last successfully synced (5 AM IST batch).';
COMMENT ON COLUMN public.sources.last_error_message IS 'Last error message from ingest/sync, if any.';
COMMENT ON COLUMN public.sources.status IS 'healthy = syncing OK, failing = recent errors, inactive = disabled or never run.';

-- Table to store each 5:00 AM batch run summary
CREATE TABLE public.sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_started_at timestamptz NOT NULL DEFAULT now(),
  run_finished_at timestamptz,
  articles_succeeded int NOT NULL DEFAULT 0,
  articles_failed int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.sync_logs IS 'History of each 5:00 AM IST batch run: counts of summarized vs failed articles.';

-- Index for listing runs by time
CREATE INDEX idx_sync_logs_run_started_at ON public.sync_logs (run_started_at DESC);

-- RLS
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to sync_logs for authenticated users"
  ON public.sync_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role full access to sync_logs"
  ON public.sync_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
