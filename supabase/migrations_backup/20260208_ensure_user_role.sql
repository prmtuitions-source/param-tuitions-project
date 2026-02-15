-- Ensure `user_role` is present and normalized; map legacy 'customer' -> 'parent'
-- Run this in Supabase SQL editor or include it as a migration.

-- 1) Normalize existing rows where user_role is NULL but roles array exists
UPDATE public.profiles
SET user_role = roles[1]
WHERE (user_role IS NULL OR user_role = '')
  AND roles IS NOT NULL
  AND array_length(roles,1) >= 1;

-- 2) Map legacy 'customer' to 'parent' to align with client role names
UPDATE public.profiles
SET user_role = 'parent', roles = ARRAY['parent']
WHERE user_role = 'customer';

-- 3) Ensure future inserts/updates derive user_role from roles when missing
CREATE OR REPLACE FUNCTION public.ensure_user_role()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.user_role IS NULL OR NEW.user_role = '' THEN
    IF NEW.roles IS NOT NULL AND array_length(NEW.roles,1) >= 1 THEN
      NEW.user_role := NEW.roles[1];
    END IF;
  END IF;

  -- If still missing, default to 'parent'
  IF NEW.user_role IS NULL OR NEW.user_role = '' THEN
    NEW.user_role := 'parent';
  END IF;

  -- Keep roles array in sync with user_role (first element)
  IF NEW.roles IS NULL OR array_length(NEW.roles,1) = 0 OR NEW.roles[1] IS DISTINCT FROM NEW.user_role THEN
    NEW.roles := ARRAY[NEW.user_role];
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_ensure_user_role ON public.profiles;
CREATE TRIGGER trg_profiles_ensure_user_role
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.ensure_user_role();

-- 4) Optional strict schema changes (uncomment to apply)
-- ALTER TABLE public.profiles
--   ALTER COLUMN user_role SET DEFAULT 'parent',
--   ALTER COLUMN user_role SET NOT NULL;
