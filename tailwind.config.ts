import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['selector', 'html:not(.light)'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-vazir)', 'Vazirmatn', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        navy: {
          50: '#eef3fb',
          100: '#d6e2f4',
          200: '#adc4e8',
          300: '#7b9ed6',
          400: '#4c74bd',
          500: '#2c53a0',
          600: '#1d3d7f',
          700: '#16305f',
          800: '#102546',
          900: '#0b1a33',
          950: '#060f1f',
        },
        brand: {
          DEFAULT: '#2563eb',
          light: '#3b82f6',
          glow: '#1e6bff',
        },
        cyan: {
          glow: '#22d3ee',
        },
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(50%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(-200%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        marquee: 'marquee 40s linear infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.24,0,0.38,1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
      backgroundImage: {
        'grid-dark':
          'linear-gradient(to right, rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.07) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};

export default config;
