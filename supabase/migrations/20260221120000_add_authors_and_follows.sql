-- Authors: id, name, bio, image_url, twitter_handle
CREATE TABLE public.authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text,
  image_url text,
  twitter_handle text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name)
);

CREATE INDEX idx_authors_name ON public.authors (name);

-- Add author_id to articles (nullable during migration)
ALTER TABLE public.articles
  ADD COLUMN author_id uuid REFERENCES public.authors(id) ON DELETE SET NULL;

CREATE INDEX idx_articles_author_id ON public.articles (author_id);

-- Follows: user_id + author_id
CREATE TABLE public.follows (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.authors(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, author_id)
);

CREATE INDEX idx_follows_user_id ON public.follows (user_id);
CREATE INDEX idx_follows_author_id ON public.follows (author_id);

-- RLS: Authors - everyone can read, only service_role can write
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read authors"
  ON public.authors
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access authors"
  ON public.authors
  FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- RLS: Follows - users manage their own follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own follows"
  ON public.follows
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own follows"
  ON public.follows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own follows"
  ON public.follows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- updated_at trigger for authors
CREATE TRIGGER set_authors_updated_at
  BEFORE UPDATE ON public.authors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
