-- Restrict SELECT on reviews to admins only
-- Idempotent: safe to run multiple times

-- Ensure row level security is enabled on the reviews table
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;

-- Remove any existing policy with the same name to keep migration idempotent
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'select_reviews_admin_only'
  ) THEN
    PERFORM pg_catalog.pg_policy_drop('select_reviews_admin_only', 'public', 'reviews');
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- pg_policies may not exist on very old PG versions; ignore
  NULL;
END;
$$;

-- Create policy: only users whose profile.user_role is admin or super_admin may SELECT
DROP POLICY IF EXISTS select_reviews_admin_only ON public.reviews;
CREATE POLICY select_reviews_admin_only ON public.reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.user_role IN ('admin','super_admin')
    )
  );

-- End migration
