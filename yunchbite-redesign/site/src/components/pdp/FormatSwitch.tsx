"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { Reveal } from "@/components/motion/Reveal";
import { dur, ease } from "@/lib/tokens";
import { cn } from "@/lib/cn";

export interface FormatOption {
  slug: string;
  label: string;
  sizes: string;
  current: boolean;
}

/** PDP-02: format chips linking to the sibling URLs. A highlight pill slides to the hovered/focused chip (R1-D3). */
export function FormatSwitch({ heading, sizesLabel, options, color, ink }: { heading: string; sizesLabel: string; options: FormatOption[]; color: string; ink: string }) {
  const root = useRef<HTMLDivElement>(null);
  const hl = useRef<HTMLSpanElement>(null);

  const place = (btn: HTMLElement | null, animate = true) => {
    const h = hl.current;
    const g = root.current;
    if (!h || !g || !btn) return;
    const gb = g.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    const vars = { x: b.left - gb.left, y: b.top - gb.top, width: b.width, height: b.height, opacity: 1 };
    if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) gsap.to(h, { ...vars, duration: dur.quick + 0.1, ease: ease.glide, overwrite: true });
    else gsap.set(h, vars);
  };
  const cur = () => root.current?.querySelector<HTMLElement>('[aria-current="page"]') ?? null;

  useGSAP(
    () => {
      place(cur(), false);
      const ro = new ResizeObserver(() => place(cur(), false));
      if (root.current) ro.observe(root.current);
      return () => ro.disconnect();
    },
    { scope: root },
  );

  return (
    <section aria-label={heading} className="bg-cream pb-2 pt-10 md:pt-14" style={{ ["--flavour" as string]: color, ["--flavour-ink" as string]: ink }}>
      <div className="mx-auto w-full max-w-[var(--container-max)] px-gutter">
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8 lg:max-w-[58%]">
          <h2 className="display-type shrink-0 text-[length:var(--text-h3)]">{heading}</h2>
          <div ref={root} className="relative flex flex-wrap gap-2" onPointerLeave={() => place(cur())}>
            <span ref={hl} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 rounded-pill bg-flavour opacity-0" />
            {options.map((o) => (
              <TransitionLink
                key={o.slug}
                href={`/products/${o.slug}`}
                transitionTypes={["pdp-switch"]}
                aria-current={o.current ? "page" : undefined}
                onPointerEnter={(e) => place(e.currentTarget)}
                onFocus={(e) => place(e.currentTarget)}
                onBlur={() => place(cur())}
                className={cn(
                  "relative z-10 inline-flex min-h-11 flex-col justify-center rounded-pill border-2 px-5 py-1.5 leading-tight transition-colors duration-[var(--dur-quick)]",
                  o.current ? "border-transparent text-flavour-ink" : "border-ink/25 text-ink hover:border-transparent hover:text-flavour-ink focus-visible:border-transparent focus-visible:text-flavour-ink",
                )}
              >
                <span className="text-[0.95rem] font-bold">{o.label}</span>
                <span className="sr-only">{sizesLabel}: </span>
                <span className="tabular text-xs font-semibold opacity-80">{o.sizes}</span>
              </TransitionLink>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
