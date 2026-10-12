'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { icons } from '@/components/Icons';
import { admin, collabTypes } from '@/data/collab';
import { listHref } from '@/lib/admin-query';
import type { ListQuery } from '@/lib/db';
import { cn } from '@/lib/utils';

const t = admin.list;

/** Search (debounced, URL-driven), type filter and sort for the request list. */
export function ListToolbar({ query }: { query: ListQuery }) {
  const router = useRouter();
  const [q, setQ] = useState(query.q ?? '');
  const [pending, start] = useTransition();
  const first = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = setTimeout(() => {
      start(() => router.replace(listHref(query, { q: q.trim() || undefined, page: undefined })));
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // "/" focuses search, like most inboxes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (patch: Parameters<typeof listHref>[1]) => start(() => router.push(listHref(query, { ...patch, page: undefined })));

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <icons.search
          className={cn('pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 opacity-60', pending && 'animate-pulse')}
        />
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.search}
          aria-label={t.search}
          className="field !py-2.5 !pr-11"
        />
        <kbd className="muted pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-md border px-1.5 text-[10px] sm:block">
          /
        </kbd>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:flex">
        <select
          value={query.type ?? ''}
          onChange={(e) => go({ type: e.target.value || undefined })}
          aria-label="نوع همکاری"
          className="field !py-2.5 sm:w-48"
        >
          <option value="">{t.anyType}</option>
          {collabTypes.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={query.sort}
          onChange={(e) => go({ sort: e.target.value })}
          aria-label="مرتب‌سازی"
          className="field !py-2.5 sm:w-40"
        >
          {Object.entries(t.sort).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
