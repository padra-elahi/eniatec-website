'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { Reveal } from './Reveal';
import { stats } from '@/data/site';
import { toFa } from '@/lib/utils';

/** Counts from zero to `value` once the element scrolls into view. */
function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // ease-out-expo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {toFa(n)}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="relative border-y py-14" style={{ background: 'color-mix(in srgb, var(--bg-soft) 45%, transparent)' }}>
      <div className="container-x grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="text-center md:text-start">
            <div className="gradient-text text-4xl font-black sm:text-5xl">
              <Counter value={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-2 text-sm font-medium">{s.label}</div>
            <div className="muted mt-1 text-xs">{s.hint}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
