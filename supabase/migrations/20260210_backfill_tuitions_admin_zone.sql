-- Backfill missing or placeholder admin_zone on tuitions and ensure future inserts are populated
-- Idempotent: safe to run multiple times

/* 1) Backfill existing tuitions where admin_zone is NULL or appears to be a placeholder like '<...>' */
UPDATE public.tuitions t
SET admin_zone = l.admin_zone
FROM public.locations l
WHERE (t.admin_zone IS NULL OR t.admin_zone ~ '^\s*$' OR t.admin_zone LIKE '<%')
  AND t.location_name = l.location_name;


/* 2) Create (or replace) function to set admin_zone on insert when missing */
CREATE OR REPLACE FUNCTION public.set_tuition_admin_zone()
RETURNS trigger AS $$
BEGIN
  IF (NEW.admin_zone IS NULL OR NEW.admin_zone = '') AND NEW.location_name IS NOT NULL THEN
    SELECT l.admin_zone INTO NEW.admin_zone
    FROM public.locations l
    WHERE l.location_name = NEW.location_name
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


/* 3) (Re)create trigger that fires BEFORE INSERT to ensure admin_zone is populated */
DROP TRIGGER IF EXISTS tr_set_tuition_admin_zone ON public.tuitions;
CREATE TRIGGER tr_set_tuition_admin_zone
BEFORE INSERT ON public.tuitions
FOR EACH ROW
EXECUTE FUNCTION public.set_tuition_admin_zone();

/* 4) Optional safety: also populate admin_zone for any tuitions inserted with placeholder tokens */
UPDATE public.tuitions t
SET admin_zone = l.admin_zone
FROM public.locations l
WHERE (t.admin_zone ~ '^<.*>$')
  AND t.location_name = l.location_name;

/* End migration */
