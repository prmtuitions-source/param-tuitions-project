-- Helper SQL queries to run in Supabase SQL Editor to inspect and help recover 'blogs' data
-- 1) List tables related to blogs
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public' AND tablename ILIKE '%blog%';

-- 2) Basic sanity checks: does 'blogs' exist and how many rows remain
SELECT to_regclass('public.blogs') AS blogs_table_exists;
SELECT COUNT(*) AS remaining_blogs FROM public.blogs;

-- 3) Show most recent blog rows (if any)
SELECT id, title, slug, created_at, updated_at
FROM public.blogs
ORDER BY created_at DESC
LIMIT 50;

-- 4) Look for likely archive/backup tables that may contain blog data
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public' AND (tablename ILIKE '%blog%_backup' OR tablename ILIKE '%archive%' OR tablename ILIKE '%backup%');

-- 5) If an audit or change-log table exists, inspect recent delete events
-- (Common audit table names: audit_log, change_log, revisions, blog_revisions)
SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename ILIKE '%audit%' OR tablename ILIKE '%revision%';

-- Example: inspect a candidate audit table (replace audit_log with actual name)
-- SELECT * FROM public.audit_log WHERE table_name='blogs' ORDER BY created_at DESC LIMIT 50;

-- 6) If you have Postgres point-in-time or WAL backups managed by Supabase, use the Supabase UI backups/restore flow.
-- This SQL cannot restore WAL snapshots directly. Contact Supabase support or use project Backups in the Supabase dashboard.

-- 7) Safety: create a snapshot of current (even empty) blogs table before any destructive action
-- (creates blogs_snapshot_<timestamp> with current rows)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='blogs_snapshot') THEN
    RAISE NOTICE 'blogs_snapshot already exists - consider using a timestamped name';
  ELSE
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.blogs_snapshot AS TABLE public.blogs WITH NO DATA';
  END IF;
END$$;

-- Fill the snapshot (run once)
-- INSERT INTO public.blogs_snapshot SELECT * FROM public.blogs;

-- 8) If you find a backup/archived table with content, you can copy rows back (example)
-- INSERT INTO public.blogs (id,title,slug,content,image_url,created_at,updated_at)
-- SELECT id,title,slug,content,image_url,created_at,updated_at FROM public.blogs_backup WHERE <filter>;

-- 9) If nothing exists in DB, consider restoring from exported SQL/migrations in your repo
-- Check repository file: supabase/migrations/ and supabase_migrations_backup.json for any 'blogs' inserts.

-- 10) If no DB copy available, use web cache scraping as last resort (see README_restore_blogs.md)
