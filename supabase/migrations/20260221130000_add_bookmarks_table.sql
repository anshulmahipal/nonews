-- Bookmarks: user_id + article_id with composite PK to prevent duplicates
-- RLS: users can only insert/delete/read their own bookmarks

CREATE TABLE public.bookmarks (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, article_id)
);

-- Index for sorting bookmarks by most recent (user's bookmarks, newest first)
CREATE INDEX idx_bookmarks_user_created_at ON public.bookmarks (user_id, created_at DESC);

-- RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can only INSERT their own bookmarks
CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only DELETE their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only READ their own bookmarks
CREATE POLICY "Users can read own bookmarks"
  ON public.bookmarks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
