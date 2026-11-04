import { PageTransition } from "@/components/layout/PageTransition";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { Pop } from "@/components/motion/Pop";
import { Reveal } from "@/components/motion/Reveal";
import { PartnerBand } from "@/components/sections/PartnerBand";
import { BowlOpener } from "@/components/content/BowlOpener";
import { ClaimStack } from "@/components/sections/ClaimStack";
import type { Claim } from "@/data/site";
import { NutritionTable } from "@/components/content/NutritionTable";
import { PackFormats } from "@/components/content/PackFormats";
import { SectionHead } from "@/components/content/SectionHead";
import { ClosingStatement } from "@/components/content/ClosingStatement";
import { benefitsCopy } from "@/data";
import { photos } from "@/data/assets";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ ...benefitsCopy.seo, path: "/benefits" });

const b = benefitsCopy.benefits;

const BENEFIT_ICONS: Claim["icon"][] = ["protein", "protein", "olive", "no-preservatives", "veg-gluten", "no-palm", "protein"];
const benefitClaims: Claim[] = b["BEN-02"].cards.map((c, i) => ({ key: `benefit-${i}`, label: c.title, detail: c.detail, icon: BENEFIT_ICONS[i] }));

export default function BenefitsPage() {
  const nut = b["BEN-03"];
  return (
    <PageTransition>
      <BowlOpener eyebrow={b["BEN-01"].title} title={b["BEN-01"].shortTitle} intro={b["BEN-01"].intro} image={photos.makhanaBowl} />

      <Section tone="cream" padded={false} className="py-[clamp(3rem,7vw,6rem)]">
        <Container size="narrow">
          <Reveal>
            <p className="display-type mx-auto max-w-[28ch] text-center text-[length:clamp(1.6rem,3.2vw,2.8rem)] leading-[1.02] text-maroon">{b["BEN-02"].lead}</p>
          </Reveal>
        </Container>
      </Section>
      <ClaimStack id="ben-stack" eyebrow="What's inside" title={b["BEN-02"].heading} items={benefitClaims} tone="maroon" />

      <Section tone="soft" arch behind="var(--color-maroon)" aria-labelledby="ben-nutrition">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHead id="ben-nutrition" n={nut.n} eyebrow="Per 100 g" heading={nut.heading} lead={nut.lead} />
            <Reveal className="mt-10 rounded-card bg-cream p-7">
              <h3 className="display-type text-[length:var(--text-h3)]">{nut.ingredients.title}</h3>
              <p className="mt-2 text-ink/80">{nut.ingredients.lead}</p>
              <ul className="mt-4 space-y-2">
                {nut.ingredients.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 font-semibold">
                    <Icon name="check" className="mt-1 size-5 shrink-0 text-red" />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <NutritionTable caption="Roasted makhana, per 100 g" columns={nut.columns} rows={nut.rows} footnotes={nut.footnotes} note={nut.note} />
        </Container>
      </Section>

      <Section tone="cream" aria-labelledby="ben-pack">
        <Container>
          <SectionHead id="ben-pack" n={b["BEN-04"].n} eyebrow="Packaging" heading={b["BEN-04"].heading} lead={b["BEN-04"].lead} className="mb-14" />
          <PackFormats pickLabel={b["BEN-04"].pickLabel} formats={b["BEN-04"].formats} features={b["BEN-04"].features} />
        </Container>
      </Section>

      <ClosingStatement tone="yellow" arch behind="var(--color-cream)" text={b["BEN-05"].heading} shapes={["makhana-1", "makhana-3", "olive", "makhana-5", "pudina-leaf", "makhana-2"]}>
        <Reveal className="mt-6">
          <p className="mx-auto max-w-[56ch] text-[1.15rem] leading-[1.7]">{b["BEN-05"].lead}</p>
        </Reveal>
        <ul className="mt-10 flex flex-wrap justify-center gap-3">
          {b["BEN-05"].chips.map((c, i) => (
            <li key={c}>
              <Pop delay={i * 0.08}>
                <span className="display-type inline-flex rounded-pill bg-ink px-6 py-3 text-[length:clamp(1.1rem,2vw,1.6rem)] text-cream">{c}</span>
              </Pop>
            </li>
          ))}
        </ul>
        <Reveal className="mt-10 space-y-1">
          {b["BEN-05"].taglines.map((t) => (
            <p key={t} className="font-bold uppercase tracking-[0.12em] text-maroon">{t}</p>
          ))}
          <p className="pt-3 text-ink/85">{b["BEN-05"].closing}</p>
        </Reveal>
      </ClosingStatement>
      <PartnerBand variant="slim" />
    </PageTransition>
  );
}
