import type { ReactNode } from "react";
import type { ShapeName } from "@/data/types";
import { Section, type SectionTone } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { TypeIn } from "@/components/motion/TypeIn";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { DriftShapes } from "@/components/sections/DriftShapes";

export interface ClosingStatementProps {
  text: string;
  cta?: { label: string; href: string };
  tone?: SectionTone;
  shapes?: ShapeName[];
  children?: ReactNode;
  arch?: boolean;
  behind?: string;
}

/** Closing brand line (types in) with a magnetic CTA and drifting shapes. */
export function ClosingStatement({ text, cta, tone = "red", shapes = ["makhana-1", "makhana-4", "chilli", "makhana-2", "pudina-leaf", "makhana-3"], children, arch, behind }: ClosingStatementProps) {
  return (
    <Section tone={tone} arch={arch} behind={behind} className="overflow-hidden">
      <DriftShapes shapes={shapes} className="opacity-90" />
      <Container size="narrow" className="relative z-10 flex min-h-[60vh] flex-col items-center justify-center text-center">
        <TypeIn as="h2" text={text} className="display-type block text-[length:clamp(2.6rem,6.4vw,6.2rem)] leading-[0.94]" />
        {children}
        {cta && (
          <Reveal className="mt-10" delay={0.1}>
            <ButtonLink href={cta.href} variant={tone === "red" || tone === "maroon" ? "cream" : "solid"} size="lg">
              {cta.label}
            </ButtonLink>
          </Reveal>
        )}
      </Container>
    </Section>
  );
}
