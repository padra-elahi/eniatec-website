'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ParticleField } from './ParticleField';
import { TerminalCard } from './TerminalCard';
import { hero } from '@/data/site';

const words = hero.titleTop.split(' ');

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-28 pt-32 sm:pt-36">
      <div className="absolute inset-0 bg-grid-dark [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_35%,black,transparent_72%)]" />
      <ParticleField className="absolute inset-0 h-full w-full" />

      <div
        className="pointer-events-none absolute -top-40 end-[-10%] h-[520px] w-[520px] rounded-full blur-[130px]"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.35), transparent 65%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-[-20%] start-[-8%] h-[460px] w-[460px] rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.22), transparent 65%)' }}
      />

      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.a
            href="#products"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="chip hover:border-brand/50 hover:text-[var(--fg)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-cyan-glow" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-glow" />
            </span>
            {hero.badge}
          </motion.a>

          <h1 className="mt-7 text-[2.3rem] font-black leading-[1.28] sm:text-6xl sm:leading-[1.2]">
            {words.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                className="inline-block"
                initial={reduce ? false : { opacity: 0, y: 26, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}&nbsp;
              </motion.span>
            ))}
            <motion.span
              className="gradient-text inline-block"
              initial={reduce ? false : { opacity: 0, y: 26, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.08 * words.length, ease: [0.16, 1, 0.3, 1] }}
            >
              {hero.titleAccent}
            </motion.span>
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="muted mt-7 max-w-xl text-base leading-[2.1] sm:text-lg"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.58 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <a href="#products" className="btn-primary">
              {hero.primaryCta}
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
            </a>
            <a href="#contact" className="btn-ghost">
              {hero.secondaryCta}
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <TerminalCard />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="muted absolute inset-x-0 bottom-7 hidden flex-col items-center gap-2 text-xs sm:flex"
      >
        <span>{hero.scrollHint}</span>
        <motion.span
          animate={reduce ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="block h-6 w-[1px] bg-gradient-to-b from-transparent via-brand to-transparent"
        />
      </motion.div>
    </section>
  );
}
