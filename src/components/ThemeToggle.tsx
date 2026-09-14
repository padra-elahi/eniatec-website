'use client';

import { useEffect, useState } from 'react';

const KEY = 'eniatec-theme';

/** Switches between the default dark palette and the light one. */
export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains('light'));
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle('light', next);
    try {
      localStorage.setItem(KEY, next ? 'light' : 'dark');
    } catch {
      /* storage can be blocked; the toggle still works for this visit */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? 'حالت تیره' : 'حالت روشن'}
      title={light ? 'حالت تیره' : 'حالت روشن'}
      className="grid h-10 w-10 place-items-center rounded-xl border transition-colors hover:border-brand/60 hover:bg-brand/10"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        {light ? (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
