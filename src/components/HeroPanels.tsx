'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toFa } from '@/lib/utils';

const inbox = [
  { title: 'تایید طرح کنترل کیفیت', code: 'IC-۲۰۴۸', role: 'دفتر فنی', tone: 'amber' },
  { title: 'اجرای بازرسی نهایی', code: 'IC-۲۰۳۱', role: 'بازرس داخلی', tone: 'blue' },
  { title: 'تصمیم عدم انطباق', code: 'IC-۱۹۸۷', role: 'بهره‌بردار', tone: 'rose' },
  { title: 'صدور مجوز حمل', code: 'IC-۱۹۵۲', role: 'بازرگانی', tone: 'emerald' },
] as const;

const toneClass: Record<string, string> = {
  amber: 'bg-amber-400/15 text-amber-700 dark:text-amber-300 border-amber-400/30',
  blue: 'bg-blue-400/15 text-blue-700 dark:text-blue-300 border-blue-400/30',
  rose: 'bg-rose-400/15 text-rose-700 dark:text-rose-300 border-rose-400/30',
  emerald: 'bg-emerald-400/15 text-emerald-700 dark:text-emerald-700 dark:text-emerald-300 border-emerald-400/30',
};

/** A mock role-based workflow inbox — the shape both products share. */
export function InboxPanel() {
  return (
    <ul className="space-y-2.5">
      {inbox.map((row, i) => (
        <motion.li
          key={row.code}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.09, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-[13px]"
          style={{ background: 'color-mix(in srgb, var(--bg) 55%, transparent)' }}
        >
          <div className="min-w-0">
            <div className="truncate font-medium">{row.title}</div>
            <div className="muted mt-0.5 text-[11px]">کد کالا {row.code}</div>
          </div>
          <span className={`shrink-0 rounded-lg border px-2 py-1 text-[11px] ${toneClass[row.tone]}`}>
            {row.role}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

const bars = [42, 61, 55, 78, 69, 88, 73, 95];

/** A mock KPI panel with animated bars and counters. */
export function MetricsPanel() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { k: 'سفارش باز', v: '۱۲۴' },
          { k: 'بازرسی امروز', v: '۱۸' },
          { k: 'نرخ تایید', v: '۹۴٪' },
        ].map((m, i) => (
          <motion.div
            key={m.k}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="rounded-xl border px-3 py-2.5"
            style={{ background: 'color-mix(in srgb, var(--bg) 55%, transparent)' }}
          >
            <div className="text-lg font-bold">{m.v}</div>
            <div className="muted text-[11px]">{m.k}</div>
          </motion.div>
        ))}
      </div>
      <div className="flex h-28 items-end gap-2">
        {bars.map((b, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${b}%` }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 rounded-t-md"
            style={{ background: 'linear-gradient(to top, rgba(37,99,235,0.25), #3b82f6)' }}
          />
        ))}
      </div>
      <div className="muted flex justify-between text-[11px]">
        <span>فروردین</span>
        <span>روند تایید بچ‌ها</span>
        <span>آبان</span>
      </div>
    </div>
  );
}

const codeLines = [
  { t: 'const step = workflow.next({', c: 'text-sky-700 dark:text-sky-300' },
  { t: "  from: 'INSPECTION_CONDUCT',", c: 'muted' },
  { t: "  actor: 'INSPECTION_EXPERT',", c: 'muted' },
  { t: '  batch: { sent: 120, approved: 118 },', c: 'muted' },
  { t: '})', c: 'text-sky-700 dark:text-sky-300' },
  { t: '', c: '' },
  { t: '// ✓ باقی‌مانده: ۲ — چرخه باز می‌ماند', c: 'text-emerald-700 dark:text-emerald-300' },
];

/** A typing code panel; reveals one line at a time. */
export function CodePanel() {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    const id = setInterval(() => {
      setShown((s) => (s >= codeLines.length ? s : s + 1));
    }, 260);
    return () => clearInterval(id);
  }, []);

  return (
    <pre dir="ltr" className="overflow-x-auto font-mono text-[12.5px] leading-[2]">
      {codeLines.slice(0, shown).map((l, i) => (
        <div key={i} className={l.c || undefined} dir={l.t.startsWith('//') ? 'rtl' : 'ltr'}>
          <span className="muted me-3 select-none">{toFa(String(i + 1).padStart(2, '0'))}</span>
          {l.t || ' '}
        </div>
      ))}
      {shown < codeLines.length && (
        <span className="inline-block h-4 w-2 animate-pulse bg-brand align-middle" />
      )}
    </pre>
  );
}
