-- Migration: Replace direct auth.uid() usages in RLS policies with (SELECT auth.uid())
-- Date: 2026-02-12
-- This migration locates existing policies that reference auth.uid() in their
-- USING or WITH CHECK expressions, drops them, and recreates them with
-- auth.uid() wrapped as (SELECT auth.uid()). It attempts to preserve
-- policy name, target table, command, and role list.

SET client_min_messages = WARNING;
BEGIN;

DO $$
DECLARE
  rec RECORD;
  polrel TEXT;
  role_list TEXT;
  cmd TEXT;
  qual TEXT;
  chk TEXT;
  create_stmt TEXT;
BEGIN
  FOR rec IN
    SELECT polname, polrelid, polcmd, polroles, pg_get_expr(polqual, polrelid) AS qual, pg_get_expr(polwithcheck, polrelid) AS chk
    FROM pg_catalog.pg_policy
  LOOP
    IF (rec.qual IS NOT NULL AND rec.qual LIKE '%auth.uid()%') OR (rec.chk IS NOT NULL AND rec.chk LIKE '%auth.uid()%') THEN
      polrel := rec.polrelid::regclass::text;

      -- Build role list (quoted identifiers). If no roles, default to PUBLIC.
      SELECT string_agg(quote_ident(rolname), ',') INTO role_list
      FROM pg_authid WHERE oid = ANY (rec.polroles);
      IF role_list IS NULL THEN
        role_list := 'PUBLIC';
      END IF;

      -- Map command
      cmd := CASE rec.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        ELSE 'ALL'
      END;

      -- Replace auth.uid() occurrences with SELECT form
      qual := rec.qual;
      chk := rec.chk;
      IF qual IS NOT NULL THEN
        qual := replace(qual, 'auth.uid()', '(SELECT auth.uid())');
      END IF;
      IF chk IS NOT NULL THEN
        chk := replace(chk, 'auth.uid()', '(SELECT auth.uid())');
      END IF;

      -- Drop existing policy if present
      EXECUTE format('DROP POLICY IF EXISTS %I ON %s', rec.polname, polrel);

      -- Recreate the policy using the modified expressions
      create_stmt := format('CREATE POLICY %I ON %s FOR %s TO %s', rec.polname, polrel, cmd, role_list);
      IF qual IS NOT NULL AND trim(qual) <> '' THEN
        create_stmt := create_stmt || ' USING (' || qual || ')';
      END IF;
      IF chk IS NOT NULL AND trim(chk) <> '' THEN
        create_stmt := create_stmt || ' WITH CHECK (' || chk || ')';
      END IF;

      RAISE NOTICE 'Recreating policy: %', create_stmt;
      EXECUTE create_stmt;
    END IF;
  END LOOP;
END
$$;

COMMIT;

-- Notes:
-- - This migration must be run by a privileged user (owner/superuser) because it reads
--   from pg_authid and recreates policies. Run in staging first.
-- - It preserves policy names and commands; complex policies using custom functions
--   with auth.* calls are adjusted only where the textual 'auth.uid()' appears.
-- - After running, verify critical flows and review any policy bodies that had manual
--   adjustments required.
