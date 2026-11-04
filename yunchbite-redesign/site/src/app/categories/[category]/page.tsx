import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/PageTransition";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TypeIn } from "@/components/motion/TypeIn";
import { Reveal } from "@/components/motion/Reveal";
import { PillFaq } from "@/components/sections/PillFaq";
import { Statement } from "@/components/sections/Statement";
import { PackCarousel } from "@/components/category/PackCarousel";
import { FlavourGrid } from "@/components/category/FlavourGrid";
import { CategoryCard } from "@/components/category/CategoryCard";
import { FORMAT_ORDER, flavourGroups } from "@/components/products/groups";
import { categories, getCategory } from "@/data/categories";
import { productsCopy } from "@/data/copy";
import { productsByCategory } from "@/data/products";
import type { CategoryKey, ShapeName } from "@/data/types";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/seo";

// Unknown categories must be a real 404, so this route is allowed to block (params are awaited outside <Suspense>).
export const instant = false;

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata(props: PageProps<"/categories/[category]">): Promise<Metadata> {
  const { category } = await props.params;
  const c = getCategory(category);
  if (!c) return {};
  return pageMetadata({ title: c.metaTitle, description: c.metaDescription, path: `/categories/${c.slug}` });
}

const SHAPES: Record<CategoryKey, ShapeName[]> = {
  makhana: ["makhana-1", "chilli", "makhana-3", "pudina-leaf", "makhana-5", "pepper", "makhana-2", "olive"],
  popcorn: ["popcorn", "butter", "pudina-leaf", "salt", "popcorn", "olive", "popcorn", "oil-drop"],
  "dry-fruits": ["almond", "cashew", "almond", "olive", "cashew", "oil-drop", "almond", "cashew"],
};

const FILTER_ORDER: Record<string, number> = Object.fromEntries(FORMAT_ORDER.map((f, i) => [f, i]));

export default async function CategoryPage(props: PageProps<"/categories/[category]">) {
  const { category: slug } = await props.params;
  const c = getCategory(slug);
  if (!c) notFound();
  const groups = flavourGroups(c.key);
  const copy = productsCopy.category;

  // Filter pills: as in the copy deck, ordered Pillow, Zipper, Jar, Raw for formats; only options that match something.
  const filterLabels = (copy.filters[c.key] as string[]).filter((l) => l !== "All");
  const filters = filterLabels
    .map((label) => ({ tag: label.toLowerCase(), label }))
    .sort((a, b) => (FILTER_ORDER[a.tag] ?? 99) - (FILTER_ORDER[b.tag] ?? 99));

  const others = categories.filter((x) => x.key !== c.key);
  const idx = c.statement.toLowerCase().indexOf("olive oil");
  const statement =
    idx >= 0 ? (
      <>
        {c.statement.slice(0, idx)}
        <em>{c.statement.slice(idx, idx + 9)}</em>
        {c.statement.slice(idx + 9)}
      </>
    ) : (
      c.statement
    );

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const listLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${c.name} | Yunch Bite`,
    url: `${SITE_URL}/categories/${c.slug}`,
    description: c.metaDescription,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: productsByCategory(c.key).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/products/${p.slug}`, name: `${p.name} (${p.formatLabel})` })),
    },
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/products` },
      { "@type": "ListItem", position: 3, name: c.name, item: `${SITE_URL}/categories/${c.slug}` },
    ],
  };

  return (
    <PageTransition>
      {[faqLd, listLd, crumbs].map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(d) }} />
      ))}

      <section className="relative overflow-hidden bg-cream-2 pb-[clamp(2.5rem,5vw,4.5rem)] pt-[calc(var(--header-h)+clamp(0.5rem,2vh,1.5rem))] text-ink" data-header-theme="light" aria-label={c.name}>
        <Container className="relative z-10 text-center">
          <Eyebrow className="mb-3 text-red">{c.name}</Eyebrow>
          <TypeIn as="h1" text={c.title} trigger="load" className="display-type mx-auto block max-w-[22ch] text-[length:clamp(2.2rem,5.2vw,4.9rem)] leading-[0.9]" />
          <Reveal delay={0.2}>
            <p className="mt-3 text-[length:clamp(1rem,1.5vw,1.3rem)] font-semibold text-ink/80">{c.subline}</p>
          </Reveal>
        </Container>
        <div className="relative mt-[clamp(0.5rem,2vh,1.5rem)]">
          <PackCarousel
            items={groups}
            color={c.color}
            ink={c.ink}
            ringText="YUNCHY · CRUNCHY · HEALTHY BITE"
            labels={{ prev: "Previous flavour", next: "Next flavour", region: `${c.name} flavours`, view: "View flavour", hint: "Drag, scroll sideways or use the arrows", formats: "Formats" }}
          />
        </div>
      </section>

      <Section tone="cream" arch behind="#FBEFD9" aria-labelledby="cat-grid-h">
        <Container>
          <Eyebrow className="mb-3 text-red">{groups.length} flavours</Eyebrow>
          <TypeIn as="h2" id="cat-grid-h" text={`${c.name} flavours`} className="display-type text-[length:var(--text-display)] leading-[0.9]" />
          <div className="mt-10">
            <FlavourGrid groups={groups} filters={filters} filterLabel="Filter by format" countLabel="flavours shown" />
          </div>
        </Container>
      </Section>

      <Statement tone="soft" shapes={SHAPES[c.key]} as="h2">
        {statement}
      </Statement>

      <Section tone="maroon" aria-labelledby="cat-faq-h">
        <Container>
          <TypeIn as="h2" id="cat-faq-h" text={copy["CAT-04"].heading} className="display-type mb-10 text-[length:var(--text-display)] leading-[0.9]" />
          <PillFaq items={c.faq} tone="dark" />
        </Container>
      </Section>

      <Section tone="cream" arch behind="#8B1313" aria-labelledby="cat-more-h">
        <Container>
          <TypeIn as="h2" id="cat-more-h" text={copy["CAT-05"].heading} className="display-type mb-10 text-[length:var(--text-display)] leading-[0.9]" />
          <Reveal stagger={0.12} className="grid gap-5 md:grid-cols-2">
            {others.map((o) => {
              const g = flavourGroups(o.key);
              return <CategoryCard key={o.key} name={o.name} subline={o.subline} href={`/categories/${o.slug}`} color={o.color} ink={o.ink} packs={g.slice(0, 2).map((x) => x.rep)} count={g.length} />;
            })}
          </Reveal>
        </Container>
      </Section>
    </PageTransition>
  );
}
