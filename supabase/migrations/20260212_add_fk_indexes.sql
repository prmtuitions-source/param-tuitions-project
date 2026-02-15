-- Migration: Add FK-covering indexes (conditional)
-- Date: 2026-02-12
-- Purpose: Create indexes on foreign-key columns to improve join/delete/update performance.
-- This script checks for table/column existence before creating each index so it is safe
-- to run against different schema versions.

BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='active_sessions' AND column_name='parent_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_active_sessions_parent_id ON public.active_sessions(parent_id)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='active_sessions' AND column_name='teacher_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_active_sessions_teacher_id ON public.active_sessions(teacher_id)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='active_sessions' AND column_name='tuition_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_active_sessions_tuition_id ON public.active_sessions(tuition_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='agreements' AND column_name='teacher_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_agreements_teacher_id ON public.agreements(teacher_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='invoices' AND column_name='parent_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_invoices_parent_id ON public.invoices(parent_id)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='invoices' AND column_name='teacher_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_invoices_teacher_id ON public.invoices(teacher_id)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='invoices' AND column_name='tuition_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_invoices_tuition_id ON public.invoices(tuition_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='reviewer_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='reviewee_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='tuition_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reviews_tuition_id ON public.reviews(tuition_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='applications' AND column_name='tuition_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_applications_tuition_id ON public.applications(tuition_id)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='applications' AND column_name='teacher_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_applications_teacher_id ON public.applications(teacher_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teacher_location_logs' AND column_name='teacher_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_teacher_location_logs_teacher_id ON public.teacher_location_logs(teacher_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='recipient_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient_id ON public.notification_logs(recipient_id)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='notification_job_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_notification_logs_job_id ON public.notification_logs(notification_job_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_jobs' AND column_name='recipient_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_notification_jobs_recipient_id ON public.notification_jobs(recipient_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teacher_penalties' AND column_name='teacher_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_teacher_penalties_teacher_id ON public.teacher_penalties(teacher_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teacher_scorecards' AND column_name='teacher_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_teacher_scorecards_teacher_id ON public.teacher_scorecards(teacher_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tuition_attendance' AND column_name='tuition_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_tuition_attendance_tuition_id ON public.tuition_attendance(tuition_id)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tuition_attendance' AND column_name='student_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_tuition_attendance_student_id ON public.tuition_attendance(student_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teacher_service_areas' AND column_name='teacher_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_teacher_service_areas_teacher_id ON public.teacher_service_areas(teacher_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teacher_availability' AND column_name='teacher_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_teacher_availability_teacher_id ON public.teacher_availability(teacher_id)';
  END IF;

  -- Add other suggested FK indexes here following the same pattern if needed.
END
$$;

COMMIT;

-- Notes:
-- - This script is intentionally defensive: it will only create indexes if the referenced
--   table and column exist. Run in staging first and confirm query plans before production.
-- - After deployment consider monitoring pg_stat_user_indexes for usage and remove duplicates/unused indexes.
