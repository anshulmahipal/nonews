-- Bookmark Folders (Categories): user_id, name, color
-- RLS: users can only see and manage their own folders

CREATE TABLE public.bookmark_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#64748b',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE INDEX idx_bookmark_folders_user_id ON public.bookmark_folders (user_id);

-- Add optional folder_id to bookmarks
ALTER TABLE public.bookmarks
  ADD COLUMN folder_id uuid REFERENCES public.bookmark_folders(id) ON DELETE SET NULL;

CREATE INDEX idx_bookmarks_folder_id ON public.bookmarks (folder_id);

-- RLS for bookmark_folders
ALTER TABLE public.bookmark_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own folders"
  ON public.bookmark_folders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own folders"
  ON public.bookmark_folders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON public.bookmark_folders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON public.bookmark_folders
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to UPDATE their own bookmarks (for folder_id)
CREATE POLICY "Users can update own bookmarks"
  ON public.bookmarks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Seed 3 default folders for every new user (update auth trigger)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  INSERT INTO public.bookmark_folders (user_id, name, color)
  VALUES
    (NEW.id, 'General', '#64748b'),
    (NEW.id, 'Economy', '#0ea5e9'),
    (NEW.id, 'Politics', '#8b5cf6')
  ON CONFLICT (user_id, name) DO NOTHING;

  RETURN NEW;
END;
$$;
