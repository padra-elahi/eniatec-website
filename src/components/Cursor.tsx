'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A soft glow that trails the pointer on devices with a real mouse.
 * Grows over interactive elements. Never shown on touch or reduced-motion.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;
    setEnabled(true);

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let raf = 0;

    const loop = () => {
      cx += (x - cx) * 0.16;
      cy += (y - cy) * 0.16;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const target = e.target as HTMLElement | null;
      const hot = !!target?.closest('a, button, input, textarea, select, [data-cursor="hot"]');
      ref.current?.classList.toggle('scale-[2.6]', hot);
      ref.current?.classList.toggle('opacity-40', hot);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70] h-6 w-6 rounded-full opacity-70 mix-blend-screen transition-[transform,opacity] duration-200 will-change-transform"
      style={{
        background: 'radial-gradient(circle, rgba(59,130,246,0.9), rgba(34,211,238,0.25) 55%, transparent 70%)',
      }}
    />
  );
}
