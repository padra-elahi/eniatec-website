import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomInt } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { statuses, type StatusValue } from '@/data/collab';
import type { CollabInput } from '@/lib/validation';

/**
 * Storage for collaboration requests: one SQLite file under DATA_DIR
 * (default ./data), via Node's built-in `node:sqlite` — no native module, no
 * database server. In Docker, DATA_DIR is a volume so requests survive
 * container updates.
 */

export type RequestRow = {
  id: number;
  code: string;
  created_at: number;
  updated_at: number;
  status: StatusValue;
  starred: number;
  read_at: number | null;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  website: string;
  type: string;
  interests: string;
  budget: string;
  timeline: string;
  subject: string;
  message: string;
  referral: string;
  contact_pref: string;
  ip: string;
  user_agent: string;
};

export type EventRow = {
  id: number;
  request_id: number;
  created_at: number;
  kind: 'created' | 'status' | 'note' | 'starred' | 'unstarred';
  body: string;
};

const SCHEMA = `
CREATE TABLE IF NOT EXISTS requests (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  code         TEXT    NOT NULL UNIQUE,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  status       TEXT    NOT NULL DEFAULT 'new',
  starred      INTEGER NOT NULL DEFAULT 0,
  read_at      INTEGER,
  full_name    TEXT    NOT NULL,
  email        TEXT    NOT NULL,
  phone        TEXT    NOT NULL,
  company      TEXT    NOT NULL DEFAULT '',
  role         TEXT    NOT NULL DEFAULT '',
  website      TEXT    NOT NULL DEFAULT '',
  type         TEXT    NOT NULL,
  interests    TEXT    NOT NULL DEFAULT '[]',
  budget       TEXT    NOT NULL DEFAULT '',
  timeline     TEXT    NOT NULL DEFAULT '',
  subject      TEXT    NOT NULL,
  message      TEXT    NOT NULL,
  referral     TEXT    NOT NULL DEFAULT '',
  contact_pref TEXT    NOT NULL DEFAULT '',
  ip           TEXT    NOT NULL DEFAULT '',
  user_agent   TEXT    NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS requests_created ON requests (created_at DESC);
CREATE INDEX IF NOT EXISTS requests_status  ON requests (status);

CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL REFERENCES requests (id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  kind       TEXT    NOT NULL,
  body       TEXT    NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS events_request ON events (request_id, created_at);
`;

// node:sqlite returns null-prototype objects, which React will not pass to
// client components; spreading makes them plain.
const plain = <T,>(rows: unknown[]) => rows.map((r) => ({ ...(r as object) })) as T[];

const g = globalThis as unknown as { __eniatecDb?: DatabaseSync };

function db() {
  if (!g.__eniatecDb) {
    const dir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    mkdirSync(dir, { recursive: true });
    const conn = new DatabaseSync(path.join(dir, 'eniatec.db'));
    conn.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
    conn.exec(SCHEMA);
    g.__eniatecDb = conn;
  }
  return g.__eniatecDb;
}

// No 0/O/1/I, so a code read out over the phone is unambiguous.
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function newCode() {
  let s = '';
  for (let i = 0; i < 6; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `ENI-${s}`;
}

const STATUS_VALUES = statuses.map((s) => s.value) as string[];
export const isStatus = (v: unknown): v is StatusValue => typeof v === 'string' && STATUS_VALUES.includes(v);

export function createRequest(input: CollabInput, meta: { ip: string; userAgent: string }) {
  const conn = db();
  const now = Date.now();
  const website =
    input.website && !/^https?:\/\//i.test(input.website) ? `https://${input.website}` : input.website;

  for (let attempt = 0; ; attempt++) {
    const code = newCode();
    try {
      const res = conn
        .prepare(
          `INSERT INTO requests (code, created_at, updated_at, full_name, email, phone, company, role, website,
             type, interests, budget, timeline, subject, message, referral, contact_pref, ip, user_agent)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          code, now, now, input.fullName, input.email, input.phone, input.company, input.role, website,
          input.type, JSON.stringify(input.interests), input.budget, input.timeline, input.subject,
          input.message, input.referral, input.contactPref, meta.ip, meta.userAgent.slice(0, 300),
        );
      addEvent(Number(res.lastInsertRowid), 'created');
      return code;
    } catch (err) {
      // A code collision is astronomically rare; anything else is a real error.
      if (attempt < 3 && String(err).includes('UNIQUE')) continue;
      throw err;
    }
  }
}

function addEvent(requestId: number, kind: EventRow['kind'], body = '') {
  db()
    .prepare('INSERT INTO events (request_id, created_at, kind, body) VALUES (?, ?, ?, ?)')
    .run(requestId, Date.now(), kind, body);
}

export type ListQuery = {
  q?: string;
  status?: string;
  type?: string;
  view?: 'all' | 'starred' | 'unread';
  sort?: 'newest' | 'oldest' | 'updated';
  page?: number;
  perPage?: number;
};

function where(query: ListQuery) {
  const clauses: string[] = [];
  const params: Array<string | number> = [];
  if (query.status && isStatus(query.status)) {
    clauses.push('status = ?');
    params.push(query.status);
  } else if (!query.q) {
    // Archived requests stay out of the default views unless asked for.
    clauses.push("status != 'archived'");
  }
  if (query.type) {
    clauses.push('type = ?');
    params.push(query.type);
  }
  if (query.view === 'starred') clauses.push('starred = 1');
  if (query.view === 'unread') clauses.push('read_at IS NULL');
  if (query.q) {
    const like = `%${query.q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    const cols = ['full_name', 'email', 'company', 'code', 'subject', 'phone', 'message'];
    clauses.push(`(${cols.map((c) => `${c} LIKE ? ESCAPE '\\'`).join(' OR ')})`);
    params.push(...cols.map(() => like));
  }
  return { sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

const ORDER = {
  newest: 'created_at DESC, id DESC',
  oldest: 'created_at ASC, id ASC',
  updated: 'updated_at DESC, id DESC',
} as const;

export function listRequests(query: ListQuery) {
  const conn = db();
  const { sql, params } = where(query);
  const perPage = query.perPage ?? 20;
  const total = Number((conn.prepare(`SELECT COUNT(*) AS n FROM requests ${sql}`).get(...params) as { n: number }).n);
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, query.page ?? 1), pages);
  const rows = plain<RequestRow>(
    conn
      .prepare(`SELECT * FROM requests ${sql} ORDER BY ${ORDER[query.sort ?? 'newest']} LIMIT ? OFFSET ?`)
      .all(...params, perPage, (page - 1) * perPage),
  );
  return { rows, total, page, pages, perPage };
}

/** Every row matching the filters, for CSV export. */
export function allRequests(query: ListQuery) {
  const { sql, params } = where(query);
  return db()
    .prepare(`SELECT * FROM requests ${sql} ORDER BY ${ORDER[query.sort ?? 'newest']}`)
    .all(...params) as unknown as RequestRow[];
}

export function getRequest(id: number) {
  const conn = db();
  const found = conn.prepare('SELECT * FROM requests WHERE id = ?').get(id);
  if (!found) return null;
  const row = { ...found } as unknown as RequestRow;
  const events = plain<EventRow>(
    conn.prepare('SELECT * FROM events WHERE request_id = ? ORDER BY created_at ASC, id ASC').all(id),
  );
  return { row, events };
}

/** Neighbours in the default (newest-first) order, for prev/next navigation. */
export function neighbours(id: number) {
  const conn = db();
  const row = conn.prepare('SELECT created_at FROM requests WHERE id = ?').get(id) as { created_at: number } | undefined;
  if (!row) return { newer: null, older: null };
  const newer = conn
    .prepare(
      'SELECT id FROM requests WHERE (created_at > ?1 OR (created_at = ?1 AND id > ?2)) ORDER BY created_at ASC, id ASC LIMIT 1',
    )
    .get(row.created_at, id) as { id: number } | undefined;
  const older = conn
    .prepare(
      'SELECT id FROM requests WHERE (created_at < ?1 OR (created_at = ?1 AND id < ?2)) ORDER BY created_at DESC, id DESC LIMIT 1',
    )
    .get(row.created_at, id) as { id: number } | undefined;
  return { newer: newer?.id ?? null, older: older?.id ?? null };
}

export function markRead(ids: number[], read: boolean) {
  const stmt = read
    ? db().prepare('UPDATE requests SET read_at = COALESCE(read_at, ?) WHERE id = ?')
    : db().prepare('UPDATE requests SET read_at = NULL WHERE id = ?');
  const now = Date.now();
  for (const id of ids) {
    if (read) stmt.run(now, id);
    else stmt.run(id);
  }
}

export function setStatus(ids: number[], status: StatusValue) {
  const conn = db();
  const now = Date.now();
  const get = conn.prepare('SELECT status FROM requests WHERE id = ?');
  const upd = conn.prepare('UPDATE requests SET status = ?, updated_at = ?, read_at = COALESCE(read_at, ?) WHERE id = ?');
  for (const id of ids) {
    const cur = get.get(id) as { status: string } | undefined;
    if (!cur || cur.status === status) continue;
    upd.run(status, now, now, id);
    addEvent(id, 'status', JSON.stringify({ from: cur.status, to: status }));
  }
}

export function setStarred(id: number, starred: boolean) {
  const res = db()
    .prepare('UPDATE requests SET starred = ?, updated_at = ? WHERE id = ? AND starred != ?')
    .run(starred ? 1 : 0, Date.now(), id, starred ? 1 : 0);
  if (res.changes) addEvent(id, starred ? 'starred' : 'unstarred');
}

export function addNote(id: number, body: string) {
  const text = body.trim().slice(0, 4000);
  if (!text) return;
  db().prepare('UPDATE requests SET updated_at = ? WHERE id = ?').run(Date.now(), id);
  addEvent(id, 'note', text);
}

export function deleteNote(requestId: number, eventId: number) {
  db().prepare("DELETE FROM events WHERE id = ? AND request_id = ? AND kind = 'note'").run(eventId, requestId);
}

export function deleteRequests(ids: number[]) {
  const stmt = db().prepare('DELETE FROM requests WHERE id = ?');
  for (const id of ids) stmt.run(id);
}

export function unreadCount() {
  return Number(
    (db().prepare("SELECT COUNT(*) AS n FROM requests WHERE read_at IS NULL AND status != 'archived'").get() as { n: number }).n,
  );
}

const DAY = 86_400_000;

export function stats() {
  const conn = db();
  const count = (sql: string, ...p: number[]) => Number((conn.prepare(sql).get(...p) as { n: number }).n);
  const now = Date.now();

  const byStatus = Object.fromEntries(
    (conn.prepare('SELECT status, COUNT(*) AS n FROM requests GROUP BY status').all() as Array<{ status: string; n: number }>).map(
      (r) => [r.status, Number(r.n)],
    ),
  ) as Record<string, number>;
  const byType = (
    conn.prepare('SELECT type, COUNT(*) AS n FROM requests GROUP BY type ORDER BY n DESC').all() as Array<{ type: string; n: number }>
  ).map((r) => ({ type: r.type, n: Number(r.n) }));

  // Daily buckets for the last 30 days, oldest first. Buckets are UTC+3:30
  // days, so "today" matches the calendar day in Iran.
  const tz = 3.5 * 3_600_000;
  const today = Math.floor((now + tz) / DAY);
  const raw = conn
    .prepare('SELECT CAST((created_at + ?) / ? AS INTEGER) AS d, COUNT(*) AS n FROM requests WHERE created_at >= ? GROUP BY d')
    .all(tz, DAY, (today - 29) * DAY - tz) as Array<{ d: number; n: number }>;
  const map = new Map(raw.map((r) => [Number(r.d), Number(r.n)]));
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = today - 29 + i;
    return { day: d * DAY - tz, n: map.get(d) ?? 0 };
  });

  return {
    total: count('SELECT COUNT(*) AS n FROM requests'),
    unread: count("SELECT COUNT(*) AS n FROM requests WHERE read_at IS NULL AND status != 'archived'"),
    week: count('SELECT COUNT(*) AS n FROM requests WHERE created_at >= ?', now - 7 * DAY),
    prevWeek: count('SELECT COUNT(*) AS n FROM requests WHERE created_at >= ? AND created_at < ?', now - 14 * DAY, now - 7 * DAY),
    byStatus,
    byType,
    daily,
    recent: plain<RequestRow>(conn.prepare('SELECT * FROM requests ORDER BY created_at DESC, id DESC LIMIT 6').all()),
  };
}
