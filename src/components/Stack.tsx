'use client';

import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { differentiators, stack } from '@/data/site';

/** Infinite marquee of the tech we build on, plus the four differentiators. */
export function Stack() {
  const row = [...stack, ...stack];

  return (
    <section id="stack" className="section">
      <div className="container-x">
        <SectionHeading
          eyebrow="تکنولوژی"
          title="ابزارهایی که رویشان"
          accent="حساب می‌کنیم"
          desc="هیچ چیز عجیب و غریبی انتخاب نمی‌کنیم. استک‌مان بالغ، تایپ‌سِیف و قابل استقرار روی زیرساخت خود شماست."
        />
      </div>

      <div
        className="relative mt-14 overflow-hidden py-4"
        style={{ maskImage: 'linear-gradient(to left, transparent, black 12%, black 88%, transparent)', WebkitMaskImage: 'linear-gradient(to left, transparent, black 12%, black 88%, transparent)' }}
      >
        <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
          {row.map((t, i) => (
            <span
              key={`${t}-${i}`}
              dir="ltr"
              className="surface shrink-0 rounded-xl border px-5 py-3 text-sm font-medium transition-colors hover:border-brand/50 hover:text-brand-light"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="container-x mt-20 grid gap-5 sm:grid-cols-2">
        {differentiators.map((d, i) => (
          <Reveal key={d.title} delay={(i % 2) * 0.08}>
            <div className="card h-full border-s-2 !border-s-brand/60">
              <h3 className="text-base font-bold">{d.title}</h3>
              <p className="muted mt-3 text-sm leading-[2]">{d.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
