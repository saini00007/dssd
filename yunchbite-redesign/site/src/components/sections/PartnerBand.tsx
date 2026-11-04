import { partnerBand } from "@/data/copy/shared";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { TypeIn } from "@/components/motion/TypeIn";
import { DriftShapes } from "./DriftShapes";
import { cn } from "@/lib/cn";

export interface PartnerBandProps {
  /** "full": HOME-12 big red arch band. "slim": one line + button (Products, PDP). */
  variant?: "full" | "slim";
  /** Colour behind the arch corners (the previous section's colour). */
  behind?: string;
  className?: string;
}

/** HOME-12 partner conversion band. Links to /contact#partner. */
export function PartnerBand({ variant = "full", behind, className }: PartnerBandProps) {
  const href = `${partnerBand.cta.href}#partner`;

  if (variant === "slim") {
    return (
      <Section tone="yellow" padded={false} className={cn("py-10 md:py-12", className)}>
        <Container className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <p className="display-type text-[length:var(--text-h2)] leading-[0.95]">{partnerBand.slim}</p>
          <ButtonLink href={href} variant="solid" size="lg">
            {partnerBand.cta.label}
          </ButtonLink>
        </Container>
      </Section>
    );
  }

  return (
    <Section tone="red" arch behind={behind} className={cn("overflow-hidden", className)} aria-labelledby="partner-band-heading">
      <DriftShapes shapes={["makhana-1", "makhana-4", "makhana-2", "olive"]} className="opacity-90" />
      <Container className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <Eyebrow className="mb-5 text-yellow">{partnerBand.eyebrow}</Eyebrow>
          <TypeIn as="h2" id="partner-band-heading" text={partnerBand.heading} className="display-type text-[length:var(--text-display)] leading-[0.92]" />
          <Reveal className="mt-9" delay={0.15}>
            <ButtonLink href={href} variant="cream" size="lg">
              {partnerBand.cta.label}
            </ButtonLink>
          </Reveal>
        </div>
        <Reveal as="ul" stagger={0.09} className="flex flex-col gap-3">
          {partnerBand.points.map((p, i) => (
            <li key={p.title} className="flex gap-4 rounded-[28px] bg-maroon/70 p-5 backdrop-blur-[2px] md:p-6">
              <span aria-hidden="true" className="display-type text-outline text-5xl leading-none text-cream [--stroke-color:var(--color-yellow)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="display-type block text-[length:var(--text-h3)] leading-none">{p.title}</span>
                <span className="mt-2 block text-[0.98rem] text-cream/90">{p.detail}</span>
              </span>
            </li>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
