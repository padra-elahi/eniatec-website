'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { nav } from '@/data/site';
import { cn } from '@/lib/utils';

/** Sticky top bar: frosts on scroll, highlights the section in view. */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = nav.map((n) => n.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.6] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled ? 'py-2 backdrop-blur-xl' : 'py-4',
      )}
      style={
        scrolled
          ? { background: 'color-mix(in srgb, var(--bg) 78%, transparent)', borderBottom: '1px solid var(--line)' }
          : undefined
      }
    >
      <div className="container-x flex items-center justify-between gap-4">
        <a href="#top" className="text-xl sm:text-2xl" aria-label="Eniatec — خانه">
          <Logo />
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="ناوبری اصلی">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'relative rounded-lg px-4 py-2 text-sm transition-colors',
                active === item.href ? 'text-[var(--fg)]' : 'muted hover:text-[var(--fg)]',
              )}
            >
              {active === item.href && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-lg border border-brand/30 bg-brand/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a href="#contact" className="btn-primary hidden !px-5 !py-2.5 sm:inline-flex">
            شروع همکاری
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="منو"
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-xl border md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="container-x mt-3 md:hidden"
            aria-label="ناوبری موبایل"
          >
            <div className="surface flex flex-col gap-1 rounded-2xl border p-3">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm transition-colors hover:bg-brand/10"
                >
                  {item.label}
                </a>
              ))}
              <a href="#contact" onClick={() => setOpen(false)} className="btn-primary mt-1">
                شروع همکاری
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
