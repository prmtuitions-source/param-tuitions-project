-- Add whatsapp opt-in flag to profiles
BEGIN;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in boolean DEFAULT true;

-- Ensure existing rows default to true
UPDATE public.profiles SET whatsapp_opt_in = true WHERE whatsapp_opt_in IS NULL;

COMMIT;
