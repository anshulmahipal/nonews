-- Profiles table for storing Expo push tokens (used by ai-processor for Morning Brief notifications)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expo_push_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_profiles_expo_push_token ON public.profiles (expo_push_token);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read profiles" ON public.profiles
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow insert profiles" ON public.profiles
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow update profiles" ON public.profiles
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access profiles" ON public.profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
