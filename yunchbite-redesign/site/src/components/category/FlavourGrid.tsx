"use client";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Flip } from "gsap/Flip";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { FilterPills, type FilterOption } from "@/components/sections/FilterPills";
import { FlavourCard } from "@/components/product/FlavourCard";
import { dur, ease, mq } from "@/lib/tokens";
import { cn } from "@/lib/cn";
import type { FlavourGroup } from "@/components/products/groups";

if (typeof window !== "undefined") gsap.registerPlugin(Flip);

export interface FlavourGridProps {
  groups: FlavourGroup[];
  /** Filter pills; `tag` is matched against each flavour's formats (and raw/roasted for nuts). Empty: no pills. */
  filters: { tag: string; label: string }[];
  filterLabel: string;
  countLabel: string;
}

/** Tags a flavour answers to: its formats, plus raw / roasted for the nut range. */
export function tagsOf(g: FlavourGroup): string[] {
  const t: string[] = g.formats.map((f) => f.format);
  if (g.category === "dry-fruits") t.push(g.key.startsWith("roasted") ? "roasted" : "raw");
  return t;
}

/** CAT-02: one card per flavour + filter pills that re-flow the grid with a GSAP Flip layout animation. */
export function FlavourGrid({ groups, filters, filterLabel, countLabel }: FlavourGridProps) {
  const [tag, setTag] = useState("all");
  const list = useRef<HTMLUListElement>(null);
  const reduce = useRef(false);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(mq.reduce, () => void (reduce.current = true));
    mm.add(mq.motion, () => void (reduce.current = false));
  });

  const matches = (g: FlavourGroup, t: string) => t === "all" || tagsOf(g).includes(t);
  const shown = groups.filter((g) => matches(g, tag));

  const options: FilterOption[] = [
    { value: "all", label: "All", count: groups.length },
    ...filters.map((f) => ({ value: f.tag, label: f.label, count: groups.filter((g) => matches(g, f.tag)).length })),
  ];

  const change = (v: string) => {
    const ul = list.current;
    if (!ul || reduce.current) return setTag(v);
    const items = Array.from(ul.children) as HTMLElement[];
    const state = Flip.getState(items);
    flushSync(() => setTag(v));
    Flip.from(state, {
      duration: dur.roast * 0.85,
      ease: ease.roast,
      absolute: true,
      nested: false,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: dur.move, ease: ease.crunch, delay: 0.2, clearProps: "opacity,transform" }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: dur.quick + 0.1, ease: "power1.in" }),
    });
  };

  return (
    <div>
      {filters.length > 0 && <FilterPills options={options} value={tag} onChange={change} label={filterLabel} className="mb-6" />}
      <p className="sr-only" aria-live="polite" role="status">
        {shown.length} {countLabel}
      </p>
      <ul ref={list} className="grid grid-cols-1 gap-x-5 gap-y-14 pt-10 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g, i) => (
          <li key={g.key} className={cn("min-w-0", !matches(g, tag) && "hidden")}>
            <FlavourCard group={g} activeFormat={tag === "all" ? undefined : tag} priority={i < 3} />
          </li>
        ))}
      </ul>
    </div>
  );
}
