import { PageTransition } from "@/components/layout/PageTransition";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TypeIn } from "@/components/motion/TypeIn";
import { PackCard } from "@/components/product/PackCard";
import { FlavourStage } from "@/components/sections/FlavourStage";
import { PartnerBand } from "@/components/sections/PartnerBand";
import { PodiumOpener, type OpenerPack } from "@/components/products/PodiumOpener";
import { PopGrid } from "@/components/products/PopGrid";
import { BestsellerStamp } from "@/components/products/BestsellerStamp";
import { packData } from "@/components/products/groups";
import { bestsellers, getProduct } from "@/data/products";
import { getFlavour } from "@/data/flavours";
import type { FlavourKey } from "@/data/keys";
import { bestsellersCopy } from "@/data/copy";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/seo";

export const metadata = pageMetadata({
  title: bestsellersCopy.seo.title,
  description: bestsellersCopy.seo.description,
  path: "/bestsellers",
});

// Pyramid order, top down (1-2-3-5): spread the packs that share a photo so neighbours differ.
const PYRAMID = [
  "makhana-zipper-peri-peri",
  "popcorn-butter",
  "makhana-zipper-chatpataa",
  "dryfruits-roasted-almonds",
  "makhana-pillow-peri-peri",
  "popcorn-salted",
  "dryfruits-roasted-cashews",
  "makhana-pillow-chatpataa",
  "makhana-zipper-salt-pepper",
  "makhana-jar-peri-peri",
  "makhana-jar-chatpataa",
];

export default function BestsellersPage() {
  const copy = bestsellersCopy.bestsellers;
  const list = bestsellers();
  const pyramid: OpenerPack[] = PYRAMID.flatMap((slug) => {
    const p = getProduct(slug);
    if (!p || !p.bestseller) return [];
    const f = getFlavour(p.flavourKey);
    return [{ ...packData(p), color: f.color, ink: f.ink }];
  });
  // anything bestselling that the fixed order missed still appears
  for (const p of list) if (!pyramid.some((x) => x.slug === p.slug)) pyramid.push({ ...packData(p), color: getFlavour(p.flavourKey).color, ink: getFlavour(p.flavourKey).ink });

  // Flavour stage: only the bestselling flavours, each showing its bestselling pack (zipper first).
  const flavourKeys = [...new Set(list.map((p) => p.flavourKey))] as FlavourKey[];
  const productFor = (key: FlavourKey) => list.find((p) => p.flavourKey === key && p.format === "zipper") ?? list.find((p) => p.flavourKey === key);

  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Bestsellers",
    url: `${SITE_URL}/bestsellers`,
    mainEntity: { "@type": "ItemList", itemListElement: list.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/products/${p.slug}`, name: `${p.name} (${p.formatLabel})` })) },
  };

  return (
    <PageTransition>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <PodiumOpener
        variant="pyramid"
        title={copy["BEST-01"].title}
        tagline={copy["BEST-01"].tagline}
        packs={pyramid}
        burst="#FFD200"
        shapes={["makhana-2", "chilli", "makhana-4", "popcorn", "almond", "olive", "cashew", "makhana-5"]}
      />
      <FlavourStage title={copy["BEST-02"].heading} flavourKeys={flavourKeys} productFor={productFor} morph={false} behind="#FBEFD9" id="bestseller-flavours" />
      <Section tone="cream" aria-labelledby="best-grid-h">
        <Container>
          <Eyebrow className="mb-3 text-red">{list.length} bestsellers</Eyebrow>
          <TypeIn as="h2" id="best-grid-h" text={copy["BEST-03"].heading} className="display-type mb-10 text-[length:var(--text-display)] leading-[0.9]" />
          <PopGrid className="grid grid-cols-1 gap-x-5 gap-y-14 pt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((p, i) => (
              <li key={p.slug} className="relative min-w-0">
                <PackCard product={p} priority={i < 4} eager={false} />
                <BestsellerStamp label={copy["BEST-03"].stamp} className="absolute -left-3 -top-5 z-20 size-[88px] -rotate-12" />
              </li>
            ))}
          </PopGrid>
        </Container>
      </Section>
      <PartnerBand variant="slim" />
    </PageTransition>
  );
}
