import { cn } from '@/lib/utils';

/**
 * The Eniatec wordmark: geometric lettering with the signature blue dot
 * replacing the tittle of the "i".
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex select-none items-baseline font-extrabold tracking-tight',
        className,
      )}
      aria-label="Eniatec"
      dir="ltr"
    >
      <span className="relative">
        <span>En</span>
        <span className="relative">
          <span className="opacity-0">i</span>
          <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
            <span
              className="mb-[0.16em] h-[0.2em] w-[0.2em] rounded-full bg-brand-glow"
              style={{ boxShadow: '0 0 12px 1px rgba(30,107,255,0.75)' }}
            />
            <span className="h-[0.62em] w-[0.14em] rounded-[1px] bg-current" />
          </span>
        </span>
        <span>atec</span>
      </span>
      {!compact && (
        <span className="ms-2 hidden text-[0.5em] font-medium tracking-normal opacity-55 sm:inline">
          .tech
        </span>
      )}
    </span>
  );
}

/** Square app-icon version of the mark, used in the footer and as a badge. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg font-black text-white',
        className,
      )}
      style={{ background: 'linear-gradient(135deg,#102546,#1d3d7f 35%,#2563eb 100%)' }}
      aria-hidden
    >
      E
      <span className="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-cyan-glow" />
    </span>
  );
}
