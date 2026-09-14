'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CodePanel, InboxPanel, MetricsPanel } from './HeroPanels';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'inbox', label: 'کارتابل', Panel: InboxPanel },
  { id: 'metrics', label: 'شاخص‌ها', Panel: MetricsPanel },
  { id: 'code', label: 'موتور گردش‌کار', Panel: CodePanel },
] as const;

const ROTATE_MS = 6500;

/**
 * The hero's floating app window. Rotates through three live mock panels and
 * tilts slightly toward the pointer; rotation stops once the visitor clicks a
 * tab themselves.
 */
export function TerminalCard() {
  const [index, setIndex] = useState(0);
  const [pinned, setPinned] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pinned) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % tabs.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [pinned]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1100px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(1100px) rotateY(0) rotateX(0)';
  };

  const Panel = tabs[index].Panel;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative rounded-2xl border shadow-2xl transition-transform duration-300 will-change-transform"
      style={{
        background: 'color-mix(in srgb, var(--bg-soft) 88%, transparent)',
        boxShadow: '0 40px 90px -40px rgba(2,8,23,0.9), 0 0 0 1px var(--line)',
      }}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-60"
        style={{ background: 'linear-gradient(140deg, rgba(37,99,235,0.28), transparent 42%)' }}
      />

      <div className="relative flex items-center gap-2 border-b px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <i className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <i className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <i className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </span>
        <span className="muted mx-auto font-mono text-[11px]" dir="ltr">
          app.eniatec.tech
        </span>
      </div>

      <div className="relative flex gap-1 border-b px-3 pt-3" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => {
              setIndex(i);
              setPinned(true);
            }}
            className={cn(
              'relative rounded-t-lg px-3.5 py-2 text-[12.5px] transition-colors',
              i === index ? 'text-[var(--fg)]' : 'muted hover:text-[var(--fg)]',
            )}
          >
            {t.label}
            {i === index && (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-brand"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="relative min-h-[268px] p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={tabs[index].id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32 }}
          >
            <Panel />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
