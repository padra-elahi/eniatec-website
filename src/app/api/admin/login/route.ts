import { NextResponse } from 'next/server';
import {
  adminConfigured,
  clearRateLimit,
  clientIp,
  createSessionToken,
  passwordMatches,
  rateLimit,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!adminConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const ip = await clientIp();
  const bucket = `login:${ip}`;
  // Per-IP, plus a global ceiling: X-Forwarded-For can be forged, so the
  // per-IP limit alone would not stop a guesser who rotates it.
  if (!rateLimit(bucket, 8, 15 * 60_000) || !rateLimit('login:*', 40, 15 * 60_000)) {
    return NextResponse.json({ error: 'locked' }, { status: 429 });
  }

  const { password } = (await req.json().catch(() => ({}))) as { password?: unknown };
  if (typeof password !== 'string' || !passwordMatches(password)) {
    // A short fixed delay makes guessing slower without hurting a real user.
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: 'wrong' }, { status: 401 });
  }

  clearRateLimit(bucket);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
  return res;
}
