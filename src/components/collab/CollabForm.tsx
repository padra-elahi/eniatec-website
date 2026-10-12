'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { icons } from '@/components/Icons';
import {
  budgets,
  collab,
  collabTypes,
  contactPrefs,
  interests,
  labelOf,
  referrals,
  timelines,
} from '@/data/collab';
import { site } from '@/data/site';
import { cn, toFa } from '@/lib/utils';
import {
  emptyInput,
  LIMITS,
  normalize,
  STEP_FIELDS,
  validate,
  type CollabInput,
  type FieldErrors,
} from '@/lib/validation';

const DRAFT_KEY = 'eniatec-collab-draft';
const t = collab;

type Phase = 'form' | 'sending' | 'done';

/** The three-step collaboration request form, with its sidebar and success state. */
export function CollabForm() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<CollabInput>(emptyInput);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [phase, setPhase] = useState<Phase>('form');
  const [banner, setBanner] = useState('');
  const [code, setCode] = useState('');
  const [hp, setHp] = useState('');
  const startedAt = useRef(Date.now());
  const cardRef = useRef<HTMLDivElement>(null);
  const restored = useRef(false);

  // Restore an unfinished draft, then keep saving it as the visitor types.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { data?: unknown; step?: number };
        setData({ ...emptyInput, ...normalize(saved.data), consent: false });
        if (typeof saved.step === 'number') setStep(Math.min(Math.max(saved.step, 0), 2));
      }
    } catch {
      /* storage unavailable or corrupt: start fresh */
    }
    restored.current = true;
  }, []);

  useEffect(() => {
    if (!restored.current || phase === 'done') return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, step }));
    } catch {
      /* ignore */
    }
  }, [data, step, phase]);

  const set = useCallback(<K extends keyof CollabInput>(key: K, value: CollabInput[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }, []);

  const blur = (key: keyof CollabInput) => {
    const v = data[key];
    if (v === '' || (Array.isArray(v) && !v.length)) return;
    const err = validate(data, [key])[key];
    setErrors((e) => ({ ...e, [key]: err }));
  };

  const scrollToCard = () => {
    const el = cardRef.current;
    if (el && el.getBoundingClientRect().top < 80) {
      window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 96, behavior: 'smooth' });
    }
  };

  const focusFirstError = (errs: FieldErrors) => {
    const first = STEP_FIELDS.flat().find((f) => errs[f]);
    if (!first) return;
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-field="${first}"]`);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
    setBanner('');
    scrollToCard();
  };

  const next = () => {
    const errs = validate(data, STEP_FIELDS[step]);
    if (Object.values(errs).some(Boolean)) {
      setErrors((e) => ({ ...e, ...errs }));
      focusFirstError(errs);
      return;
    }
    go(step + 1);
  };

  const submit = async () => {
    const errs = validate(data);
    if (Object.values(errs).some(Boolean)) {
      setErrors(errs);
      const firstStep = STEP_FIELDS.findIndex((fields) => fields.some((f) => errs[f]));
      if (firstStep !== step) go(firstStep);
      setBanner(t.errors.fixBelow);
      focusFirstError(errs);
      return;
    }
    setPhase('sending');
    setBanner('');
    try {
      const res = await fetch('/api/collaborate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, hp, startedAt: startedAt.current }),
      });
      const json = (await res.json().catch(() => ({}))) as { code?: string; error?: string; fields?: FieldErrors };
      if (res.ok && json.code) {
        setCode(json.code);
        setPhase('done');
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
        scrollToCard();
        return;
      }
      if (res.status === 422 && json.fields) {
        setErrors(json.fields);
        setBanner(t.errors.fixBelow);
      } else {
        setBanner(res.status === 429 ? t.errors.rateLimited : t.errors.server);
      }
    } catch {
      setBanner(t.errors.server);
    }
    setPhase('form');
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === 'sending') return;
    if (step < 2) next();
    else submit();
  };

  const reset = () => {
    setData(emptyInput);
    setErrors({});
    setStep(0);
    setCode('');
    setPhase('form');
    startedAt.current = Date.now();
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-8">
      <Aside step={phase === 'done' ? 3 : step} onJump={(i) => i < step && phase !== 'done' && go(i)} />

      <div ref={cardRef} className="card overflow-hidden !rounded-3xl !p-0 shadow-[0_30px_80px_-40px_rgba(37,99,235,0.45)]">
        {phase === 'done' ? (
          <Success code={code} onAgain={reset} />
        ) : (
          <form onSubmit={onSubmit} noValidate aria-describedby={banner ? 'collab-banner' : undefined}>
            <Progress step={step} />

            <div className="relative px-6 pb-2 pt-7 sm:px-10">
              {/* Honeypot: invisible to people, irresistible to bots. */}
              <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Fax
                  <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
                </label>
              </div>

              <AnimatePresence mode="wait" initial={false} custom={dir}>
                <StepPanel key={step} dir={dir}>
                  {step === 0 && <StepAbout data={data} errors={errors} set={set} blur={blur} />}
                  {step === 1 && <StepKind data={data} errors={errors} set={set} />}
                  {step === 2 && <StepDetails data={data} errors={errors} set={set} blur={blur} onEdit={go} />}
                </StepPanel>
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {banner && (
                <motion.p
                  id="collab-banner"
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mx-6 overflow-hidden sm:mx-10"
                >
                  <span className="mt-4 block rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-[13px] text-rose-700 dark:text-rose-300">
                    {banner}
                  </span>
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-between gap-3 border-t px-6 py-5 sm:px-10">
              {step > 0 ? (
                <button type="button" onClick={() => go(step - 1)} className="btn-ghost focus-ring !px-4 sm:!px-5">
                  <icons.chevron className="h-4 w-4 rotate-180" />
                  {t.prev}
                </button>
              ) : (
                <span className="muted hidden items-center gap-1.5 text-xs sm:flex">
                  <icons.clock className="h-4 w-4" />
                  {t.duration}
                </span>
              )}
              <button
                type="submit"
                disabled={phase === 'sending'}
                className="btn-primary focus-ring ms-auto min-w-[9.5rem] disabled:cursor-wait disabled:opacity-70"
              >
                {phase === 'sending' ? (
                  <>
                    <Spinner />
                    {t.submitting}
                  </>
                ) : step < 2 ? (
                  <>
                    {t.next}
                    <icons.chevron className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    {t.submit}
                    <icons.send className="h-4 w-4 -scale-x-100" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────── layout pieces ───────────────────────────── */

function Aside({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  const Check = icons.check;
  const Mail = icons.mail;
  return (
    <aside className="card !rounded-3xl !p-0 lg:sticky lg:top-24">
      <div
        className="rounded-t-3xl p-6 sm:p-8"
        style={{ background: 'linear-gradient(160deg, rgba(37,99,235,0.16), rgba(34,211,238,0.05) 65%, transparent)' }}
      >
        <ol className="relative space-y-1" aria-label="مراحل فرم">
          {t.steps.map((s, i) => {
            const state = i < step ? 'done' : i === step ? 'current' : 'todo';
            return (
              <li key={s.title} className="relative">
                {i < t.steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute start-[19px] top-11 h-[calc(100%-2.25rem)] w-px overflow-hidden"
                    style={{ background: 'var(--line)' }}
                  >
                    <motion.span
                      className="absolute inset-x-0 top-0 block bg-gradient-to-b from-brand to-cyan-glow"
                      initial={false}
                      animate={{ height: i < step ? '100%' : '0%' }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  disabled={state !== 'done'}
                  aria-current={state === 'current' ? 'step' : undefined}
                  className="focus-ring group flex w-full items-center gap-4 rounded-2xl p-1.5 text-start transition-colors enabled:hover:bg-brand/5"
                >
                  <span
                    className={cn(
                      'relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-sm font-bold transition-all duration-500',
                      state === 'done' && 'border-transparent text-white',
                      state === 'current' && 'border-brand/60 bg-brand/15 text-brand-light',
                      state === 'todo' && 'muted',
                    )}
                    style={
                      state === 'done'
                        ? { background: 'linear-gradient(135deg,#2563eb,#22d3ee)', boxShadow: '0 8px 20px -8px rgba(37,99,235,0.8)' }
                        : undefined
                    }
                  >
                    {state === 'done' ? <Check className="h-4 w-4" /> : toFa(i + 1)}
                    {state === 'current' && (
                      <span className="absolute inset-0 animate-pulse-ring rounded-xl border border-brand/50" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className={cn('block text-sm font-bold', state === 'todo' && 'muted')}>{s.title}</span>
                    <span className="muted block text-xs">{s.desc}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="hidden p-6 sm:p-8 lg:block">
        <h2 className="text-sm font-bold">{t.aside.title}</h2>
        <ul className="mt-4 space-y-3">
          {t.aside.points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-[13px]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-glow" />
              <span className="muted">{p}</span>
            </li>
          ))}
        </ul>
        <div className="hairline my-6" />
        <p className="muted text-xs">{t.aside.direct}</p>
        <a
          href={`mailto:${site.email}`}
          className="focus-ring mt-3 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors hover:border-brand/50 hover:bg-brand/10"
        >
          <Mail className="h-5 w-5 text-brand-light" />
          <span dir="ltr">{site.email}</span>
        </a>
        <p className="muted mt-6 flex items-start gap-2 text-[11.5px] leading-6">
          <icons.lock className="mt-1 h-3.5 w-3.5 shrink-0" />
          {t.aside.privacy}
        </p>
      </div>
    </aside>
  );
}

function Progress({ step }: { step: number }) {
  const pct = ((step + 1) / 3) * 100;
  return (
    <div className="px-6 pt-6 sm:px-10 sm:pt-8">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-brand-light">{toFa(t.stepOf(step + 1, 3))}</span>
        <span className="muted">{t.steps[step].title}</span>
      </div>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full"
        style={{ background: 'var(--line)' }}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={step + 1}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg,#22d3ee,#2563eb)' }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

function StepPanel({ children, dir }: { children: React.ReactNode; dir: number }) {
  const reduce = useReducedMotion();
  // RTL: moving forward slides content in from the left.
  const x = reduce ? 0 : 28;
  return (
    <motion.div
      initial={{ opacity: 0, x: -x * dir }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: x * dir }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────────── steps ───────────────────────────── */

type StepProps = {
  data: CollabInput;
  errors: FieldErrors;
  set: <K extends keyof CollabInput>(key: K, value: CollabInput[K]) => void;
  blur?: (key: keyof CollabInput) => void;
};

function StepTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-7">
      <h2 className="text-xl font-extrabold sm:text-2xl">{title}</h2>
      <p className="muted mt-1.5 text-sm">{desc}</p>
    </div>
  );
}

function StepAbout({ data, errors, set, blur }: StepProps) {
  return (
    <>
      <StepTitle title={t.steps[0].title} desc="تا بدانیم با چه کسی صحبت می‌کنیم و چطور به شما برسیم." />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="fullName" icon="user" required autoComplete="name" data={data} errors={errors} set={set} blur={blur} className="sm:col-span-2" />
        <TextField name="email" icon="mail" type="email" required ltr autoComplete="email" inputMode="email" data={data} errors={errors} set={set} blur={blur} />
        <TextField name="phone" icon="phone" type="tel" required ltr autoComplete="tel" inputMode="tel" data={data} errors={errors} set={set} blur={blur} />
        <TextField name="company" icon="building" autoComplete="organization" optional data={data} errors={errors} set={set} blur={blur} />
        <TextField name="role" autoComplete="organization-title" data={data} errors={errors} set={set} blur={blur} optional />
        <TextField name="website" icon="globe" type="url" ltr autoComplete="url" inputMode="url" data={data} errors={errors} set={set} blur={blur} optional className="sm:col-span-2" />
      </div>
    </>
  );
}

function StepKind({ data, errors, set }: StepProps) {
  const toggleInterest = (v: string) =>
    set('interests', data.interests.includes(v) ? data.interests.filter((x) => x !== v) : [...data.interests, v]);

  return (
    <>
      <StepTitle title={t.steps[1].title} desc="زمینهٔ همکاری را مشخص کنید تا درخواست به دست فرد مناسب برسد." />

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">
          {t.fields.type} <span className="text-rose-500">*</span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-invalid={!!errors.type} aria-describedby={errors.type ? 'err-type' : undefined}>
          {collabTypes.map((o, i) => {
            const Icon = icons[o.icon];
            const on = data.type === o.value;
            return (
              <label
                key={o.value}
                className={cn(
                  'group relative flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all duration-200',
                  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/60',
                  on ? 'border-brand/60 bg-brand/10 shadow-[0_10px_30px_-18px_rgba(37,99,235,0.9)]' : 'hover:border-brand/35 hover:bg-brand/[0.04]',
                )}
              >
                <input
                  type="radio"
                  name="type"
                  value={o.value}
                  checked={on}
                  onChange={() => set('type', o.value)}
                  className="sr-only"
                  data-field={i === 0 ? 'type' : undefined}
                />
                <span
                  className={cn(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors',
                    on ? 'border-transparent bg-brand text-white' : 'text-brand-light',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{o.label}</span>
                  <span className="muted mt-0.5 block text-xs leading-5">{o.desc}</span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all',
                    on ? 'border-brand bg-brand' : '',
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full bg-white transition-transform', on ? 'scale-100' : 'scale-0')} />
                </span>
              </label>
            );
          })}
        </div>
        <FieldError id="err-type" msg={errors.type} />
      </fieldset>

      <fieldset className="mt-8">
        <legend className="mb-3 flex items-center gap-2 text-sm font-semibold">
          {t.fields.interests} <OptionalTag />
        </legend>
        <div className="flex flex-wrap gap-2">
          {interests.map((o) => {
            const on = data.interests.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={on}
                onClick={() => toggleInterest(o.value)}
                className={cn(
                  'focus-ring inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] transition-all duration-200',
                  on ? 'border-brand/60 bg-brand/15 text-[var(--fg)]' : 'muted hover:border-brand/35 hover:text-[var(--fg)]',
                )}
              >
                <span
                  className={cn(
                    'grid h-4 w-4 place-items-center rounded-full transition-all',
                    on ? 'bg-brand text-white' : 'border',
                  )}
                  aria-hidden
                >
                  {on && <icons.check className="h-3 w-3" />}
                </span>
                {o.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <Segmented name="budget" label={t.fields.budget} options={budgets} value={data.budget} onChange={(v) => set('budget', v)} />
        <Segmented name="timeline" label={t.fields.timeline} options={timelines} value={data.timeline} onChange={(v) => set('timeline', v)} />
      </div>
    </>
  );
}

function StepDetails({ data, errors, set, blur, onEdit }: StepProps & { onEdit: (step: number) => void }) {
  const len = data.message.length;
  return (
    <>
      <StepTitle title={t.steps[2].title} desc="هرچه دقیق‌تر بنویسید، برآورد اولیهٔ ما دقیق‌تر خواهد بود." />

      <div className="mb-7 rounded-2xl border p-4 sm:p-5" style={{ background: 'color-mix(in srgb, var(--bg) 45%, transparent)' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold">{t.summary}</h3>
        </div>
        <dl className="mt-3 grid gap-x-6 gap-y-3 text-[13px] sm:grid-cols-2">
          <SummaryItem label={t.fields.fullName} value={data.fullName} onEdit={() => onEdit(0)} />
          <SummaryItem label={t.fields.email} value={data.email} ltr onEdit={() => onEdit(0)} />
          <SummaryItem label="نوع همکاری" value={labelOf(collabTypes, data.type)} onEdit={() => onEdit(1)} />
          <SummaryItem
            label={`${t.fields.budget} · ${t.fields.timeline}`}
            value={`${labelOf(budgets, data.budget)} · ${labelOf(timelines, data.timeline)}`}
            onEdit={() => onEdit(1)}
          />
        </dl>
      </div>

      <div className="grid gap-5">
        <TextField name="subject" required data={data} errors={errors} set={set} blur={blur} />

        <div>
          <FieldLabel htmlFor="f-message" label={t.fields.message} required />
          <textarea
            id="f-message"
            data-field="message"
            rows={6}
            value={data.message}
            maxLength={LIMITS.message}
            onChange={(e) => set('message', e.target.value)}
            onBlur={() => blur?.('message')}
            placeholder={t.placeholders.message}
            aria-invalid={!!errors.message}
            aria-describedby="err-message hint-message"
            className="field resize-y leading-7"
          />
          <div className="mt-1.5 flex items-start justify-between gap-3">
            <FieldError id="err-message" msg={errors.message} inline />
            <span
              id="hint-message"
              className={cn('ms-auto shrink-0 text-[11px] tabular-nums', len > LIMITS.message * 0.9 ? 'text-amber-500' : 'muted')}
            >
              {toFa(t.chars(len, LIMITS.message))}
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="f-referral" label={t.fields.referral} />
            <select id="f-referral" value={data.referral} onChange={(e) => set('referral', e.target.value)} className="field">
              {referrals.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Segmented name="contactPref" label={t.fields.contactPref} options={contactPrefs} value={data.contactPref} onChange={(v) => set('contactPref', v)} compact />
        </div>

        <label
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-[13px] leading-6 transition-colors',
            'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/60',
            errors.consent ? 'border-rose-400/50 bg-rose-400/5' : data.consent ? 'border-brand/40 bg-brand/5' : 'hover:border-brand/30',
          )}
        >
          <input
            type="checkbox"
            data-field="consent"
            checked={data.consent}
            onChange={(e) => set('consent', e.target.checked)}
            className="sr-only"
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? 'err-consent' : undefined}
          />
          <span
            aria-hidden
            className={cn(
              'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all',
              data.consent ? 'border-brand bg-brand text-white' : '',
            )}
          >
            {data.consent && <icons.check className="h-3.5 w-3.5" />}
          </span>
          <span className="muted">{t.fields.consent}</span>
        </label>
        <FieldError id="err-consent" msg={errors.consent} />
      </div>
    </>
  );
}

/* ───────────────────────────── success ───────────────────────────── */

function Success({ code, onAgain }: { code: string; onAgain: () => void }) {
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the code is still selectable */
    }
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-16"
      role="status"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 w-64 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.35), transparent 70%)' }}
      />
      <div className="relative mx-auto grid h-20 w-20 place-items-center">
        <span className="absolute inset-0 animate-pulse-ring rounded-full border border-emerald-400/50" aria-hidden />
        <span
          className="grid h-20 w-20 place-items-center rounded-full text-white"
          style={{ background: 'linear-gradient(135deg,#10b981,#22d3ee)', boxShadow: '0 18px 40px -16px rgba(16,185,129,0.9)' }}
        >
          <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <motion.path
              d="m5 12.5 4.5 4.5L19 7.5"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
            />
          </svg>
        </span>
      </div>

      <h2 className="relative mt-7 text-2xl font-extrabold sm:text-3xl">{t.success.title}</h2>
      <p className="muted relative mx-auto mt-3 max-w-md text-sm leading-7">{t.success.desc}</p>

      <div className="relative mx-auto mt-8 inline-flex items-center gap-3 rounded-2xl border px-5 py-3" style={{ background: 'color-mix(in srgb, var(--bg) 55%, transparent)' }}>
        <span className="muted text-xs">{t.success.codeLabel}</span>
        <span dir="ltr" className="select-all font-mono text-lg font-bold tracking-wider">
          {code}
        </span>
        <button
          type="button"
          onClick={copy}
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors hover:border-brand/50 hover:bg-brand/10"
        >
          {copied ? <icons.check className="h-3.5 w-3.5 text-emerald-500" /> : <icons.copy className="h-3.5 w-3.5" />}
          {copied ? t.success.copied : t.success.copy}
        </button>
      </div>

      <div className="relative mx-auto mt-10 max-w-md text-start">
        <h3 className="text-sm font-bold">{t.success.nextTitle}</h3>
        <ol className="mt-4 space-y-3">
          {t.success.next.map((s, i) => (
            <li key={s} className="flex items-start gap-3 text-[13px]">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-brand/40 bg-brand/10 text-[11px] font-bold text-brand-light">
                {toFa(i + 1)}
              </span>
              <span className="muted pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="relative mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/" className="btn-primary focus-ring">
          {t.success.home}
        </Link>
        <button type="button" onClick={onAgain} className="btn-ghost focus-ring">
          {t.success.another}
        </button>
      </div>
    </motion.div>
  );
}

/* ───────────────────────────── field primitives ───────────────────────────── */

function OptionalTag() {
  return <span className="muted rounded-md border px-1.5 py-px text-[10px] font-normal">{t.optional}</span>;
}

function FieldLabel({ htmlFor, label, required, optional }: { htmlFor: string; label: string; required?: boolean; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-center gap-2 text-[13px] font-semibold">
      {label}
      {required && <span className="text-rose-500">*</span>}
      {optional && <OptionalTag />}
    </label>
  );
}

function FieldError({ id, msg, inline }: { id: string; msg?: string; inline?: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {msg && (
        <motion.p
          id={id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn('flex items-center gap-1.5 text-[12px] text-rose-600 dark:text-rose-400', !inline && 'mt-2')}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4.5M12 16h.01" />
          </svg>
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

type TextName = 'fullName' | 'email' | 'phone' | 'company' | 'role' | 'website' | 'subject';

function TextField({
  name,
  icon,
  type = 'text',
  required,
  optional,
  ltr,
  autoComplete,
  inputMode,
  className,
  data,
  errors,
  set,
  blur,
}: StepProps & {
  name: TextName;
  icon?: keyof typeof icons;
  type?: string;
  required?: boolean;
  optional?: boolean;
  ltr?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  className?: string;
}) {
  const id = `f-${name}`;
  const Icon = icon ? icons[icon] : null;
  const err = errors[name];
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={t.fields[name]} required={required} optional={optional} />
      <div className="relative">
        {Icon && (
          <Icon
            className={cn(
              'pointer-events-none absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 opacity-60',
              ltr ? 'left-3.5' : 'right-3.5',
            )}
          />
        )}
        <input
          id={id}
          data-field={name}
          type={type}
          dir={ltr ? 'ltr' : undefined}
          value={data[name]}
          maxLength={LIMITS[name]}
          onChange={(e) => set(name, e.target.value)}
          onBlur={() => blur?.(name)}
          placeholder={t.placeholders[name]}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-required={required}
          aria-invalid={!!err}
          aria-describedby={err ? `err-${name}` : undefined}
          className={cn('field', Icon && (ltr ? 'pl-11' : 'pr-11'), ltr && 'text-left')}
        />
      </div>
      <FieldError id={`err-${name}`} msg={err} />
    </div>
  );
}

function Segmented({
  name,
  label,
  options,
  value,
  onChange,
  compact,
}: {
  name: string;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  const uid = useId();
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-semibold">{label}</legend>
      <div className={cn('grid gap-2', compact ? 'grid-cols-3' : 'grid-cols-2')}>
        {options.map((o) => {
          const on = value === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                'relative flex cursor-pointer items-center justify-center rounded-xl border px-2 py-2.5 text-center text-[12.5px] leading-5 transition-all duration-200',
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/60',
                on ? 'border-brand/60 bg-brand/15 font-semibold text-[var(--fg)]' : 'muted hover:border-brand/35 hover:text-[var(--fg)]',
              )}
            >
              <input
                type="radio"
                name={`${name}-${uid}`}
                value={o.value}
                checked={on}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function SummaryItem({ label, value, ltr, onEdit }: { label: string; value: string; ltr?: boolean; onEdit: () => void }) {
  return (
    <div className="group flex min-w-0 items-start justify-between gap-2">
      <div className="min-w-0">
        <dt className="muted text-[11px]">{label}</dt>
        <dd className={cn('mt-0.5 truncate font-medium', ltr && 'text-right')} dir={ltr ? 'ltr' : undefined}>
          {value || '—'}
        </dd>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="focus-ring shrink-0 rounded-md px-1.5 py-0.5 text-[11px] text-brand-light opacity-80 transition-opacity hover:opacity-100"
      >
        ویرایش
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
