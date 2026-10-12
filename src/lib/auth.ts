import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Single-administrator auth. The password comes from ADMIN_PASSWORD; a
 * successful login sets an httpOnly cookie holding an expiry signed with
 * HMAC-SHA256. The signing key is SESSION_SECRET, or — when that is unset —
 * derived from the password, so changing the password signs everyone out.
 */

export const SESSION_COOKIE = 'eniatec_admin';
const SESSION_TTL = 7 * 24 * 3600 * 1000;

export const adminConfigured = () => !!process.env.ADMIN_PASSWORD;

function key() {
  const secret = process.env.SESSION_SECRET || `pw:${process.env.ADMIN_PASSWORD ?? ''}`;
  return createHash('sha256').update(secret).digest();
}

const sign = (payload: string) => createHmac('sha256', key()).update(payload).digest('base64url');

const sha = (s: string) => createHash('sha256').update(s).digest();

export function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Hashing both sides first gives equal-length buffers for timingSafeEqual.
  return timingSafeEqual(sha(input), sha(expected));
}

export function createSessionToken() {
  const payload = String(Date.now() + SESSION_TTL);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const good = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (good.length !== given.length || !timingSafeEqual(good, given)) return false;
  return Number(payload) > Date.now();
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false',
  path: '/',
  maxAge: SESSION_TTL / 1000,
};

export async function isAdmin() {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** For admin pages: bounces to the login screen when not signed in. */
export async function requireAdminPage() {
  if (!(await isAdmin())) redirect('/admin/login/');
}

/** For admin server actions and route handlers. */
export async function assertAdmin() {
  if (!(await isAdmin())) throw new Error('unauthorized');
}

/** The client IP as seen through the reverse proxy (Caddy sets X-Forwarded-For). */
export async function clientIp() {
  const h = await headers();
  return (h.get('x-forwarded-for')?.split(',')[0] || h.get('x-real-ip') || '').trim().slice(0, 64);
}

/**
 * In-memory fixed-window rate limiter. Fine for a single container; it resets
 * on restart, which only ever errs on the side of letting someone retry.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  b.count++;
  return b.count <= limit;
}

export function clearRateLimit(key: string) {
  buckets.delete(key);
}
