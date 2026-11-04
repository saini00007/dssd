// Shared (client + server) validation for the contact forms. Pure functions, no dependencies.
import { contactCopy } from "@/data";

export type ContactKind = "partner" | "question";

export interface ContactPayload {
  kind: ContactKind;
  name: string;
  phone: string;
  email: string;
  interest?: string;
  city?: string;
  message?: string;
  /** Honeypot: real people never fill it. */
  website?: string;
}

export type ContactErrors = Partial<Record<"name" | "phone" | "email" | "interest" | "city" | "message", string>>;

export const INTEREST_OPTIONS: readonly string[] = contactCopy.contact["CON-02"].interestOptions;
export const LIMITS = { name: 80, email: 120, city: 80, message: 2000 } as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS = /^\+?[0-9 ()\-.]+$/;

export function isValidPhone(v: string): boolean {
  const t = v.trim();
  if (!PHONE_CHARS.test(t)) return false;
  const digits = t.replace(/\D/g, "").length;
  return digits >= 10 && digits <= 15;
}

export function validateContact(p: ContactPayload, msg: { required: string; invalidEmail: string; invalidPhone: string }): ContactErrors {
  const e: ContactErrors = {};
  const name = (p.name ?? "").trim();
  if (!name) e.name = msg.required;
  else if (name.length > LIMITS.name) e.name = msg.required;
  if (!(p.phone ?? "").trim()) e.phone = msg.required;
  else if (!isValidPhone(p.phone)) e.phone = msg.invalidPhone;
  const email = (p.email ?? "").trim();
  if (!email) e.email = msg.required;
  else if (!EMAIL.test(email) || email.length > LIMITS.email) e.email = msg.invalidEmail;
  if (p.kind === "partner") {
    if (!p.interest || !INTEREST_OPTIONS.includes(p.interest)) e.interest = msg.required;
    const city = (p.city ?? "").trim();
    if (!city || city.length > LIMITS.city) e.city = msg.required;
  } else {
    const m = (p.message ?? "").trim();
    if (!m) e.message = msg.required;
  }
  if ((p.message ?? "").length > LIMITS.message) e.message = `Please keep it under ${LIMITS.message} characters.`;
  return e;
}
