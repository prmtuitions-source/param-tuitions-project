-- Migration: Harden RLS on critical public tables
-- Date: 2026-02-12
-- Goal: Enable Row-Level Security on sensitive tables and add conservative policies

BEGIN;

-- Helper: role check expression used in policies
-- (resolves the current user's role from profiles table)
-- Note: this assumes `profiles` table exists and `user_role` column is authoritative

-- 1) form_configs (admin only)
ALTER TABLE IF EXISTS public.form_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access" ON public.form_configs;
CREATE POLICY "Admins full access" ON public.form_configs
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (
    (SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text])
  )
  WITH CHECK (
    (SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text])
  );

-- 2) gold_enquiries (admin only)
ALTER TABLE IF EXISTS public.gold_enquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access" ON public.gold_enquiries;
CREATE POLICY "Admins full access" ON public.gold_enquiries
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]))
  WITH CHECK ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]));

-- 3) locations (admin only)
ALTER TABLE IF EXISTS public.locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access" ON public.locations;
CREATE POLICY "Admins full access" ON public.locations
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]))
  WITH CHECK ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]));

-- 4) missed_classes (admins full access; parents/teachers can view/insert their own rows)
ALTER TABLE IF EXISTS public.missed_classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access" ON public.missed_classes;
CREATE POLICY "Admins full access" ON public.missed_classes
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]))
  WITH CHECK ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]));

-- Owners: allow parents or teachers to SELECT their own missed_classes rows
DROP POLICY IF EXISTS "Owners limited select" ON public.missed_classes;
CREATE POLICY "Owners limited select" ON public.missed_classes
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    (parent_id IS NOT NULL AND parent_id = auth.uid()) OR (teacher_id IS NOT NULL AND teacher_id = auth.uid())
  );

-- Allow parents/teachers to insert a missed_classes row only for themselves
DROP POLICY IF EXISTS "Owners limited insert" ON public.missed_classes;
CREATE POLICY "Owners limited insert" ON public.missed_classes
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (parent_id IS NOT NULL AND parent_id = auth.uid()) OR (teacher_id IS NOT NULL AND teacher_id = auth.uid())
  );

-- 5) notification_jobs (admin only; recipients can see notification jobs where recipient_id = auth.uid())
ALTER TABLE IF EXISTS public.notification_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access" ON public.notification_jobs;
CREATE POLICY "Admins full access" ON public.notification_jobs
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]))
  WITH CHECK ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]));

DROP POLICY IF EXISTS "Recipients can view jobs" ON public.notification_jobs;
CREATE POLICY "Recipients can view jobs" ON public.notification_jobs
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (recipient_id IS NOT NULL AND recipient_id = auth.uid());

-- 6) notification_logs (admin only; recipients can view their logs)
ALTER TABLE IF EXISTS public.notification_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access" ON public.notification_logs;
CREATE POLICY "Admins full access" ON public.notification_logs
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]))
  WITH CHECK ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]));

DROP POLICY IF EXISTS "Recipients can view logs" ON public.notification_logs;
CREATE POLICY "Recipients can view logs" ON public.notification_logs
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (recipient_id IS NOT NULL AND recipient_id = auth.uid());

-- 7) notification_templates (admin only)
ALTER TABLE IF EXISTS public.notification_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access" ON public.notification_templates;
CREATE POLICY "Admins full access" ON public.notification_templates
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]))
  WITH CHECK ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]));

-- 8) profiles_admin_zone_backfill_audit (admin full; owners can view their own backfills)
ALTER TABLE IF EXISTS public.profiles_admin_zone_backfill_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access" ON public.profiles_admin_zone_backfill_audit;
CREATE POLICY "Admins full access" ON public.profiles_admin_zone_backfill_audit
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]))
  WITH CHECK ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]));

DROP POLICY IF EXISTS "Owner view backfill" ON public.profiles_admin_zone_backfill_audit;
CREATE POLICY "Owner view backfill" ON public.profiles_admin_zone_backfill_audit
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (profile_id IS NOT NULL AND profile_id = auth.uid());

-- 9) review_parameters (admin only)
ALTER TABLE IF EXISTS public.review_parameters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access" ON public.review_parameters;
CREATE POLICY "Admins full access" ON public.review_parameters
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]))
  WITH CHECK ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]));

-- 10) spatial_ref_sys (admin only - PostGIS system table)
ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access" ON public.spatial_ref_sys;
CREATE POLICY "Admins full access" ON public.spatial_ref_sys
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]))
  WITH CHECK ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]));

-- 11) system_settings (admin only)
ALTER TABLE IF EXISTS public.system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access" ON public.system_settings;
CREATE POLICY "Admins full access" ON public.system_settings
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]))
  WITH CHECK ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]));

-- 12) teacher_location_logs (admins full; teacher can view/insert their own)
ALTER TABLE IF EXISTS public.teacher_location_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access" ON public.teacher_location_logs;
CREATE POLICY "Admins full access" ON public.teacher_location_logs
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]))
  WITH CHECK ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]));

DROP POLICY IF EXISTS "Teacher owner view" ON public.teacher_location_logs;
CREATE POLICY "Teacher owner view" ON public.teacher_location_logs
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (teacher_id IS NOT NULL AND teacher_id = auth.uid());

DROP POLICY IF EXISTS "Teacher owner insert" ON public.teacher_location_logs;
CREATE POLICY "Teacher owner insert" ON public.teacher_location_logs
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (teacher_id IS NOT NULL AND teacher_id = auth.uid());

-- 13) terms_and_conditions (admin only)
ALTER TABLE IF EXISTS public.terms_and_conditions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access" ON public.terms_and_conditions;
CREATE POLICY "Admins full access" ON public.terms_and_conditions
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]))
  WITH CHECK ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text, 'superadmin'::text, 'staff'::text]));

COMMIT;

-- Notes:
-- - This migration is intentionally conservative: admin full access is granted via policies
--   that check `profiles.user_role`. Owner policies are only added where the table schema
--   includes an owner-like column (e.g. `parent_id`, `teacher_id`, `recipient_id`, `profile_id`).
-- - After applying this migration, review application behavior to ensure legitimate operations
--   are not blocked; adjust WITH CHECK or additional owner policies for specific tables as required.
