'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { icons } from '@/components/Icons';
import { deleteRequestsAction, markReadAction, setStarredAction, setStatusAction } from '@/app/admin/actions';
import { admin, collabTypes, labelOf, statuses } from '@/data/collab';
import type { RequestRow } from '@/lib/db';
import { formatDateTime, timeAgo } from '@/lib/format';
import { cn, toFa } from '@/lib/utils';
import { ConfirmDialog } from './ConfirmDialog';
import { useToast } from './Toast';
import { Avatar, StatusBadge } from './ui';

const t = admin.list;

/** The request list with row selection, inline starring and bulk actions. */
export function RequestsTable({ rows }: { rows: RequestRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();

  const visibleIds = rows.map((r) => r.id);
  const sel = visibleIds.filter((id) => selected.has(id));
  const allOn = sel.length === rows.length && rows.length > 0;

  const toggle = (id: number) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const run = (fn: () => Promise<unknown>, msg: string = admin.toast.saved, clear = true) =>
    start(async () => {
      try {
        await fn();
        toast(msg);
        if (clear) setSelected(new Set());
        router.refresh();
      } catch {
        toast(admin.toast.error, 'error');
      }
    });

  return (
    <>
      <div className="card mt-4 overflow-hidden !p-0">
        <div className="flex items-center gap-3 border-b px-4 py-2.5 text-xs sm:px-5">
          <Checkbox
            checked={allOn}
            indeterminate={sel.length > 0 && !allOn}
            onChange={() => setSelected(allOn ? new Set() : new Set(visibleIds))}
            label="انتخاب همه"
          />
          <span className="muted">{sel.length ? t.selected(toFa(sel.length)) : t.columns.person}</span>
          <span className="muted ms-auto hidden w-40 md:block">{t.columns.type}</span>
          <span className="muted hidden w-32 md:block">{t.columns.status}</span>
          <span className="muted hidden w-24 text-left sm:block">{t.columns.date}</span>
        </div>

        <ul className={cn('divide-y transition-opacity', pending && 'opacity-70')} style={{ borderColor: 'var(--line)' }}>
          {rows.map((r) => {
            const unread = r.read_at === null;
            const on = selected.has(r.id);
            return (
              <li
                key={r.id}
                className={cn(
                  'group relative flex items-center gap-3 px-4 py-3.5 transition-colors sm:px-5',
                  on ? 'bg-brand/[0.07]' : 'hover:bg-brand/[0.035]',
                )}
              >
                {unread && <span className="absolute inset-y-3 right-0 w-[3px] rounded-l-full bg-brand-light" aria-hidden />}
                <Checkbox checked={on} onChange={() => toggle(r.id)} label={`انتخاب ${r.full_name}`} />
                <button
                  type="button"
                  onClick={() => run(() => setStarredAction(r.id, !r.starred), admin.toast.saved, false)}
                  aria-label={r.starred ? admin.detail.unstar : admin.detail.star}
                  aria-pressed={!!r.starred}
                  className={cn(
                    'focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors',
                    r.starred ? 'text-amber-400' : 'muted opacity-50 hover:text-amber-400 hover:opacity-100',
                  )}
                >
                  <icons.star className={cn('h-[18px] w-[18px]', !!r.starred && 'fill-current')} />
                </button>

                <Link href={`/admin/requests/${r.id}/`} className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-lg">
                  <Avatar name={r.full_name} size={38} className="hidden sm:grid" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={cn('truncate text-sm', unread ? 'font-bold' : 'font-medium')}>{r.full_name}</span>
                      {r.company && <span className="muted hidden truncate text-xs lg:inline">· {r.company}</span>}
                      <span dir="ltr" className="muted hidden shrink-0 font-mono text-[10.5px] opacity-70 xl:inline">
                        {r.code}
                      </span>
                    </span>
                    <span className={cn('mt-0.5 block truncate text-[12.5px]', unread ? 'text-[var(--fg)]' : 'muted')}>
                      {r.subject}
                      <span className="muted"> — {r.message.slice(0, 120)}</span>
                    </span>
                    <span className="mt-1.5 flex items-center gap-2 md:hidden">
                      <StatusBadge status={r.status} />
                      <span className="muted truncate text-[11px]">{labelOf(collabTypes, r.type)}</span>
                    </span>
                  </span>
                  <span className="muted hidden w-40 truncate text-[12.5px] md:block">{labelOf(collabTypes, r.type)}</span>
                  <span className="hidden w-32 md:block">
                    <StatusBadge status={r.status} />
                  </span>
                  <span className="muted hidden w-24 text-left text-[11.5px] sm:block" title={formatDateTime(r.created_at)}>
                    {timeAgo(r.created_at)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <AnimatePresence>
        {sel.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4 lg:pr-[260px]"
          >
            <div className="surface flex max-w-full flex-wrap items-center gap-2 rounded-2xl border p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
              <span className="px-3 text-[13px] font-semibold">{t.selected(toFa(sel.length))}</span>
              <span className="h-6 w-px" style={{ background: 'var(--line)' }} />
              <select
                aria-label={t.setStatus}
                value=""
                onChange={(e) => e.target.value && run(() => setStatusAction(sel, e.target.value))}
                className="field !w-auto !py-2 text-[13px]"
                disabled={pending}
              >
                <option value="">{t.setStatus}…</option>
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <BarButton onClick={() => run(() => markReadAction(sel, true))} disabled={pending} icon={icons.eye} label={t.markRead} />
              <BarButton onClick={() => run(() => markReadAction(sel, false))} disabled={pending} icon={icons.mail} label={t.markUnread} />
              <BarButton onClick={() => setConfirm(true)} disabled={pending} icon={icons.trash} label={t.delete} danger />
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                aria-label="لغو انتخاب"
                className="focus-ring muted grid h-9 w-9 place-items-center rounded-lg hover:text-[var(--fg)]"
              >
                <icons.close className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirm}
        title={t.confirmDelete(toFa(sel.length))}
        confirmLabel={t.delete}
        busy={pending}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          run(() => deleteRequestsAction(sel), admin.toast.deleted);
        }}
      />
    </>
  );
}

function BarButton({
  onClick,
  disabled,
  icon: Icon,
  label,
  danger,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: (p: { className?: string }) => React.ReactElement;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'focus-ring inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[12.5px] transition-colors disabled:opacity-50',
        danger ? 'border-rose-400/30 text-rose-500 hover:bg-rose-500/10' : 'hover:border-brand/40 hover:bg-brand/10',
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="relative grid h-5 w-5 shrink-0 cursor-pointer place-items-center has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/60 rounded-md">
      <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} className="peer sr-only" />
      <span
        aria-hidden
        className={cn(
          'grid h-[18px] w-[18px] place-items-center rounded-md border transition-all',
          checked || indeterminate ? 'border-brand bg-brand text-white' : 'hover:border-brand/50',
        )}
      >
        {checked ? <icons.check className="h-3 w-3" /> : indeterminate ? <span className="h-0.5 w-2 rounded bg-white" /> : null}
      </span>
    </label>
  );
}
