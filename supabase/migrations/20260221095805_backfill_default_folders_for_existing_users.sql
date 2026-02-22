-- Backfill default folders for existing users who have none
INSERT INTO public.bookmark_folders (user_id, name, color)
SELECT p.id, name, color
FROM public.profiles p
CROSS JOIN (VALUES
  ('General', '#64748b'),
  ('Economy', '#0ea5e9'),
  ('Politics', '#8b5cf6')
) AS defaults(name, color)
WHERE NOT EXISTS (
  SELECT 1 FROM public.bookmark_folders bf
  WHERE bf.user_id = p.id
)
ON CONFLICT (user_id, name) DO NOTHING;
