-- Add marked_by_id and marked_by_role to tuition_attendance and backfill existing rows
-- Idempotent migration

BEGIN;

ALTER TABLE IF EXISTS public.tuition_attendance
  ADD COLUMN IF NOT EXISTS marked_by_id uuid;

ALTER TABLE IF EXISTS public.tuition_attendance
  ADD COLUMN IF NOT EXISTS marked_by_role text;

-- Backfill: set marked_by_id = teacher_id and marked_by_role from profiles when possible
UPDATE public.tuition_attendance ta
SET marked_by_id = ta.teacher_id,
    marked_by_role = p.user_role
FROM public.profiles p
WHERE ta.marked_by_id IS NULL
  AND ta.teacher_id IS NOT NULL
  AND p.id = ta.teacher_id;

-- Optional index for lookup
CREATE INDEX IF NOT EXISTS idx_tuition_attendance_marked_by ON public.tuition_attendance (marked_by_id, marked_by_role);

COMMIT;

-- End migration
