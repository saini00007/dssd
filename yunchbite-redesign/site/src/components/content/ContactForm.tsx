"use client";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/ButtonLink";
import { Icon } from "@/components/ui/Icon";
import { RingBurst, type RingBurstHandle } from "@/components/motion/RingBurst";
import { popElement } from "@/components/motion/pop";
import { buddyImage } from "@/lib/media";
import { cn } from "@/lib/cn";
import { formFeedback } from "@/data";
import { INTEREST_OPTIONS, LIMITS, validateContact, type ContactErrors, type ContactKind, type ContactPayload } from "./contact-schema";

type Status = "idle" | "sending" | "success" | "error";

export interface ContactFormProps {
  kind: ContactKind;
  lead: string;
  fields: Record<string, string>;
  submit: string;
  interestPlaceholder?: string;
  headingId: string;
}

const inputCls =
  "block w-full rounded-small border-2 bg-cream px-4 text-base text-ink transition-[border-color,box-shadow] duration-[var(--dur-quick)] placeholder:text-ink/45 hover:border-ink/60 focus:border-red focus:shadow-[0_0_0_4px_rgb(214_22_16/0.18)] focus:outline-none aria-[invalid=true]:border-red aria-[invalid=true]:bg-red/5";

function Field({ id, label, required, error, children }: { id: string; label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold">
        {label.replace(/\s*\(optional\)\s*$/i, "")}
        {required ? (
          <span className="ml-1 text-red" aria-hidden="true">*</span>
        ) : (
          <span className="ml-2 font-medium text-ink/65">(optional)</span>
        )}
      </label>
      {children}
      {/* Reserved slot: error text appearing or clearing never shifts the layout (a shift between mousedown and mouseup would swallow the submit click). */}
      <div className="mt-1.5 min-h-[1.5rem]">
        {error && (
          <p id={`${id}-err`} className="flex items-center gap-2 text-sm font-semibold text-red-deep">
            <Icon name="close" className="size-4 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/** CON-02 / CON-03. Labelled fields, required markers, inline validation (copy from formFeedback), aria-live status. */
export function ContactForm({ kind, lead, fields, submit, interestPlaceholder, headingId }: ContactFormProps) {
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  const form = useRef<HTMLFormElement>(null);
  const ring = useRef<RingBurstHandle>(null);
  const done = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [serverMsg, setServerMsg] = useState("");
  const partner = kind === "partner";
  const thumbs = buddyImage("thumbs");

  useEffect(() => {
    if (status === "success") {
      popElement(done.current?.querySelector("[data-buddy]"), { from: 0.5, y: 24 });
      ring.current?.burst();
      done.current?.focus();
    }
  }, [status]);

  const read = (): ContactPayload => {
    const fd = new FormData(form.current!);
    const g = (k: string) => String(fd.get(k) ?? "");
    return { kind, name: g("name"), phone: g("phone"), email: g("email"), interest: g("interest"), city: g("city"), message: g("message"), website: g("website") };
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const payload = read();
    const errs = validateContact(payload, formFeedback);
    setErrors(errs);
    const firstBad = (["name", "phone", "email", "interest", "city", "message"] as const).find((k) => errs[k]);
    if (firstBad) {
      setStatus("idle");
      setServerMsg("");
      form.current?.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }
    setStatus("sending");
    setServerMsg("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: ContactErrors; error?: string };
      if (res.ok && data.ok) {
        setStatus("success");
        return;
      }
      if (data.errors) setErrors(data.errors);
      setServerMsg(res.status === 429 && data.error ? data.error : formFeedback.error);
      setStatus("error");
    } catch {
      setServerMsg(formFeedback.error);
      setStatus("error");
    }
  };

  const blur = (name: keyof ContactErrors) => () => {
    if (Object.keys(errors).length === 0 && status === "idle") return;
    const next = validateContact(read(), formFeedback);
    setErrors((prev) => ({ ...prev, [name]: next[name] }));
  };

  const sending = status === "sending";
  const err = (k: keyof ContactErrors) => ({ "aria-invalid": errors[k] ? (true as const) : undefined, "aria-describedby": errors[k] ? `${id(k)}-err` : undefined, onBlur: blur(k) });

  if (status === "success") {
    return (
      <div ref={done} tabIndex={-1} role="status" className="relative flex min-h-[420px] flex-col items-center justify-center rounded-card bg-yellow p-10 text-center outline-none">
        <div className="relative w-[180px]">
          <RingBurst ref={ring} color="#D61610" />
          <div data-buddy="">
            <Image src={thumbs.src} alt="" width={thumbs.width} height={thumbs.height} sizes="180px" className="h-auto w-full" />
          </div>
        </div>
        <p className="display-type mt-8 max-w-[22ch] text-[length:var(--text-h2)] leading-[0.98]">{formFeedback.success}</p>
        <Button variant="solid" className="mt-8" onClick={() => { setStatus("idle"); setErrors({}); }}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form ref={form} onSubmit={onSubmit} noValidate aria-labelledby={headingId} className="rounded-card bg-cream-2 p-6 md:p-10">
      <p className="mb-8 max-w-[52ch] text-[1.1rem] leading-relaxed">{lead}</p>
      <div className="grid gap-x-6 gap-y-1 md:grid-cols-2">
        <Field id={id("name")} label={fields.name} required error={errors.name}>
          <input id={id("name")} name="name" type="text" autoComplete="name" maxLength={LIMITS.name} required aria-required="true" className={cn(inputCls, "h-14 border-ink/25")} {...err("name")} />
        </Field>
        <Field id={id("phone")} label={fields.phone} required error={errors.phone}>
          <input id={id("phone")} name="phone" type="tel" inputMode="tel" autoComplete="tel" required aria-required="true" className={cn(inputCls, "h-14 border-ink/25")} {...err("phone")} />
        </Field>
        <Field id={id("email")} label={fields.email} required error={errors.email}>
          <input id={id("email")} name="email" type="email" autoComplete="email" maxLength={LIMITS.email} required aria-required="true" className={cn(inputCls, "h-14 border-ink/25")} {...err("email")} />
        </Field>
        {partner && (
          <Field id={id("interest")} label={fields.interest} required error={errors.interest}>
            <select id={id("interest")} name="interest" defaultValue="" required aria-required="true" className={cn(inputCls, "h-14 border-ink/25")} {...err("interest")}>
              <option value="" disabled>{interestPlaceholder}</option>
              {INTEREST_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </Field>
        )}
        {partner && (
          <Field id={id("city")} label={fields.city} required error={errors.city}>
            <input id={id("city")} name="city" type="text" autoComplete="address-level2" maxLength={LIMITS.city} required aria-required="true" className={cn(inputCls, "h-14 border-ink/25")} {...err("city")} />
          </Field>
        )}
        <div className="md:col-span-2">
          <Field id={id("message")} label={fields.message} required={!partner} error={errors.message}>
            <textarea id={id("message")} name="message" rows={5} maxLength={LIMITS.message} required={!partner} aria-required={!partner} className={cn(inputCls, "resize-y border-ink/25 py-3.5")} {...err("message")} />
          </Field>
        </div>
      </div>
      {/* Honeypot: hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={sending} aria-disabled={sending} className="disabled:cursor-wait disabled:opacity-70">
          {sending ? formFeedback.sending : submit}
        </Button>
        <p className="text-sm text-ink/70"><span className="text-red" aria-hidden="true">*</span> Required</p>
      </div>
      <div aria-live="polite" role="status" className="mt-4 min-h-6">
        {status === "error" && serverMsg && <p className="rounded-small bg-red/10 p-4 font-semibold text-red-deep">{serverMsg}</p>}
        {sending && <p className="sr-only">{formFeedback.sending}</p>}
        {status === "idle" && Object.values(errors).some(Boolean) && <p className="sr-only">Please fix the highlighted fields.</p>}
      </div>
    </form>
  );
}
