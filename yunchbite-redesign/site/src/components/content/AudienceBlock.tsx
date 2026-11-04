import type { ReactNode } from "react";
import { Section, type SectionTone } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/motion/Reveal";
import { Pop } from "@/components/motion/Pop";
import { TypeIn } from "@/components/motion/TypeIn";
import { NumberedCard } from "@/components/sections/NumberedCard";
import { cn } from "@/lib/cn";

export interface AudienceBlockProps {
  /** Unique, page-prefixed id used by the pills (scroll target). */
  id: string;
  n: string;
  heading: string;
  lead: string;
  tone: SectionTone;
  /** Numbered cards (title + detail) OR a plain points list. */
  cards?: { title: string; detail: string }[];
  points?: string[];
  cardTone?: "cream" | "yellow" | "red" | "maroon";
  cta?: { label: string; href: string };
  close?: string;
  arch?: boolean;
  behind?: string;
  /** Right-hand visual (e.g. the tiffin). */
  aside?: ReactNode;
  children?: ReactNode;
}

/** WHY-02/03/04/05: one audience: eyebrow, h2, lead, cards or points, optional CTA to the partner form. */
export function AudienceBlock({ id, n, heading, lead, tone, cards, points, cardTone = "cream", cta, close, arch, behind, aside, children }: AudienceBlockProps) {
  const dark = tone === "red" || tone === "maroon";
  return (
    <Section tone={tone} arch={arch} behind={behind} aria-labelledby={id}>
      <Container>
        <div className={cn("grid gap-10", !!aside && "lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16")}>
          <div>
            <Eyebrow className="mb-4">
              <span className="tabular">{n}</span>
              <span aria-hidden="true">·</span>For
            </Eyebrow>
            <TypeIn as="h2" id={id} text={heading} className="display-type block scroll-mt-40 text-[length:var(--text-display)] leading-[0.92]" />
            <Reveal y={24} className="mt-6">
              <p className="max-w-[58ch] text-[1.15rem] leading-[1.7]">{lead}</p>
            </Reveal>
            {points && (
              <Reveal as="ul" stagger={0.08} className="mt-8 grid gap-3">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-4 text-lg font-semibold leading-snug">
                    <span aria-hidden="true" className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", dark ? "bg-yellow text-ink" : "bg-red text-cream")}>
                      <Icon name="check" className="size-4" />
                    </span>
                    <span className="max-w-[44ch]">{p}</span>
                  </li>
                ))}
              </Reveal>
            )}
            {children}
            {cta && (
              <Reveal className="mt-10">
                <ButtonLink href={`${cta.href}#partner`} variant={dark ? "yellow" : "solid"} size="lg">
                  {cta.label.replace(/\s*→\s*$/, "")}
                </ButtonLink>
              </Reveal>
            )}
          </div>
          {aside}
        </div>
        {cards && (
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c, i) => (
              <li key={c.title} className={cards.length % 3 === 2 && i === cards.length - 1 ? "lg:col-span-2" : ""}>
                <Pop delay={(i % 3) * 0.06} className="h-full">
                  <NumberedCard number={String(i + 1).padStart(2, "0")} title={c.title} tone={cardTone} className="min-h-[300px]">
                    {c.detail}
                  </NumberedCard>
                </Pop>
              </li>
            ))}
          </ul>
        )}
        {close && (
          <Reveal className="mt-12">
            <p className="max-w-[62ch] text-[1.1rem] leading-[1.7]">{close}</p>
          </Reveal>
        )}
      </Container>
    </Section>
  );
}
