import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/PageTransition";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TypeIn } from "@/components/motion/TypeIn";
import { PackCard } from "@/components/product/PackCard";
import { PartnerBand } from "@/components/sections/PartnerBand";
import { PdpFlight } from "@/components/pdp/PdpFlight";
import { ProductHero } from "@/components/pdp/ProductHero";
import { FormatSwitch } from "@/components/pdp/FormatSwitch";
import { DataCards } from "@/components/pdp/DataCards";
import { TasteProfile } from "@/components/pdp/TasteProfile";
import { ClaimIcons } from "@/components/pdp/ClaimIcons";
import { emphasizeAllergens } from "@/components/pdp/emphasize";
import { PopGrid } from "@/components/products/PopGrid";
import { FORMAT_ORDER, compactSizes } from "@/components/products/groups";
import { getProduct, products, relatedProducts, siblingFormats } from "@/data/products";
import { getFlavour } from "@/data/flavours";
import { getCategory } from "@/data/categories";
import { productsCopy } from "@/data/copy";
import { pageMetadata, jsonLd, SITE_URL, defaultOgImage } from "@/lib/seo";
import { packSrc } from "@/lib/media";

// Unknown slugs must be a real 404, so this route is allowed to block (params are awaited outside <Suspense>).
export const instant = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

function ogImage(p: NonNullable<ReturnType<typeof getProduct>>) {
  const pack = packSrc(p);
  if (pack.placeholder) return defaultOgImage();
  return { url: pack.src, width: pack.width, height: pack.height, alt: `${p.name} ${p.formatLabel} pack` };
}

export async function generateMetadata(props: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = getProduct(slug);
  if (!p) return {};
  return pageMetadata({ title: p.metaTitle, description: p.metaDescription, path: `/products/${p.slug}`, image: ogImage(p) });
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const p = getProduct(slug);
  if (!p) notFound();
  const f = getFlavour(p.flavourKey);
  const category = getCategory(p.category)!;
  const copy = productsCopy.pdp;
  const formats = [p, ...siblingFormats(p)].sort((a, b) => FORMAT_ORDER.indexOf(a.format) - FORMAT_ORDER.indexOf(b.format));
  const related = relatedProducts(p, 6);

  const pack = packSrc(p);
  const image = pack.placeholder ? defaultOgImage().url : pack.src;
  const abs = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u}`);
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/products/${p.slug}#product`,
    name: `${p.name} (${p.formatLabel})`,
    description: p.description,
    image: [abs(image)],
    sku: p.slug,
    url: `${SITE_URL}/products/${p.slug}`,
    category: category.name,
    brand: { "@type": "Brand", name: "Yunch Bite" },
    countryOfOrigin: { "@type": "Country", name: "India" },
    // No aggregateRating / review: SHOW_REVIEWS is false and the ratings are not verified.
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: copy.breadcrumbRoot, item: `${SITE_URL}/products` },
      { "@type": "ListItem", position: 3, name: category.name, item: `${SITE_URL}/categories/${category.slug}` },
      { "@type": "ListItem", position: 4, name: p.name, item: `${SITE_URL}/products/${p.slug}` },
    ],
  };

  return (
    <PageTransition>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(product) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbs) }} />
      <PdpFlight>
        <ProductHero product={p} flavour={f} category={category} copy={{ bestsellerBadge: copy.bestsellerBadge, ratingLabel: copy.ratingLabel, breadcrumbRoot: copy.breadcrumbRoot, sizesLabel: copy["PDP-02"].sizesLabel }} />
        <FormatSwitch
          heading={copy["PDP-02"].heading}
          sizesLabel={copy["PDP-02"].sizesLabel}
          color={f.color}
          ink={f.ink}
          options={formats.map((x) => ({ slug: x.slug, label: x.formatLabel, sizes: compactSizes(x.sizes), current: x.slug === p.slug }))}
        />
        <DataCards
          heading={copy["PDP-05"].heading}
          tabLabels={copy["PDP-05"].tabs}
          servingLabel={copy["PDP-05"].servingLabel}
          factLabels={{ sizes: copy["PDP-02"].sizesLabel, ...copy["PDP-05"].factsLabels }}
          ingredients={emphasizeAllergens(p.ingredients, p.allergens)}
          allergens={emphasizeAllergens(p.allergens, p.allergens)}
          allergenNote="Always check the pack label for the latest allergen information."
          nutrition={p.nutrition}
          facts={{ sizes: p.sizes.join(" · "), shelfLife: p.shelfLife, storage: p.storage, origin: p.origin }}
          flavourColor={f.color}
          ingredient={f.ingredient}
        />
        <TasteProfile
          heading={copy["PDP-03"].heading}
          pairsHeading={copy["PDP-03"].pairsHeading}
          scale={copy["PDP-03"].scale}
          meters={copy["PDP-03"].meters}
          taste={f.taste}
          pairsWith={f.pairsWith}
          color={f.color}
          ink={f.ink}
        />
        <ClaimIcons />
        <Section tone="cream" aria-labelledby="pdp-more-h">
          <Container>
            <Eyebrow className="mb-3 text-red">{category.name}</Eyebrow>
            <TypeIn as="h2" id="pdp-more-h" text={copy["PDP-06"].heading} className="display-type mb-12 text-[length:var(--text-display)] leading-[0.9]" />
            <PopGrid className="grid grid-cols-1 gap-x-5 gap-y-14 pt-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug} className="min-w-0">
                  <PackCard product={r} eager={false} />
                </li>
              ))}
            </PopGrid>
          </Container>
        </Section>
      </PdpFlight>
      <PartnerBand variant="slim" />
    </PageTransition>
  );
}
