"use client";
import { useRef, type CSSProperties } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { deferIn } from "@/components/motion/entrance";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TypeIn } from "@/components/motion/TypeIn";
import type { ClaimIcon } from "@/data/site";
import type { ShapeName } from "@/data/types";
import { shapeSrc } from "@/lib/media";
import { mq } from "@/lib/tokens";
import { cn } from "@/lib/cn";

/**
 * ClaimStack (P05 = R1-C5): the claims as cards that rise tilted (-4deg), straighten, and stack into tabs; paper-cut
 * cut-outs at 3 depths parallax around them (the nearest are blurred). Shared by Home (HOME-04) and Benefits.
 *
 * Props:
 *  - `items`    `ClaimStackItem[]` (`site.claims` works as is): `{ key, label, detail, icon }`; `icon` is a claim icon
 *               key ("olive", "no-palm", "no-preservatives", "protein", "veg-gluten") or ANY foundation `IconName`
 *               ("leaf", "check", "star", ...). Works with 5-7+ cards: tab height and scroll length adapt (pin stays <= 1.7 viewports).
 *  - `title`    section heading (h2), `eyebrow?` small label above it, `id?`
 *  - `shapes`   paper-cut `ShapeName[]` for the depth layers (default: olive, makhana, chilli, pudina ...)
 *  - `tone`     "maroon" (default) | "red" | "cream" | "yellow": section colour
 *  - `counterLabel` aria-hidden "01 / 05" counter on/off (default true)
 *
 * Motion: pinned for 1.7 viewports (md+ and no reduced motion), scrubbed. Everything else (touch/mobile,
 * reduced motion): a plain list of cards, no pin, no spacer.
 */
export interface ClaimStackItem {
  key: string;
  label: string;
  detail: string;
  icon: ClaimIcon | IconName;
}
export interface ClaimStackProps {
  items: ClaimStackItem[];
  title: string;
  eyebrow?: string;
  shapes?: ShapeName[];
  tone?: "maroon" | "red" | "cream" | "yellow";
  id?: string;
  counter?: boolean;
  className?: string;
}

const ICONS: Record<string, IconName> = {
  olive: "olive",
  "no-palm": "no-palm",
  "no-preservatives": "no-preservative",
  protein: "protein",
  "veg-gluten": "gluten-free",
};

const CARD_TONES = [
  "bg-cream text-ink [--chip:var(--color-red)] [--chip-ink:var(--color-cream)]",
  "bg-yellow text-ink [--chip:var(--color-ink)] [--chip-ink:var(--color-yellow)]",
  "bg-makhana text-maroon-deep [--chip:var(--color-maroon)] [--chip-ink:var(--color-makhana)]",
  "bg-red text-cream [--chip:var(--color-cream)] [--chip-ink:var(--color-red)]",
  "bg-cream-2 text-ink [--chip:var(--color-maroon)] [--chip-ink:var(--color-cream)]",
];

const SECTION_TONES = {
  maroon: "bg-maroon text-cream on-dark",
  red: "bg-red text-cream on-dark",
  cream: "bg-cream text-ink",
  yellow: "bg-yellow text-ink",
} as const;

// depth 0 far (small, faint, slow) · 1 mid · 2 near (big, blurred, fast). Positions in % of the section.
const SLOTS: { l: number; t: number; w: number; r: number; d: 0 | 1 | 2 }[] = [
  { l: 4, t: 12, w: 5, r: -14, d: 0 },
  { l: 39, t: 5, w: 4.5, r: 20, d: 0 },
  { l: 93, t: 84, w: 5, r: 30, d: 0 },
  { l: 8, t: 82, w: 8, r: 24, d: 1 },
  { l: 31, t: 88, w: 7, r: -18, d: 1 },
  { l: 22, t: 6, w: 8.5, r: 14, d: 1 },
  { l: -8, t: 30, w: 12, r: -22, d: 2 },
  { l: 96, t: 52, w: 12, r: 16, d: 2 },
  { l: -6, t: 70, w: 10, r: -10, d: 2 },
  { l: 44, t: 90, w: 7, r: 8, d: 1 },
];
const DEPTH = [
  { y: 50, op: 0.55, blur: 0, z: 0 },
  { y: 130, op: 0.95, blur: 0, z: 1 },
  { y: 260, op: 1, blur: 7, z: 30 },
];

const DEFAULT_SHAPES: ShapeName[] = ["olive", "makhana-1", "chilli", "pudina-leaf", "makhana-3", "oil-drop", "pepper", "makhana-5", "salt", "makhana-2"];

export function ClaimStack({ items, title, eyebrow, shapes = DEFAULT_SHAPES, tone = "maroon", id, counter = true, className }: ClaimStackProps) {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const count = items.length;

  useGSAP(
    () => {
      const el = root.current;
      const pinEl = pin.current;
      if (!el || !pinEl) return;
      const mm = gsap.matchMedia();
      mm.add(`(min-width: 768px) and ${mq.motion}`, (_c, safe) => {
        const off = deferIn(safe, () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", el);
        const dims = gsap.utils.toArray<HTMLElement>("[data-dim]", el);
        const shapesEls = gsap.utils.toArray<HTMLElement>("[data-depth]", el);
        const counterEl = el.querySelector<HTMLElement>("[data-count]");
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: pinEl,
            start: "top top",
            end: `+=${Math.min(170, count * 34)}%`,
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (!counterEl) return;
              const i = Math.min(count, Math.floor(self.progress * count * 0.999) + 1);
              if (counterEl.dataset.i !== String(i)) {
                counterEl.dataset.i = String(i);
                counterEl.textContent = `${String(i).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
              }
            },
          },
        });
        cards.forEach((c, i) => {
          tl.fromTo(c, { y: () => window.innerHeight * 0.95, rotation: -4 }, { y: 0, rotation: 0, duration: 1 }, i);
          if (i > 0) {
            tl.to(dims[i - 1], { opacity: 0.16, duration: 1 }, i);
            tl.to(cards[i - 1], { scale: 0.975, duration: 1 }, i);
          }
        });
        shapesEls.forEach((s) => {
          const d = Number(s.dataset.dy);
          tl.fromTo(s, { y: d }, { y: -d, rotation: `+=${Number(s.dataset.spin)}`, ease: "none", duration: count }, 0);
        });
        tl.to({}, { duration: 0.35 }); // short hold on the finished stack
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
        });
        return () => off();
      });
    },
    { scope: root, dependencies: [count] },
  );

  return (
    <section ref={root} id={id} aria-labelledby={`${id ?? "claims"}-title`} className={cn("relative overflow-clip", SECTION_TONES[tone], className)} data-header-theme={tone === "maroon" || tone === "red" ? "dark" : "light"}>
      <div ref={pin} className="relative py-section motion-safe:md:flex motion-safe:md:h-svh motion-safe:md:items-center motion-safe:md:py-0">
        {/* depth layers */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden motion-safe:md:block">
          {shapes.slice(0, SLOTS.length).map((name, i) => {
            const s = SLOTS[i];
            const dp = DEPTH[s.d];
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${name}-${i}`}
                data-depth={s.d}
                data-dy={dp.y}
                data-spin={s.r > 0 ? 18 : -18}
                src={shapeSrc(name)}
                alt=""
                width={160}
                height={160}
                loading="lazy"
                draggable={false}
                className="absolute h-auto select-none"
                style={{ left: `${s.l}%`, top: `${s.t}%`, width: `${s.w}vw`, rotate: `${s.r}deg`, opacity: dp.op, zIndex: dp.z, filter: dp.blur ? `blur(${dp.blur}px)` : undefined } as CSSProperties}
              />
            );
          })}
        </div>

        <Container className="relative z-10 grid gap-10 pt-[calc(var(--header-h)*0.4)] motion-safe:md:grid-cols-[0.78fr_1.22fr] motion-safe:md:items-center motion-safe:md:gap-8 lg:gap-16">
          <div className="max-w-[26rem]">
            {eyebrow && <Eyebrow className="mb-4 text-yellow">{eyebrow}</Eyebrow>}
            <TypeIn as="h2" id={`${id ?? "claims"}-title`} text={title} className="display-type text-[length:clamp(2.4rem,4.6vw,4.75rem)] leading-[0.94]" />
            {counter && (
              <p aria-hidden="true" data-count="" data-i="1" className="tabular mt-6 hidden text-sm font-bold tracking-[0.18em] opacity-80 motion-safe:md:block">
                {`01 / ${String(count).padStart(2, "0")}`}
              </p>
            )}
          </div>

          <ol
            className="relative flex list-none flex-col gap-4 motion-safe:md:block motion-safe:md:gap-0"
            style={
              {
                "--tab": `calc(clamp(56px, 6.4vw, 84px) * ${Math.min(1, 5.5 / count).toFixed(3)})`,
                "--ch": count > 5 ? "clamp(270px, 27vw, 370px)" : "clamp(300px, 31vw, 420px)",
                "--n": count,
              } as CSSProperties
            }
          >
            {/* the pinned stack needs a fixed height; set through a class so the list layout stays natural */}
            <li aria-hidden="true" className="hidden motion-safe:md:block" style={{ height: "calc(var(--tab) * (var(--n) - 1) + var(--ch))" }} />
            {items.map((c, i) => (
              <li
                key={c.key}
                data-card=""
                className={cn(
                  "relative isolate flex min-h-[220px] flex-col overflow-hidden rounded-card shadow-[0_-10px_30px_-12px_rgb(42_18_16/0.45)]",
                  "motion-safe:md:absolute motion-safe:md:inset-x-0 motion-safe:md:top-[var(--top)] motion-safe:md:h-[var(--ch)] motion-safe:md:min-h-0",
                  CARD_TONES[i % CARD_TONES.length],
                )}
                style={{ ["--top" as string]: `calc(var(--tab) * ${i})` } as CSSProperties}
              >
                <div className="flex items-center gap-4 px-6 pt-5 motion-safe:md:h-[var(--tab)] motion-safe:md:items-center motion-safe:md:pt-0">
                  <span className="display-type tabular text-[length:clamp(1.3rem,2vw,1.9rem)] opacity-70">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="display-type text-[length:clamp(1.15rem,1.9vw,1.75rem)] leading-[1] text-balance">{c.label}</h3>
                </div>
                <div className="flex flex-1 items-center gap-6 px-6 pb-7 pt-3 motion-safe:md:items-center">
                  <span aria-hidden="true" className="grid size-[clamp(4.5rem,8vw,7.5rem)] shrink-0 place-items-center rounded-full bg-[var(--chip)] text-[var(--chip-ink)]">
                    <Icon name={ICONS[c.icon] ?? (c.icon as IconName)} className="size-[48%]" />
                  </span>
                  <p className="max-w-[28ch] text-[length:clamp(1.05rem,1.55vw,1.4rem)] font-medium leading-snug">{c.detail}</p>
                </div>
                <div data-dim="" aria-hidden="true" className="pointer-events-none absolute inset-0 bg-maroon-deep opacity-0" />
              </li>
            ))}
          </ol>
        </Container>
      </div>
    </section>
  );
}
