'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/** A thin gradient bar pinned to the top edge tracking page scroll. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: 'right' }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-gradient-to-l from-brand via-cyan-glow to-violet-400"
      aria-hidden
    />
  );
}
