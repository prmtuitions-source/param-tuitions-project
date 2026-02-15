# Signed-URL Service (signed-url.js)

Purpose
- Provides short-lived signed URLs for private Supabase Storage objects.
- Validates the requesting user's JWT and enforces basic owner/admin access checks.

Required environment variables
- `SUPABASE_URL` — your Supabase project URL (e.g. https://xyz.supabase.co)
- `SUPABASE_SERVICE_KEY` — Supabase service-role key (keep secret)
- `PORT` — optional (default: `8787`)

Run locally

```bash
# install deps (if not already)
npm install

# run
SUPABASE_URL="https://<project>.supabase.co" SUPABASE_SERVICE_KEY="<service-key>" node signed-url.js
```

Usage (client)
- Client should call the endpoint `/api/signed-url?bucket=<bucket>&path=<path>&expires=<seconds>`
- Include the user's access token in the `Authorization: Bearer <token>` header.
- The service returns `{ signedUrl, expiresIn }`.

Security notes & deployment
- Never commit `SUPABASE_SERVICE_KEY` to source control. Store it in your host's secret manager.
- Host this service in a trusted environment (internal network, VPC, or behind an API gateway).
- Use HTTPS and a reverse-proxy to enforce TLS and rate-limiting.
- Rotate the `SUPABASE_SERVICE_KEY` regularly and update the host secret.
- Limit allowed buckets or perform stricter ACL checks inside `signed-url.js` if needed.

Recommended quick deployments
- Vercel / Netlify functions: wrap the handler as a serverless function and set secrets in the deployment UI.
- Small VPS / Docker: create a `Dockerfile` and run inside a small container behind your proxy.

Example minimal Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json .
COPY signed-url.js .
RUN npm install --production
ENV PORT=8787
EXPOSE 8787
CMD ["node", "signed-url.js"]
```

Audit checklist before production
- Ensure the token validation routine uses the correct Supabase `auth.getUser(token)` (already implemented).
- Confirm owner extraction logic matches your storage path conventions (current code expects `prefix/<ownerId>/...`).
- Monitor for 403/401 errors in logs to detect misconfigured paths or missing tokens.

File: signed-url.js

See implementation in this repo: [server/signed-url.js](server/signed-url.js)
