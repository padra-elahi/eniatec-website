'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Toast = { id: number; text: string; tone: 'ok' | 'error' };

const Ctx = createContext<(text: string, tone?: Toast['tone']) => void>(() => {});

export const useToast = () => useContext(Ctx);

/** Small stacked notifications at the bottom of the admin panel. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex flex-col items-center gap-2 px-4" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className={cn(
                'surface pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-[13px] shadow-2xl',
                t.tone === 'error' && 'border-rose-400/40',
              )}
            >
              <span className={cn('h-2 w-2 rounded-full', t.tone === 'ok' ? 'bg-emerald-400' : 'bg-rose-400')} />
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
