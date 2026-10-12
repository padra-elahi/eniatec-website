'use server';

import { revalidatePath } from 'next/cache';
import { assertAdmin } from '@/lib/auth';
import * as db from '@/lib/db';

const ids = (v: number[]) => v.filter((n) => Number.isInteger(n) && n > 0).slice(0, 500);

function done() {
  revalidatePath('/admin', 'layout');
  return { ok: true as const };
}

export async function setStatusAction(requestIds: number[], status: string) {
  await assertAdmin();
  if (!db.isStatus(status)) throw new Error('bad status');
  db.setStatus(ids(requestIds), status);
  return done();
}

export async function markReadAction(requestIds: number[], read: boolean) {
  await assertAdmin();
  db.markRead(ids(requestIds), read);
  return done();
}

export async function setStarredAction(id: number, starred: boolean) {
  await assertAdmin();
  db.setStarred(id, starred);
  return done();
}

export async function addNoteAction(id: number, body: string) {
  await assertAdmin();
  if (typeof body !== 'string') throw new Error('bad note');
  db.addNote(id, body);
  return done();
}

export async function deleteNoteAction(id: number, eventId: number) {
  await assertAdmin();
  db.deleteNote(id, eventId);
  return done();
}

export async function deleteRequestsAction(requestIds: number[]) {
  await assertAdmin();
  db.deleteRequests(ids(requestIds));
  return done();
}
