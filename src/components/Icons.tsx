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
  star: (p) => (
    <svg {...base} {...p}>
      <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
    </svg>
  ),
  search: (p) => (
    <svg {...base} {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  ),
  inbox: (p) => (
    <svg {...base} {...p}>
      <path d="M3 13.5 5.4 5.6A2 2 0 0 1 7.3 4.2h9.4a2 2 0 0 1 1.9 1.4L21 13.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.5Z" />
      <path d="M3 13.5h5l1.5 2.5h5l1.5-2.5h5" />
    </svg>
  ),
  chart: (p) => (
    <svg {...base} {...p}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
  logout: (p) => (
    <svg {...base} {...p}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M9 16l-4-4 4-4M5 12h11" />
    </svg>
  ),
  trash: (p) => (
    <svg {...base} {...p}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </svg>
  ),
  download: (p) => (
    <svg {...base} {...p}>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  ),
  external: (p) => (
    <svg {...base} {...p}>
      <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </svg>
  ),
  copy: (p) => (
    <svg {...base} {...p}>
      <rect x="8" y="8" width="12" height="12" rx="2.5" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  ),
  phone: (p) => (
    <svg {...base} {...p}>
      <path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />
    </svg>
  ),
  user: (p) => (
    <svg {...base} {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20.5a8 8 0 0 1 16 0" />
    </svg>
  ),
  building: (p) => (
    <svg {...base} {...p}>
      <path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M15 9h3a2 2 0 0 1 2 2v10M2 21h20M8 7h3M8 11h3M8 15h3" />
    </svg>
  ),
  globe: (p) => (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
  note: (p) => (
    <svg {...base} {...p}>
      <path d="M5 4h14v11l-5 5H5V4Z" />
      <path d="M14 20v-5h5M9 9h6M9 13h3" />
    </svg>
  ),
  eye: (p) => (
    <svg {...base} {...p}>
      <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (p) => (
    <svg {...base} {...p}>
      <path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-2.9 3.8M6.6 6.6A17 17 0 0 0 2.5 12S6 19 12 19a9.6 9.6 0 0 0 4.4-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  ),
  chevron: (p) => (
    <svg {...base} {...p}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  ),
  lock: (p) => (
    <svg {...base} {...p}>
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  menu: (p) => (
    <svg {...base} {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  close: (p) => (
    <svg {...base} {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  clock: (p) => (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  send: (p) => (
    <svg {...base} {...p}>
      <path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" />
    </svg>
  ),
};
