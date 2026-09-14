'use client';

import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { icons } from './Icons';
import { services } from '@/data/site';

/** Tracks the pointer so each card's spotlight follows it. */
function onCardMove(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  el.style.setProperty('--my', `${e.clientY - rect.top}px`);
}

export function Services() {
  const Check = icons.check;

  return (
    <section id="services" className="section">
      <div className="container-x">
        <SectionHeading
          eyebrow="خدمات"
          title="از تحلیل فرآیند تا"
          accent="نسخهٔ تولیدی"
          desc="ما آژانس طراحی سایت نیستیم. سامانه‌های سازمانی می‌سازیم — چیزهایی که ده‌ها نقش کاربری، گردش‌کارهای چندمرحله‌ای و داده‌های حساس را سال‌ها تاب می‌آورند."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = icons[s.icon];
            return (
              <Reveal key={s.id} delay={(i % 3) * 0.08}>
                <article
                  onMouseMove={onCardMove}
                  className="spotlight card group h-full overflow-hidden hover:border-brand/40"
                >
                  <div className="relative">
                    <span className="grid h-12 w-12 place-items-center rounded-xl border border-brand/25 bg-brand/10 text-brand-light transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                    <p className="muted mt-3 text-sm leading-[2]">{s.desc}</p>
                    <ul className="mt-5 space-y-2">
                      {s.points.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-[13px]">
                          <Check className="h-4 w-4 shrink-0 text-cyan-glow" />
                          <span className="muted">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: 'linear-gradient(to left, transparent, #2563eb, transparent)' }}
                  />
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
