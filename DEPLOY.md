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

## Option C — Your own server

Three variants, cheapest first in terms of new moving parts.

### C1 — The server that already runs Persian CRM

That stack's Caddy already has a hook for exactly this: `EXTRA_SITE` /
`EXTRA_UPSTREAM` in `deploy/Caddyfile`, plus
`deploy/docker-compose.extra.example.yml`, which attaches Caddy to a second
compose project's network. So the website becomes another container behind the
same proxy, with the same automatic TLS. Nothing about the CRM changes.

```bash
# 1. Put this repository on the server and start the container.
#    It listens on 127.0.0.1:8080 and is named `eniatec-web`.
sudo mkdir -p /opt/eniatec-website
# …copy this repository there, then:
cd /opt/eniatec-website
docker compose up -d --build
docker network ls | grep eniatec        # note the network name, e.g. eniatec-website_default
```

```bash
# 2. Let the CRM's Caddy join that network.
cd /opt/persian-crm
cp deploy/docker-compose.extra.example.yml docker-compose.extra.yml
# edit it: set `name:` under networks.other to the network from step 1
```

```bash
# 3. Point the proxy at it. In /opt/persian-crm/.env:
EXTRA_SITE=eniatec.tech, www.eniatec.tech
EXTRA_UPSTREAM=eniatec-web:80
```

```bash
# 4. Apply. FORCE=1 is what makes auto-update.sh redeploy after an .env edit.
cd /opt/persian-crm
FORCE=1 ./deploy/auto-update.sh
```

`auto-update.sh` picks up `docker-compose.extra.yml` automatically once it
exists, so the overlay survives every later automatic update.

DNS: an `A` record for `eniatec.tech` (and `www`) pointing at that server.
Caddy issues the certificate on first request.

To publish a new version of the site afterwards:

```bash
cd /opt/eniatec-website && git pull && docker compose up -d --build
```

### C2 — A plain server with Caddy

Simplest option on a fresh machine: Caddy handles certificates and renewal by
itself, with no certbot step.

```bash
# on your machine
npm ci && npm run build
rsync -avz --delete out/ user@server:/tmp/eniatec-out/

# on the server
sudo apt install caddy                 # if not already installed
sudo mkdir -p /var/www/eniatec
sudo rsync -a --delete /tmp/eniatec-out/ /var/www/eniatec/
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

`deploy/Caddyfile` already covers the `www` alias, gzip/zstd, immutable caching
for `/_next/static/`, the security headers and the 404 page.

### C3 — A plain server with nginx

```bash
# on your machine
npm ci && npm run build
rsync -avz --delete out/ user@server:/var/www/eniatec/

# on the server — HTTP first
sudo cp deploy/nginx.conf /etc/nginx/sites-available/eniatec.tech
sudo ln -s /etc/nginx/sites-available/eniatec.tech /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# confirm http://eniatec.tech serves the site, THEN add TLS
sudo certbot --nginx -d eniatec.tech -d www.eniatec.tech
```

The order matters: `deploy/nginx.conf` is HTTP-only on purpose. certbot copies
the server block into a TLS one and adds the redirect itself. Writing the
`ssl_certificate` paths by hand first makes `nginx -t` fail, because the
certificate does not exist yet.

DNS at your registrar, for C2 and C3:

| Type | Name | Value |
|---|---|---|
| A | `@` | your server's IPv4 |
| A | `www` | your server's IPv4 |
| AAAA | `@` | your server's IPv6 (if any) |

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
