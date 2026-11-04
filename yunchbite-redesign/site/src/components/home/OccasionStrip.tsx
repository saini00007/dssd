"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { PackImage } from "@/components/product/PackImage";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TypeIn } from "@/components/motion/TypeIn";
import { Reveal } from "@/components/motion/Reveal";
import { useDragScroll } from "./useDragScroll";
import { shapeSrc } from "@/lib/media";
import type { ShapeName } from "@/data/types";
import { cn } from "@/lib/cn";

export interface Occasion {
  key: string;
  title: string;
  line: string;
  /** Real photo (cropped by object-position) or a composed card (flavour colour + pack + paper-cut shapes). */
  photo?: { src: string; alt: string; width: number; height: number; position?: string };
  color: string;
  ink: string;
  pack?: { slug: string; name: string; formatLabel: string; flavourKey: string };
  shapes: ShapeName[];
}

const SHAPE_SLOTS = [
  { l: 6, t: 12, w: 22, r: -18 },
  { l: 70, t: 8, w: 20, r: 20 },
  { l: 78, t: 46, w: 16, r: -10 },
  { l: 4, t: 52, w: 16, r: 26 },
];

/** HOME-07: a short curved strip, drag/scroll/keyboard; the centre card scales up. */
export function OccasionStrip({ occasions, eyebrow, heading }: { occasions: Occasion[]; eyebrow: string; heading: string }) {
  const ref = useRef<HTMLUListElement>(null);
  useDragScroll(ref);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-occ]"));
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = el.scrollLeft + el.clientWidth / 2;
      for (const c of cards) {
        const cw = c.offsetWidth || 1;
        const d = (c.offsetLeft + cw / 2 - mid) / (cw * 1.05);
        const a = Math.min(Math.abs(d), 2.2);
        c.style.setProperty("--s", (0.84 + 0.16 * Math.max(0, 1 - a / 1.1)).toFixed(3));
        c.style.setProperty("--y", `${(a * a * 14).toFixed(1)}px`);
        c.style.setProperty("--r", `${(d * 3.2).toFixed(2)}deg`);
        c.dataset.centre = a < 0.5 ? "1" : "0";
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    // start on the middle card
    const mid = cards[Math.floor(cards.length / 2)];
    if (mid) el.scrollLeft = mid.offsetLeft + mid.offsetWidth / 2 - el.clientWidth / 2;
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section aria-labelledby="occasions-title" data-header-theme="light" className="relative overflow-hidden bg-cream py-section">
      <Container className="mb-[clamp(2rem,4vw,3.5rem)] text-center">
        <Eyebrow className="mb-4 text-red">{eyebrow}</Eyebrow>
        <TypeIn as="h2" id="occasions-title" text={heading} className="display-type text-[length:var(--text-display)] leading-[0.92]" />
      </Container>
      <Reveal>
        <ul
          ref={ref}
          tabIndex={0}
          aria-label="Snacking occasions, scroll sideways"
          className="flex cursor-grab snap-x snap-mandatory list-none gap-[clamp(14px,2vw,28px)] overflow-x-auto overscroll-x-contain px-[calc(50%-var(--cw)/2)] pb-16 pt-10 [--cw:clamp(250px,27vw,400px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {occasions.map((o, i) => (
            <li
              key={o.key}
              data-occ=""
              className="w-[var(--cw)] shrink-0 snap-center will-change-transform"
              style={{ transform: "translate3d(0,var(--y,0px),0) rotate(var(--r,0deg)) scale(var(--s,0.9))", transformOrigin: "50% 60%" } as CSSProperties}
            >
              <article className="relative isolate aspect-[5/6] overflow-hidden rounded-[28px]" style={{ background: o.color, color: o.ink }}>
                {o.photo ? (
                  <Image src={o.photo.src} alt={o.photo.alt} fill sizes="(min-width: 1024px) 400px, 70vw" className="object-cover" style={{ objectPosition: o.photo.position ?? "50% 50%" }} draggable={false} />
                ) : (
                  <div aria-hidden="true" className="absolute inset-0">
                    <div className="absolute left-1/2 top-[44%] aspect-square w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,currentColor_12%,transparent)]" />
                    {o.shapes.slice(0, 4).map((s, k) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={k} src={shapeSrc(s)} alt="" width={96} height={96} loading="lazy" draggable={false} className="absolute h-auto select-none" style={{ left: `${SHAPE_SLOTS[k].l}%`, top: `${SHAPE_SLOTS[k].t}%`, width: `${SHAPE_SLOTS[k].w}%`, rotate: `${SHAPE_SLOTS[k].r}deg` }} />
                    ))}
                    {o.pack && (
                      <div className="absolute inset-x-[18%] bottom-[22%] top-[10%]">
                        <PackImage product={o.pack} fit decorative morph={false} sizes="(min-width: 1024px) 22vw, 50vw" imgClassName="drop-shadow-[0_18px_22px_rgb(42_18_16/0.34)]" />
                      </div>
                    )}
                  </div>
                )}
                <div className={cn("absolute inset-x-0 bottom-0 z-10 p-5", o.photo ? "bg-gradient-to-t from-maroon-deep/90 via-maroon-deep/55 to-transparent pt-16 text-cream" : "")}>
                  <h3 className="display-type text-[length:clamp(1.5rem,2.2vw,2.1rem)] leading-[0.95]">{o.title}</h3>
                  <p className="mt-1.5 text-[0.95rem] font-medium leading-snug">{o.line}</p>
                </div>
              </article>
              <span className="sr-only">{`Occasion ${i + 1} of ${occasions.length}`}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
