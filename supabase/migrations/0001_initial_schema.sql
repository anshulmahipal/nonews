-- Initial schema for Editorial Quick Read
-- Sources (RSS), Articles (with AI summary/stance), pg_cron for 5:00 AM IST batch

-- AI stance enum (Gemini stance labels)
CREATE TYPE public.ai_stance AS ENUM (
  'Supportive',
  'Critical',
  'Neutral',
  'Sarcastic',
  'Balanced'
);

-- Article processing status
CREATE TYPE public.article_status AS ENUM (
  'pending',
  'completed',
  'failed'
);

-- RSS/editorial sources (read by daily-ingestor)
CREATE TABLE public.sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rss_url text NOT NULL,
  category text NOT NULL DEFAULT 'editorial',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Articles: raw content from ingest, then ai_summary/ai_stance from AI processor
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  guid text NOT NULL UNIQUE,
  title text NOT NULL,
  link text NOT NULL,
  author text,
  published_at timestamptz NOT NULL,
  raw_content text,
  ai_summary text,
  ai_stance public.ai_stance,
  status public.article_status NOT NULL DEFAULT 'pending',
  processed_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_articles_source_id ON public.articles (source_id);
CREATE INDEX idx_articles_status ON public.articles (status);
CREATE INDEX idx_articles_processed_date ON public.articles (processed_date);

-- RLS
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read sources" ON public.sources
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow read articles" ON public.articles
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Service role full access sources" ON public.sources
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access articles" ON public.articles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_sources_updated_at
  BEFORE UPDATE ON public.sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- pg_cron: enable extension and schedule Morning Edition placeholder (23:30 UTC = 5:00 AM IST)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

SELECT cron.schedule(
  'morning-edition-placeholder',
  '30 23 * * *',
  $$SELECT 1$$
);
