import { claims, type ClaimIcon } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Icon, type IconName } from "@/components/ui/Icon";
import { PopGrid } from "@/components/products/PopGrid";

const ICONS: Record<ClaimIcon, IconName[]> = {
  olive: ["olive"],
  "no-palm": ["no-palm"],
  "no-preservatives": ["no-preservative"],
  protein: ["protein"],
  "veg-gluten": ["veg-mark", "gluten-free"],
};

/** PDP-04: claim icons row (icons pop in, staggered). */
export function ClaimIcons() {
  return (
    <Section tone="soft" padded={false} className="py-[clamp(3rem,6vw,5rem)]" aria-label="Why Yunch Bite">
      <Container>
        <PopGrid className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-5" from={0.5}>
          {claims.map((c) => (
            <li key={c.key} className="flex flex-col items-center text-center">
              <span className="mb-4 grid size-[84px] place-items-center rounded-full bg-cream text-red shadow-[var(--shadow-pill)]">
                <span className="flex items-center gap-1">
                  {ICONS[c.icon].map((n) => (
                    <Icon key={n} name={n} className={ICONS[c.icon].length > 1 ? "size-7" : "size-9"} />
                  ))}
                </span>
              </span>
              <p className="display-type text-[length:clamp(1.05rem,1.5vw,1.3rem)] leading-[1.02]">{c.label}</p>
              <p className="mt-2 max-w-[26ch] text-sm text-ink/75">{c.detail}</p>
            </li>
          ))}
        </PopGrid>
      </Container>
    </Section>
  );
}
