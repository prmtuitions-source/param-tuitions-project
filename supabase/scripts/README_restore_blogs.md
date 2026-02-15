Steps to check and attempt recovery of deleted blog rows

1) Open Supabase project -> SQL Editor and run the queries in `check_restore_blogs.sql`.

2) Key checks the queries perform:
   - List related tables with 'blog' in the name.
   - Confirm whether `public.blogs` exists and count remaining rows.
   - Show the most recent rows (if present).
   - Search for likely archive or backup tables.
   - Suggest creating a snapshot table to preserve current state before any write.

3) If you find a backup/archive table (e.g., `blogs_backup`), restore rows with:
   ```sql
   INSERT INTO public.blogs (id, title, slug, content, image_url, created_at, updated_at)
   SELECT id, title, slug, content, image_url, created_at, updated_at FROM public.blogs_backup WHERE <filter>;
   ```

4) If no backup tables exist and Supabase Backups are available (managed by Supabase), use the Supabase dashboard -> Backups -> Restore flow or contact Supabase support and reference your project ID and approximate deletion time.

5) If the DB cannot be restored, consider recovering content from public caches (Wayback Machine, Google Cache) or from your repo (`supabase/migrations/` or `supabase_migrations_backup.json`). Use the following Node.js snippet to attempt fetching Google Cache for a list of blog URLs (replace with your domain):

   ```javascript
   // simple fetch script (node >=18)
   import fs from 'fs';
   import fetch from 'node-fetch';

   const urls = [
     'https://your-site.example/blog/slug-1',
     'https://your-site.example/blog/slug-2'
   ];

   async function download() {
     for (const u of urls) {
       const cacheUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://webcache.googleusercontent.com/search?q=cache:' + u)}`;
       try {
         const res = await fetch(cacheUrl);
         const text = await res.text();
         const filename = `cache-${u.split('/').pop()}.html`;
         fs.writeFileSync(filename, text);
         console.log('Saved', filename);
       } catch (err) { console.error('Failed for', u, err); }
     }
   }
   download();
   ```

6) After recovering content, insert the recovered blog rows into `public.blogs` using `INSERT` SQL (ensure unique `id` and `slug`).

7) Prevent future loss: add an audit trigger (example in repo suggestions) and enable Supabase scheduled backups / export daily.

If you want I can:
- Run an automated scan of `supabase/migrations/` for 'blogs' seed inserts and produce a restore SQL.
- Generate a SuperAdmin 'Add Blog' form component next.
