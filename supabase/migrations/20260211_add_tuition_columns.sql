-- Add missing tuition columns required by Excel import
-- Run this against your Supabase/Postgres instance (requires appropriate privileges)

ALTER TABLE public.tuitions
  ADD COLUMN IF NOT EXISTS classes_per_week integer,
  ADD COLUMN IF NOT EXISTS duration_hours text,
  ADD COLUMN IF NOT EXISTS timing text,
  ADD COLUMN IF NOT EXISTS teacher_gender text,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS current_location text,
  ADD COLUMN IF NOT EXISTS referred_to text,
  ADD COLUMN IF NOT EXISTS cancel_reason text;

-- Note: specific_demands is text[] in current schema; preferred_demo_date is date.
-- Adjust types if you prefer different types (e.g., numeric for duration_hours).
