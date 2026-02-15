-- Adds optional tuition columns present in Excel exports
BEGIN;

ALTER TABLE public.tuitions
  ADD COLUMN IF NOT EXISTS classes_per_week integer,
  ADD COLUMN IF NOT EXISTS duration_hours text,
  ADD COLUMN IF NOT EXISTS timing text,
  ADD COLUMN IF NOT EXISTS teacher_gender text,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS current_location text,
  ADD COLUMN IF NOT EXISTS related_tn text,
  ADD COLUMN IF NOT EXISTS allotted_to text,
  ADD COLUMN IF NOT EXISTS referred_to text,
  ADD COLUMN IF NOT EXISTS cancel_reason text,
  ADD COLUMN IF NOT EXISTS link text,
  ADD COLUMN IF NOT EXISTS contact_name text;

COMMIT;
