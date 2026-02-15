-- Migration: Backfill missing profiles.admin_zone for teachers
-- Date: 2026-02-09
-- Idempotent; safe to re-run. Creates an audit table and attempts three passes:
--  A) exact match from teacher_details.main_location -> locations.admin_zone
--  B) fuzzy match from teacher_details.areas_served -> locations.admin_zone
--  C) fallback from assigned_admin_id -> admin profile's admin_zone

BEGIN;

-- Create audit table (if not exists) to record affected rows and sources
CREATE TABLE IF NOT EXISTS public.profiles_admin_zone_backfill_audit (
  profile_id uuid,
  old_admin_zone text,
  main_location text,
  areas_served text,
  assigned_admin_id uuid,
  backfilled_admin_zone text,
  backfill_ts timestamptz DEFAULT now(),
  source text
);

-- Populate audit with current rows that are missing admin_zone (only teachers)
INSERT INTO public.profiles_admin_zone_backfill_audit(profile_id, old_admin_zone, main_location, areas_served, assigned_admin_id, source)
SELECT p.id, p.admin_zone, td.main_location, coalesce(td.areas_served::text, ''), p.assigned_admin_id, 'pre_update'
FROM public.profiles p
LEFT JOIN public.teacher_details td ON td.id = p.id
WHERE p.user_role = 'teacher' AND (p.admin_zone IS NULL OR p.admin_zone = '');

-- PASS A: Exact main_location -> locations.admin_zone
UPDATE public.profiles p
SET admin_zone = l.admin_zone
FROM public.teacher_details td
JOIN public.locations l ON l.location_name = td.main_location
WHERE p.id = td.id
  AND p.user_role = 'teacher'
  AND (p.admin_zone IS NULL OR p.admin_zone = '')
  AND l.admin_zone IS NOT NULL;

-- Record which rows got backfilled in PASS A
UPDATE public.profiles_admin_zone_backfill_audit a
SET backfilled_admin_zone = p.admin_zone, source = 'main_location', backfill_ts = now()
FROM public.profiles p
WHERE a.profile_id = p.id
  AND a.backfilled_admin_zone IS NULL
  AND p.admin_zone IS NOT NULL;

-- PASS B: Fuzzy match from areas_served -> locations.admin_zone
UPDATE public.profiles p
SET admin_zone = l.admin_zone
FROM public.teacher_details td
JOIN public.locations l
  ON lower(coalesce(td.areas_served::text, '')) LIKE '%' || lower(l.location_name) || '%'
WHERE p.id = td.id
  AND p.user_role = 'teacher'
  AND (p.admin_zone IS NULL OR p.admin_zone = '')
  AND l.admin_zone IS NOT NULL;

-- Record which rows got backfilled in PASS B
UPDATE public.profiles_admin_zone_backfill_audit a
SET backfilled_admin_zone = p.admin_zone, source = 'areas_served', backfill_ts = now()
FROM public.profiles p
WHERE a.profile_id = p.id
  AND a.backfilled_admin_zone IS NULL
  AND p.admin_zone IS NOT NULL;

-- PASS C: Fallback from assigned_admin_id -> admin profile's admin_zone
UPDATE public.profiles p
SET admin_zone = a.admin_zone
FROM public.profiles a
WHERE p.assigned_admin_id = a.id
  AND p.user_role = 'teacher'
  AND (p.admin_zone IS NULL OR p.admin_zone = '')
  AND a.admin_zone IS NOT NULL;

-- Record which rows got backfilled in PASS C
UPDATE public.profiles_admin_zone_backfill_audit a
SET backfilled_admin_zone = p.admin_zone, source = 'assigned_admin', backfill_ts = now()
FROM public.profiles p
WHERE a.profile_id = p.id
  AND a.backfilled_admin_zone IS NULL
  AND p.admin_zone IS NOT NULL;

COMMIT;

-- Summary: After running, you can inspect the audit table for which rows were updated
-- SELECT * FROM public.profiles_admin_zone_backfill_audit ORDER BY backfill_ts DESC LIMIT 100;
