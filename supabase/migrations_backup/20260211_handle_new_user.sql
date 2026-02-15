-- Migration: idempotent handle_new_user function + recommended RLS policy suggestions
-- Run this using the Supabase CLI or psql as a DB admin.

-- 1) Function: create or replace with ON CONFLICT upsert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_role, roles)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'customer',
    ARRAY['user']
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      user_role  = EXCLUDED.user_role,
      roles      = EXCLUDED.roles;

  RETURN NEW;
END;
$$;

-- 2) Recommended RLS setup for `public.profiles` (review before applying):
-- Enable RLS (if not already enabled)
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to SELECT/UPDATE their own profile (example):
-- CREATE POLICY "Users can view own profile" ON public.profiles
--   FOR SELECT TO authenticated
--   USING (auth.uid() = id);

-- CREATE POLICY "Users can update own profile" ON public.profiles
--   FOR UPDATE TO authenticated
--   USING (auth.uid() = id)
--   WITH CHECK (auth.uid() = id);

-- Allow users to create their profile on sign-up:
-- CREATE POLICY "Users can create own profile" ON public.profiles
--   FOR INSERT TO authenticated
--   WITH CHECK (auth.uid() = id);

-- NOTE: The trigger that calls `handle_new_user()` runs inside the database as the function owner.
-- If the function owner is the table owner or a role that has BYPASSRLS, RLS will be bypassed and the INSERT will succeed.
-- If not, you may need to ensure the function is owned by a role that can bypass RLS, or create an explicit policy
-- to allow the trigger's executing role to INSERT. Review your Supabase/Postgres role setup before applying.
