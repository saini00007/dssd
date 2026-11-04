import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageTransition } from "@/components/layout/PageTransition";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Pill } from "@/components/ui/Pill";
import { Icon } from "@/components/ui/Icon";
import { TypeIn } from "@/components/motion/TypeIn";
import { Reveal } from "@/components/motion/Reveal";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PartnerBand } from "@/components/sections/PartnerBand";
import { ArticleCard } from "@/components/content/ArticleCard";
import { ArticleHero } from "@/components/content/ArticleHero";
import { Prose } from "@/components/content/Prose";
import { ReadProgress } from "@/components/content/ReadProgress";
import { articleImage, formatDate, toCard } from "@/components/content/article-data";
import { articles, getArticle, moreArticles, site, blogCopy } from "@/data";
import { jsonLd, pageMetadata, SITE_URL } from "@/lib/seo";

// `dynamicParams = false` is rejected by cacheComponents; unknown slugs hit notFound() below, so the route may block on params.
export const instant = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(props: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const a = getArticle(slug);
  if (!a) return {};
  const img = articleImage(a);
  return pageMetadata({
    title: a.metaTitle,
    description: a.metaDescription,
    path: `/articles/${a.slug}`,
    type: "article",
    publishedTime: a.date,
    image: { url: img.src, width: img.width, height: img.height, alt: img.alt },
  });
}

const initials = (n: string) => n.split(" ").filter((w) => /^[A-Za-z]/.test(w) && w !== "Dr.").slice(0, 2).map((w) => w[0]).join("");

export default async function ArticlePage(props: PageProps<"/articles/[slug]">) {
  const { slug } = await props.params;
  const a = getArticle(slug);
  if (!a) notFound();
  const copy = blogCopy.article;
  const img = articleImage(a);
  const url = `${SITE_URL}/articles/${a.slug}`;
  const more = moreArticles(a, 3).map(toCard);

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.title,
      description: a.metaDescription,
      image: [`${SITE_URL}${img.src}`],
      datePublished: a.date,
      dateModified: a.date,
      articleSection: a.category,
      author: { "@type": "Person", name: a.author.name, jobTitle: a.author.role },
      publisher: { "@type": "Organization", name: site.name, url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/logo.png` } },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: copy.breadcrumbRoot, item: `${SITE_URL}/blogs-reviews` },
        { "@type": "ListItem", position: 3, name: a.title, item: url },
      ],
    },
  ];

  return (
    <PageTransition>
      {ld.map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(o) }} />
      ))}
      <ReadProgress>
        {/* ART-01 */}
        <Section tone="cream" padded={false} className="pt-[clamp(7.5rem,16vh,10rem)] pb-10 md:pb-14">
          <Container size="narrow" className="max-w-[1280px]">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-ink/75">
                <li>
                  <TransitionLink href="/" className="underline-offset-4 hover:underline">Home</TransitionLink>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <TransitionLink href="/blogs-reviews" className="underline-offset-4 hover:underline">{copy.breadcrumbRoot}</TransitionLink>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="max-w-[28ch] truncate font-semibold text-ink">{a.title}</li>
              </ol>
            </nav>
            <Pill tone="red" className="mt-8">{a.category}</Pill>
            <TypeIn as="h1" trigger="load" text={a.title} className="display-type mt-5 block text-[length:clamp(2.6rem,6.6vw,6.2rem)] leading-[0.9]" />
            <Reveal className="mt-8" y={20}>
              <p className="max-w-[44ch] text-[length:clamp(1.25rem,2vw,1.6rem)] leading-snug text-ink/85">{a.lead}</p>
              <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-t-2 border-ink/10 pt-6 text-sm">
                <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-maroon text-base font-black text-cream">{initials(a.author.name)}</span>
                <span>
                  <span className="block font-bold">{a.author.name}</span>
                  <span className="block text-ink/70">{a.author.role}</span>
                </span>
                <span aria-hidden="true" className="hidden h-8 w-px bg-ink/20 sm:block" />
                <time dateTime={a.date} className="text-ink/80">{formatDate(a.date)}</time>
                <span aria-hidden="true">·</span>
                <span className="text-ink/80">{a.readTime}</span>
              </p>
            </Reveal>
          </Container>
        </Section>

        {/* ART-03 */}
        <ArticleHero src={img.src} alt={img.alt} width={img.width} height={img.height} />

        {/* ART-04 */}
        <article className="pb-[clamp(4rem,9vw,7rem)] pt-[clamp(3rem,6vw,5rem)]">
          <Prose blocks={a.body} tryIt={copy.productCardLabel} />
        </article>
      </ReadProgress>

      {/* ART-05 */}
      <Section tone="soft" arch behind="var(--color-cream)" aria-labelledby="art-more">
        <Container>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 id="art-more" className="display-type text-[length:var(--text-h2)] leading-none">{copy.more.heading}</h2>
            <ButtonLink href={copy.more.viewAll.href} variant="ghost" size="sm">{copy.more.viewAll.label}</ButtonLink>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {more.map((m) => (
              <ArticleCard key={m.slug} article={m} readMore={blogCopy.blog["BLOG-02"].readMore} />
            ))}
          </div>
          <p className="mt-12">
            <TransitionLink href={copy.back.href} direction="back" className="inline-flex items-center gap-2 font-bold text-red underline-offset-4 hover:underline">
              <Icon name="arrow-left" className="size-5" />
              {copy.back.label}
            </TransitionLink>
          </p>
        </Container>
      </Section>
      <PartnerBand variant="slim" />
    </PageTransition>
  );
}
