-- Supabase SQL: Ensure profiles columns exist and allow users to insert/update their own profile

-- 1) Add missing columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS roles text[],
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS user_role text;

-- 2) Enable Row-Level Security (RLS) on profiles (if not already enabled)
-- Note: Run this only if RLS is not already enabled for the table.
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3) Allow authenticated users to INSERT their own profile (id must equal auth.uid())
CREATE POLICY "Allow insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- 4) Allow authenticated users to UPDATE their own profile
CREATE POLICY "Allow update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 5) (Optional) Prevent regular authenticated users from deleting profiles
-- Super admins (existing super-admin policy) will still be able to perform admin actions
CREATE POLICY IF NOT EXISTS "Disallow delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (false);

-- 6) (Optional) If you want to allow authenticated users to SELECT their own profile (usually already present)
CREATE POLICY IF NOT EXISTS "Allow select own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- 7) Notes:
-- - The project already contains a "Superadmin Full Access" policy on public.profiles allowing super_admin users to perform ALL operations.
-- - After applying these policies, client-side upserts/inserts performed with id = auth.uid() will succeed for authenticated users.
-- - If you use triggers to backfill profiles on auth.user_created, keep them; these policies complement both approaches.

-- 8) Example backfill SQL to create profiles for existing auth users (run once if needed):
-- INSERT INTO public.profiles (id, email, full_name, roles, user_role, created_at)
-- SELECT id, email, (user_metadata->>'full_name')::text, ARRAY['parent']::text[], 'parent', now()
-- FROM auth.users u
-- WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);
