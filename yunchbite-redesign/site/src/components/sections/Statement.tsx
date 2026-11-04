import type { ReactNode } from "react";
import type { ShapeName } from "@/data/types";
import { Section, type SectionTone } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { DriftShapes } from "./DriftShapes";
import { cn } from "@/lib/cn";

export interface StatementProps {
  /** The centred line. Use <em> for a highlighted word (rendered in yellow on dark tones, red on light). */
  children: ReactNode;
  /** Paper-cut shapes (up to 8) drifting around the line. */
  shapes?: ShapeName[];
  tone?: SectionTone;
  eyebrow?: ReactNode;
  as?: "p" | "h2" | "h3";
  arch?: boolean;
  className?: string;
}

const DEFAULT_SHAPES: ShapeName[] = ["makhana-1", "chilli", "makhana-3", "pudina-leaf", "makhana-5", "pepper", "makhana-2", "berry"];

/** P21: a centred brand line with paper-cut shapes drifting in parallax around it. */
export function Statement({ children, shapes = DEFAULT_SHAPES, tone = "cream", eyebrow, as: Tag = "p", arch, className }: StatementProps) {
  const dark = tone === "red" || tone === "maroon";
  return (
    <Section tone={tone} arch={arch} className={cn("overflow-hidden", className)}>
      <DriftShapes shapes={shapes} />
      <Container size="narrow" className="relative z-10 flex min-h-[55vh] flex-col items-center justify-center text-center">
        {eyebrow && <div className="mb-6 text-sm font-bold uppercase tracking-[0.14em]">{eyebrow}</div>}
        <Reveal>
          <Tag className={cn("display-type text-[length:var(--text-display)] leading-[0.95] [&_em]:not-italic", dark ? "[&_em]:text-yellow" : "[&_em]:text-red")}>{children}</Tag>
        </Reveal>
      </Container>
    </Section>
  );
}
