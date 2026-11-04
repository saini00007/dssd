import { PageTransition } from "@/components/layout/PageTransition";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { TypeIn } from "@/components/motion/TypeIn";
import { ClaimMarquee } from "@/components/sections/ClaimMarquee";
import { PartnerBand } from "@/components/sections/PartnerBand";
import { AudiencePills } from "@/components/content/AudiencePills";
import { AudienceBlock } from "@/components/content/AudienceBlock";
import { TiffinMoment } from "@/components/content/TiffinMoment";
import { ClosingStatement } from "@/components/content/ClosingStatement";
import { whyCopy } from "@/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ ...whyCopy.seo, path: "/why-yunch-bite" });

const w = whyCopy.why;
const ids = { consumers: "why-consumers", parents: "why-parents", retailers: "why-retailers", distributors: "why-distributors" };

export default function WhyPage() {
  const parents = w["WHY-03"];
  return (
    <PageTransition>
      {/* WHY-01 */}
      <Section tone="cream" padded={false} className="pt-[clamp(8rem,18vh,11rem)] pb-8">
        <Container>
          <Eyebrow className="mb-5 text-red">Great taste with higher standards</Eyebrow>
          <TypeIn as="h1" trigger="load" text={w["WHY-01"].title} className="display-type block text-[length:var(--text-hero)] leading-[0.86]" />
          <Reveal className="mt-8">
            <p className="max-w-[64ch] text-[1.15rem] leading-[1.75]">{w["WHY-01"].intro}</p>
          </Reveal>
        </Container>
      </Section>
      <AudiencePills label="Jump to an audience" pills={w["WHY-01"].pills.map((p) => ({ ...p, targetId: ids[p.key as keyof typeof ids] }))} />

      {/* WHY-02 */}
      <AudienceBlock id={ids.consumers} n={w["WHY-02"].n} heading={w["WHY-02"].heading} lead={w["WHY-02"].lead} tone="maroon" arch behind="var(--color-cream)" cardTone="cream" cards={w["WHY-02"].cards} close={w["WHY-02"].close} />

      {/* WHY-03 */}
      <AudienceBlock
        id={ids.parents}
        n={parents.n}
        heading={parents.heading}
        lead={parents.lead}
        tone="yellow"
        arch
        behind="var(--color-maroon)"
        points={parents.points}
        aside={<TiffinMoment className="mx-auto w-full max-w-[460px]" />}
      >
        <Reveal className="mt-10">
          <p className="display-type text-[length:clamp(1.6rem,3vw,2.6rem)] leading-[0.98] text-maroon">{parents.closing}</p>
        </Reveal>
      </AudienceBlock>

      {/* WHY-04 */}
      <AudienceBlock id={ids.retailers} n={w["WHY-04"].n} heading={w["WHY-04"].heading} lead={w["WHY-04"].lead} tone="cream" arch behind="var(--color-yellow)" cards={w["WHY-04"].cards} cardTone="red" cta={w["WHY-04"].cta} />

      {/* WHY-05 */}
      <AudienceBlock id={ids.distributors} n={w["WHY-05"].n} heading={w["WHY-05"].heading} lead={w["WHY-05"].lead} tone="maroon" arch behind="var(--color-cream)" points={w["WHY-05"].points} cta={w["WHY-05"].cta} />

      {/* WHY-06 */}
      <Section tone="cream" aria-labelledby="why-everyone" padded={false} className="pt-[var(--section-y)]">
        <Container className="mb-12 text-center">
          <Eyebrow className="mb-4 justify-center">
            <span className="tabular">{w["WHY-06"].n}</span>
            <span aria-hidden="true">·</span>For
          </Eyebrow>
          <TypeIn as="h2" id="why-everyone" text={w["WHY-06"].heading} className="display-type block text-[length:var(--text-display)] leading-[0.92]" />
          <Reveal className="mt-6">
            <p className="mx-auto max-w-[56ch] text-[1.15rem] leading-[1.7]">{w["WHY-06"].lead}</p>
          </Reveal>
        </Container>
        <ClaimMarquee items={w["WHY-06"].chips} tone="yellow" label="For everyone, every day" />
      </Section>
      <ClosingStatement tone="cream" text={w["WHY-06"].tagline} shapes={["makhana-1", "pudina-leaf", "makhana-3", "chilli", "makhana-5", "berry"]}>
        <Reveal className="mt-8">
          <p className="mx-auto max-w-[48ch] text-[1.15rem] leading-[1.7]">{w["WHY-06"].closing}</p>
        </Reveal>
      </ClosingStatement>
      <PartnerBand variant="slim" />
    </PageTransition>
  );
}
