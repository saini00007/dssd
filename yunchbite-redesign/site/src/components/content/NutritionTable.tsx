"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { whenInView } from "@/components/motion/entrance";
import { mq } from "@/lib/tokens";

export interface NutritionRowData {
  nutrient: string;
  value: string;
  dvLabel: string;
  dv: number;
}

export interface NutritionTableProps {
  caption: string;
  columns: string[];
  rows: NutritionRowData[];
  footnotes: string[];
  note?: string;
}

/** "347 kcal" -> { num: 347, dec: 0, rest: " kcal" } so the number can count up while the unit stays put. */
function split(text: string) {
  const m = text.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  return { num: parseFloat(m[1]), dec: (m[1].split(".")[1] ?? "").length, rest: m[2] };
}

/**
 * BEN-03: nutrition per 100 g (plain roasted makhana). A real <table>; the final numbers are always in the HTML.
 * On enter, the % DV bars grow and the numbers count up. Bars are on a 0-100 % DV scale.
 */
export function NutritionTable({ caption, columns, rows, footnotes, note }: NutritionTableProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.motion, () => {
        const bars = el.querySelectorAll<HTMLElement>("[data-bar]");
        const counters = el.querySelectorAll<HTMLElement>("[data-count]");
        gsap.set(bars, { scaleX: 0, transformOrigin: "0 50%" });
        const state = { p: 0 };
        const finals = Array.from(counters).map((c) => c.textContent ?? "");
        const parsed = finals.map(split);
        const write = (p: number) => {
          counters.forEach((c, i) => {
            const s = parsed[i];
            if (!s) return;
            c.textContent = `${(s.num * p).toFixed(s.dec)}${s.rest}`;
          });
        };
        write(0);
        const tl = gsap.timeline({ paused: true });
        tl.to(bars, { scaleX: 1, duration: 1.1, ease: "power2.inOut", stagger: 0.06 }, 0).to(state, { p: 1, duration: 1.3, ease: "power2.out", onUpdate: () => write(state.p) }, 0);
        const stop = whenInView(el, "top 75%", () => tl.play());
        return () => {
          stop();
          tl.kill();
          counters.forEach((c, i) => (c.textContent = finals[i]));
          gsap.set(bars, { clearProps: "transform" });
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="overflow-hidden rounded-card bg-cream shadow-[var(--shadow-lift)]">
      <div className="overflow-x-auto">
        <table className="tabular w-full min-w-[520px] border-collapse text-left">
          <caption className="display-type bg-maroon px-6 py-5 text-left text-[length:var(--text-h3)] text-cream md:px-8">{caption}</caption>
          <thead>
            <tr className="border-b-2 border-ink/15 text-xs font-bold uppercase tracking-[0.12em] text-ink/70">
              <th scope="col" className="px-6 py-3 font-bold md:px-8">{columns[0]}</th>
              <th scope="col" className="px-3 py-3 font-bold">{columns[1]}</th>
              <th scope="col" className="px-6 py-3 font-bold md:px-8">{columns[2]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const key = r.dv >= 15;
              return (
                <tr key={r.nutrient} className="border-b border-ink/10 last:border-0">
                  <th scope="row" className="px-6 py-3.5 font-bold md:px-8">{r.nutrient}</th>
                  <td className="px-3 py-3.5 font-semibold">
                    <span data-count="">{r.value}</span>
                  </td>
                  <td className="px-6 py-3.5 md:px-8">
                    <div className="flex items-center gap-3">
                      <span aria-hidden="true" className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-ink/10">
                        <span data-bar="" className={`absolute inset-y-0 left-0 rounded-full ${key ? "bg-red" : "bg-ink/55"}`} style={{ width: `${Math.max(r.dv, r.dv > 0 ? 1 : 0)}%` }} />
                      </span>
                      <span data-count="" className="w-12 shrink-0 text-right font-bold">{r.dvLabel}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="space-y-1 border-t-2 border-ink/15 bg-cream-2 px-6 py-5 text-sm text-ink/80 md:px-8">
        {footnotes.map((f) => (
          <p key={f}>{f}</p>
        ))}
        {note && <p className="pt-2 font-bold text-ink">{note}</p>}
      </div>
    </div>
  );
}
