-- Grant admin access to a user so they can access /admin/dashboard and /admin/health.
-- app_metadata is not editable in the Supabase Dashboard; run this in SQL Editor.
--
-- 1. Replace YOUR-EMAIL@example.com with the user's email.
-- 2. Run in Supabase Dashboard → SQL Editor.
-- 3. User must log out and log back in so the JWT includes the new app_metadata.

UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
WHERE email = 'YOUR-EMAIL@example.com';
