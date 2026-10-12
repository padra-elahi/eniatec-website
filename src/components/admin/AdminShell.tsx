'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { icons } from '@/components/Icons';
import { Logo, LogoMark } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { admin } from '@/data/collab';
import { cn, toFa } from '@/lib/utils';
import { ToastProvider } from './Toast';

const t = admin.nav;

/** Sidebar on desktop, top bar + drawer on mobile, around every admin page. */
export function AdminShell({ unread, children }: { unread: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <ToastProvider>
      <div className="min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          className="sticky top-0 hidden h-screen flex-col border-e lg:flex"
          style={{ background: 'color-mix(in srgb, var(--bg-soft) 55%, transparent)' }}
        >
          <SidebarContent unread={unread} />
        </aside>

        <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b px-4 backdrop-blur-xl lg:hidden" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)' }}>
          <Link href="/admin/" className="flex items-center gap-2.5">
            <LogoMark className="!h-9 !w-9" />
            <span className="text-sm font-bold">{admin.brand}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="منو"
              className="focus-ring relative grid h-10 w-10 place-items-center rounded-xl border"
            >
              <icons.menu className="h-5 w-5" />
              {unread > 0 && <span className="absolute -end-1 -top-1 h-2.5 w-2.5 rounded-full bg-brand-light ring-2 ring-[var(--bg)]" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                className="surface absolute inset-y-0 right-0 flex w-[280px] flex-col border-s shadow-2xl"
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="بستن"
                  className="focus-ring absolute left-3 top-4 grid h-9 w-9 place-items-center rounded-lg border"
                >
                  <icons.close className="h-4 w-4" />
                </button>
                <SidebarContent unread={unread} />
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8 lg:px-10">{children}</main>
      </div>
    </ToastProvider>
  );
}

function SidebarContent({ unread }: { unread: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const items = [
    { href: '/admin/', label: t.dashboard, icon: icons.chart, active: pathname === '/admin/' || pathname === '/admin' },
    { href: '/admin/requests/', label: t.requests, icon: icons.inbox, active: pathname.startsWith('/admin/requests'), badge: unread },
  ];

  const logout = async () => {
    setLeaving(true);
    await fetch('/api/admin/logout/', { method: 'POST' }).catch(() => {});
    router.replace('/admin/login/');
    router.refresh();
  };

  return (
    <>
      <div className="flex h-20 items-center gap-3 px-6">
        <LogoMark />
        <div className="leading-tight">
          <Logo className="text-lg" compact />
          <span className="muted block text-[11px]">{admin.brand}</span>
        </div>
      </div>
      <div className="hairline mx-5" />

      <nav className="flex-1 space-y-1 p-4" aria-label="ناوبری پنل">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            aria-current={it.active ? 'page' : undefined}
            className={cn(
              'focus-ring relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors',
              it.active ? 'font-semibold text-[var(--fg)]' : 'muted hover:bg-brand/5 hover:text-[var(--fg)]',
            )}
          >
            {it.active && (
              <motion.span
                layoutId="admin-nav"
                className="absolute inset-0 -z-10 rounded-xl border border-brand/30 bg-brand/10"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <it.icon className={cn('h-[18px] w-[18px]', it.active && 'text-brand-light')} />
            {it.label}
            {!!it.badge && (
              <span className="ms-auto rounded-full bg-brand px-2 py-px text-[11px] font-bold text-white">{toFa(it.badge)}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="space-y-1 border-t p-4">
        <a
          href="/"
          target="_blank"
          className="focus-ring muted flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors hover:bg-brand/5 hover:text-[var(--fg)]"
        >
          <icons.external className="h-[18px] w-[18px]" />
          {t.site}
        </a>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={logout}
            disabled={leaving}
            className="focus-ring muted flex flex-1 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-60"
          >
            <icons.logout className="h-[18px] w-[18px] -scale-x-100" />
            {t.logout}
          </button>
          <span className="hidden lg:block">
            <ThemeToggle />
          </span>
        </div>
      </div>
    </>
  );
}
