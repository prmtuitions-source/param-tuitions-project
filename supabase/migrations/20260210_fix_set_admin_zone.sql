-- Fix set_admin_zone to use schema-qualified table and guard errors
-- Run this in Supabase SQL Editor or via psql as a DB admin.

CREATE OR REPLACE FUNCTION public.set_admin_zone()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_zone text;
  v_admin uuid;
BEGIN
  -- initialize
  NEW.admin_zone := NULL;
  NEW.assigned_admin_id := NULL;

  IF NEW.main_location_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Safely fetch the location's admin_zone
  BEGIN
    SELECT admin_zone INTO v_zone
    FROM public.locations
    WHERE id = NEW.main_location_id;
  EXCEPTION WHEN OTHERS THEN
    v_zone := NULL;
  END;

  IF v_zone IS NULL THEN
    RETURN NEW;
  END IF;

  NEW.admin_zone := v_zone;

  -- Find any available admin in the same zone (role = 'admin')
  BEGIN
    SELECT id INTO v_admin
    FROM public.profiles
    WHERE admin_zone = v_zone
      AND user_role = 'admin'
    LIMIT 1;
    NEW.assigned_admin_id := v_admin;
  EXCEPTION WHEN OTHERS THEN
    NEW.assigned_admin_id := NULL;
  END;

  RETURN NEW;
END;
$$;
