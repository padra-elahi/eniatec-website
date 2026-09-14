/** Joins class names, dropping falsy values. */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Converts ASCII digits in a string to Persian digits. */
export function toFa(input: string | number) {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}
