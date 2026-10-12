import { budgets, collabTypes, contactPrefs, interests, labelOf, referrals, statuses, timelines } from '@/data/collab';
import { isAdmin } from '@/lib/auth';
import { allRequests } from '@/lib/db';
import { parseListQuery } from '@/lib/admin-query';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

const cell = (v: string | number) => {
  const s = String(v ?? '');
  // Neutralise spreadsheet formula injection, then quote.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

/** CSV of every request matching the list page's current filters. */
export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response('unauthorized', { status: 401 });

  const params = Object.fromEntries(new URL(req.url).searchParams);
  const rows = allRequests(parseListQuery(params));

  const header = [
    'کد پیگیری', 'تاریخ', 'وضعیت', 'نام', 'ایمیل', 'تلفن', 'شرکت', 'سمت', 'وب‌سایت', 'نوع همکاری',
    'حوزه‌ها', 'بودجه', 'زمان شروع', 'عنوان', 'شرح', 'آشنایی', 'روش تماس', 'ستاره‌دار',
  ];
  const lines = rows.map((r) =>
    [
      r.code,
      formatDate(r.created_at),
      labelOf(statuses, r.status),
      r.full_name,
      r.email,
      r.phone,
      r.company,
      r.role,
      r.website,
      labelOf(collabTypes, r.type),
      (JSON.parse(r.interests) as string[]).map((i) => labelOf(interests, i)).join('، '),
      labelOf(budgets, r.budget),
      labelOf(timelines, r.timeline),
      r.subject,
      r.message,
      r.referral ? labelOf(referrals, r.referral) : '',
      labelOf(contactPrefs, r.contact_pref),
      r.starred ? 'بله' : '',
    ]
      .map(cell)
      .join(','),
  );

  // The BOM makes Excel open the file as UTF-8, so Persian text is readable.
  const csv = '﻿' + [header.map(cell).join(','), ...lines].join('\r\n');
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="eniatec-requests-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
