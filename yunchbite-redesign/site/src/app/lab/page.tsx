import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/PageTransition";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Pill } from "@/components/ui/Pill";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { OutlineHeading } from "@/components/ui/OutlineHeading";
import { Icon, type IconName } from "@/components/ui/Icon";
import { VegMark } from "@/components/ui/VegMark";
import { TypeIn } from "@/components/motion/TypeIn";
import { Reveal } from "@/components/motion/Reveal";
import { Pop } from "@/components/motion/Pop";
import { PackCard } from "@/components/product/PackCard";
import { ClaimMarquee } from "@/components/sections/ClaimMarquee";
import { InsetOpener } from "@/components/sections/InsetOpener";
import { Statement } from "@/components/sections/Statement";
import { NumberedCard } from "@/components/sections/NumberedCard";
import { PartnerBand } from "@/components/sections/PartnerBand";
import { products } from "@/data/products";
import { flavours } from "@/data/flavours";
import { categories } from "@/data/categories";
import { BuddyDemo, CursorDemo, FaqDemo, FilterDemo, OpenMenuButton, RingBurstDemo } from "./LabClient";

export const metadata: Metadata = {
  title: "Lab",
  description: "Internal gallery of the Yunch Bite foundation components.",
  robots: { index: false, follow: false },
};

const ICONS: IconName[] = ["arrow", "arrow-left", "plus", "close", "instagram", "facebook", "linkedin", "mail", "phone", "pin", "leaf", "olive", "no-palm", "no-preservative", "protein", "gluten-free", "veg-mark", "star", "check"];

function Block({ title, children, tone }: { title: string; children: React.ReactNode; tone?: "dark" }) {
  return (
    <div className="border-t border-current/15 py-10">
      <p className={`mb-6 text-xs font-bold uppercase tracking-[0.18em] ${tone === "dark" ? "text-yellow" : "text-red"}`}>{title}</p>
      {children}
    </div>
  );
}

export default function LabPage() {
  // One product per distinct flavour for the card grid.
  const seen = new Set<string>();
  const sample = products.filter((p) => (seen.has(p.flavourKey) ? false : (seen.add(p.flavourKey), true))).slice(0, 8);
  const makhana = Object.values(flavours).filter((f) => f.category === "makhana");
  const faq = categories[0].faq;

  return (
    <PageTransition>
      <InsetOpener
        eyebrow="Foundation"
        title="The Lab"
        subtitle="Every primitive and shared component, on one page. Scroll to grow the image; scroll up to bring the header back."
        image={{ src: "/photos/about-hero.webp", alt: "Yunch Bite makhana, close up" }}
      />

      <Section tone="cream">
        <Container>
          <Eyebrow className="mb-4 text-red">Primitives</Eyebrow>

          <Block title="TypeIn (scroll) / Reveal / Pop">
            <TypeIn as="h2" text="Slow-roasted in olive oil. All crunch." className="display-type text-[length:var(--text-display)]" />
            <Reveal className="mt-6 max-w-[56ch]">
              <p>This paragraph fades and slides up when it reaches 80% of the viewport. The full text is in the HTML before any script runs.</p>
            </Reveal>
            <Reveal stagger={0.08} className="mt-6 flex flex-wrap gap-3">
              <Pill tone="red">Reveal</Pill>
              <Pill tone="yellow">staggered</Pill>
              <Pill tone="ink">children</Pill>
              <Pill tone="outline">one by one</Pill>
            </Reveal>
            <div className="mt-8 flex gap-4">
              <Pop>
                <div className="grid size-24 place-items-center rounded-full bg-red font-bold text-cream">Pop</div>
              </Pop>
              <Pop delay={0.12}>
                <div className="grid size-24 place-items-center rounded-full bg-yellow font-bold">Pop</div>
              </Pop>
            </div>
          </Block>

          <Block title="RingBurst">
            <RingBurstDemo />
          </Block>

          <Block title="OutlineHeading">
            <OutlineHeading text="Choose your crunch" className="text-red" />
            <OutlineHeading text="Why Yunch bite" solid="Yunch" className="mt-4 text-maroon" />
          </Block>

          <Block title="ButtonLink (solid / ghost / cream / yellow) and sizes">
            <div className="flex flex-wrap items-center gap-4">
              <ButtonLink href="/lab" variant="solid">
                Solid
              </ButtonLink>
              <ButtonLink href="/lab" variant="ghost">
                Ghost
              </ButtonLink>
              <span className="rounded-pill bg-red p-3">
                <ButtonLink href="/lab" variant="cream">
                  Cream
                </ButtonLink>
              </span>
              <ButtonLink href="/lab" variant="yellow" size="lg">
                Yellow large
              </ButtonLink>
              <ButtonLink href="/lab" variant="solid" size="sm" arrow={false}>
                Small
              </ButtonLink>
            </div>
          </Block>

          <Block title="Pill / Chip / Eyebrow / VegMark">
            <div className="flex flex-wrap items-center gap-3">
              <Pill>Outline</Pill>
              <Pill tone="cream" className="border-ink/20">
                Cream
              </Pill>
              <Pill tone="red">Red</Pill>
              <Pill tone="yellow">Yellow</Pill>
              <Pill tone="ink">Ink</Pill>
              <Pill tone="flavour" style={{ ["--flavour" as string]: "#4E9B40", ["--flavour-ink" as string]: "#2A1210" }}>
                Pudina
              </Pill>
              <Pill size="sm">Zipper Pouch</Pill>
              <VegMark />
              <Eyebrow>Eyebrow label</Eyebrow>
            </div>
          </Block>

          <Block title="Icons">
            <ul className="flex flex-wrap gap-5">
              {ICONS.map((n) => (
                <li key={n} className="flex w-16 flex-col items-center gap-2 text-xs">
                  <Icon name={n} className="size-8" />
                  {n}
                </li>
              ))}
            </ul>
          </Block>

          <Block title="FilterPills (controlled)">
            <FilterDemo />
          </Block>

          <Block title="Menu and cursor label">
            <div className="grid gap-6 md:grid-cols-2">
              <OpenMenuButton />
              <CursorDemo />
            </div>
          </Block>

          <Block title="PillFaq">
            <FaqDemo items={faq} />
          </Block>
        </Container>
      </Section>

      <ClaimMarquee />

      <Statement tone="cream" eyebrow="Statement">
        Roasted in <em>olive oil</em>. Never fried. Never boring.
      </Statement>

      <Section tone="soft">
        <Container>
          <Eyebrow className="mb-8 text-red">NumberedCard</Eyebrow>
          <div className="grid gap-5 md:grid-cols-3">
            <NumberedCard number="01" title="Why prefer Yunch Bite?" href="/why-yunch-bite" tone="cream">
              Roasted in olive oil, zero palm oil, no preservatives.
            </NumberedCard>
            <NumberedCard number="02" title="Benefits" href="/benefits" tone="yellow">
              High in protein and fibre. Gluten-free and 100% vegetarian.
            </NumberedCard>
            <NumberedCard number="03" title="Ingredients and quality" href="/ingredients-quality" tone="red">
              Hand-picked makhana from the ponds of Bihar.
            </NumberedCard>
          </div>
        </Container>
      </Section>

      <Section tone="cream">
        <Container>
          <Eyebrow className="mb-8 text-red">PackCard</Eyebrow>
          <ul className="grid grid-cols-1 gap-x-5 gap-y-14 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {sample.map((p, i) => (
              <li key={p.slug}>
                <PackCard product={p} priority={i < 4} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="maroon">
        <Container>
          <Eyebrow className="mb-8 text-yellow">FlavourBuddy</Eyebrow>
          <BuddyDemo flavours={makhana} />
        </Container>
      </Section>

      <PartnerBand behind="var(--color-maroon)" />
      <PartnerBand variant="slim" />
    </PageTransition>
  );
}
