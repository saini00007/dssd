"use client";
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { Container } from "@/components/ui/Container";
import { TypeIn } from "@/components/motion/TypeIn";
import { shapeSrc } from "@/lib/media";
import { dur, ease, mq } from "@/lib/tokens";
import { cn } from "@/lib/cn";
import type { ShapeName } from "@/data/types";

export interface DataCardsProps {
  heading: string;
  tabLabels: { ingredients: string; nutrition: string; allergens: string };
  servingLabel: string;
  factLabels: { sizes: string; shelfLife: string; storage: string; origin: string };
  /** Server-rendered ingredient / allergen markup (allergen words in bold). */
  ingredients: ReactNode;
  allergens: ReactNode;
  allergenNote: string;
  nutrition: { servingSize: string; rows: { label: string; value: string }[] };
  facts: { sizes: string; shelfLife: string; storage: string; origin: string };
  flavourColor: string;
  ingredient: ShapeName;
}

type TabKey = "ingredients" | "nutrition" | "allergens";
const TABS: TabKey[] = ["ingredients", "nutrition", "allergens"];

// Position of a card relative to the active one: rotation, offsets and scale of the fan.
function fan(k: number, wide: boolean) {
  if (k === 0) return { x: 0, y: 0, rotate: 0, scale: 1 };
  const side = k === 1 ? 1 : -1;
  return { x: side * (wide ? 22 : 10), y: wide ? 14 : 8, rotate: side * (wide ? 5.5 : 3.5), scale: 0.97 };
}
const rel = (i: number, active: number) => (i - active + TABS.length) % TABS.length;

function parseValue(v: string) {
  const m = v.match(/^([\d.]+)\s*(.*)$/);
  if (!m) return { num: null as number | null, dec: 0, unit: v };
  const dec = m[1].includes(".") ? m[1].split(".")[1].length : 0;
  return { num: parseFloat(m[1]), dec, unit: m[2] };
}

/** PDP-05: tabs (Ingredients / Nutrition / Allergens) as fanned paper cards that straighten on enter, plus the facts row. */
export function DataCards({ heading, tabLabels, servingLabel, factLabels, ingredients, allergens, allergenNote, nutrition, facts, flavourColor, ingredient }: DataCardsProps) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const entered = useRef(false);
  const wide = useRef(true);
  const uid = useId();
  const activeRef = useRef(0);

  // nutrition rows with bar ratios (relative within the same unit; energy gets no bar)
  const rows = nutrition.rows.map((r) => ({ ...r, ...parseValue(r.value) }));
  const maxByUnit = new Map<string, number>();
  for (const r of rows) if (r.num != null && r.unit !== "kcal") maxByUnit.set(r.unit, Math.max(maxByUnit.get(r.unit) ?? 0, r.num));

  const playNutrition = (el: HTMLElement) => {
    const reduce = window.matchMedia(mq.reduce).matches;
    if (reduce) return;
    const bars = el.querySelectorAll<HTMLElement>("[data-bar]");
    gsap.fromTo(bars, { scaleX: 0 }, { scaleX: (_i, t: HTMLElement) => Number(t.dataset.bar), duration: dur.roast, ease: ease.roast, stagger: 0.06, overwrite: true });
    el.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => {
      const target = Number(n.dataset.count);
      const dec = Number(n.dataset.dec);
      const o = { v: 0 };
      gsap.to(o, {
        v: target,
        duration: dur.roast + 0.3,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => void (n.textContent = o.v.toFixed(dec)),
        onComplete: () => void (n.textContent = target.toFixed(dec)),
      });
    });
  };

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", el);
      const mm = gsap.matchMedia();
      mm.add(mq.reduce, () => {
        cards.forEach((c) => c.setAttribute("data-yb-ready", ""));
      });
      mm.add(mq.motion, () => {
        const stack = el.querySelector<HTMLElement>("[data-stack]");
        if (!stack) return;
        wide.current = window.innerWidth >= 640;
        // start: all cards piled and tilted low, then fan out and straighten on enter
        cards.forEach((c, i) => {
          gsap.set(c, { x: 0, y: 90, rotate: (i - 1) * 16, scale: 0.9, opacity: 0, transformOrigin: "50% 90%" });
          c.setAttribute("data-yb-ready", "");
        });
        const st = gsap.timeline({
          scrollTrigger: {
            trigger: stack,
            start: "top 78%",
            once: true,
            onEnter: () => {
              entered.current = true;
              if (activeRef.current === 1) {
                const nut = el.querySelector<HTMLElement>('[data-card="nutrition"]');
                if (nut) gsap.delayedCall(0.5, () => playNutrition(nut));
              }
            },
          },
        });
        cards.forEach((c, i) => {
          const f = fan(rel(i, activeRef.current), wide.current);
          st.to(c, { ...f, opacity: 1, duration: dur.roast, ease: ease.roast }, i * 0.1);
        });
        return () => {
          st.kill();
          gsap.set(cards, { clearProps: "transform,opacity" });
        };
      });
    },
    { scope: root },
  );

  const select = (i: number, focus = false) => {
    if (i === activeRef.current) return;
    activeRef.current = i;
    setActive(i);
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia(mq.reduce).matches;
    const cards = gsap.utils.toArray<HTMLElement>("[data-card]", el);
    cards.forEach((c, ci) => {
      const f = fan(rel(ci, i), wide.current);
      c.style.zIndex = String(rel(ci, i) === 0 ? 30 : rel(ci, i) === 1 ? 20 : 10);
      if (reduce) gsap.set(c, f);
      else gsap.to(c, { ...f, duration: dur.move, ease: ease.roast, overwrite: "auto", opacity: 1 });
    });
    if (i === 1) {
      const nut = el.querySelector<HTMLElement>('[data-card="nutrition"]');
      if (nut) gsap.delayedCall(0.25, () => playNutrition(nut));
    }
    if (focus) requestAnimationFrame(() => el.querySelector<HTMLElement>(`[data-tab="${TABS[i]}"]`)?.focus());
  };

  const onKey = (e: KeyboardEvent) => {
    const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    let n = active;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (active + 1) % TABS.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (active - 1 + TABS.length) % TABS.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = TABS.length - 1;
    select(n, true);
  };

  const paper: Record<TabKey, string> = {
    ingredients: "bg-yellow",
    nutrition: "bg-cream",
    allergens: "bg-[color-mix(in_srgb,var(--flavour)_38%,var(--color-cream))]",
  };

  const factItems: [string, string][] = [
    [factLabels.sizes, facts.sizes],
    [factLabels.shelfLife, facts.shelfLife],
    [factLabels.storage, facts.storage],
    [factLabels.origin, facts.origin],
  ];

  return (
    <section ref={root} aria-labelledby={`${uid}-h`} className="relative bg-cream pb-[clamp(3rem,6vw,5rem)] pt-[clamp(3.5rem,7vw,6rem)]" style={{ "--flavour": flavourColor } as CSSProperties}>
      <Container>
        <div className="grid items-start gap-10 lg:group-data-[flight=on]/pdp:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
          <div className="mx-auto w-full max-w-[820px] lg:group-data-[flight=on]/pdp:mx-0 lg:group-data-[flight=on]/pdp:max-w-none">
            <TypeIn as="h2" id={`${uid}-h`} text={heading} className="display-type text-[length:var(--text-display)] leading-[0.9]" />

            <div role="tablist" aria-label={heading} onKeyDown={onKey} className="mb-8 mt-8 flex flex-wrap gap-2">
              {TABS.map((t, i) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${t}`}
                  data-tab={t}
                  aria-selected={active === i}
                  aria-controls={`${uid}-panel-${t}`}
                  tabIndex={active === i ? 0 : -1}
                  onClick={() => select(i)}
                  className={cn(
                    "inline-flex h-11 items-center rounded-pill border-2 px-5 text-[0.95rem] font-bold transition-[background-color,color,border-color] duration-[var(--dur-quick)]",
                    active === i ? "border-ink bg-ink text-cream" : "border-ink/25 text-ink hover:border-ink",
                  )}
                >
                  {tabLabels[t]}
                </button>
              ))}
            </div>

            <div data-stack="" className="grid [&>*]:col-start-1 [&>*]:row-start-1">
              {TABS.map((t, i) => {
                const k = rel(i, 0);
                const f = fan(k, true);
                const on = active === i;
                return (
                  <div
                    key={t}
                    data-card={t}
                    data-yb-anim=""
                    id={`${uid}-panel-${t}`}
                    role="tabpanel"
                    aria-labelledby={`${uid}-tab-${t}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => !on && select(i)}
                    className={cn("relative overflow-hidden rounded-[28px] border-2 border-ink/10 p-6 shadow-[var(--shadow-lift)] sm:p-9", paper[t], !on && "cursor-pointer")}
                    style={{ zIndex: on ? 30 : k === 1 ? 20 : 10, transform: `translate(${f.x}px, ${f.y}px) rotate(${f.rotate}deg) scale(${f.scale})` }}
                  >
                    <div className={cn("relative z-10", !on && "invisible")} aria-hidden={!on}>
                      {t === "ingredients" && (
                        <>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">{tabLabels.ingredients}</p>
                          <p className="mt-3 max-w-[34ch] text-[length:clamp(1.25rem,2vw,1.75rem)] font-medium leading-snug">{ingredients}</p>
                        </>
                      )}
                      {t === "allergens" && (
                        <>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">{tabLabels.allergens}</p>
                          <p className="mt-3 max-w-[34ch] text-[length:clamp(1.25rem,2vw,1.75rem)] font-medium leading-snug">{allergens}</p>
                          <p className="mt-5 max-w-[44ch] text-sm opacity-75">{allergenNote}</p>
                        </>
                      )}
                      {t === "nutrition" && (
                        <table className="w-full border-collapse text-left">
                          <caption className="mb-3 text-left text-xs font-bold uppercase tracking-[0.16em] opacity-70">
                            {tabLabels.nutrition} · {servingLabel} {nutrition.servingSize}
                          </caption>
                          <tbody>
                            {rows.map((r) => {
                              const max = maxByUnit.get(r.unit) ?? 0;
                              const ratio = r.num != null && max > 0 && r.unit !== "kcal" ? Math.max(r.num / max, r.num > 0 ? 0.03 : 0) : null;
                              return (
                                <tr key={r.label} className="border-t border-ink/12 first:border-t-0">
                                  <th scope="row" className="py-2.5 pr-4 text-[0.98rem] font-semibold">
                                    {r.label}
                                  </th>
                                  <td className="tabular whitespace-nowrap py-2.5 pr-4 text-right text-[0.98rem] font-bold">
                                    {r.num != null ? (
                                      <>
                                        <span data-count={r.num} data-dec={r.dec}>
                                          {r.num.toFixed(r.dec)}
                                        </span>{" "}
                                        <span className="font-semibold opacity-75">{r.unit}</span>
                                      </>
                                    ) : (
                                      r.value
                                    )}
                                  </td>
                                  <td className="hidden w-[34%] py-2.5 sm:table-cell" aria-hidden="true">
                                    {ratio != null && (
                                      <div className="h-2.5 overflow-hidden rounded-full bg-ink/10">
                                        <div data-bar={ratio} className="h-full origin-left rounded-full bg-red" style={{ transform: `scaleX(${ratio})` }} />
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                    {t !== "nutrition" && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={shapeSrc(ingredient)} alt="" width={160} height={160} draggable={false} className="pointer-events-none absolute -bottom-6 -right-4 w-[34%] max-w-[190px] rotate-[14deg] opacity-90" />
                    )}
                  </div>
                );
              })}
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t-2 border-ink/15 pt-8 md:grid-cols-4">
              {factItems.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-bold uppercase tracking-[0.16em] text-red">{label}</dt>
                  <dd className="mt-1.5 text-[0.98rem] leading-snug">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* The pack lands here (see PdpFlight). Only exists while the flight is on. */}
          <div aria-hidden="true" data-land="" className="relative hidden aspect-[4/5] w-full max-h-[640px] lg:group-data-[flight=on]/pdp:block" />
        </div>
      </Container>
    </section>
  );
}
