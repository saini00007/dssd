import { PageTransition } from "@/components/layout/PageTransition";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { TypeIn } from "@/components/motion/TypeIn";
import { PartnerBand } from "@/components/sections/PartnerBand";
import { JournalGrid } from "@/components/content/JournalGrid";
import { articleCards } from "@/components/content/article-data";
import { SectionHead } from "@/components/content/SectionHead";
import { blogCopy, reviews, reviewAggregate, SHOW_REVIEWS, site } from "@/data";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/seo";

export const metadata = pageMetadata({ ...blogCopy.seo, path: "/blogs-reviews" });

const b = blogCopy.blog;

export default function BlogsReviewsPage() {
  const cards = articleCards();
  const insta = site.social.find((s) => s.label === "Instagram")!;
  return (
    <PageTransition>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "The Yunch Journal",
            url: `${SITE_URL}/blogs-reviews`,
            blogPost: cards.map((a) => ({ "@type": "BlogPosting", headline: a.title, datePublished: a.dateISO, url: `${SITE_URL}/articles/${a.slug}` })),
          }),
        }}
      />
      {/* BLOG-01 + BLOG-02 */}
      <Section tone="cream" padded={false} className="pt-[clamp(8rem,18vh,11rem)] pb-[var(--section-y)]">
        <Container>
          <Eyebrow className="mb-5 text-red">Blogs &amp; Reviews</Eyebrow>
          <TypeIn as="h1" trigger="load" text={b["BLOG-01"].title} className="display-type block text-[length:var(--text-hero)] leading-[0.86]" />
          <p className="mb-12 mt-6 max-w-[40ch] text-[1.25rem] leading-snug text-ink/80">{b["BLOG-01"].sub}</p>
          <JournalGrid articles={cards} categories={b["BLOG-01"].categories} readMore={b["BLOG-02"].readMore} featuredLabel={b["BLOG-02"].featured} />
        </Container>
      </Section>

      {/* BLOG-03 newsletter: no email service is configured, so nothing is rendered. */}

      {/* BLOG-04 reviews: only when the client confirms they are real. */}
      {SHOW_REVIEWS && (
        <Section tone="soft" aria-labelledby="blog-reviews">
          <Container>
            <SectionHead id="blog-reviews" heading={b["BLOG-04"].heading} lead={`${reviewAggregate.average} · ${b["BLOG-04"].basis}`} />
            <ul className="mt-12 grid gap-5 md:grid-cols-3">
              {reviews.map((r) => (
                <li key={r.name} className="rounded-card bg-cream p-7">
                  <h3 className="display-type text-[length:var(--text-h3)]">{r.title}</h3>
                  <p className="mt-3 text-ink/85">{r.body}</p>
                  <p className="mt-5 text-sm font-bold">{r.name}</p>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {/* BLOG-05 community */}
      <Section tone="red" arch behind="var(--color-cream)" aria-labelledby="blog-community">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <Eyebrow className="mb-4">{site.hashtag}</Eyebrow>
            <TypeIn as="h2" id="blog-community" text={b["BLOG-05"].heading} className="display-type block text-[length:var(--text-display)] leading-[0.92]" />
            <Reveal className="mt-6">
              <p className="max-w-[44ch] text-[1.2rem] leading-snug">{b["BLOG-05"].sub}</p>
            </Reveal>
          </div>
          <Reveal>
            <a href={insta.href} target="_blank" rel="noopener noreferrer" className="group/ig flex items-center gap-6 rounded-card bg-cream p-8 text-ink transition-[transform,background-color] duration-[var(--dur-pop)] ease-[var(--ease-crunch)] hover:-translate-y-1.5 hover:bg-yellow">
              <span aria-hidden="true" className="grid size-20 shrink-0 place-items-center rounded-full bg-red text-cream">
                <Icon name="instagram" className="size-10" />
              </span>
              <span>
                <span className="display-type block text-[length:var(--text-h3)]">Follow {insta.handle}</span>
                <span className="mt-1 flex items-center gap-2 text-ink/80">
                  Open Instagram <span className="sr-only">(opens in a new tab)</span>
                  <Icon name="arrow" className="size-5 transition-transform group-hover/ig:translate-x-1.5" />
                </span>
              </span>
            </a>
          </Reveal>
        </Container>
      </Section>
      <PartnerBand variant="slim" />
    </PageTransition>
  );
}
