"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/components/motion/gsap";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { Pop } from "@/components/motion/Pop";
import { buddyImage } from "@/lib/media";
import { cn } from "@/lib/cn";
import { ContactForm } from "./ContactForm";
import type { ContactKind } from "./contact-schema";

export interface ContactClientProps {
  paths: { key: string; title: string; line: string }[];
  partner: { heading: string; lead: string; fields: Record<string, string>; submit: string; interestPlaceholder: string };
  question: { heading: string; lead: string; fields: Record<string, string>; submit: string };
}

/** CON-01..03: Buddy points at the active path card; the cards switch the form. The partner container has id="partner". */
export function ContactClient({ paths, partner, question }: ContactClientProps) {
  const [active, setActive] = useState<ContactKind>("partner");
  const buddy = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const img = buddyImage("point");

  // Deep link: /contact#partner (or #question) selects that form.
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.slice(1);
      if (h === "partner" || h === "question") setActive(h);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // Buddy's arm follows the selected card.
  useEffect(() => {
    const el = buddy.current;
    if (!el) return;
    const up = active === "partner";
    const vars = { rotation: up ? -6 : 7, yPercent: up ? -10 : 12 };
    if (first.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) gsap.set(el, vars);
    else gsap.to(el, { ...vars, duration: 0.6, ease: "back.out(1.7)", overwrite: true });
    first.current = false;
  }, [active]);

  return (
    <>
      <Section tone="cream" padded={false} className="pb-[var(--section-y)]">
        <Container className="grid items-center gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-12">
          <div ref={buddy} aria-hidden="true" className="mx-auto w-[min(60%,340px)] origin-[50%_70%] md:w-full md:max-w-[380px]">
            <Image src={img.src} alt="" width={img.width} height={img.height} priority sizes="(min-width: 768px) 380px, 60vw" className="h-auto w-full" />
          </div>
          <div role="group" aria-label="What would you like to do?" className="grid gap-4">
            {paths.map((p, i) => {
              const on = active === p.key;
              return (
                <Pop key={p.key} delay={0.1 + i * 0.1}>
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-controls={p.key}
                    onClick={() => setActive(p.key as ContactKind)}
                    className={cn(
                      "group/path flex w-full items-center justify-between gap-6 rounded-card p-6 text-left transition-[background-color,color,transform,box-shadow] duration-[var(--dur-pop)] ease-[var(--ease-crunch)] md:p-8",
                      on ? "bg-red text-cream shadow-[var(--shadow-lift)]" : "bg-cream-2 text-ink hover:-translate-y-1 hover:bg-yellow",
                    )}
                  >
                    <span>
                      <span className="display-type block text-[length:var(--text-h2)] leading-[0.95]">{p.title}</span>
                      <span className="mt-3 block max-w-[40ch]">{p.line}</span>
                    </span>
                    <span aria-hidden="true" className={cn("grid size-12 shrink-0 place-items-center rounded-full transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)]", on ? "bg-yellow text-ink" : "bg-ink text-cream group-hover/path:rotate-90")}>
                      <Icon name={on ? "check" : "arrow"} className="size-6" />
                    </span>
                  </button>
                </Pop>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section tone="soft" padded={false} className="py-[var(--section-y)]">
        <Container size="narrow" className="max-w-[920px]">
          <div id="partner" hidden={active !== "partner"} className="scroll-mt-28">
            <h2 id="contact-partner-h" className="display-type mb-6 text-[length:var(--text-h2)] leading-none">{partner.heading}</h2>
            <ContactForm kind="partner" headingId="contact-partner-h" lead={partner.lead} fields={partner.fields} submit={partner.submit} interestPlaceholder={partner.interestPlaceholder} />
          </div>
          <div id="question" hidden={active !== "question"} className="scroll-mt-28">
            <h2 id="contact-question-h" className="display-type mb-6 text-[length:var(--text-h2)] leading-none">{question.heading}</h2>
            <ContactForm kind="question" headingId="contact-question-h" lead={question.lead} fields={question.fields} submit={question.submit} />
          </div>
        </Container>
      </Section>
    </>
  );
}
