import { PageTransition } from "@/components/layout/PageTransition";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { InsetOpener } from "@/components/sections/InsetOpener";
import { Statement } from "@/components/sections/Statement";
import { NumberedCard } from "@/components/sections/NumberedCard";
import { PartnerBand } from "@/components/sections/PartnerBand";
import { NameMerge } from "@/components/content/NameMerge";
import { ProcessPath } from "@/components/sections/ProcessPath";
import { QuoteBlock } from "@/components/content/QuoteBlock";
import { FounderMoment } from "@/components/content/FounderMoment";
import { ClosingStatement } from "@/components/content/ClosingStatement";
import { SectionHead } from "@/components/content/SectionHead";
import { aboutCopy } from "@/data";
import { photos } from "@/data/assets";
import { pageMetadata, jsonLd } from "@/lib/seo";

export const metadata = pageMetadata({ ...aboutCopy.seo, path: "/about" });

const a = aboutCopy.about;
const anchors = ["about-story", "about-journey", "about-mission", "about-philosophy", "founder-name"];

export default function AboutPage() {
  return (
    <PageTransition>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@type": "AboutPage", name: "About Yunch Bite", url: "https://yunchbite.com/about" }) }} />
      {/* ABOUT-01 */}
      <InsetOpener title={a["ABOUT-01"].title} eyebrow="Since 18 October 2023" image={photos.factory} />
      <Section tone="cream" aria-labelledby="about-belief" className="pt-0 md:pt-4">
        <Container size="narrow">
          <Reveal>
            <p className="mb-10 max-w-[60ch] text-[1.15rem] leading-[1.7]">{a["ABOUT-01"].intro}</p>
            <h2 id="about-belief" className="display-type text-[length:clamp(1.9rem,4.4vw,4rem)] leading-[0.98] text-maroon">
              {a["ABOUT-01"].belief}
            </h2>
            <p className="mt-8 max-w-[62ch] text-[1.15rem] leading-[1.7]">{a["ABOUT-01"].body}</p>
          </Reveal>
          <Reveal className="mt-10">
            <nav aria-label="On this page">
              <ul className="flex flex-wrap gap-2">
                {a["ABOUT-01"].jumps.map((j, i) => (
                  <li key={j}>
                    <a href={`#${anchors[i]}`} className="inline-flex h-11 items-center gap-2 rounded-pill border-2 border-ink/25 px-5 text-[0.95rem] font-bold transition-colors duration-[var(--dur-quick)] hover:border-ink hover:bg-ink hover:text-cream">
                      {j}
                      <Icon name="arrow" className="size-4 rotate-90" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>
        </Container>
      </Section>

      {/* ABOUT-02 */}
      <NameMerge {...a["ABOUT-02"].merge} eyebrow="The name" />
      <Section tone="cream" aria-labelledby="about-story">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <SectionHead id="about-story" heading={a["ABOUT-02"].heading} eyebrow="Our story" className="lg:sticky lg:top-32 lg:self-start" />
          <div className="space-y-6 text-[1.15rem] leading-[1.75]">
            {a["ABOUT-02"].paragraphs.map((p, i) => (
              <Reveal key={p} y={28}>
                <p className={i === 1 ? "display-type text-[length:clamp(1.8rem,3vw,2.8rem)] leading-none text-red" : "max-w-[60ch]"}>{p}</p>
              </Reveal>
            ))}
            <Reveal y={28}>
              <p className="max-w-[60ch] border-l-4 border-yellow pl-5 font-bold">{a["ABOUT-02"].closing}</p>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ABOUT-03 */}
      <div id="about-journey" className="scroll-mt-24">
        <ProcessPath
          title={a["ABOUT-03"].heading}
          eyebrow="Since 2023"
          steps={a["ABOUT-03"].steps.map((st, i) => ({ n: st.n, title: st.title, detail: st.detail, shape: (["makhana-1", "popcorn", "cashew"] as const)[i] }))}
        />
      </div>
      <Section tone="soft" padded={false} className="pb-[var(--section-y)]">
        <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <Reveal className="space-y-5 text-[1.15rem] leading-[1.75]">
            {a["ABOUT-03"].body.map((p) => (
              <p key={p} className="max-w-[62ch]">{p}</p>
            ))}
          </Reveal>
          <Reveal>
            <p className="display-type max-w-[26ch] text-[length:clamp(1.6rem,2.6vw,2.4rem)] leading-[1] text-maroon">{a["ABOUT-03"].objective}</p>
          </Reveal>
        </Container>
      </Section>

      {/* ABOUT-04 */}
      <div id="about-mission" className="scroll-mt-24">
        <Statement tone="cream" eyebrow={a["ABOUT-04"].heading} as="h2">
          Better snacking should be <em>delicious</em>, not boring.
        </Statement>
      </div>
      <Section tone="cream" padded={false} className="pb-[var(--section-y)]">
        <Container className="grid gap-6 md:grid-cols-2">
          {[
            { k: "Mission", head: a["ABOUT-04"].mission, body: a["ABOUT-04"].missionBody, tone: "bg-yellow text-ink" },
            { k: "Vision", head: a["ABOUT-04"].vision, body: a["ABOUT-04"].visionBody, tone: "bg-maroon text-cream" },
          ].map((c) => (
            <Reveal key={c.k} className={`rounded-card p-8 md:p-12 ${c.tone}`}>
              <Eyebrow>{c.k}</Eyebrow>
              <h3 className="display-type mt-5 text-[length:clamp(1.6rem,2.6vw,2.4rem)] leading-[1.02] normal-case">{c.head}</h3>
              <p className="mt-6 max-w-[58ch] leading-[1.7] opacity-90">{c.body}</p>
            </Reveal>
          ))}
        </Container>
        <Container className="mt-10">
          <p className="text-center text-sm font-bold uppercase tracking-[0.14em] text-maroon">{a["ABOUT-04"].signOff}</p>
        </Container>
      </Section>

      {/* ABOUT-05 */}
      <Section tone="soft" aria-labelledby="about-philosophy" id="about-philosophy-wrap">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <SectionHead id="about-philosophy" heading={a["ABOUT-05"].heading} eyebrow="How we think" />
            <Reveal className="text-[1.1rem] leading-[1.7]">
              <p className="max-w-[62ch]">{a["ABOUT-05"].intro}</p>
            </Reveal>
          </div>
          <p className="mt-16 text-sm font-bold uppercase tracking-[0.14em] text-maroon">{a["ABOUT-05"].subheading}</p>
          <Reveal as="ul" stagger={0.1} y={50} className="mt-5 grid gap-5 md:grid-cols-2">
            {a["ABOUT-05"].cards.map((c, i) => (
              <li key={c.n} className={i % 2 ? "md:translate-y-10" : ""}>
                <NumberedCard number={c.n} title={c.title} tone={(["yellow", "maroon", "red", "yellow"] as const)[i]} className="min-h-[360px]">
                  <span className="block max-w-[46ch]">{c.body}</span>
                  {"range" in c && c.range && (
                    <span className="mt-4 flex flex-wrap gap-1.5">
                      {c.range.map((r) => (
                        <Pill key={r.category} size="sm" tone="cream" className="text-ink">
                          {r.category}: {r.items.length}
                        </Pill>
                      ))}
                    </span>
                  )}
                </NumberedCard>
              </li>
            ))}
          </Reveal>
          <Reveal className="mt-24 flex flex-col gap-4 rounded-card bg-cream p-8 md:flex-row md:items-center md:gap-12 md:p-12">
            <h3 className="display-type text-[length:var(--text-h2)] md:max-w-[12ch]">{a["ABOUT-05"].everyone.title}</h3>
            <p className="max-w-[60ch] leading-[1.7]">{a["ABOUT-05"].everyone.body}</p>
          </Reveal>
        </Container>
      </Section>

      {/* ABOUT-06 */}
      <Section tone="cream" aria-labelledby="about-quality">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
          <div>
            <SectionHead id="about-quality" heading={a["ABOUT-06"].heading} lead={a["ABOUT-06"].lead} />
            <Reveal as="ul" stagger={0.07} className="mt-8 grid gap-3">
              {a["ABOUT-06"].points.map((p) => (
                <li key={p} className="flex items-center gap-4 rounded-pill border-2 border-ink/15 px-5 py-3.5 text-lg font-bold">
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-red text-cream">
                    <Icon name="check" className="size-4" />
                  </span>
                  {p}
                </li>
              ))}
            </Reveal>
          </div>
          <div className="self-center">
            <p className="mb-16 text-lg font-bold text-maroon md:mb-20">{a["ABOUT-06"].intro}</p>
            <QuoteBlock quote={a["ABOUT-06"].quote} />
          </div>
        </Container>
      </Section>

      {/* ABOUT-07 */}
      <FounderMoment eyebrow={a["ABOUT-07"].heading} name={a["ABOUT-07"].name} role={a["ABOUT-07"].role} body={a["ABOUT-07"].body} quote={a["ABOUT-07"].fallbackQuote} />

      {/* ABOUT-08 */}
      <ClosingStatement tone="red" arch behind="var(--color-maroon)" text={a["ABOUT-08"].statement} cta={a["ABOUT-08"].cta} />
      <PartnerBand variant="slim" />
    </PageTransition>
  );
}
