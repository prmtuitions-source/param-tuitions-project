/*
Simple WhatsApp worker for Param Tuition Bureau
- Polls `notification_jobs` for pending jobs (SELECT FOR UPDATE SKIP LOCKED)
- Resolves template and T&C
- Calls your send endpoint (SEND_WHATSAPP_URL) with API key
- Writes an entry into `notification_logs`
- Updates `notification_jobs` status and retries on failure

Usage:
  npm install pg node-fetch dotenv
  REPLACE env vars below or create a .env file
  node scripts/whatsapp_worker.js

Environment variables:
  DATABASE_URL            - Postgres connection string (Supabase)
  SEND_WHATSAPP_URL       - e.g. http://localhost:8787/
  SEND_WHATSAPP_API_KEY   - header x-api-key to call the send endpoint
  POLL_INTERVAL_MS        - optional (default 3000)
  MAX_RETRIES             - optional (default 5)
*/

const { Client } = require('pg');
let fetch;
try {
  fetch = global.fetch || require('node-fetch');
} catch (e) {
  if (typeof global.fetch === 'function') fetch = global.fetch;
  else {
    console.error('Fetch not available. Install node-fetch (v2) or run Node 18+');
    process.exit(1);
  }
}
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
const SEND_WHATSAPP_URL = process.env.SEND_WHATSAPP_URL || 'http://localhost:8787/';
const SEND_WHATSAPP_API_KEY = process.env.SEND_WHATSAPP_API_KEY || '';
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '3000', 10);
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '5', 10);

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const pg = new Client({ connectionString: DATABASE_URL });

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

// Map generic status -> template_key
function mapStatusToTemplateKey(status, payload) {
  if (!status) return 'status_changed';
  const s = String(status).toLowerCase();
  if (s === 'confirmed') return 'teacher_booked';
  if (s === 'demo_scheduled' || s === 'demo_scheduled'.toLowerCase()) return 'demo_confirmed';
  if (s === 'demo_started' || s === 'demo_started'.toLowerCase()) return 'class_started';
  // fallback
  return 'status_changed';
}

async function resolveTemplate(templateKey, recipientType, payload, client) {
  // fetch template
  const { rows } = await client.query('SELECT template_key, title, recipient_type, body FROM public.notification_templates WHERE template_key = $1 LIMIT 1', [templateKey]);
  if (rows.length === 0) return null;
  let body = rows[0].body;

  // fetch system config
  const sysRes = await client.query("SELECT key, value FROM public.system_config WHERE key IN ('BUSINESS_NAME','ADMIN_PHONE_E164','ADMIN_WHATSAPP_LINK','FRONTEND_BASE_URL','PARENT_LOGIN_PATH','TEACHER_LOGIN_PATH')");
  const sys = Object.fromEntries(sysRes.rows.map(r => [r.key, r.value]));

  const business = sys.BUSINESS_NAME || 'Param Tuition Bureau';
  const adminPhone = sys.ADMIN_PHONE_E164 || '';
  const adminWhatsappLink = sys.ADMIN_WHATSAPP_LINK || '';
  const base = sys.FRONTEND_BASE_URL || '';
  const parentPath = sys.PARENT_LOGIN_PATH || '/login-parent';
  const teacherPath = sys.TEACHER_LOGIN_PATH || '/login-teacher';

  const loginLink = recipientType === 'teacher' ? (base + teacherPath) : (base + parentPath);

  // fetch T&C if needed (return version too)
  let tncContent = null;
  let tncVersion = null;
  if (body.includes('{{tnc_content}}') || templateKey === 'demo_confirmed') {
    const tRes = await client.query('SELECT version, content FROM public.terms_and_conditions WHERE recipient_type = $1 ORDER BY created_at DESC LIMIT 1', [recipientType]);
    if (tRes.rows.length) {
      tncContent = tRes.rows[0].content;
      tncVersion = tRes.rows[0].version;
    } else {
      tncContent = '';
      tncVersion = null;
    }
  }

  // perform placeholder replacements (simple)
  const placeholders = {
    '{{teacher_name}}': payload.teacher_name || '',
    '{{class_name}}': payload.class_name || '',
    '{{subject}}': payload.subject || '',
    '{{tuition_no}}': payload.tuition_no || '',
    '{{date}}': payload.date || '',
    '{{time}}': payload.time || '',
    '{{login_link}}': loginLink,
    '{{tnc_content}}': tncContent || '',
    '{{admin_phone}}': adminPhone,
    '{{admin_whatsapp_link}}': adminWhatsappLink,
    '{{attendance_status}}': payload.attendance_status || ''
  };

  for (const [k, v] of Object.entries(placeholders)) {
    body = body.split(k).join(v);
  }

  // prepend business header if not present
  if (!body.includes(business)) {
    body = `${business}\n` + body;
  }

  return { body, tncContent, tncVersion };
}

async function processJob(job) {
  const client = pg;
  const jid = job.id;
  console.log('Processing job', jid, job.template_key);

  // Determine recipient phone and opt-in
  let recipientPhone = job.payload && job.payload.recipient_phone;
  let whatsappOptIn = true;
  if (!recipientPhone && job.recipient_id) {
    try {
      const pr = await client.query('SELECT phone_number, coalesce(whatsapp_opt_in, true) as whatsapp_opt_in FROM public.profiles WHERE id = $1 LIMIT 1', [job.recipient_id]);
      if (pr.rows.length) {
        recipientPhone = pr.rows[0].phone_number;
        whatsappOptIn = pr.rows[0].whatsapp_opt_in;
      }
    } catch (e) { console.warn('failed to fetch recipient phone/opt-in', e); }
  }

  if (!recipientPhone) {
    console.warn('No recipient phone for job', jid);
    await client.query('UPDATE public.notification_jobs SET status = $1 WHERE id = $2', ['failed', jid]);
    await client.query("INSERT INTO public.notification_logs(id, tuition_id, application_id, event_ref, recipient_type, recipient_id, recipient_phone, template_key, payload, dedup_key, sent_at, delivery_status, provider_response) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), $10, $11)", [job.tuition_id, job.application_id, job.event_ref || null, job.recipient_type, job.recipient_id, recipientPhone, job.template_key, job.payload || {}, job.dedup_key, 'failed', {error: 'no_recipient_phone'}]);
    return;
  }

  // Respect recipient opt-in setting
  if (whatsappOptIn === false) {
    console.log('Recipient opted out of WhatsApp, skipping job', jid);
    await client.query('UPDATE public.notification_jobs SET status = $1 WHERE id = $2', ['skipped', jid]);
    await client.query("INSERT INTO public.notification_logs(id, tuition_id, application_id, event_ref, recipient_type, recipient_id, recipient_phone, template_key, payload, dedup_key, sent_at, delivery_status, provider_response) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), $10, $11)", [job.tuition_id, job.application_id, job.event_ref || null, job.recipient_type, job.recipient_id, recipientPhone, job.template_key, job.payload || {}, job.dedup_key, 'opted_out', { reason: 'whatsapp_opted_out' }]);
    return;
  }

  // Map status_changed to a concrete template if required
  let templateKey = job.template_key;
  if (templateKey === 'status_changed' && job.payload && job.payload.new_status) {
    templateKey = mapStatusToTemplateKey(job.payload.new_status, job.payload);
  }

  // Resolve template
  const resolved = await resolveTemplate(templateKey, job.recipient_type, job.payload || {}, client);
  if (!resolved) {
    console.warn('Template not found for', templateKey);
    await client.query('UPDATE public.notification_jobs SET status = $1 WHERE id = $2', ['failed', jid]);
    return;
  }

  // Build send payload
  const sendPayload = { to: recipientPhone, body: resolved.body };

  // Attempt send
  try {
    const resp = await fetch(SEND_WHATSAPP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SEND_WHATSAPP_API_KEY
      },
      body: JSON.stringify(sendPayload)
    });

    const text = await resp.text();
    const providerResp = { status: resp.status, body: text };

    if (resp.ok) {
      // insert notification_log
      await client.query("INSERT INTO public.notification_logs(id, tuition_id, application_id, event_ref, recipient_type, recipient_id, recipient_phone, template_key, payload, dedup_key, sent_at, delivery_status, provider_response) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), $10, $11)", [job.tuition_id, job.application_id, job.event_ref || null, job.recipient_type, job.recipient_id, recipientPhone, templateKey, job.payload || {}, job.dedup_key, 'sent', providerResp]);

      // If demo_confirmed, write demo_logs with tnc version (if available)
      if (templateKey === 'demo_confirmed') {
        // resolved may contain tncVersion
        const tncVersion = resolved && resolved.tncVersion ? resolved.tncVersion : null;
        await client.query('INSERT INTO public.demo_logs(demo_id, tuition_id, application_id, tnc_version, shared_at) VALUES (gen_random_uuid(), $1, $2, $3, now())', [job.tuition_id, job.application_id, tncVersion]);
        // Optionally, mark terms_and_conditions as shared by inserting/updating a shared log (demo_logs already records sharing)
      }

      await client.query('UPDATE public.notification_jobs SET status = $1 WHERE id = $2', ['done', jid]);
      console.log('Job sent:', jid);
    } else {
      console.warn('Provider returned non-ok', resp.status, text);
      // retry logic
      const attempts = job.attempts + 1;
      if (attempts >= MAX_RETRIES) {
        await client.query('UPDATE public.notification_jobs SET status = $1, attempts = $2 WHERE id = $3', ['failed', attempts, jid]);
        await client.query("INSERT INTO public.notification_logs(id, tuition_id, application_id, event_ref, recipient_type, recipient_id, recipient_phone, template_key, payload, dedup_key, sent_at, delivery_status, provider_response) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), $10, $11)", [job.tuition_id, job.application_id, job.event_ref || null, job.recipient_type, job.recipient_id, recipientPhone, templateKey, job.payload || {}, job.dedup_key, 'failed', providerResp]);
      } else {
        // schedule retry with exponential backoff
        const delay = Math.pow(2, attempts) * 1000; // ms
        const scheduledAt = new Date(Date.now() + delay).toISOString();
        await client.query('UPDATE public.notification_jobs SET status = $1, attempts = $2, scheduled_at = $3 WHERE id = $4', ['pending', attempts, scheduledAt, jid]);
      }
    }
  } catch (e) {
    console.error('Send error', e);
    const attempts = (Number(job.attempts) || 0) + 1;
    if (attempts >= MAX_RETRIES) {
      await client.query('UPDATE public.notification_jobs SET status = $1, attempts = $2 WHERE id = $3', ['failed', attempts, jid]);
      await client.query("INSERT INTO public.notification_logs(id, tuition_id, application_id, event_ref, recipient_type, recipient_id, recipient_phone, template_key, payload, dedup_key, sent_at, delivery_status, provider_response) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), $10, $11)", [job.tuition_id, job.application_id, job.event_ref || null, job.recipient_type, job.recipient_id, recipientPhone, templateKey, job.payload || {}, job.dedup_key, 'failed', { error: e.message }]);
    } else {
      const delay = Math.pow(2, attempts) * 1000;
      const scheduledAt = new Date(Date.now() + delay).toISOString();
      await client.query('UPDATE public.notification_jobs SET status = $1, attempts = $2, scheduled_at = $3 WHERE id = $4', ['pending', attempts, scheduledAt, jid]);
    }
  }
}

async function pollLoop() {
  await pg.connect();
  console.log('Worker connected to DB, polling every', POLL_INTERVAL_MS, 'ms');

  while (true) {
    try {
      // Use a transaction with SELECT FOR UPDATE SKIP LOCKED to safely claim a job
      const tx = await pg.query('BEGIN');
      const sel = await pg.query("SELECT * FROM public.notification_jobs WHERE status = 'pending' AND scheduled_at <= now() ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED");
      if (sel.rows.length === 0) {
        await pg.query('COMMIT');
        await sleep(POLL_INTERVAL_MS);
        continue;
      }
      const job = sel.rows[0];
      // mark processing
      await pg.query('UPDATE public.notification_jobs SET status = $1 WHERE id = $2', ['processing', job.id]);
      await pg.query('COMMIT');

      // process outside transaction
      await processJob(job);
    } catch (e) {
      console.error('Polling loop error', e);
      try { await pg.query('ROLLBACK'); } catch(_){}
      await sleep(2000);
    }
  }
}

pollLoop().catch(e => { console.error('Worker failed', e); process.exit(1); });
