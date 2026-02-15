const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());
// Hide framework fingerprint
app.disable('x-powered-by');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

// GET /api/signed-url?bucket=...&path=...&expires=...
app.get('/api/signed-url', async (req, res) => {
  try {
    const { bucket = 'teacher-verification', path, expires = '60' } = req.query;
    if (!path) return res.status(400).json({ error: 'Missing path parameter' });

    // Validate bucket against allowlist to prevent abuse
    const ALLOWED_BUCKETS = ['teacher-verification', 'website-assets', 'public-assets'];
    if (!ALLOWED_BUCKETS.includes(bucket)) return res.status(400).json({ error: 'Invalid bucket' });

    // Basic path validation: prevent traversal and disallow suspicious protocols
    if (typeof path !== 'string' || path.includes('..') || !/^[a-zA-Z0-9_\-\/\.]+$/.test(path)) {
      return res.status(400).json({ error: 'Invalid path format' });
    }

    // Require user token to assert ownership
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;
    if (!token) return res.status(401).json({ error: 'Missing Authorization token' });

    // Validate token and get user
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Invalid token' });
    const user = userData.user;

    // Basic owner check: expect path like "prefix/<ownerId>/..."
    const parts = path.split('/');
    const ownerId = parts.length >= 2 ? parts[1] : null;
    if (!ownerId) return res.status(400).json({ error: 'Invalid path format' });

    if (ownerId !== user.id) {
      // Allow admins to request signed URLs for audit/review
      const { data: profileRow } = await supabaseAdmin
        .from('profiles')
        .select('user_role')
        .eq('id', user.id)
        .maybeSingle();

      const role = profileRow?.user_role || '';
      const isAdmin = ['admin', 'superadmin', 'super_admin', 'staff'].includes(role.toLowerCase());
      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden: not owner of requested object' });
      }
      // admins are allowed
    }

    const raw = parseInt(expires, 10);
    const ttl = Number.isInteger(raw) ? Math.min(Math.max(raw || 60, 10), 3600) : 60;
    const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, ttl);
    if (error) return res.status(500).json({ error: error.message || error });

    return res.json({ signedUrl: data.signedUrl, expiresIn: ttl });
  } catch (err) {
    console.error('Signed URL error', err);
    return res.status(500).json({ error: err.message || err });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Signed-URL server listening on port ${PORT}`));
