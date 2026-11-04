import { PageTransition } from "@/components/layout/PageTransition";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { Reveal } from "@/components/motion/Reveal";
import { NumberedCard } from "@/components/sections/NumberedCard";
import { PartnerBand } from "@/components/sections/PartnerBand";
import { FlavourStage } from "@/components/sections/FlavourStage";
import { ClaimStack } from "@/components/sections/ClaimStack";
import { ProcessPath } from "@/components/sections/ProcessPath";
import { ReviewWall } from "@/components/sections/ReviewWall";
import { Hero } from "@/components/home/Hero";
import { JindgiWipe } from "@/components/home/JindgiWipe";
import { CategoryCard } from "@/components/home/CategoryCard";
import { OccasionStrip, type Occasion } from "@/components/home/OccasionStrip";
import { BestsellerStrip } from "@/components/home/BestsellerStrip";
import { BuddyIntro } from "@/components/home/BuddyIntro";
import { OutlineTitle } from "@/components/home/OutlineTitle";
import {
  MAKHANA_STAGE_ORDER,
  SHOW_REVIEWS,
  bestsellers,
  buddyLines,
  categories,
  getFlavour,
  getProduct,
  homeCopy,
  products,
  reviews,
  claims,
} from "@/data";
import { photos } from "@/data/assets";
import { pageMetadata } from "@/lib/seo";
import type { Product } from "@/data/types";

export const metadata = pageMetadata({ title: homeCopy.seo.title, description: homeCopy.seo.description, path: "/" });

const copy = homeCopy.home;
const pick = (slug: string): Product => {
  const p = getProduct(slug);
  if (!p) throw new Error(`Home: unknown product ${slug}`);
  return p;
};
const pack = (p: Product) => ({ slug: p.slug, name: p.name, formatLabel: p.formatLabel, flavourKey: p.flavourKey });

// Category pack clusters: [left, centre, right]
const CLUSTERS: Record<string, string[]> = {
  makhana: ["makhana-zipper-salt-pepper", "makhana-zipper-peri-peri", "makhana-zipper-cheese-herbs"],
  popcorn: ["popcorn-salted", "popcorn-butter", "popcorn-pudina"],
  "dry-fruits": ["dryfruits-roasted-cashews", "dryfruits-roasted-almonds", "dryfruits-raw-cashews"],
};

export default function Home() {
  const stageSlugs = products.filter((p) => p.format === "zipper" && MAKHANA_STAGE_ORDER.includes(p.flavourKey)).map((p) => p.slug);
  const heroPacks = ["makhana-zipper-peri-peri", "makhana-zipper-pudina", "makhana-zipper-salt-pepper", "makhana-zipper-cheese-herbs"].map((s) => ({ product: pack(pick(s)) })) as React.ComponentProps<typeof Hero>["packs"];

  const occ = copy["HOME-07"].occasions;
  const fl = (k: Parameters<typeof getFlavour>[0]) => getFlavour(k);
  const occasionCards: Occasion[] = [
    { key: occ[0].key, title: occ[0].title, line: occ[0].line, photo: { ...photos.familyLifestyle, position: "85% 50%" }, color: "#FFD200", ink: "#2A1210", shapes: ["tiffin"] },
    { key: occ[1].key, title: occ[1].title, line: occ[1].line, color: fl("peri-peri").color, ink: fl("peri-peri").ink, pack: pack(pick("makhana-zipper-peri-peri")), shapes: ["chilli", "makhana-1", "olive", "makhana-4"] },
    { key: occ[2].key, title: occ[2].title, line: occ[2].line, color: fl("cheese-herbs").color, ink: fl("cheese-herbs").ink, pack: pack(pick("makhana-zipper-cheese-herbs")), shapes: ["cheese", "popcorn", "herb-sprig", "makhana-2"] },
    { key: occ[3].key, title: occ[3].title, line: occ[3].line, color: "#F1C396", ink: "#5A0B0B", pack: pack(pick("makhana-zipper-salt-pepper")), shapes: ["pepper", "makhana-3", "salt", "makhana-5"] },
    { key: occ[4].key, title: occ[4].title, line: occ[4].line, color: fl("pudina").color, ink: fl("pudina").ink, pack: pack(pick("makhana-zipper-pudina")), shapes: ["pudina-leaf", "makhana-1", "tiffin", "makhana-4"] },
  ];

  const steps = copy["HOME-06"].steps.map((s, i) => ({ ...s, shape: (["makhana-2", "olive", "chilli", "tiffin"] as const)[i] }));

  return (
    <PageTransition>
      {/* HOME-01 */}
      <Hero
        headline={copy["HOME-01"].headline}
        line={copy["HOME-01"].line}
        primary={copy["HOME-01"].primaryCta}
        secondary={copy["HOME-01"].secondaryCta}
        packs={heroPacks}
      />

      {/* HOME-02 */}
      <FlavourStage
        id={copy["HOME-02"].id}
        title={copy["HOME-02"].heading}
        flavourKeys={MAKHANA_STAGE_ORDER}
        ctaLabel={copy["HOME-02"].cta}
        numberLabel={copy["HOME-02"].numberLabel}
        prevLabel={copy["HOME-02"].prev}
        nextLabel={copy["HOME-02"].next}
        also={
          <p>
            {copy["HOME-02"].also.label}{" "}
            {copy["HOME-02"].also.links.map((l, i) => (
              <span key={l.href}>
                {i > 0 && <span aria-hidden="true"> · </span>}
                <TransitionLink href={l.href} className="underline decoration-2 underline-offset-4 hover:no-underline">
                  {l.label}
                </TransitionLink>
              </span>
            ))}
          </p>
        }
      />

      {/* HOME-03 */}
      <JindgiWipe
        before={copy["HOME-03"].before}
        after={copy["HOME-03"].after}
        beforeCaption={copy["HOME-03"].beforeCaption}
        afterCaption={copy["HOME-03"].afterCaption}
        pack={pack(pick("makhana-zipper-peri-peri"))}
      />

      {/* HOME-04 */}
      <ClaimStack id="claims" items={claims} eyebrow={copy["HOME-04"].eyebrow} title={copy["HOME-04"].heading} />

      {/* HOME-05 */}
      <Section tone="cream" aria-labelledby="categories-title" className="overflow-hidden">
        <Container>
          <div className="mb-[clamp(2.5rem,5vw,4.5rem)] text-red">
            <OutlineTitle id="categories-title" text={copy["HOME-05"].heading} solid="crunch" className="text-[length:clamp(3rem,10.5vw,10rem)] leading-[0.86]" />
          </div>
          <Reveal as="ul" stagger={0.09} className="grid list-none gap-8 pt-10 md:grid-cols-3 md:gap-6 lg:gap-8">
            {categories.map((c, i) => (
              <li key={c.slug} className={i === 1 ? "md:mt-12" : undefined}>
                <CategoryCard
                  href={`/categories/${c.slug}`}
                  name={c.name}
                  title={c.title}
                  count={copy["HOME-05"].counts[c.slug]}
                  cta={copy["HOME-05"].cta}
                  color={c.color}
                  ink={c.ink}
                  ingredient={c.slug === "makhana" ? "chilli" : c.slug === "popcorn" ? "butter" : "almond"}
                  packs={CLUSTERS[c.slug].map((s) => pack(pick(s)))}
                />
              </li>
            ))}
          </Reveal>
        </Container>
      </Section>

      {/* HOME-06 */}
      <ProcessPath id="process" eyebrow={copy["HOME-06"].eyebrow} title={copy["HOME-06"].heading} steps={steps} />

      {/* HOME-07 */}
      <OccasionStrip occasions={occasionCards} eyebrow={copy["HOME-07"].eyebrow} heading={copy["HOME-07"].heading} />

      {/* HOME-08 */}
      <BestsellerStrip heading={copy["HOME-08"].heading} sub={copy["HOME-08"].sub} cta={copy["HOME-08"].cta} products={bestsellers()} noMorph={stageSlugs} />

      {/* HOME-09 */}
      <BuddyIntro heading={copy["HOME-09"].heading} body={copy["HOME-09"].body} bubble={copy["HOME-09"].bubble} clickHint={copy["HOME-09"].clickHint} lines={buddyLines} />

      {/* HOME-10 */}
      <Section tone="cream" aria-labelledby="know-more-title">
        <Container>
          <h2 id="know-more-title" className="display-type mb-10 text-[length:var(--text-display)] leading-[0.92]">
            {copy["HOME-10"].heading}
          </h2>
          <Reveal as="ul" stagger={0.1} className="grid list-none gap-5 md:grid-cols-3">
            {copy["HOME-10"].cards.map((c, i) => (
              <NumberedCard key={c.href} as="li" number={c.n} title={c.title} href={c.href} tone={(["cream", "yellow", "red"] as const)[i]} />
            ))}
          </Reveal>
        </Container>
      </Section>

      {/* HOME-11: hidden until the client confirms the reviews are genuine */}
      {SHOW_REVIEWS && (
        <ReviewWall
          id="reviews"
          title={copy["HOME-11"].heading}
          sub={copy["HOME-11"].sub}
          items={reviews.map((r) => ({ name: r.name, title: r.title, body: r.body, rating: r.rating }))}
        />
      )}

      {/* HOME-12 */}
      <PartnerBand variant="full" behind="#FFFDF5" />
    </PageTransition>
  );
}
