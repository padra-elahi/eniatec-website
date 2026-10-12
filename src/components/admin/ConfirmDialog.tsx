'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { icons } from '@/components/Icons';
import { admin } from '@/data/collab';

type Props = {
  open: boolean;
  title: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** A destructive-action confirmation modal. Escape or the backdrop cancels. */
export function ConfirmDialog({ open, title, confirmLabel, busy, onConfirm, onClose }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="surface relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-rose-400/30 bg-rose-400/10 text-rose-500">
              <icons.trash className="h-5 w-5" />
            </span>
            <h2 id="confirm-title" className="mt-4 text-[15px] font-bold leading-7">
              {title}
            </h2>
            <p className="muted mt-1 text-xs">این کار قابل بازگشت نیست.</p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className="btn focus-ring flex-1 bg-rose-600 !py-2.5 text-white hover:bg-rose-500 disabled:opacity-60"
              >
                {confirmLabel}
              </button>
              <button ref={cancelRef} type="button" onClick={onClose} className="btn-ghost focus-ring flex-1 !py-2.5">
                {admin.detail.cancel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
