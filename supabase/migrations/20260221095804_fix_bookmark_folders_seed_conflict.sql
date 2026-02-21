-- Fix ON CONFLICT for bookmark folder seed (explicit constraint)
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
