-- Idempotent trigger function to create or update a profile when a new auth.user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_role, roles)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'customer',
    ARRAY['user']
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      user_role  = EXCLUDED.user_role,
      roles      = EXCLUDED.roles;

  RETURN NEW;
END;
$$;
