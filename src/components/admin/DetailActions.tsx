'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { icons } from '@/components/Icons';
import { deleteRequestsAction, markReadAction, setStarredAction, setStatusAction } from '@/app/admin/actions';
import { admin, statuses } from '@/data/collab';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from './ConfirmDialog';
import { useToast } from './Toast';
import { statusTone } from './ui';

const t = admin.detail;

/** Marks a request read the first time it is opened, then refreshes the unread badge. */
export function MarkReadOnOpen({ id, unread }: { id: number; unread: boolean }) {
  const router = useRouter();
  const done = useRef(false);
  useEffect(() => {
    if (!unread || done.current) return;
    done.current = true;
    markReadAction([id], true).then(() => router.refresh(), () => {});
  }, [id, unread, router]);
  return null;
}

export function CopyButton({ value, small }: { value: string; small?: boolean }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        } catch {
          /* clipboard blocked */
        }
      }}
      aria-label={ok ? t.copied : t.copy}
      title={ok ? t.copied : t.copy}
      className={cn(
        'focus-ring muted grid shrink-0 place-items-center rounded-md transition-colors hover:text-[var(--fg)]',
        small ? 'h-5 w-5' : 'h-8 w-8 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-lg:opacity-100',
      )}
    >
      {ok ? <icons.check className="h-3.5 w-3.5 text-emerald-500" /> : <icons.copy className="h-3.5 w-3.5" />}
    </button>
  );
}

type Props = {
  id: number;
  status: string;
  starred: boolean;
  email: string;
  phone: string;
  subject: string;
  code: string;
};

/** Status picker, star, reply/call shortcuts, mark unread and delete. */
export function DetailActions({ id, status, starred, email, phone, subject, code }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    window.addEventListener('mousedown', close);
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('keydown', close);
    };
  }, [menu]);

  const run = (fn: () => Promise<unknown>, after?: () => void) =>
    start(async () => {
      try {
        await fn();
        toast(admin.toast.saved);
        if (after) after();
        else router.refresh();
      } catch {
        toast(admin.toast.error, 'error');
      }
    });

  const current = statuses.find((s) => s.value === status);
  const mailto = `mailto:${email}?subject=${encodeURIComponent(`پاسخ انیاتک: ${subject} [${code}]`)}`;

  return (
    <div className="flex flex-wrap items-center gap-2 border-t px-5 py-4 sm:px-7">
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={menu}
          disabled={pending}
          className="focus-ring inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition-colors hover:border-brand/50 disabled:opacity-60"
        >
          <span className="h-2 w-2 rounded-full" style={{ background: statusTone(status).bar }} />
          {t.status}: {current?.label}
          <icons.chevron className={cn('h-3.5 w-3.5 -rotate-90 transition-transform', menu && 'rotate-90')} />
        </button>
        <AnimatePresence>
          {menu && (
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="surface absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border p-1.5 shadow-2xl"
            >
              {statuses.map((s) => (
                <li key={s.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={s.value === status}
                    onClick={() => {
                      setMenu(false);
                      if (s.value !== status) run(() => setStatusAction([id], s.value));
                    }}
                    className={cn(
                      'focus-ring flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors hover:bg-brand/10',
                      s.value === status && 'font-semibold',
                    )}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: statusTone(s.value).bar }} />
                    {s.label}
                    {s.value === status && <icons.check className="ms-auto h-4 w-4 text-brand-light" />}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={() => run(() => setStarredAction(id, !starred))}
        disabled={pending}
        aria-pressed={starred}
        className={cn(
          'focus-ring inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[13px] transition-colors disabled:opacity-60',
          starred ? 'border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-300' : 'hover:border-amber-400/40',
        )}
      >
        <icons.star className={cn('h-4 w-4', starred && 'fill-current')} />
        {starred ? t.unstar : t.star}
      </button>

      <span className="hidden h-6 w-px sm:block" style={{ background: 'var(--line)' }} />

      <a href={mailto} className="btn-primary focus-ring !rounded-xl !px-4 !py-2 text-[13px]">
        <icons.mail className="h-4 w-4" />
        {t.reply}
      </a>
      <a
        href={`tel:${phone.replace(/[^\d+]/g, '')}`}
        className="focus-ring inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[13px] transition-colors hover:border-brand/50 hover:bg-brand/10"
      >
        <icons.phone className="h-4 w-4" />
        {t.call}
      </a>

      <div className="ms-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => run(() => markReadAction([id], false), () => router.push('/admin/requests/'))}
          disabled={pending}
          className="focus-ring muted inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] transition-colors hover:text-[var(--fg)]"
        >
          <icons.mail className="h-4 w-4" />
          <span className="hidden sm:inline">{t.markUnread}</span>
        </button>
        <button
          type="button"
          onClick={() => setConfirm(true)}
          disabled={pending}
          aria-label={t.delete}
          title={t.delete}
          className="focus-ring grid h-9 w-9 place-items-center rounded-xl border border-rose-400/30 text-rose-500 transition-colors hover:bg-rose-500/10"
        >
          <icons.trash className="h-4 w-4" />
        </button>
      </div>

      <ConfirmDialog
        open={confirm}
        title={t.confirmDelete}
        confirmLabel={t.delete}
        busy={pending}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          start(async () => {
            try {
              await deleteRequestsAction([id]);
              toast(admin.toast.deleted);
              router.push('/admin/requests/');
            } catch {
              toast(admin.toast.error, 'error');
            }
          });
        }}
      />
    </div>
  );
}
