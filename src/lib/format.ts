import { toFa } from '@/lib/utils';

const TZ = 'Asia/Tehran';

const dateFmt = new Intl.DateTimeFormat('fa-IR', { timeZone: TZ, year: 'numeric', month: 'long', day: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('fa-IR', {
  timeZone: TZ,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const shortFmt = new Intl.DateTimeFormat('fa-IR', { timeZone: TZ, month: 'short', day: 'numeric' });
const rel = new Intl.RelativeTimeFormat('fa', { numeric: 'auto' });

/** Jalali date, e.g. «۲۰ مهر ۱۴۰۵». */
export const formatDate = (ms: number) => dateFmt.format(ms);

/** Jalali date and time. */
export const formatDateTime = (ms: number) => dateTimeFmt.format(ms);

/** Day and month only, for chart labels. */
export const formatShort = (ms: number) => shortFmt.format(ms);

/** «۳ ساعت پیش»; falls back to the date after a week. */
export function timeAgo(ms: number, now = Date.now()) {
  const s = Math.round((ms - now) / 1000);
  const abs = Math.abs(s);
  if (abs < 60) return 'همین الان';
  if (abs < 3600) return rel.format(Math.round(s / 60), 'minute');
  if (abs < 86400) return rel.format(Math.round(s / 3600), 'hour');
  if (abs < 7 * 86400) return rel.format(Math.round(s / 86400), 'day');
  return formatDate(ms);
}

export const faNum = (n: number) => toFa(n.toLocaleString('en-US').replace(/,/g, '٬'));
