'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { icons } from '@/components/Icons';
import { addNoteAction, deleteNoteAction } from '@/app/admin/actions';
import { admin, labelOf, statuses } from '@/data/collab';
import type { EventRow } from '@/lib/db';
import { formatDateTime, timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useToast } from './Toast';
import { statusTone } from './ui';

const t = admin.detail;

/** Internal notes composer plus the request's timeline, newest first. */
export function Activity({ id, events }: { id: number; events: EventRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [note, setNote] = useState('');
  const [pending, start] = useTransition();

  const save = () => {
    const body = note.trim();
    if (!body) return;
    start(async () => {
      try {
        await addNoteAction(id, body);
        setNote('');
        toast(admin.toast.saved);
        router.refresh();
      } catch {
        toast(admin.toast.error, 'error');
      }
    });
  };

  const remove = (eventId: number) =>
    start(async () => {
      try {
        await deleteNoteAction(id, eventId);
        toast(admin.toast.deleted);
        router.refresh();
      } catch {
        toast(admin.toast.error, 'error');
      }
    });

  const list = [...events].reverse();

  return (
    <section className="card !p-0">
      <header className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="text-sm font-bold">{t.activity}</h2>
        <span className="muted text-xs">{events.filter((e) => e.kind === 'note').length.toLocaleString('fa-IR')} یادداشت</span>
      </header>

      <div className="p-5">
        <div className="rounded-2xl border transition-colors focus-within:border-brand/60 focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.14)]">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
            }}
            rows={3}
            maxLength={4000}
            placeholder={t.notePlaceholder}
            aria-label={t.notePlaceholder}
            className="block w-full resize-y rounded-t-2xl bg-transparent px-4 py-3 text-[13.5px] leading-7 outline-none placeholder:text-[var(--fg-muted)] placeholder:opacity-70"
          />
          <div className="flex items-center justify-between gap-3 border-t px-3 py-2">
            <span className="muted hidden text-[11px] sm:block">Ctrl + Enter</span>
            <button
              type="button"
              onClick={save}
              disabled={pending || !note.trim()}
              className="btn-primary focus-ring ms-auto !rounded-lg !px-4 !py-1.5 text-[12.5px] disabled:opacity-50"
            >
              <icons.note className="h-4 w-4" />
              {t.addNote}
            </button>
          </div>
        </div>

        <ol className="relative mt-6 space-y-5">
          <span aria-hidden className="absolute bottom-2 right-[15px] top-2 w-px" style={{ background: 'var(--line)' }} />
          {list.map((e) => (
            <li key={e.id} className="relative flex gap-3.5">
              <EventDot event={e} />
              <div className="min-w-0 flex-1 pt-1">
                {e.kind === 'note' ? (
                  <div className="group rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold text-amber-700 dark:text-amber-300">یادداشت داخلی</span>
                      <button
                        type="button"
                        onClick={() => remove(e.id)}
                        disabled={pending}
                        aria-label={t.deleteNote}
                        title={t.deleteNote}
                        className="focus-ring muted grid h-7 w-7 place-items-center rounded-md opacity-0 transition-opacity hover:text-rose-500 focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-100"
                      >
                        <icons.trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap break-words text-[13.5px] leading-7">{e.body}</p>
                  </div>
                ) : (
                  <p className="text-[13px]">{describe(e)}</p>
                )}
                <p className="muted mt-1 text-[11px]" title={formatDateTime(e.created_at)}>
                  {timeAgo(e.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function describe(e: EventRow) {
  if (e.kind === 'created') return t.events.created;
  if (e.kind === 'starred') return t.events.starred;
  if (e.kind === 'unstarred') return t.events.unstarred;
  if (e.kind === 'status') {
    try {
      const { from, to } = JSON.parse(e.body) as { from: string; to: string };
      return t.events.status(labelOf(statuses, from), labelOf(statuses, to));
    } catch {
      return '';
    }
  }
  return e.body;
}

function EventDot({ event }: { event: EventRow }) {
  const base = 'relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border';
  if (event.kind === 'note')
    return (
      <span className={cn(base, 'border-amber-400/40 bg-[var(--bg-soft)] text-amber-500')}>
        <icons.note className="h-4 w-4" />
      </span>
    );
  if (event.kind === 'status') {
    let to = 'new';
    try {
      to = (JSON.parse(event.body) as { to: string }).to;
    } catch {
      /* keep default */
    }
    return (
      <span className={cn(base, 'bg-[var(--bg-soft)]')}>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusTone(to).bar }} />
      </span>
    );
  }
  if (event.kind === 'starred' || event.kind === 'unstarred')
    return (
      <span className={cn(base, 'bg-[var(--bg-soft)] text-amber-400')}>
        <icons.star className={cn('h-4 w-4', event.kind === 'starred' && 'fill-current')} />
      </span>
    );
  return (
    <span className={cn(base, 'border-brand/40 bg-[var(--bg-soft)] text-brand-light')}>
      <icons.inbox className="h-4 w-4" />
    </span>
  );
}
