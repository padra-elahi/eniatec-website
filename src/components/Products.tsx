'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { icons } from './Icons';
import { products } from '@/data/site';
import { cn, toFa } from '@/lib/utils';

export function Products() {
  const [active, setActive] = useState(0);
  const [openFeature, setOpenFeature] = useState<number | null>(0);
  const product = products[active];
  const Arrow = icons.arrow;
  const Github = icons.github;

  const select = (i: number) => {
    setActive(i);
    setOpenFeature(0);
  };

  return (
    <section id="products" className="section overflow-hidden">
      <div
        className="pointer-events-none absolute start-1/2 top-24 h-[420px] w-[820px] -translate-x-1/2 rounded-full blur-[150px]"
        style={{ background: `radial-gradient(circle, ${product.accent}22, transparent 68%)` }}
      />

      <div className="container-x relative">
        <SectionHeading
          eyebrow="محصولات"
          title="دو سامانهٔ تولیدی که"
          accent="خودمان ساخته‌ایم"
          desc="این‌ها نمونه‌کار نیستند؛ سامانه‌های کاملی هستند که ساخته‌ایم و توسعه می‌دهیم. معماری، مستندات و کد هر دو روی گیت‌هاب در دسترس است."
        />

        <Reveal delay={0.1}>
          <div className="mt-14 flex justify-center">
            <div className="surface inline-flex rounded-2xl border p-1.5" role="tablist">
              {products.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => select(i)}
                  className={cn(
                    'relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 sm:px-7',
                    i === active
                      ? 'text-white shadow-lg shadow-brand/25'
                      : 'muted hover:text-[var(--fg)]',
                  )}
                  style={
                    i === active
                      ? { background: `linear-gradient(135deg, ${p.accent}, #1e3a8a)` }
                      : undefined
                  }
                >
                  <span className="block" dir="ltr">{p.name}</span>
                  <span className="block text-[10px] font-normal opacity-80">{p.kicker}</span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]"
          >
            <div
              className="card overflow-hidden !p-7"
              style={{ borderColor: `${product.accent}33` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: product.accent, boxShadow: `0 0 14px ${product.accent}` }}
                />
                <span className="muted text-xs">{product.kicker}</span>
              </div>

              <h3 className="mt-4 text-2xl font-black" dir="ltr">
                {product.name}
              </h3>
              <p className="mt-1 text-sm font-medium opacity-80">{product.nameFa}</p>
              <p className="muted mt-5 text-sm leading-[2.1]">{product.summary}</p>

              <div className="mt-7 grid grid-cols-3 gap-2.5">
                {product.metrics.map((m) => (
                  <div key={m.k} className="rounded-xl border px-3 py-3 text-center">
                    <div className="text-xl font-black" style={{ color: product.accent }}>
                      {m.v}
                    </div>
                    <div className="muted mt-1 text-[11px]">{m.k}</div>
                  </div>
                ))}
              </div>

              <div className="mt-7">
                <div className="muted mb-3 text-xs">سطوح کاربری</div>
                <ul className="space-y-2">
                  {product.surfaces.map((s) => (
                    <li key={s.name} className="flex items-start gap-2.5 text-[13px]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: product.accent }} />
                      <span>
                        <b className="font-semibold">{s.name}</b>
                        <span className="muted"> — {s.desc}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-7 flex flex-wrap gap-1.5">
                {product.stack.map((t) => (
                  <span key={t} className="chip !px-2.5 !py-0.5 !text-[11px]" dir="ltr">
                    {t}
                  </span>
                ))}
              </div>

              <a
                href={product.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost mt-8 w-full"
              >
                <Github className="h-4 w-4" />
                مشاهده روی گیت‌هاب
                <Arrow className="h-4 w-4" />
              </a>
            </div>

            <div className="card !p-3 sm:!p-5">
              <div className="muted px-3 pb-3 pt-2 text-xs">قابلیت‌های کلیدی — برای جزئیات کلیک کنید</div>
              <ul className="space-y-1.5">
                {product.features.map((f, i) => {
                  const open = openFeature === i;
                  return (
                    <li key={f.title}>
                      <button
                        type="button"
                        onClick={() => setOpenFeature(open ? null : i)}
                        aria-expanded={open}
                        className={cn(
                          'flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-right text-sm transition-colors',
                          open ? 'bg-brand/10' : 'hover:bg-brand/[0.06]',
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-bold"
                            style={{ background: `${product.accent}1f`, color: product.accent }}
                          >
                            {toFa(i + 1)}
                          </span>
                          <span className="font-medium">{f.title}</span>
                        </span>
                        <svg
                          viewBox="0 0 24 24"
                          className={cn('h-4 w-4 shrink-0 transition-transform duration-300', open && 'rotate-180')}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="muted px-4 pb-4 pt-1 text-[13px] leading-[2.1]">{f.desc}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
