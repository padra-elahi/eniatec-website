'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { process } from '@/data/site';

/** A scroll-driven timeline: the spine fills as the section passes the viewport. */
export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 70%', 'end 60%'],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  const glowY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section id="process" className="section">
      <div className="container-x">
        <SectionHeading
          eyebrow="فرآیند کار"
          title="شش گام از ایده تا"
          accent="سامانهٔ زنده"
          desc="بدون سورپرایز، بدون «سه ماه دیگر نشانتان می‌دهیم». در هر گام چیزی قابل لمس تحویل می‌گیرید."
        />

        <div ref={ref} className="relative mt-16">
          <div className="absolute bottom-0 end-[19px] top-2 w-px md:end-1/2 md:translate-x-1/2">
            <div className="h-full w-px" style={{ background: 'var(--line)' }} />
            <motion.div
              style={{ scaleY, transformOrigin: 'top' }}
              className="absolute inset-0 w-px bg-gradient-to-b from-brand via-cyan-glow to-violet-400"
            />
            <motion.div
              style={{ top: glowY }}
              className="absolute -start-[3px] h-1.5 w-1.5 rounded-full bg-cyan-glow"
            />
          </div>

          <ol className="space-y-8 md:space-y-2">
            {process.map((p, i) => (
              <li
                key={p.step}
                className="relative ps-0 pe-14 md:grid md:grid-cols-2 md:gap-12 md:pe-0"
              >
                <Reveal
                  delay={0.05}
                  className={
                    i % 2 === 0
                      ? 'md:col-start-1 md:text-start'
                      : 'md:col-start-2 md:row-start-auto'
                  }
                >
                  <div className="card spotlight group md:my-3" onMouseMove={spotlight}>
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-black text-brand/70 transition-colors group-hover:text-brand">
                        {p.step}
                      </span>
                      <h3 className="text-lg font-bold">{p.title}</h3>
                    </div>
                    <p className="muted mt-3 text-sm leading-[2]">{p.desc}</p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-glow/25 bg-cyan-glow/10 px-3 py-1.5 text-[11.5px] text-cyan-600 dark:text-cyan-300">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {p.deliverable}
                    </div>
                  </div>
                </Reveal>

                <span
                  className="absolute end-[13px] top-8 h-3.5 w-3.5 rounded-full border-2 md:end-[calc(50%-7px)]"
                  style={{ borderColor: 'var(--brand)', background: 'var(--bg)' }}
                  aria-hidden
                />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function spotlight(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  el.style.setProperty('--my', `${e.clientY - rect.top}px`);
}
