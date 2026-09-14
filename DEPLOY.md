# Deploying to eniatec.tech

The build output is a folder of static files (`out/`). Any static host will
serve it. Pick one of the three paths below.

Build command and output directory are the same everywhere:

```
Build command:     npm run build
Output directory:  out
Node version:      22
```

---

## Option A — Cloudflare Pages (recommended)

Free, global CDN, free TLS, and it handles the apex domain cleanly.

1. **Push this repository to GitHub** (already done if you are reading this
   there).
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → pick this repository.
3. Build settings:
   - Framework preset: **Next.js (Static HTML Export)**
   - Build command: `npm run build`
   - Build output directory: `out`
   - Environment variable: `NODE_VERSION = 22`
     (add `NEXT_PUBLIC_CONTACT_ENDPOINT` here too if you wire up a form backend)
4. Deploy. You get a `*.pages.dev` URL — check it works.
5. **Custom domain**: Pages project → **Custom domains** → add `eniatec.tech`
   and `www.eniatec.tech`.
   - If `eniatec.tech`'s nameservers already point at Cloudflare, the DNS
     records are created for you.
   - Otherwise, move the domain's nameservers to Cloudflare first (Cloudflare
     dashboard → **Add a site**), then repeat this step.

DNS, if you ever need to set it by hand:

| Type | Name | Value | Proxy |
|---|---|---|---|
| CNAME | `@` | `<project>.pages.dev` | Proxied |
| CNAME | `www` | `<project>.pages.dev` | Proxied |

Redirect `www` → apex under **Rules → Redirect Rules**, or leave both live.

---

## Option B — Vercel or Netlify

Same settings, connected to the same repository.

**Vercel** — import the repo; it detects Next.js. Because `next.config.mjs`
sets `output: 'export'`, the deploy is static. Add the domain under
**Settings → Domains**, then at your registrar:

| Type | Name | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

**Netlify** — build command `npm run build`, publish directory `out`. Add the
domain under **Domain management**; Netlify shows the exact records.

Verify the values in the provider's dashboard before entering them — hosting
providers do change their published IPs.

---

## Option C — Your own VPS with nginx

Useful if the site must sit on Iranian infrastructure alongside your other
services.

```bash
# on your machine
npm ci
npm run build
rsync -avz --delete out/ user@server:/var/www/eniatec/

# on the server, once
sudo cp deploy/nginx.conf /etc/nginx/sites-available/eniatec.tech
sudo ln -s /etc/nginx/sites-available/eniatec.tech /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d eniatec.tech -d www.eniatec.tech
```

DNS at your registrar:

| Type | Name | Value |
|---|---|---|
| A | `@` | your server's IPv4 |
| A | `www` | your server's IPv4 |
| AAAA | `@` | your server's IPv6 (if any) |

`deploy/nginx.conf` already handles the HTTP→HTTPS redirect, the `www`→apex
redirect, long-lived caching for `/_next/static/`, gzip, and the 404 page.

### Or with Docker

```bash
docker compose up -d --build     # serves on :8080
```

Then put your existing reverse proxy (Caddy, Traefik, nginx) in front of
`127.0.0.1:8080` and let it terminate TLS.

---

## After it is live

- `https://eniatec.tech/robots.txt` and `/sitemap.xml` are already served.
- Submit the site to **Google Search Console** (verify by DNS TXT record).
- Open graph preview: `public/og.svg`. Some social platforms do not render SVG
  previews — if you want a guaranteed preview card, export that file to a
  1200×630 PNG as `public/og.png` and change the two `'/og.svg'` references in
  `src/app/layout.tsx`.
- The site never calls Google Fonts at runtime: Vazirmatn is downloaded during
  the build and served from your own origin.
