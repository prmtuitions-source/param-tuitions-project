Production Security Headers and Deployment Guidance

This project is a static SPA built with Vite. Many ZAP-reported issues (CSP missing, HSTS, X-Frame-Options, X-Content-Type-Options, cache-control, SameSite cookies) must be fixed at the HTTP server / CDN level.

Recommended header set (example):

Content-Security-Policy: default-src 'self'; base-uri 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' data:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://*.supabase.com https://*.paramtuitions.com https://*.googleapis.com https://*.mapbox.com ws: wss:; frame-ancestors 'none'; object-src 'none'; form-action 'self'; upgrade-insecure-requests

X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Cache-Control: public, max-age=31536000, immutable  # for build assets with hashed names

Cookie attributes:
- Set SameSite=Lax or SameSite=Strict for authentication cookies where possible.
- Avoid setting SameSite=None unless Secure is also set.

Avoid tokens in URLs:
- Do not pass authentication tokens in query parameters (e.g. ?token=...). Use Authorization headers or secure SameSite cookies.
- If you currently append tokens to job cards or deep-links for testing, switch to server-side delivery or short-lived signed links.

Hosting-specific examples

Nginx (example server block):

    add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' data:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://*.supabase.com https://*.paramtuitions.com https://*.googleapis.com ws: wss:; frame-ancestors 'none'; object-src 'none'; form-action 'self'; upgrade-insecure-requests" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    location / {
      try_files $uri /index.html;
    }

Netlify (_headers file):

    /*
      Content-Security-Policy: default-src 'self'; base-uri 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' data:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://*.supabase.com https://*.paramtuitions.com https://*.googleapis.com ws: wss:; frame-ancestors 'none'; object-src 'none'; form-action 'self'; upgrade-insecure-requests
      X-Frame-Options: DENY
      X-Content-Type-Options: nosniff
      Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
      Referrer-Policy: strict-origin-when-cross-origin
      Permissions-Policy: geolocation=(), microphone=(), camera=()
    /*

Vercel (vercel.json headers example):

    {
      "headers": [
        {
          "source": "/(.*)",
          "headers": [
            { "key": "Content-Security-Policy", "value": "default-src 'self'; base-uri 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' data:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://*.supabase.com https://*.paramtuitions.com https://*.googleapis.com ws: wss:; frame-ancestors 'none'; object-src 'none'; form-action 'self'; upgrade-insecure-requests" }
            ,{ "key": "X-Frame-Options", "value": "DENY" }
            ,{ "key": "X-Content-Type-Options", "value": "nosniff" }
            ,{ "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
            ,{ "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
          ]
        }
      ]
    }

Supabase (if serving via Edge functions or custom server):
- Set these headers in your function response objects before returning.

Notes & follow-ups
- Meta/http-equiv tags are fallbacks for environments where you cannot set server headers, but they are less effective than real HTTP headers. Configure your hosting/CDN to return these headers for production.
- The CSP above is intentionally permissive for typical third-party services; review and tighten it for your exact external origins.
- After applying server-side headers, re-run ZAP to verify the findings are gone.

If you want, I can:
- Add a `_headers` file for Netlify or `vercel.json` for Vercel in this repo configured with the recommended headers.
- Add an Nginx snippet file for your ops team.
- Scan the repo for code paths that place tokens into URLs and refactor them.

*** End of file ***