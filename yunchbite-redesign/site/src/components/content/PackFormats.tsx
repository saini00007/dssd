"use client";
import { useEffect, useRef, useState } from "react";
import { FilterPills } from "@/components/sections/FilterPills";
import { PackImage } from "@/components/product/PackImage";
import { Icon } from "@/components/ui/Icon";
import { popElement } from "@/components/motion/pop";
import { getProduct } from "@/data/products";

export interface PackFormatsProps {
  pickLabel: string;
  formats: { key: string; label: string; line: string }[];
  features: { title: string; detail: string }[];
}

/** Flat paper-cut pack silhouettes for the formats that have no real cut-out yet (pillow, jar). */
function PackArt({ kind }: { kind: "pillow" | "jar" }) {
  if (kind === "pillow") {
    return (
      <svg viewBox="0 0 240 280" className="h-full w-full" focusable="false" aria-hidden="true">
        <path d="M30 36h180v208H30z" fill="#D61610" />
        <path d="M30 36h180l-6 8H36zM30 244h180l-6-8H36z" fill="#BA0403" />
        {Array.from({ length: 16 }).map((_, i) => (
          <path key={i} d={`M${34 + i * 11.5} 36v10M${34 + i * 11.5} 234v10`} stroke="#8B1313" strokeWidth="2" />
        ))}
        <path d="M30 108h180v70H30z" fill="#FFD200" />
        <circle cx="120" cy="143" r="26" fill="#FFFDF5" />
        <path d="M108 143c0-10 6-18 12-22 6 4 12 12 12 22s-6 16-12 16-12-6-12-16z" fill="#D61610" />
        <path d="M54 60c10-6 22-6 30 0M156 60c10-6 22-6 30 0" stroke="#FFFDF5" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 280" className="h-full w-full" focusable="false" aria-hidden="true">
      <rect x="52" y="20" width="136" height="38" rx="10" fill="#D61610" />
      <path d="M62 30h116M62 42h116" stroke="#BA0403" strokeWidth="3" />
      <path d="M60 58h120v10c20 6 30 18 30 40v120c0 18-12 30-30 30H60c-18 0-30-12-30-30V108c0-22 10-34 30-40z" fill="#FBEFD9" stroke="#2A1210" strokeWidth="3" />
      <path d="M44 150c20 8 50 10 76 4s52-6 76 2v70c0 12-8 20-20 20H64c-12 0-20-8-20-20z" fill="#F1C396" />
      <circle cx="82" cy="170" r="11" fill="#FFFDF5" opacity=".9" />
      <circle cx="122" cy="186" r="13" fill="#FFFDF5" opacity=".9" />
      <circle cx="160" cy="168" r="10" fill="#FFFDF5" opacity=".9" />
      <rect x="64" y="92" width="112" height="44" rx="8" fill="#FFD200" />
      <path d="M78 114h84" stroke="#2A1210" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** BEN-04: pick a pack (pillow, zipper, jar); the selected pack pops and its line fades in. */
export function PackFormats({ pickLabel, formats, features }: PackFormatsProps) {
  const [key, setKey] = useState(formats[0].key);
  const stage = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const current = formats.find((f) => f.key === key) ?? formats[0];
  const zipper = getProduct("makhana-zipper-peri-peri");

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    popElement(stage.current, { from: 0.8, y: 18 });
  }, [key]);

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div className="relative mx-auto grid aspect-square w-full max-w-[460px] place-items-center rounded-full bg-yellow">
          <div ref={stage} className="h-[84%] w-[74%]">
            {key === "zipper" && zipper ? <PackImage product={zipper} fit sizes="280px" decorative className="h-full" /> : <PackArt kind={key === "jar" ? "jar" : "pillow"} />}
          </div>
        </div>
        <div>
          <p id="pack-pick-label" className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-maroon">{pickLabel}</p>
          <FilterPills label={pickLabel} options={formats.map((f) => ({ value: f.key, label: f.label }))} value={key} onChange={setKey} />
          <div className="mt-8 min-h-[7.5rem]" aria-live="polite">
            <h3 className="display-type text-[length:clamp(2.4rem,5vw,4.5rem)] leading-[0.9]">{current.label}</h3>
            <p className="mt-4 max-w-[40ch] text-[1.2rem] leading-snug">{current.line}</p>
          </div>
        </div>
      </div>
      <ul className="mt-16 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <li key={f.title} className="flex gap-4">
            <span aria-hidden="true" className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-red text-cream">
              <Icon name="check" className="size-5" />
            </span>
            <span>
              <span className="display-type block text-[length:var(--text-h3)] leading-[1]">{f.title}</span>
              <span className="mt-1.5 block max-w-[34ch] text-ink/80">{f.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
