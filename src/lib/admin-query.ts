import type { ListQuery } from '@/lib/db';

type Params = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

/** Reads the request list's filters from URL search params. */
export function parseListQuery(params: Params): ListQuery {
  const view = one(params.view);
  const sort = one(params.sort);
  return {
    q: one(params.q).trim().slice(0, 100) || undefined,
    status: one(params.status) || undefined,
    type: one(params.type) || undefined,
    view: view === 'starred' || view === 'unread' ? view : 'all',
    sort: sort === 'oldest' || sort === 'updated' ? sort : 'newest',
    page: Math.max(1, Number.parseInt(one(params.page), 10) || 1),
  };
}

/** Builds a list URL from the current filters plus overrides; empty values are dropped. */
export function listHref(base: ListQuery, patch: Partial<Record<keyof ListQuery, string | number | undefined>>) {
  const merged: Record<string, string | number | undefined> = { ...base, ...patch };
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v === undefined || v === '' ) continue;
    if (k === 'view' && v === 'all') continue;
    if (k === 'sort' && v === 'newest') continue;
    if (k === 'page' && Number(v) <= 1) continue;
    if (k === 'perPage') continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return `/admin/requests/${qs ? `?${qs}` : ''}`;
}
