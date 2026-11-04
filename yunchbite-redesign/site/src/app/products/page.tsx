import { PageTransition } from "@/components/layout/PageTransition";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TypeIn } from "@/components/motion/TypeIn";
import { Reveal } from "@/components/motion/Reveal";
import { PackCard } from "@/components/product/PackCard";
import { ClaimMarquee } from "@/components/sections/ClaimMarquee";
import { PartnerBand } from "@/components/sections/PartnerBand";
import { PodiumOpener, type OpenerPack } from "@/components/products/PodiumOpener";
import { CategoryBand } from "@/components/products/CategoryBand";
import { PopGrid } from "@/components/products/PopGrid";
import { flavourGroups, packData } from "@/components/products/groups";
import { bestsellers, getProduct } from "@/data/products";
import { getFlavour } from "@/data/flavours";
import { categories } from "@/data/categories";
import { productsCopy } from "@/data/copy";
import { claimChips } from "@/data/site";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/seo";

export const metadata = pageMetadata({
  title: productsCopy.seo.title,
  description: productsCopy.seo.description,
  path: "/products",
});

const PODIUM: { slug: string; label: string }[] = [
  { slug: "popcorn-butter", label: "Popcorn" },
  { slug: "dryfruits-roasted-almonds", label: "Dry fruits" },
  { slug: "makhana-zipper-peri-peri", label: "Makhana" },
  { slug: "makhana-zipper-salt-pepper", label: "Makhana" },
  { slug: "popcorn-pudina", label: "Popcorn" },
];

export default function ProductsPage() {
  const copy = productsCopy.products;
  const podium: OpenerPack[] = PODIUM.flatMap(({ slug, label }) => {
    const p = getProduct(slug);
    if (!p) return [];
    const f = getFlavour(p.flavourKey);
    return [{ ...packData(p), color: f.color, ink: f.ink, label }];
  });
  const best = bestsellers();

  const list = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Our Products",
    url: `${SITE_URL}/products`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: categories.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, url: `${SITE_URL}/categories/${c.slug}` })),
    },
  };

  return (
    <PageTransition>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(list) }} />
      <PodiumOpener
        variant="podium"
        title={copy["PRD-01"].title}
        tagline={copy["PRD-01"].tagline}
        packs={podium}
        burst="#D61610"
        shapes={["makhana-1", "chilli", "makhana-3", "popcorn", "almond", "pudina-leaf", "makhana-5", "cashew"]}
      />
      <ClaimMarquee tone="red" items={claimChips} />
      {categories.map((c, ci) => {
        const groups = flavourGroups(c.key);
        return (
          <CategoryBand
            key={c.key}
            id={`band-${c.key}`}
            name={c.name}
            href={`/categories/${c.slug}`}
            subline={c.subline}
            statement={c.statement}
            color={c.color}
            ink={c.ink}
            cta={productsCopy.products["PRD-03"].labels[c.key]}
            behind={ci === 0 ? "#D61610" : categories[ci - 1].color}
            packs={groups.slice(0, 5).map((g) => g.rep)}
            count={groups.length}
          />
        );
      })}
      <Section tone="cream" arch behind={categories[categories.length - 1].color} aria-labelledby="best-h">
        <Container>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow className="mb-3 text-red">{best.length} favourites</Eyebrow>
              <TypeIn as="h2" id="best-h" text={copy["PRD-04"].heading} className="display-type text-[length:var(--text-display)]" />
            </div>
            <Reveal>
              <ButtonLink href={copy["PRD-04"].cta.href} variant="ghost">
                {copy["PRD-04"].cta.label}
              </ButtonLink>
            </Reveal>
          </div>
          <PopGrid className="grid grid-cols-1 gap-x-5 gap-y-14 pt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {best.map((p, i) => (
              <li key={p.slug} className="min-w-0">
                <PackCard product={p} priority={i < 4} eager={false} />
              </li>
            ))}
          </PopGrid>
        </Container>
      </Section>
      <PartnerBand variant="full" behind="#FFFDF5" />
    </PageTransition>
  );
}
