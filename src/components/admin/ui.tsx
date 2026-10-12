import { statuses } from '@/data/collab';
import { cn } from '@/lib/utils';

const TONES: Record<string, { badge: string; dot: string; bar: string }> = {
  brand: { badge: 'border-brand/30 bg-brand/10 text-blue-700 dark:text-blue-300', dot: 'bg-brand-light', bar: '#3b82f6' },
  amber: { badge: 'border-amber-400/30 bg-amber-400/10 text-amber-700 dark:text-amber-300', dot: 'bg-amber-400', bar: '#f59e0b' },
  cyan: { badge: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-400', bar: '#22d3ee' },
  emerald: { badge: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-400', bar: '#10b981' },
  rose: { badge: 'border-rose-400/30 bg-rose-400/10 text-rose-700 dark:text-rose-300', dot: 'bg-rose-400', bar: '#f43f5e' },
  slate: { badge: 'border-slate-400/30 bg-slate-400/10 text-slate-600 dark:text-slate-300', dot: 'bg-slate-400', bar: '#94a3b8' },
};

export function statusTone(status: string) {
  const tone = statuses.find((s) => s.value === status)?.tone ?? 'slate';
  return TONES[tone];
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = statuses.find((x) => x.value === status);
  const tone = statusTone(status);
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium',
        tone.badge,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', tone.dot)} />
      {s?.label ?? status}
    </span>
  );
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#2563eb,#22d3ee)',
  'linear-gradient(135deg,#7c3aed,#3b82f6)',
  'linear-gradient(135deg,#0891b2,#10b981)',
  'linear-gradient(135deg,#db2777,#f59e0b)',
  'linear-gradient(135deg,#1d3d7f,#2563eb)',
  'linear-gradient(135deg,#059669,#22d3ee)',
];

/** Initials on a gradient picked deterministically from the name. */
export function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = (parts.length > 1 ? parts[0][0] + '‌' + parts[parts.length - 1][0] : (parts[0] ?? '?').slice(0, 2)) || '?';
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span
      aria-hidden
      className={cn('grid shrink-0 place-items-center rounded-xl font-bold text-white', className)}
      style={{ width: size, height: size, fontSize: size * 0.36, background: AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length] }}
    >
      {initials}
    </span>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn('card !p-0', className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <h2 className="text-sm font-bold">{title}</h2>
          {action}
        </header>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  );
}
