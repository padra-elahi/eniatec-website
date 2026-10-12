import Link from 'next/link';
import { notFound } from 'next/navigation';
import { icons } from '@/components/Icons';
import { Activity } from '@/components/admin/Activity';
import { CopyButton, DetailActions, MarkReadOnOpen } from '@/components/admin/DetailActions';
import { Avatar, Panel, StatusBadge } from '@/components/admin/ui';
import { admin, budgets, collabTypes, contactPrefs, interests, labelOf, referrals, timelines } from '@/data/collab';
import { getRequest, neighbours } from '@/lib/db';
import { formatDateTime, timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const t = admin.detail;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const found = getRequest(Number((await params).id));
  return { title: found ? found.row.full_name : 'یافت نشد' };
}

export default async function RequestPage({ params }: Props) {
  const id = Number((await params).id);
  const found = Number.isInteger(id) ? getRequest(id) : null;
  if (!found) notFound();
  const { row: r, events } = found;
  const nav = neighbours(id);
  const picked = JSON.parse(r.interests) as string[];
  const typeInfo = collabTypes.find((c) => c.value === r.type);
  const TypeIcon = icons[typeInfo?.icon ?? 'layers'];

  const facts = [
    { k: 'بودجه تقریبی', v: labelOf(budgets, r.budget) },
    { k: 'زمان شروع', v: labelOf(timelines, r.timeline) },
    { k: 'روش تماس ترجیحی', v: labelOf(contactPrefs, r.contact_pref) },
    { k: 'آشنایی از طریق', v: r.referral ? labelOf(referrals, r.referral) : '—' },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <MarkReadOnOpen id={r.id} unread={r.read_at === null} />

      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/requests/" className="focus-ring muted inline-flex items-center gap-1.5 rounded-lg text-sm hover:text-[var(--fg)]">
          <icons.arrow className="h-4 w-4 rotate-180" />
          {t.back}
        </Link>
        <div className="flex items-center gap-1.5">
          <NavArrow href={nav.newer ? `/admin/requests/${nav.newer}/` : null} label={t.prevItem} dir="prev" />
          <NavArrow href={nav.older ? `/admin/requests/${nav.older}/` : null} label={t.nextItem} dir="next" />
        </div>
      </div>

      <header className="card mt-5 !rounded-3xl !p-0">
        <div
          className="rounded-t-3xl px-5 pb-5 pt-6 sm:px-7"
          style={{ background: 'linear-gradient(160deg, rgba(37,99,235,0.14), rgba(34,211,238,0.04) 60%, transparent)' }}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <Avatar name={r.full_name} size={60} className="!rounded-2xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold sm:text-2xl">{r.full_name}</h1>
                <StatusBadge status={r.status} />
              </div>
              <p className="muted mt-1 text-sm">
                {[r.role, r.company].filter(Boolean).join(' · ') || 'بدون شرکت'}
              </p>
              <p className="muted mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <icons.clock className="h-3.5 w-3.5" />
                  {t.received} {timeAgo(r.created_at)} — {formatDateTime(r.created_at)}
                </span>
                <span dir="ltr" className="inline-flex items-center gap-1 rounded-md border px-1.5 py-px font-mono text-[11px]">
                  {r.code}
                  <CopyButton value={r.code} small />
                </span>
              </p>
            </div>
          </div>
        </div>
        <DetailActions
          id={r.id}
          status={r.status}
          starred={!!r.starred}
          email={r.email}
          phone={r.phone}
          subject={r.subject}
          code={r.code}
        />
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel title={t.request}>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand/30 bg-brand/10 text-brand-light">
                <TypeIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="muted text-[11px]">نوع همکاری</p>
                <p className="text-sm font-bold">{labelOf(collabTypes, r.type)}</p>
              </div>
            </div>
            <h2 className="mt-6 text-lg font-bold leading-8">{r.subject}</h2>
            <p className="mt-3 whitespace-pre-wrap break-words text-[14px] leading-8">{r.message}</p>

            {picked.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {picked.map((i) => (
                  <span key={i} className="chip !text-[12px]">
                    {labelOf(interests, i)}
                  </span>
                ))}
              </div>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border" style={{ background: 'var(--line)' }}>
              {facts.map((f) => (
                <div key={f.k} className="p-4" style={{ background: 'var(--bg-soft)' }}>
                  <dt className="muted text-[11px]">{f.k}</dt>
                  <dd className="mt-1 text-[13px] font-semibold">{f.v}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Activity id={r.id} events={events} />
        </div>

        <div className="space-y-6">
          <Panel title={t.contact} bodyClassName="!p-2">
            <ContactRow icon={icons.mail} label="ایمیل" value={r.email} href={`mailto:${r.email}`} ltr />
            <ContactRow icon={icons.phone} label="تلفن" value={r.phone} href={`tel:${r.phone.replace(/[^\d+]/g, '')}`} ltr />
            {r.website && <ContactRow icon={icons.globe} label="وب‌سایت" value={r.website.replace(/^https?:\/\//, '')} href={r.website} ltr external />}
            {r.company && <ContactRow icon={icons.building} label="شرکت" value={r.company} />}
            {r.role && <ContactRow icon={icons.user} label="سمت" value={r.role} />}
          </Panel>

          <Panel title={t.technical}>
            <dl className="space-y-3 text-[12px]">
              <div>
                <dt className="muted">{t.ip}</dt>
                <dd dir="ltr" className="mt-0.5 text-right font-mono">{r.ip || '—'}</dd>
              </div>
              <div>
                <dt className="muted">{t.agent}</dt>
                <dd dir="ltr" className="mt-0.5 break-all text-right font-mono text-[11px] leading-5 opacity-80">{r.user_agent || '—'}</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  ltr,
  external,
}: {
  icon: (p: { className?: string }) => React.ReactElement;
  label: string;
  value: string;
  href?: string;
  ltr?: boolean;
  external?: boolean;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-brand/5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-brand-light">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="muted text-[11px]">{label}</p>
        {href ? (
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            dir={ltr ? 'ltr' : undefined}
            className={cn('focus-ring block truncate rounded text-[13px] font-medium hover:text-brand-light', ltr && 'text-right')}
          >
            {value}
          </a>
        ) : (
          <p className="truncate text-[13px] font-medium">{value}</p>
        )}
      </div>
      <CopyButton value={value} />
    </div>
  );
}

function NavArrow({ href, label, dir }: { href: string | null; label: string; dir: 'prev' | 'next' }) {
  const cls = 'focus-ring grid h-9 w-9 place-items-center rounded-xl border transition-colors';
  const icon = <icons.chevron className={cn('h-4 w-4', dir === 'prev' && 'rotate-180')} />;
  return href ? (
    <Link href={href} aria-label={label} title={label} className={cn(cls, 'hover:border-brand/50 hover:bg-brand/10')}>
      {icon}
    </Link>
  ) : (
    <span aria-hidden className={cn(cls, 'opacity-35')}>
      {icon}
    </span>
  );
}
