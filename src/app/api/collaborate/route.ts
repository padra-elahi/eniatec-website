import { NextResponse } from 'next/server';
import { createRequest } from '@/lib/db';
import { clientIp, rateLimit } from '@/lib/auth';
import { normalize, validate } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/** Public endpoint behind the collaboration form. */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  // Bots fill the hidden field, or submit faster than a person can type.
  const elapsed = Date.now() - Number(body.startedAt);
  if (body.hp || !Number.isFinite(elapsed) || elapsed < 3000) {
    return NextResponse.json({ ok: true, code: 'ENI-000000' });
  }

  const ip = await clientIp();
  if (!rateLimit(`collab:${ip}`, 5, 3_600_000)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const input = normalize(body);
  const errors = validate(input);
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: 'invalid', fields: errors }, { status: 422 });
  }

  const code = createRequest(input, { ip, userAgent: req.headers.get('user-agent') ?? '' });
  return NextResponse.json({ ok: true, code }, { status: 201 });
}
