'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { icons } from '@/components/Icons';
import { Logo, LogoMark } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { admin } from '@/data/collab';
import { cn } from '@/lib/utils';

const t = admin.login;

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (res?.ok) {
      router.replace('/admin/');
      router.refresh();
      return;
    }
    setBusy(false);
    setError(res?.status === 429 ? t.locked : res?.status === 503 ? t.notConfigured : t.wrong);
    setShake((n) => n + 1);
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-grid-dark [background-size:44px_44px]"
          style={{ maskImage: 'radial-gradient(ellipse 60% 50% at 50% 40%, #000 20%, transparent 75%)' }}
        />
        <div
          className="absolute left-1/2 top-1/3 h-[480px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgba(37,99,235,0.3), rgba(34,211,238,0.08) 60%, transparent)' }}
        />
      </div>
      <div className="absolute left-4 top-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px]"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="!h-14 !w-14 !rounded-2xl !text-2xl" />
          <Logo className="mt-5 text-2xl" compact />
        </div>

        <motion.form
          key={shake}
          onSubmit={submit}
          animate={shake && !reduce ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
          transition={{ duration: 0.4 }}
          className="card !rounded-3xl !p-7 shadow-[0_30px_80px_-40px_rgba(37,99,235,0.5)] sm:!p-8"
        >
          <h1 className="text-xl font-extrabold">{t.title}</h1>
          <p className="muted mt-1.5 text-[13px] leading-6">{t.desc}</p>

          {!configured ? (
            <p className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-[13px] leading-6 text-amber-700 dark:text-amber-300">
              {t.notConfigured}
            </p>
          ) : (
            <>
              <label htmlFor="pw" className="mb-2 mt-7 block text-[13px] font-semibold">
                {t.password}
              </label>
              <div className="relative">
                <icons.lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 opacity-60" />
                <input
                  id="pw"
                  type={show ? 'text' : 'password'}
                  dir="ltr"
                  autoFocus
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'pw-error' : undefined}
                  className="field !pl-11 !pr-12 text-left"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? t.hide : t.show}
                  className="focus-ring muted absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg hover:text-[var(--fg)]"
                >
                  {show ? <icons.eyeOff className="h-[18px] w-[18px]" /> : <icons.eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
              {error && (
                <p id="pw-error" role="alert" className="mt-2.5 text-[12.5px] text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy || !password}
                className={cn('btn-primary focus-ring mt-6 w-full disabled:opacity-60', busy && 'cursor-wait')}
              >
                {busy ? t.submitting : t.submit}
              </button>
            </>
          )}
        </motion.form>

        <p className="muted mt-6 text-center text-xs">
          <a href="/" className="transition-colors hover:text-[var(--fg)]">
            {admin.nav.site}
          </a>
        </p>
      </motion.div>
    </main>
  );
}
