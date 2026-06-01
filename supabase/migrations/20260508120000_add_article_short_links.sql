-- Minimal short-link store for article redirects.
CREATE TABLE public.article_short_links (
  id text PRIMARY KEY,
  title text NOT NULL,
  original_url text NOT NULL,
  short_code text NOT NULL UNIQUE,
  click_count bigint NOT NULL DEFAULT 0,
  ios_deep_link text,
  android_deep_link text,
  web_fallback_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_article_short_links_short_code
  ON public.article_short_links (short_code);

CREATE INDEX idx_article_short_links_created_at
  ON public.article_short_links (created_at DESC);

ALTER TABLE public.article_short_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read article short links" ON public.article_short_links
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Service role full access article short links" ON public.article_short_links
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER set_article_short_links_updated_at
  BEFORE UPDATE ON public.article_short_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
