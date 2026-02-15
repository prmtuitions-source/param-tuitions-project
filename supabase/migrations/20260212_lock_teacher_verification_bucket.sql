-- Migration: Restrict teacher-verification bucket access
-- Date: 2026-02-12
-- Goal: Remove public read access to teacher verification uploads and add owner/admin policies.

BEGIN;

-- 1) Remove broad public access policy (if present)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- 2) Remove overly-broad insert policy if present
DROP POLICY IF EXISTS "Teacher Upload" ON storage.objects;

-- 3) Allow teachers to SELECT their own verification objects when they upload into a per-user folder
DROP POLICY IF EXISTS "Teacher verification owner read" ON storage.objects;
CREATE POLICY "Teacher verification owner read"
  ON storage.objects
  AS permissive
  FOR SELECT
  TO authenticated
  USING (
    (bucket_id = 'teacher-verification'::text)
    AND ((storage.foldername(name))[1] = auth.uid()::text)
  );

-- 4) Allow admins and super_admins to SELECT teacher verification objects
DROP POLICY IF EXISTS "Teacher verification admin read" ON storage.objects;
CREATE POLICY "Teacher verification admin read"
  ON storage.objects
  AS permissive
  FOR SELECT
  TO authenticated
  USING (
    (bucket_id = 'teacher-verification'::text)
    AND (
      (SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text])
    )
  );

-- 5) Allow uploads only into an owner folder (owner or admin)
DROP POLICY IF EXISTS "Teacher verification upload" ON storage.objects;
CREATE POLICY "Teacher verification upload"
  ON storage.objects
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (bucket_id = 'teacher-verification'::text)
    AND (
      ((storage.foldername(name))[1] = auth.uid()::text)
      OR
      ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text]))
    )
  );

-- 6) Ensure admins can view teacher documents (other bucket)
DROP POLICY IF EXISTS "Admins can view teacher docs" ON storage.objects;
CREATE POLICY "Admins can view teacher docs"
  ON storage.objects
  AS permissive
  FOR SELECT
  TO authenticated
  USING (
    (bucket_id = 'teacher-documents'::text)
    AND ((SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()) = ANY (ARRAY['admin'::text, 'super_admin'::text]))
  );

COMMIT;

-- Notes:
--  - This migration assumes uploads are stored under a per-user prefix (e.g. "<user-id>/file.jpg").
--    If your current upload code does not place files in a user-specific folder, you must update
--    upload logic to include the user id in the object name or else owners will not be able to
--    access their own files via the owner policy. Admins will still be able to access files.
