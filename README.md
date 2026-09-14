# Eniatec — company website

The marketing site for **Eniatec** (انیاتک), served at
**[eniatec.tech](https://eniatec.tech)**. A single-page, fully right-to-left
Persian site that introduces the company, its services, and the two production
systems it builds:

- **[Persian CRM](https://github.com/padra-elahi/persian-crm)** — a
  multi-tenant CRM/ERP for Iranian businesses.
- **[Bazrasi](https://github.com/padra-elahi/bazrasi-inspection-system)** — an
  inspection management system for a steel company's two complexes.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router), `output: 'export'` — a fully static build |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3, custom CSS variables for the light/dark palettes |
| Motion | Framer Motion, plus a hand-written canvas constellation in the hero |
| Font | Vazirmatn via `next/font/google` — downloaded at build time and **self-hosted**, so the deployed site makes no request to Google |
| Output | `out/` — plain HTML/CSS/JS, no Node server needed |

Everything is client-side and static: there is no database, no API, and no
server runtime to operate.

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build      # static export into out/
```

The build needs network access once, to fetch the Vazirmatn font files that
`next/font` then inlines into `out/_next/static/media/`.

## Content

All Persian copy lives in [`src/data/site.ts`](src/data/site.ts) — navigation,
hero, services, products, process steps, tech list and contact strings. No
Persian string is hardcoded in a component, so wording changes never mean
touching JSX.

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
  components/
    Header, Hero, Stats, Services, Products, Process, Stack, Contact, Footer
    ParticleField     — the interactive canvas behind the hero
    TerminalCard      — the hero's mock app window (+ HeroPanels)
    Cursor, ScrollProgress, ThemeToggle, Reveal, SectionHeading, Logo, Icons
  data/site.ts        — every string and content structure
  lib/utils.ts        — cn() and Persian-digit conversion
public/               — favicon, OG image, robots.txt, sitemap.xml
deploy/               — nginx vhost (VPS) and the in-image nginx config
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

By default the form composes a `mailto:` to `info@eniatec.tech` with the fields
pre-filled — no backend, nothing to run, and never a dead end.

To collect submissions properly, point it at any endpoint that accepts a JSON
`POST` (Formspree, Getform, a Cloudflare Worker, …):

```bash
NEXT_PUBLIC_CONTACT_ENDPOINT=https://formspree.io/f/xxxxxxx
```

Set it as a build-time environment variable wherever you build; see
[`.env.example`](.env.example).

## Deploying to eniatec.tech

See **[DEPLOY.md](DEPLOY.md)** for the three supported paths (Cloudflare Pages,
Vercel/Netlify, or nginx on your own VPS) and the DNS records for each.
