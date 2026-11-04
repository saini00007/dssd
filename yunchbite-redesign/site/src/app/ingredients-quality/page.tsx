import Image from "next/image";
import { PageTransition } from "@/components/layout/PageTransition";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Pill } from "@/components/ui/Pill";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pop } from "@/components/motion/Pop";
import { Reveal } from "@/components/motion/Reveal";
import { TypeIn } from "@/components/motion/TypeIn";
import { InsetOpener } from "@/components/sections/InsetOpener";
import { ClaimMarquee } from "@/components/sections/ClaimMarquee";
import { PartnerBand } from "@/components/sections/PartnerBand";
import { IngredientCards } from "@/components/content/IngredientCards";
import { OliveOil } from "@/components/content/OliveOil";
import { IngredientTable } from "@/components/content/IngredientTable";
import { PhotoStack } from "@/components/content/PhotoStack";
import { SectionHead } from "@/components/content/SectionHead";
import { ingredientsCopy } from "@/data";
import { photos } from "@/data/assets";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ ...ingredientsCopy.seo, path: "/ingredients-quality" });

const q = ingredientsCopy.ingredients;

export default function IngredientsQualityPage() {
  const oil = q["IQ-03"].oliveOil;
  const t = q["IQ-04"];
  const c = q["IQ-06"];
  return (
    <PageTransition>
      {/* IQ-01 */}
      <InsetOpener
        className="[&_h1]:mx-auto [&_h1]:max-w-[18ch] [&_h1]:text-[length:clamp(2.6rem,6.4vw,6.6rem)]"
        title={q["IQ-01"].statement}
        eyebrow="Ingredients & quality"
        image={photos.factory}
      />

      {/* IQ-02 */}
      <Section tone="cream" aria-labelledby="iq-clean" padded={false} className="pb-[var(--section-y)]">
        <Container className="pb-[var(--section-y)]">
          <Reveal>
            <p className="max-w-[60ch] text-[1.2rem] leading-[1.7]">{q["IQ-01"].intro}</p>
          </Reveal>
        </Container>
        <Container>
          <SectionHead id="iq-clean" n={q["IQ-02"].n} eyebrow="Ingredients" heading={q["IQ-02"].heading} lead={q["IQ-02"].lead} className="mb-14" />
          <IngredientCards points={q["IQ-02"].points} />
        </Container>
      </Section>

      {/* IQ-03 */}
      <Section tone="maroon" arch behind="var(--color-cream)" aria-labelledby="iq-oil">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
          <div>
            <Eyebrow className="mb-4 text-yellow">
              <span className="tabular">{q["IQ-03"].n}</span>
              <span aria-hidden="true">·</span>Quality you can trust
            </Eyebrow>
            <TypeIn as="h2" id="iq-oil" text={oil.title} className="display-type block text-[length:var(--text-display)] leading-[0.92]" />
            <Reveal y={24} className="mt-6 space-y-5">
              <p className="max-w-[56ch] text-[1.1rem] leading-[1.7] text-cream/90">{q["IQ-03"].lead}</p>
              <p className="max-w-[56ch] text-[1.1rem] leading-[1.7]">{oil.body}</p>
            </Reveal>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {oil.chips.map((chip, i) => (
                <li key={chip}>
                  <Pop delay={i * 0.07}>
                    <Pill tone="yellow" className="py-2.5 text-[0.95rem]">{chip}</Pill>
                  </Pop>
                </li>
              ))}
            </ul>
          </div>
          <OliveOil neverFried={oil.neverFried} />
        </Container>
      </Section>

      {/* IQ-04 */}
      <Section tone="cream" aria-labelledby="iq-table">
        <Container>
          <SectionHead id="iq-table" n={t.n} eyebrow="Transparency" heading={t.heading} lead={t.lead} className="mb-12" />
          <IngredientTable tabs={t.tabs} columns={t.columns} additivesNote={t.additivesNote} label="Ingredients by product category" />
        </Container>
      </Section>

      {/* IQ-05 */}
      <Section tone="soft" padded={false} className="pt-[var(--section-y)]" aria-labelledby="iq-pack">
        <Container className="mb-12">
          <SectionHead id="iq-pack" n={q["IQ-05"].n} eyebrow="Packaging" heading={q["IQ-05"].heading} lead={q["IQ-05"].lead} />
        </Container>
        <ClaimMarquee items={q["IQ-05"].chips} tone="maroon" label="How we protect quality" className="mt-0" />
        <div className="h-[var(--section-y)]" />
      </Section>

      {/* IQ-06 */}
      <div data-stack-section="" className="md:motion-safe:h-[230vh]">
        <Section tone="yellow" padded={false} aria-labelledby="iq-commit" className="py-[var(--section-y)] md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:flex md:motion-safe:h-[100svh] md:motion-safe:items-center md:motion-safe:overflow-hidden md:motion-safe:py-0">
          <Container className="grid w-full gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
            <div>
              <SectionHead id="iq-commit" n={c.n} eyebrow="Our commitment" heading={c.heading} lead={c.lead} />
              <Reveal as="ol" stagger={0.08} className="mt-8 grid gap-2.5">
                {c.steps.map((s) => (
                  <li key={s.n} className="flex items-center gap-4 rounded-pill bg-ink/[0.07] py-2.5 pl-3 pr-6 text-lg font-bold">
                    <span aria-hidden="true" className="tabular grid size-10 shrink-0 place-items-center rounded-full bg-ink text-sm text-yellow">{s.n}</span>
                    {s.title}
                  </li>
                ))}
              </Reveal>
              <p className="mt-6 flex flex-wrap gap-x-4 font-bold uppercase tracking-[0.1em] text-maroon">
                {c.taglines.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </p>
            </div>
            <div>
              <div className="relative aspect-[3/2] overflow-hidden rounded-card md:motion-safe:hidden">
                <Image src={photos.factory.src} alt={photos.factory.alt} fill sizes="(min-width: 1024px) 560px, 90vw" className="object-cover" />
              </div>
              <PhotoStack steps={c.steps} />
            </div>
          </Container>
        </Section>
      </div>
      <Section tone="cream" padded={false} className="py-16 text-center">
        <Container>
          <p className="display-type text-[length:clamp(1.6rem,3.4vw,3rem)] leading-[1] text-maroon">{c.signOff}</p>
        </Container>
      </Section>
      <PartnerBand variant="slim" />
    </PageTransition>
  );
}
