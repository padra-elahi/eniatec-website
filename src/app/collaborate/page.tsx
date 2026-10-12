import type { Metadata } from 'next';
import Link from 'next/link';
import { CollabForm } from '@/components/collab/CollabForm';
import { Footer } from '@/components/Footer';
import { icons } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { collab } from '@/data/collab';

export const metadata: Metadata = {
  title: collab.meta.title,
  description: collab.meta.description,
  alternates: { canonical: '/collaborate/' },
};

export default function CollaboratePage() {
  return (
    <>
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-xl"
        style={{ background: 'color-mix(in srgb, var(--bg) 78%, transparent)' }}
      >
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <Link href="/" className="focus-ring rounded-lg text-xl sm:text-2xl" aria-label="Eniatec — خانه">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="focus-ring muted hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm transition-colors hover:text-[var(--fg)] sm:inline-flex"
            >
              <icons.arrow className="h-4 w-4 rotate-180" />
              {collab.back}
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute inset-0 bg-grid-dark opacity-60 [background-size:44px_44px]"
            style={{ maskImage: 'radial-gradient(ellipse 70% 55% at 50% 0%, #000 30%, transparent 75%)' }}
          />
          <div
            className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(closest-side, rgba(37,99,235,0.28), rgba(34,211,238,0.08) 60%, transparent)' }}
          />
        </div>

        <section className="container-x pb-24 pt-12 sm:pt-16">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
            <span className="chip animate-fade-up border-brand/30 text-brand-light">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-glow opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-glow" />
              </span>
              {collab.eyebrow}
            </span>
            <h1 className="heading mt-5 animate-fade-up [animation-delay:80ms]">
              {collab.title} <span className="gradient-text">{collab.titleAccent}</span>
            </h1>
            <p className="muted mt-5 animate-fade-up text-[15px] leading-[2.1] [animation-delay:160ms]">{collab.subtitle}</p>
          </div>

          <div className="animate-fade-up [animation-delay:240ms]">
            <CollabForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
