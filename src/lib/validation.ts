import { budgets, collab, collabTypes, contactPrefs, interests, referrals, timelines } from '@/data/collab';

/**
 * Validation for the collaboration form, shared by the browser (instant
 * feedback per step) and the API route (the authority). Pure functions, no
 * dependencies.
 */

export type CollabInput = {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  website: string;
  type: string;
  interests: string[];
  budget: string;
  timeline: string;
  subject: string;
  message: string;
  referral: string;
  contactPref: string;
  consent: boolean;
};

export type FieldErrors = Partial<Record<keyof CollabInput, string>>;

export const LIMITS = {
  fullName: 80,
  email: 120,
  phone: 20,
  company: 120,
  role: 80,
  website: 200,
  subject: 140,
  message: 4000,
  messageMin: 20,
} as const;

export const STEP_FIELDS: Array<Array<keyof CollabInput>> = [
  ['fullName', 'email', 'phone', 'company', 'role', 'website'],
  ['type', 'interests', 'budget', 'timeline'],
  ['subject', 'message', 'referral', 'contactPref', 'consent'],
];

export const emptyInput: CollabInput = {
  fullName: '',
  email: '',
  phone: '',
  company: '',
  role: '',
  website: '',
  type: '',
  interests: [],
  budget: 'unknown',
  timeline: 'flexible',
  subject: '',
  message: '',
  referral: '',
  contactPref: 'any',
  consent: false,
};

const FA = '۰۱۲۳۴۵۶۷۸۹';
const AR = '٠١٢٣٤٥٦٧٨٩';

/** Turns Persian and Arabic-Indic digits into ASCII ones. */
export function toEnDigits(s: string) {
  return s.replace(/[۰-۹٠-٩]/g, (d) => String(FA.indexOf(d) >= 0 ? FA.indexOf(d) : AR.indexOf(d)));
}

const isOneOf = (list: ReadonlyArray<{ value: string }>, v: string) => list.some((o) => o.value === v);

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max * 2) : '');

/** Coerces untrusted JSON into a CollabInput; anything unexpected becomes empty. */
export function normalize(raw: unknown): CollabInput {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const list = Array.isArray(r.interests) ? r.interests : [];
  return {
    fullName: str(r.fullName, LIMITS.fullName).replace(/\s+/g, ' '),
    email: toEnDigits(str(r.email, LIMITS.email)).toLowerCase(),
    phone: toEnDigits(str(r.phone, LIMITS.phone)),
    company: str(r.company, LIMITS.company),
    role: str(r.role, LIMITS.role),
    website: str(r.website, LIMITS.website),
    type: str(r.type, 20),
    interests: [...new Set(list.filter((x): x is string => typeof x === 'string' && isOneOf(interests, x)))],
    budget: str(r.budget, 20),
    timeline: str(r.timeline, 20),
    subject: str(r.subject, LIMITS.subject).replace(/\s+/g, ' '),
    message: str(r.message, LIMITS.message),
    referral: str(r.referral, 20),
    contactPref: str(r.contactPref, 20),
    consent: r.consent === true,
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validates the given fields (all of them by default). */
export function validate(input: CollabInput, fields?: Array<keyof CollabInput>): FieldErrors {
  const e = collab.errors;
  const errors: FieldErrors = {};
  const want = (f: keyof CollabInput) => !fields || fields.includes(f);
  const tooLong = (f: keyof typeof LIMITS, v: string) => v.length > LIMITS[f];

  if (want('fullName')) {
    if (input.fullName.length < 2) errors.fullName = e.required;
    else if (tooLong('fullName', input.fullName)) errors.fullName = e.tooLong;
  }
  if (want('email')) {
    if (!input.email) errors.email = e.required;
    else if (!EMAIL_RE.test(toEnDigits(input.email)) || tooLong('email', input.email)) errors.email = e.email;
  }
  if (want('phone')) {
    const digits = toEnDigits(input.phone).replace(/[\s\-()]/g, '');
    if (!digits) errors.phone = e.required;
    else if (!/^\+?\d{8,15}$/.test(digits)) errors.phone = e.phone;
  }
  if (want('company') && tooLong('company', input.company)) errors.company = e.tooLong;
  if (want('role') && tooLong('role', input.role)) errors.role = e.tooLong;
  if (want('website') && input.website) {
    let ok = !tooLong('website', input.website);
    try {
      const u = new URL(/^https?:\/\//i.test(input.website) ? input.website : `https://${input.website}`);
      ok = ok && u.hostname.includes('.');
    } catch {
      ok = false;
    }
    if (!ok) errors.website = e.url;
  }
  if (want('type') && !isOneOf(collabTypes, input.type)) errors.type = e.type;
  if (want('budget') && !isOneOf(budgets, input.budget)) errors.budget = e.required;
  if (want('timeline') && !isOneOf(timelines, input.timeline)) errors.timeline = e.required;
  if (want('subject')) {
    if (input.subject.length < 3) errors.subject = e.required;
    else if (tooLong('subject', input.subject)) errors.subject = e.tooLong;
  }
  if (want('message')) {
    if (!input.message) errors.message = e.required;
    else if (input.message.length < LIMITS.messageMin) errors.message = e.messageShort;
    else if (tooLong('message', input.message)) errors.message = e.tooLong;
  }
  if (want('referral') && input.referral && !isOneOf(referrals, input.referral)) errors.referral = e.required;
  if (want('contactPref') && !isOneOf(contactPrefs, input.contactPref)) errors.contactPref = e.required;
  if (want('consent') && !input.consent) errors.consent = e.consent;

  return errors;
}
