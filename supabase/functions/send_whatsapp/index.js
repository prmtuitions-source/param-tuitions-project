/*
Simple Express-style endpoint for sending WhatsApp messages via Twilio.
Deploy this as a small Node process or adapt to Supabase Edge Functions / Cloud Run.

Environment variables required:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_WHATSAPP_FROM  (e.g. 'whatsapp:+1415XXXXXXX')
- WHATSAPP_API_KEY       (shared secret to protect this endpoint)

Request: POST / (JSON)
{ to: '+91XXXXXXXXXX', body: 'Message text' }

This file is a minimal example; secure/scale as needed.
*/

const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.json());
// Don't leak framework info in headers
if (typeof app.disable === 'function') app.disable('x-powered-by');

const PORT = process.env.PORT || 8787;

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_FROM) {
  console.warn('TWILIO envvars not set. Endpoint will error if called.');
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Simple API key middleware
// API key middleware: require header only and use constant-time compare
app.use((req, res, next) => {
  const key = req.header('x-api-key');
  const expected = process.env.WHATSAPP_API_KEY;
  if (!expected) return next(); // No API key configured — allow (not recommended)
  if (!key) return res.status(401).json({ error: 'unauthorized' });
  // constant-time compare to reduce timing attacks
  const safeCompare = (a, b) => {
    if (!a || !b || a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return result === 0;
  };
  if (!safeCompare(key, expected)) return res.status(401).json({ error: 'unauthorized' });
  next();
});

app.post('/', async (req, res) => {
  const { to, body } = req.body || {};
  if (!to || !body) return res.status(400).json({ error: 'to and body required' });

  try {
    const msg = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${to}`,
      body: body
    });
    return res.json({ ok: true, sid: msg.sid });
  } catch (e) {
    console.error('twilio send error', e && e.message);
    return res.status(500).json({ error: e && e.message });
  }
});

app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => console.log('send_whatsapp listening on', PORT));
