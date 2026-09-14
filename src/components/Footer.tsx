import { Logo, LogoMark } from './Logo';
import { icons } from './Icons';
import { nav, products, site } from '@/data/site';
import { toFa } from '@/lib/utils';

export function Footer() {
  const Github = icons.github;
  const Mail = icons.mail;
  const year = toFa(new Date().getFullYear());

  return (
    <footer className="relative border-t pt-16" style={{ background: 'color-mix(in srgb, var(--bg-soft) 40%, transparent)' }}>
      <div className="container-x">
        <div className="grid gap-10 pb-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <LogoMark />
              <Logo className="text-2xl" />
            </div>
            <p className="muted mt-5 max-w-sm text-sm leading-[2]">{site.description}</p>
            <div className="mt-6 flex gap-2">
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="گیت‌هاب"
                className="grid h-10 w-10 place-items-center rounded-xl border transition-colors hover:border-brand/60 hover:bg-brand/10"
              >
                <Github className="h-[18px] w-[18px]" />
              </a>
              <a
                href={`mailto:${site.email}`}
                aria-label="ایمیل"
                className="grid h-10 w-10 place-items-center rounded-xl border transition-colors hover:border-brand/60 hover:bg-brand/10"
              >
                <Mail className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          <nav aria-label="پیوندهای سایت">
            <h3 className="text-sm font-bold">سایت</h3>
            <ul className="mt-4 space-y-2.5">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="muted text-sm transition-colors hover:text-[var(--fg)]">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="محصولات">
            <h3 className="text-sm font-bold">محصولات</h3>
            <ul className="mt-4 space-y-2.5">
              {products.map((p) => (
                <li key={p.id}>
                  <a
                    href={p.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="muted text-sm transition-colors hover:text-[var(--fg)]"
                  >
                    {p.name} — {p.kicker}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="hairline" />
        <div className="muted flex flex-col items-center justify-between gap-3 py-7 text-xs sm:flex-row">
          <span>
            © {year} {site.name} — تمامی حقوق محفوظ است.
          </span>
          <span dir="ltr" className="font-mono opacity-70">
            {site.domain}
          </span>
        </div>
      </div>
    </footer>
  );
}
