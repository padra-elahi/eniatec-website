# Eniatec — company website

The marketing site for **Eniatec** (انیاتک), served at
**[eniatec.tech](https://eniatec.tech)**. A single-page, fully right-to-left
Persian site that introduces the company, its services, and the two production
systems it builds, with a collaboration request form and an admin panel for
reviewing what comes in:

- **[Persian CRM](https://github.com/padra-elahi/persian-crm)** — a
  multi-tenant CRM/ERP for Iranian businesses.
- **[Bazrasi](https://github.com/padra-elahi/bazrasi-inspection-system)** — an
  inspection management system for a steel company's two complexes.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router), `output: 'standalone'` — prerendered pages plus a small Node server |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3, custom CSS variables for the light/dark palettes |
| Motion | Framer Motion, plus a hand-written canvas constellation in the hero |
| Font | Vazirmatn via `next/font/google` — downloaded at build time and **self-hosted**, so the deployed site makes no request to Google |
| Storage | SQLite through Node's built-in `node:sqlite` — one file, no database server, no native module |
| Output | `.next/standalone` — run as a Docker image (see `Dockerfile`) |

The marketing pages are still static HTML generated at build time. The server
exists for the collaboration request form and the admin panel.

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build      # production build into .next/
```

For the admin panel locally, put `ADMIN_PASSWORD=…` in `.env.local`. Requests
are written to `./data/eniatec.db` (git-ignored).

The build needs network access once, to fetch the Vazirmatn font files that
`next/font` then inlines into `out/_next/static/media/`.

## Collaboration requests & admin panel

- **`/collaborate/`** — a three-step request form (about you → kind of
  collaboration → details), validated in the browser and again on the server
  with the same rules (`src/lib/validation.ts`). It keeps an unfinished draft
  in `localStorage`, and on success shows a tracking code such as
  `ENI-7MEY8E`. Spam protection: a honeypot field, a minimum fill time, and a
  per-IP rate limit.
- **`/admin/`** — sign in with `ADMIN_PASSWORD`. Dashboard with totals, a
  30-day chart and breakdowns by status and type; an inbox with search,
  status/type/unread/starred filters, sorting, pagination, bulk status
  changes, mark read/unread and delete; a detail page with status workflow
  (new → reviewing → contacted → accepted / rejected / archived), stars,
  internal notes, an activity timeline, reply-by-email and call shortcuts,
  and prev/next navigation; CSV export (opens correctly in Excel) of whatever
  the current filters show.

Sessions are an httpOnly, SameSite=Strict cookie signed with HMAC-SHA256
(`src/lib/auth.ts`); login attempts are rate limited. Storage and queries are
in `src/lib/db.ts`; the schema is created on first start.

## Content

All Persian copy lives in [`src/data/site.ts`](src/data/site.ts) — navigation,
hero, services, products, process steps, tech list and contact strings. No
Persian string is hardcoded in a component, so wording changes never mean
touching JSX. The collaboration form's and admin panel's copy and option lists
live in [`src/data/collab.ts`](src/data/collab.ts).

Products are described by the `products` array in that file: each entry drives
the tab label, the summary card, the metrics, the surface list, the expandable
feature list, and the tech chips.

## Structure

```
src/
  app/
    layout.tsx        — <html dir="rtl">, fonts, metadata, JSON-LD, theme bootstrap
    page.tsx          — section order
    globals.css       — palette variables, component classes, light-mode overrides
    not-found.tsx     — 404
    collaborate/      — the collaboration request form page
    admin/            — login, dashboard, request list and detail; server actions
    api/              — collaborate (public POST), admin login/logout/export
  components/
    Header, Hero, Stats, Services, Products, Process, Stack, Contact, Footer
    ParticleField     — the interactive canvas behind the hero
    TerminalCard      — the hero's mock app window (+ HeroPanels)
    Cursor, ScrollProgress, ThemeToggle, Reveal, SectionHeading, Logo, Icons
    collab/           — CollabForm (steps, validation, success state)
    admin/            — shell, tables, actions, dialogs, toasts
  data/site.ts        — every string and content structure
  data/collab.ts      — form and admin copy, option lists, statuses
  lib/utils.ts        — cn() and Persian-digit conversion
  lib/db.ts           — SQLite storage
  lib/auth.ts         — admin session, password check, rate limiting
  lib/validation.ts   — shared form validation
public/               — favicon, OG image, robots.txt, sitemap.xml
deploy/               — GHCR compose file, Caddy and nginx reverse-proxy configs
```

## Theming

Dark is the default. The palette is a set of CSS variables on `:root`, with
`:root.light` overriding them; Tailwind's `dark:` variant is wired to
`html:not(.light)` (see `tailwind.config.ts`) so utility-level overrides work in
both directions. An inline script in `<head>` applies the stored choice before
first paint, so there is no flash.

## Accessibility & motion

- Every animation is skipped when `prefers-reduced-motion: reduce` is set —
  including the hero canvas, which renders one static frame instead.
- The canvas pauses entirely when scrolled out of view.
- The custom cursor only appears for `pointer: fine` devices.

## The contact form

The short form at the bottom of the home page is separate from `/collaborate/`.
By default it composes a `mailto:` to `info@eniatec.tech` with the fields
pre-filled — no backend, nothing to run, and never a dead end.

To collect submissions properly, point it at any endpoint that accepts a JSON
`POST` (Formspree, Getform, a Cloudflare Worker, …):

```bash
NEXT_PUBLIC_CONTACT_ENDPOINT=https://formspree.io/f/xxxxxxx
```

Set it as a build-time environment variable wherever you build; see
[`.env.example`](.env.example).

## Deploying to eniatec.tech

See **[DEPLOY.md](DEPLOY.md)**: the GHCR + Watchtower path that runs
eniatec.tech today (including the one-time step that adds the data volume and
admin password), building on your own server, and backups.
