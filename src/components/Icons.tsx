import type { ReactElement } from 'react';

type IconProps = { className?: string };

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** The line-icon set used by the services grid, keyed by `services[].icon`. */
export const icons: Record<string, (p: IconProps) => ReactElement> = {
  layers: (p) => (
    <svg {...base} {...p}>
      <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
      <path d="m3 12.5 9 4.5 9-4.5M3 17l9 4.5 9-4.5" />
    </svg>
  ),
  flow: (p) => (
    <svg {...base} {...p}>
      <rect x="3" y="3" width="6" height="5" rx="1.5" />
      <rect x="15" y="16" width="6" height="5" rx="1.5" />
      <rect x="15" y="3" width="6" height="5" rx="1.5" />
      <path d="M9 5.5h3.5a2 2 0 0 1 2 2v0M12 18.5H8a2 2 0 0 1-2-2V8" />
    </svg>
  ),
  type: (p) => (
    <svg {...base} {...p}>
      <path d="M4 6V4h16v2M12 4v16M9 20h6" />
    </svg>
  ),
  plug: (p) => (
    <svg {...base} {...p}>
      <path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-6 6v4" />
    </svg>
  ),
  server: (p) => (
    <svg {...base} {...p}>
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
      <path d="M7 7h.01M7 17h.01" />
    </svg>
  ),
  compass: (p) => (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </svg>
  ),
  check: (p) => (
    <svg {...base} {...p}>
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  ),
  arrow: (p) => (
    <svg {...base} {...p}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  ),
  github: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86l-.01 2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  ),
  mail: (p) => (
    <svg {...base} {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  ),
};
