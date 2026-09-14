'use client';

import { useState } from 'react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { icons } from './Icons';
import { contact, site } from '@/data/site';

/**
 * Set NEXT_PUBLIC_CONTACT_ENDPOINT to a form backend (Formspree, Getform, a
 * serverless function…) to POST submissions as JSON. With it unset — the
 * default for a plain static deploy — the form opens the visitor's mail client
 * with the message pre-filled instead, so it is never a dead end.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;

type State = 'idle' | 'sending' | 'sent' | 'error';

export function Contact() {
  const [state, setState] = useState<State>('idle');
  const Mail = icons.mail;
  const Github = icons.github;
  const Check = icons.check;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    if (!ENDPOINT) {
      const body = [
        `${contact.fields.name}: ${data.name}`,
        `${contact.fields.company}: ${data.company}`,
        `${contact.fields.email}: ${data.email}`,
        `${contact.fields.phone}: ${data.phone}`,
        `${contact.fields.budget}: ${data.budget}`,
        '',
        data.message,
      ].join('\n');
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
        `درخواست پروژه — ${data.company || data.name}`,
      )}&body=${encodeURIComponent(body)}`;
      setState('sent');
      return;
    }

    setState('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setState('sent');
    } catch {
      setState('error');
    }
  };

  const field = 'w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--fg-muted)] focus:border-brand/60 focus:ring-2 focus:ring-brand/20';

  return (
    <section id="contact" className="section">
      <div className="container-x">
        <div className="card overflow-hidden !rounded-3xl !p-0">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            <div
              className="relative p-8 sm:p-10"
              style={{ background: 'linear-gradient(160deg, rgba(37,99,235,0.16), rgba(34,211,238,0.06) 60%, transparent)' }}
            >
              <SectionHeading eyebrow="تماس" title={contact.title} desc={contact.subtitle} center={false} />

              <div className="mt-10 space-y-3">
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors hover:border-brand/50 hover:bg-brand/10"
                >
                  <Mail className="h-5 w-5 text-brand-light" />
                  <span dir="ltr">{site.email}</span>
                </a>
                <a
                  href={site.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors hover:border-brand/50 hover:bg-brand/10"
                >
                  <Github className="h-5 w-5 text-brand-light" />
                  <span dir="ltr">github.com/padra-elahi</span>
                </a>
              </div>

              <ul className="mt-8 space-y-3">
                {contact.assurances.map((a) => (
                  <li key={a} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-glow" />
                    <span className="muted">{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={onSubmit} className="p-8 sm:p-10">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="muted mb-2 block text-xs">{contact.fields.name}</span>
                  <input name="name" required className={field} placeholder="نام شما" />
                </label>
                <label className="block">
                  <span className="muted mb-2 block text-xs">{contact.fields.company}</span>
                  <input name="company" className={field} placeholder="اختیاری" />
                </label>
                <label className="block">
                  <span className="muted mb-2 block text-xs">{contact.fields.email}</span>
                  <input name="email" type="email" required dir="ltr" className={`${field} text-left`} placeholder="you@company.com" />
                </label>
                <label className="block">
                  <span className="muted mb-2 block text-xs">{contact.fields.phone}</span>
                  <input name="phone" dir="ltr" className={`${field} text-left`} placeholder="09xx xxx xxxx" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="muted mb-2 block text-xs">{contact.fields.budget}</span>
                  <select name="budget" className={field} defaultValue={contact.budgets[0]}>
                    {contact.budgets.map((b) => (
                      <option key={b} value={b} className="bg-[var(--bg-soft)]">
                        {b}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="muted mb-2 block text-xs">{contact.fields.message}</span>
                  <textarea name="message" required rows={5} className={`${field} resize-y`} placeholder="فرآیندی که می‌خواهید نرم‌افزاری شود را توضیح دهید…" />
                </label>
              </div>

              <Reveal delay={0.05}>
                <button type="submit" disabled={state === 'sending'} className="btn-primary mt-6 w-full disabled:opacity-60">
                  {state === 'sending' ? contact.submitting : contact.submit}
                </button>
              </Reveal>

              {state === 'sent' && (
                <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-[13px] text-emerald-700 dark:text-emerald-300">
                  {contact.success}
                </p>
              )}
              {state === 'error' && (
                <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-[13px] text-rose-700 dark:text-rose-300">
                  {contact.error}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
