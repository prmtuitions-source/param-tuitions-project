-- Add managed fields to tuition_attendance so absent records can be marked as managed/makeup
-- Idempotent migration

ALTER TABLE IF EXISTS public.tuition_attendance
  ADD COLUMN IF NOT EXISTS managed_at timestamptz,
  ADD COLUMN IF NOT EXISTS managed_by_id uuid,
  ADD COLUMN IF NOT EXISTS managed_by_role text,
  ADD COLUMN IF NOT EXISTS managed_makeup_id uuid;

CREATE INDEX IF NOT EXISTS idx_tuition_attendance_managed_at ON public.tuition_attendance (managed_at);

-- no backfill required

-- End migration
