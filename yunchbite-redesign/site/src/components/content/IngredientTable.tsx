"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/components/motion/gsap";
import { FilterPills } from "@/components/sections/FilterPills";
import { dur } from "@/lib/tokens";

export interface IngredientTab {
  key: string;
  label: string;
  title: string;
  rows: { flavour: string; ingredients: string }[];
  note: string;
}

export interface IngredientTableProps {
  tabs: IngredientTab[];
  columns: string[];
  additivesNote: string;
  label: string;
}

/** IQ-04: tabs Makhana / Popcorn / Nuts, one accessible table each (all in the HTML; the inactive ones are hidden). Cross-fade on change. */
export function IngredientTable({ tabs, columns, additivesNote, label }: IngredientTableProps) {
  const [key, setKey] = useState(tabs[0].key);
  const wrap = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const panel = wrap.current?.querySelector(`[data-panel="${key}"]`);
    if (panel && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(panel, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: dur.quick + 0.1, ease: "power2.out", clearProps: "transform,opacity" });
    }
  }, [key]);

  return (
    <div>
      <FilterPills label={label} options={tabs.map((t) => ({ value: t.key, label: t.label, count: t.rows.length }))} value={key} onChange={setKey} />
      <div ref={wrap} className="mt-8">
        {tabs.map((t) => (
          <div key={t.key} data-panel={t.key} hidden={t.key !== key} role="group" aria-label={`${t.label} ingredients`}>
            <p className="mb-2 text-sm font-semibold text-ink/70 sm:hidden">Swipe sideways to read every ingredient list.</p>
            <div className="overflow-x-auto rounded-card bg-cream shadow-[var(--shadow-lift)]">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <caption className="display-type bg-ink px-6 py-5 text-left text-[length:var(--text-h3)] text-cream md:px-8">{t.title}</caption>
                <thead>
                  <tr className="border-b-2 border-ink/15 text-xs font-bold uppercase tracking-[0.12em] text-ink/70">
                    <th scope="col" className="w-[28%] px-6 py-3 md:px-8">{columns[0]}</th>
                    <th scope="col" className="px-3 py-3 pr-6 md:pr-8">{columns[1]}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((r) => (
                    <tr key={r.flavour} className="border-b border-ink/10 align-top last:border-0">
                      <th scope="row" className="px-6 py-4 font-bold md:px-8">{r.flavour}</th>
                      <td className="px-3 py-4 pr-6 leading-relaxed text-ink/85 md:pr-8">{r.ingredients}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-5 font-bold text-maroon">{t.note}</p>
          </div>
        ))}
        <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-ink/75">{additivesNote}</p>
      </div>
    </div>
  );
}
