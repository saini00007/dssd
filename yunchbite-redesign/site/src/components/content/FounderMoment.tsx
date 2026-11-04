import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TypeIn } from "@/components/motion/TypeIn";
import { Reveal } from "@/components/motion/Reveal";
import { DriftShapes } from "@/components/sections/DriftShapes";

export interface FounderMomentProps {
  eyebrow: string;
  /** Full name as printed, e.g. "Mr. Nitin Rathi". The giant title drops the honorific. */
  name: string;
  role: string;
  body: string[];
  quote: string;
  /** When a founder portrait exists, pass it: the giant name then overlaps the photo (R2-C7). */
  photo?: { src: string; alt: string; width: number; height: number };
}

/** ABOUT-07. No founder photo yet: a strong typographic card; pass `photo` to switch to the portrait layout. */
export function FounderMoment({ eyebrow, name, role, body, quote, photo }: FounderMomentProps) {
  const big = name.replace(/^(mr|mrs|ms|dr)\.?\s+/i, "");
  const [first, ...rest] = big.split(" ");
  return (
    <Section tone="maroon" arch behind="var(--color-cream)" className="overflow-hidden" aria-labelledby="founder-name">
      <DriftShapes shapes={["makhana-2", "olive", "makhana-4", "makhana-1"]} className="opacity-25" />
      <Container className="relative z-10">
        <Eyebrow className="mb-6 text-yellow">{eyebrow}</Eyebrow>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <h2 id="founder-name" aria-label={name} className="display-type relative text-[length:clamp(4rem,15.5vw,16rem)] leading-[0.8]">
            <TypeIn text={first} className="block text-yellow" />
            <TypeIn text={rest.join(" ")} className="block text-cream md:pl-[0.35em]" />
          </h2>
          <p className="display-type max-w-[12ch] text-[length:clamp(1.6rem,3vw,2.8rem)] leading-[0.98] md:pb-[0.5em] md:text-right">
            <span className="text-yellow">{role}</span>
          </p>
        </div>
        {photo && (
          <div className="relative -mt-[8vw] ml-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-card">
            <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />
          </div>
        )}
        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <Reveal>
            <div className="rounded-card bg-cream p-8 text-ink md:p-12">
              <span aria-hidden="true" className="display-type block h-12 text-[6rem] leading-[0.9] text-red">“</span>
              <blockquote className="display-type mt-2 text-[length:clamp(1.6rem,2.6vw,2.5rem)] leading-[1.02] normal-case">{quote}</blockquote>
              <p className="mt-8 flex items-center gap-4 border-t-2 border-ink/15 pt-6">
                <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-red text-lg font-black text-cream">
                  {first[0]}
                  {rest[0]?.[0]}
                </span>
                <span>
                  <span className="block font-bold">{name}</span>
                  <span className="block text-sm text-ink/75">{role}</span>
                </span>
              </p>
            </div>
          </Reveal>
          <Reveal stagger={0.12} className="flex flex-col gap-5 self-center text-[1.1rem] leading-[1.7] text-cream/90">
            {body.map((p) => (
              <p key={p} className="max-w-[58ch]">
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
