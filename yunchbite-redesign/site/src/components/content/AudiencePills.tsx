"use client";
import { useEffect, useState } from "react";
import { FilterPills } from "@/components/sections/FilterPills";
import { useLenis } from "@/components/motion/SmoothScroll";

export interface AudiencePillsProps {
  pills: { key: string; label: string; targetId: string }[];
  label: string;
}

/** WHY-01: sticky audience pills. Scroll-spy highlights the section in view; clicking scrolls to it (Lenis when on). */
export function AudiencePills({ pills, label }: AudiencePillsProps) {
  const [active, setActive] = useState(pills[0].key);
  const lenis = useLenis();

  useEffect(() => {
    const secs: { key: string; el: Element }[] = [];
    for (const p of pills) {
      const el = document.getElementById(p.targetId);
      if (el) secs.push({ key: p.key, el: el.closest("section") ?? el });
    }
    if (!secs.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      // The active audience is the last section whose top has passed the reading line (40% of the viewport).
      const line = window.innerHeight * 0.4;
      let cur = secs[0].key;
      for (const s of secs) if (s.el.getBoundingClientRect().top <= line) cur = s.key;
      setActive(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pills]);

  const go = (key: string) => {
    setActive(key);
    const p = pills.find((x) => x.key === key);
    const el = p && document.getElementById(p.targetId);
    if (!el) return;
    const offset = -((parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 80) + 56);
    if (lenis) lenis.scrollTo(el, { offset });
    else el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="sticky top-[76px] z-30 flex justify-center px-gutter py-3 md:top-[72px]">
      <nav aria-label={label} className="rounded-[30px] bg-cream/90 p-2 shadow-[var(--shadow-pill)] backdrop-blur">
        <FilterPills label={label} options={pills.map((p) => ({ value: p.key, label: p.label }))} value={active} onChange={go} className="justify-center [&_button]:h-10 [&_button]:px-4 [&_button]:text-[0.9rem]" />
      </nav>
    </div>
  );
}
