import Link from 'next/link';
import { icons } from '@/components/Icons';
import { Avatar, Panel, StatusBadge, statusTone } from '@/components/admin/ui';
import { admin, collabTypes, labelOf, statuses } from '@/data/collab';
import { stats } from '@/lib/db';
import { faNum, formatDate, formatShort, timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'داشبورد' };

const t = admin.dashboard;

export default function Dashboard() {
  const s = stats();
  const open = (s.byStatus.new ?? 0) + (s.byStatus.reviewing ?? 0) + (s.byStatus.contacted ?? 0);
  const delta = s.week - s.prevWeek;

  const kpis = [
    { label: t.total, value: s.total, icon: icons.inbox, hint: t.week(faNum(s.week)), href: '/admin/requests/' },
    { label: t.unread, value: s.unread, icon: icons.mail, hint: 'منتظر نگاه شما', href: '/admin/requests/?view=unread', accent: s.unread > 0 },
    { label: t.open, value: open, icon: icons.clock, hint: 'جدید، در بررسی یا در تماس', href: '/admin/requests/' },
    { label: t.accepted, value: s.byStatus.accepted ?? 0, icon: icons.check, hint: 'همکاری‌های تاییدشده', href: '/admin/requests/?status=accepted' },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="muted text-xs">{formatDate(Date.now())}</p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{t.title}</h1>
          <p className="muted mt-1 text-sm">{t.subtitle}</p>
        </div>
        <Link href="/admin/requests/" className="btn-primary focus-ring !px-5 !py-2.5">
          <icons.inbox className="h-4 w-4" />
          {admin.nav.requests}
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="card focus-ring group !p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40"
          >
            <div className="flex items-start justify-between">
              <span className="muted text-xs sm:text-[13px]">{k.label}</span>
              <span
                className={cn(
                  'grid h-9 w-9 place-items-center rounded-xl border transition-colors group-hover:border-brand/40',
                  k.accent ? 'border-transparent bg-brand text-white' : 'text-brand-light',
                )}
              >
                <k.icon className="h-[18px] w-[18px]" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-black tracking-tight sm:text-[2.1rem]">{faNum(k.value)}</p>
            <p className="muted mt-1 truncate text-[11.5px]">{k.hint}</p>
          </Link>
        ))}
      </div>

      {s.total === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Panel
              title={t.chart}
              action={
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
                    delta > 0 && 'border-emerald-400/30 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300',
                    delta < 0 && 'border-rose-400/30 bg-rose-400/10 text-rose-600 dark:text-rose-300',
                    delta === 0 && 'muted',
                  )}
                >
                  {delta > 0 ? '▲' : delta < 0 ? '▼' : '•'} {faNum(Math.abs(delta))} نسبت به هفتهٔ قبل
                </span>
              }
            >
              <DailyChart daily={s.daily} />
            </Panel>

            <Panel title={t.byStatus}>
              <StatusBreakdown byStatus={s.byStatus} total={s.total} />
            </Panel>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Panel
              title={t.recent}
              bodyClassName="!p-2"
              action={
                <Link href="/admin/requests/" className="focus-ring rounded-md text-xs text-brand-light hover:underline">
                  {t.viewAll}
                </Link>
              }
            >
              <ul>
                {s.recent.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/admin/requests/${r.id}/`}
                      className="focus-ring flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-brand/5"
                    >
                      <span className="relative">
                        <Avatar name={r.full_name} size={38} />
                        {r.read_at === null && (
                          <span className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-light ring-2 ring-[var(--bg-soft)]" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block truncate text-sm', r.read_at === null ? 'font-bold' : 'font-medium')}>
                          {r.full_name}
                          {r.company && <span className="muted font-normal"> · {r.company}</span>}
                        </span>
                        <span className="muted block truncate text-xs">{r.subject}</span>
                      </span>
                      <span className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                        <StatusBadge status={r.status} />
                        <span className="muted text-[11px]">{timeAgo(r.created_at)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title={t.byType}>
              <TypeBreakdown byType={s.byType} total={s.total} />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function DailyChart({ daily }: { daily: Array<{ day: number; n: number }> }) {
  const max = Math.max(1, ...daily.map((d) => d.n));
  // A round ceiling for the gridline labels.
  const top = max <= 4 ? max : Math.ceil(max / 2) * 2;
  return (
    <div>
      <div className="relative h-48" dir="ltr">
        {[1, 0.5, 0].map((f) => (
          <div key={f} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${f * 100}%` }}>
            <span className="muted w-6 -translate-y-1/2 text-left text-[10px] tabular-nums">{faNum(Math.round(top * f))}</span>
            <span className="h-px flex-1 -translate-y-1/2" style={{ background: 'var(--line)' }} />
          </div>
        ))}
        <div className="absolute inset-y-0 left-8 right-0 flex items-end gap-[3px]">
          {daily.map((d, i) => (
            <div key={d.day} className="group relative flex h-full flex-1 items-end">
              <div
                className={cn(
                  'w-full rounded-t-[4px] transition-all duration-300 group-hover:brightness-125',
                  d.n === 0 && 'opacity-40',
                )}
                style={{
                  height: d.n ? `${(d.n / top) * 100}%` : '2px',
                  background: i === daily.length - 1 ? 'linear-gradient(180deg,#22d3ee,#2563eb)' : 'linear-gradient(180deg,#3b82f6,#1d4ed8)',
                }}
              />
              <div className="surface pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-center text-[11px] opacity-0 shadow-xl transition-opacity group-hover:opacity-100" dir="rtl">
                <span className="block font-bold">{faNum(d.n)} درخواست</span>
                <span className="muted">{formatShort(d.day)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="muted mt-3 flex justify-between ps-0 pe-8 text-[10.5px]">
        <span>امروز</span>
        <span>{formatShort(daily[15].day)}</span>
        <span>{formatShort(daily[0].day)}</span>
      </div>
    </div>
  );
}

function StatusBreakdown({ byStatus, total }: { byStatus: Record<string, number>; total: number }) {
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full" style={{ background: 'var(--line)' }}>
        {statuses.map((st) => {
          const n = byStatus[st.value] ?? 0;
          if (!n) return null;
          return (
            <div
              key={st.value}
              title={`${st.label}: ${faNum(n)}`}
              style={{ width: `${(n / total) * 100}%`, background: statusTone(st.value).bar }}
              className="h-full border-s-2 border-[var(--bg-soft)] first:border-s-0"
            />
          );
        })}
      </div>
      <ul className="mt-5 space-y-1">
        {statuses.map((st) => {
          const n = byStatus[st.value] ?? 0;
          return (
            <li key={st.value}>
              <Link
                href={`/admin/requests/?status=${st.value}`}
                className="focus-ring flex items-center gap-3 rounded-lg px-2 py-2 text-[13px] transition-colors hover:bg-brand/5"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusTone(st.value).bar }} />
                <span className="flex-1">{st.label}</span>
                <span className="muted tabular-nums text-xs">{total ? faNum(Math.round((n / total) * 100)) : '۰'}٪</span>
                <span className="w-8 text-left font-bold tabular-nums">{faNum(n)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TypeBreakdown({ byType, total }: { byType: Array<{ type: string; n: number }>; total: number }) {
  const max = Math.max(1, ...byType.map((x) => x.n));
  return (
    <ul className="space-y-4">
      {collabTypes
        .map((ct) => ({ ...ct, n: byType.find((x) => x.type === ct.value)?.n ?? 0 }))
        .sort((a, b) => b.n - a.n)
        .map((ct) => {
          const Icon = icons[ct.icon];
          return (
            <li key={ct.value}>
              <Link href={`/admin/requests/?type=${ct.value}`} className="focus-ring group block rounded-lg">
                <div className="flex items-center gap-2.5 text-[13px]">
                  <Icon className="h-4 w-4 text-brand-light" />
                  <span className="flex-1 truncate group-hover:text-brand-light">{labelOf(collabTypes, ct.value)}</span>
                  <span className="font-bold tabular-nums">{faNum(ct.n)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--line)' }}>
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-brand to-cyan-glow"
                    style={{ width: `${(ct.n / max) * 100}%`, opacity: total ? 1 : 0 }}
                  />
                </div>
              </Link>
            </li>
          );
        })}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="card mt-6 flex flex-col items-center !rounded-3xl !py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl border border-brand/30 bg-brand/10 text-brand-light">
        <icons.inbox className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-lg font-bold">{t.empty}</h2>
      <p className="muted mt-2 max-w-sm text-sm">{t.emptyHint}</p>
      <a href="/collaborate/" target="_blank" className="btn-ghost focus-ring mt-6">
        <icons.external className="h-4 w-4" />
        {t.openForm}
      </a>
    </div>
  );
}
