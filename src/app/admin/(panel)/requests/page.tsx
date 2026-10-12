import Link from 'next/link';
import { icons } from '@/components/Icons';
import { ListToolbar } from '@/components/admin/ListToolbar';
import { RequestsTable } from '@/components/admin/RequestsTable';
import { admin, statuses } from '@/data/collab';
import { listHref, parseListQuery } from '@/lib/admin-query';
import { listRequests, stats } from '@/lib/db';
import { faNum } from '@/lib/format';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'درخواست‌ها' };

const t = admin.list;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function RequestsPage({ searchParams }: Props) {
  const query = parseListQuery(await searchParams);
  const { rows, total, page, pages, perPage } = listRequests(query);
  const { byStatus, unread } = stats();
  const all = Object.entries(byStatus).reduce((a, [k, n]) => (k === 'archived' ? a : a + n), 0);

  const exportQs = listHref(query, { page: undefined }).split('?')[1];
  const filtered = !!(query.q || query.status || query.type || query.view !== 'all');

  const views = [
    { key: 'all', label: t.all, n: all },
    { key: 'unread', label: t.unread, n: unread },
    { key: 'starred', label: t.starred },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{t.title}</h1>
          <p className="muted mt-1 text-sm">{faNum(total)} درخواست {filtered && 'با فیلترهای فعلی'}</p>
        </div>
        <a
          href={`/api/admin/export/${exportQs ? `?${exportQs}` : ''}`}
          className="btn-ghost focus-ring !px-4 !py-2.5"
          download
        >
          <icons.download className="h-4 w-4" />
          {t.export}
        </a>
      </div>

      <div className="mt-6 flex items-center gap-1 overflow-x-auto border-b scrollbar-thin">
        {views.map((v) => {
          const on = query.view === v.key && !query.status;
          return (
            <Link
              key={v.key}
              href={listHref({ ...query, status: undefined }, { view: v.key, page: undefined })}
              className={cn(
                'focus-ring relative -mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm transition-colors',
                on ? 'border-brand font-semibold text-[var(--fg)]' : 'muted border-transparent hover:text-[var(--fg)]',
              )}
            >
              {v.label}
              {'n' in v && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-px text-[10.5px] tabular-nums',
                    on ? 'bg-brand text-white' : 'border',
                  )}
                >
                  {faNum(v.n)}
                </span>
              )}
            </Link>
          );
        })}
        <span className="mx-2 h-5 w-px shrink-0" style={{ background: 'var(--line)' }} />
        {statuses.map((st) => {
          const on = query.status === st.value;
          return (
            <Link
              key={st.value}
              href={listHref(query, { status: on ? undefined : st.value, view: 'all', page: undefined })}
              className={cn(
                'focus-ring relative -mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-[13px] transition-colors',
                on ? 'border-brand font-semibold text-[var(--fg)]' : 'muted border-transparent hover:text-[var(--fg)]',
              )}
            >
              {st.label}
              <span className="muted text-[11px] tabular-nums">{faNum(byStatus[st.value] ?? 0)}</span>
            </Link>
          );
        })}
      </div>

      <ListToolbar query={query} />

      {rows.length === 0 ? (
        <div className="card mt-4 flex flex-col items-center !py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl border text-brand-light">
            <icons.search className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold">{t.empty}</p>
          {filtered && (
            <Link href="/admin/requests/" className="btn-ghost focus-ring mt-5 !py-2 text-xs">
              {t.clear}
            </Link>
          )}
        </div>
      ) : (
        <RequestsTable rows={rows} />
      )}

      {pages > 1 && (
        <nav className="mt-5 flex items-center justify-between gap-3 text-[13px]" aria-label="صفحه‌بندی">
          <span className="muted">
            {t.page(faNum((page - 1) * perPage + 1), faNum(Math.min(page * perPage, total)), faNum(total))}
          </span>
          <div className="flex gap-2">
            <PageLink href={page > 1 ? listHref(query, { page: page - 1 }) : null} label={t.prev} prev />
            <PageLink href={page < pages ? listHref(query, { page: page + 1 }) : null} label={t.next} />
          </div>
        </nav>
      )}
    </div>
  );
}

function PageLink({ href, label, prev }: { href: string | null; label: string; prev?: boolean }) {
  const cls = 'btn-ghost focus-ring !px-3.5 !py-2 text-xs';
  const content = (
    <>
      {prev && <icons.chevron className="h-4 w-4 rotate-180" />}
      {label}
      {!prev && <icons.chevron className="h-4 w-4" />}
    </>
  );
  return href ? (
    <Link href={href} className={cls}>
      {content}
    </Link>
  ) : (
    <span className={cn(cls, 'pointer-events-none opacity-40')}>{content}</span>
  );
}
