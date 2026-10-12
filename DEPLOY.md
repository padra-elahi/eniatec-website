# Deploying to eniatec.tech

The site is a small Node server (Next.js `output: 'standalone'`) packaged as a
Docker image. The marketing pages are still prerendered at build time; the
server adds the collaboration form's API (`/api/collaborate/`) and the admin
panel (`/admin/`). Requests are stored in a SQLite file under `/data` inside
the container, so **`/data` must be a volume**.

Two environment variables configure the admin panel:

| Variable | Purpose |
|---|---|
| `ADMIN_PASSWORD` | Password for `/admin/`. Unset → the panel stays locked. |
| `SESSION_SECRET` | Signs admin session cookies. Any long random string (`openssl rand -base64 32`). |

See [`.env.example`](.env.example).

---

## How eniatec.tech is deployed today

The site runs on the Persian CRM server, behind that stack's Caddy, and
updates itself — no manual step after a push:

1. A push to `main` runs `.github/workflows/docker.yml`, which builds the
   `Dockerfile` and publishes `ghcr.io/padra-elahi/eniatec-website:latest`.
2. On the server, `/opt/eniatec-website/docker-compose.yml` is
   `deploy/docker-compose.ghcr.yml`. Its container carries the Watchtower
   opt-in label, and the Watchtower already running in the Bazrasi stack polls
   GHCR every 2 minutes and recreates `eniatec-web` when `:latest` moves.
3. The CRM's Caddy (`/opt/persian-crm/deploy/Caddyfile`) has a site block for
   `eniatec.tech, www.eniatec.tech` that proxies to `eniatec-web:80`. TLS for
   visitors terminates at the ParsPack CDN, like the CRM's own domains.

### One-time step when moving to the version with the admin panel

Watchtower swaps the image but keeps the container's old settings, so the
volume and the admin password have to be added once by hand. Do this **before
or right after** the first image with the admin panel is published:

```bash
cd /opt/eniatec-website
# 1. Take the new compose file (adds the env file and the data volume).
curl -fsSL https://raw.githubusercontent.com/padra-elahi/eniatec-website/main/deploy/docker-compose.ghcr.yml \
  -o docker-compose.yml
# 2. Set the admin credentials.
cat > .env <<EOF
ADMIN_PASSWORD=$(openssl rand -base64 18)
SESSION_SECRET=$(openssl rand -base64 32)
EOF
chmod 600 .env
cat .env            # note the password
# 3. Recreate the container with the new settings.
docker compose pull && docker compose up -d
```

After that, Watchtower updates keep the volume and the variables.

Check what is deployed: `docker logs --since 1h bazrasi-watchtower-1` on the
server. Force an update immediately:
`cd /opt/eniatec-website && docker compose pull && docker compose up -d`.

### Backups

All requests are in one file, `eniatec.db`, in the `eniatec-data` volume.
SQLite's online backup is safe while the site is running:

```bash
docker run --rm -v eniatec-website_eniatec-data:/data -v "$PWD":/out alpine \
  sh -c 'apk add -q sqlite && sqlite3 /data/eniatec.db ".backup /out/eniatec-$(date +%F).db"'
```

The admin panel's **CSV export** is the quick alternative for a readable copy.

---

## Other ways to run it

### On the CRM server, building there

That stack's Caddy already has a hook for exactly this: `EXTRA_SITE` /
`EXTRA_UPSTREAM` in `deploy/Caddyfile`, plus
`deploy/docker-compose.extra.example.yml`, which attaches Caddy to a second
compose project's network.

```bash
# 1. Put this repository on the server, configure, start.
cd /opt/eniatec-website
cp .env.example .env            # set ADMIN_PASSWORD and SESSION_SECRET
docker compose up -d --build    # listens on 127.0.0.1:8080, named eniatec-web
docker network ls | grep eniatec

# 2. Let the CRM's Caddy join that network.
cd /opt/persian-crm
cp deploy/docker-compose.extra.example.yml docker-compose.extra.yml
# edit it: set `name:` under networks.other to the network from step 1

# 3. In /opt/persian-crm/.env:
#    EXTRA_SITE=eniatec.tech, www.eniatec.tech
#    EXTRA_UPSTREAM=eniatec-web:80
FORCE=1 ./deploy/auto-update.sh
```

`next/font` downloads Vazirmatn during the build, so building on the server
needs it to reach `fonts.googleapis.com`. If it cannot, use the GHCR image
path above instead — CI does the build.

### A plain server with Caddy or nginx

```bash
cp .env.example .env            # set ADMIN_PASSWORD and SESSION_SECRET
docker compose up -d --build    # 127.0.0.1:8080
```

Then put a TLS-terminating proxy in front:

- **Caddy** — `sudo cp deploy/Caddyfile /etc/caddy/Caddyfile && sudo systemctl reload caddy`.
  Caddy issues and renews the certificate itself.
- **nginx** — install `deploy/nginx.conf` as a site, confirm
  `http://eniatec.tech` answers, then run
  `sudo certbot --nginx -d eniatec.tech -d www.eniatec.tech`.

DNS at your registrar:

| Type | Name | Value |
|---|---|---|
| A | `@` | your server's IPv4 |
| A | `www` | your server's IPv4 |
| AAAA | `@` | your server's IPv6 (if any) |

### Static hosts (Cloudflare Pages, Netlify)

No longer supported: the collaboration form and the admin panel need the
server. Vercel can run the server, but its filesystem is not persistent, so
SQLite storage would not work there either.

---

## After it is live

- Open `https://eniatec.tech/admin/` and sign in with `ADMIN_PASSWORD`.
- `https://eniatec.tech/robots.txt` and `/sitemap.xml` are served; `/admin/`
  and `/api/` are excluded from indexing.
- Submit the site to **Google Search Console** (verify by DNS TXT record).
- Open graph preview: `public/og.svg`. Some social platforms do not render SVG
  previews — if you want a guaranteed preview card, export that file to a
  1200×630 PNG as `public/og.png` and change the two `'/og.svg'` references in
  `src/app/layout.tsx`.
- The site never calls Google Fonts at runtime: Vazirmatn is downloaded during
  the build and served from your own origin.
