import { formFeedback } from "@/data";
import { validateContact, type ContactPayload } from "@/components/content/contact-schema";

// Simple in-memory rate limit per IP (per server instance). Good enough as a first line; put a real one in front for production.
const WINDOW_MS = 10 * 60_000;
const MAX_HITS = 8;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  return false;
}

const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const str = (v: unknown): string => (typeof v === "string" ? v : "");

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  if (limited(ip)) return json({ ok: false, error: "Too many requests. Please try again in a few minutes." }, 429);

  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return json({ ok: false, error: "Expected JSON." }, 415);
  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > 20_000) return json({ ok: false, error: "Payload too large." }, 413);
    raw = JSON.parse(text);
  } catch {
    return json({ ok: false, error: "Invalid JSON." }, 400);
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return json({ ok: false, error: "Invalid payload." }, 400);
  const o = raw as Record<string, unknown>;

  // Honeypot
  if (str(o.website).trim() !== "") return json({ ok: false, error: "Rejected." }, 400);

  const kind = o.kind === "partner" || o.kind === "question" ? o.kind : null;
  if (!kind) return json({ ok: false, error: "Unknown form." }, 400);
  for (const k of ["name", "phone", "email", "interest", "city", "message"]) {
    if (o[k] !== undefined && typeof o[k] !== "string") return json({ ok: false, error: `Invalid ${k}.` }, 400);
  }
  const payload: ContactPayload = {
    kind,
    name: str(o.name).trim(),
    phone: str(o.phone).trim(),
    email: str(o.email).trim(),
    interest: str(o.interest) || undefined,
    city: str(o.city).trim() || undefined,
    message: str(o.message).trim() || undefined,
  };
  const errors = validateContact(payload, formFeedback);
  if (Object.keys(errors).length) return json({ ok: false, error: "Please check the highlighted fields.", errors }, 400);

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, receivedAt: new Date().toISOString(), source: "yunchbite.com" }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return json({ ok: false, error: "Delivery failed." }, 502);
      return json({ ok: true, delivered: true });
    } catch {
      return json({ ok: false, error: "Delivery failed." }, 502);
    }
  }

  // No delivery configured: be honest about it.
  if (process.env.NODE_ENV !== "production") console.log("[contact] (not delivered, no CONTACT_WEBHOOK_URL)", payload);
  else console.warn("[contact] submission received but CONTACT_WEBHOOK_URL is not set; not delivered");
  return json({ ok: true, delivered: false });
}
