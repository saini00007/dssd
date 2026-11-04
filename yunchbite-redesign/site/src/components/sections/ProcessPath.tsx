"use client";
import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TypeIn } from "@/components/motion/TypeIn";
import type { ShapeName } from "@/data/types";
import { buddyImage, shapeSrc } from "@/lib/media";
import { mq } from "@/lib/tokens";
import { cn } from "@/lib/cn";

/**
 * ProcessPath (P06 = R1-C7): numbered cards ride a big dotted arc as you scroll (they enter tilted from the right,
 * straighten at the centre, leave left) while Makhana Buddy walks the path. Shared by Home (HOME-06), About and
 * Ingredients & Quality.
 *
 * Props:
 *  - `steps`   `{ n: "01", title, detail, shape?: ShapeName }[]` (4 recommended)
 *  - `title`   section heading (h2); `eyebrow?`; `id?`
 *  - `tone`    "soft" (default, cream-2) | "cream" | "yellow"
 *
 * Motion: pinned for 1.7 viewports, scrubbed (md+ and no reduced motion). Otherwise (touch/mobile, reduced motion): a
 * plain grid of cards (a row of 4 on desktop), no pin.
 */
export interface ProcessStep {
  n: string;
  title: string;
  detail: string;
  shape?: ShapeName;
}
export interface ProcessPathProps {
  steps: ProcessStep[];
  title: string;
  eyebrow?: string;
  tone?: "soft" | "cream" | "yellow";
  id?: string;
  className?: string;
}

const TONES = { soft: "bg-cream-2", cream: "bg-cream", yellow: "bg-yellow" } as const;
const CARD_TONES = [
  "bg-cream text-ink [--o:var(--color-red)]",
  "bg-yellow text-ink [--o:var(--color-maroon)]",
  "bg-red text-cream [--o:var(--color-yellow)]",
  "bg-maroon text-cream [--o:var(--color-yellow)]",
];

// Arc (fractions of the pinned stage): ellipse centre and radii. a in [0,1] runs left -> right over the top.
const ARC = { cx: 0.5, cy: 1.22, rx: 0.6, ry: 0.5 };
const arcPoint = (a: number, W: number, H: number) => {
  const t = Math.PI * (1 - a);
  return { x: (ARC.cx + ARC.rx * Math.cos(t)) * W, y: (ARC.cy - ARC.ry * Math.sin(t)) * H };
};

export function ProcessPath({ steps, title, eyebrow, tone = "soft", id, className }: ProcessPathProps) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const count = steps.length;
  const buddy = buddyImage("walk");
  const dots = `M ${(ARC.cx - ARC.rx) * 1000} ${ARC.cy * 700} A ${ARC.rx * 1000} ${ARC.ry * 700} 0 0 1 ${(ARC.cx + ARC.rx) * 1000} ${ARC.cy * 700}`;

  useGSAP(
    () => {
      const el = root.current;
      const st = stage.current;
      if (!el || !st) return;
      const mm = gsap.matchMedia();
      mm.add(`(min-width: 768px) and ${mq.motion}`, () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-step]", el);
        const walker = el.querySelector<HTMLElement>("[data-walker]");
        const bob = el.querySelector<HTMLElement>("[data-bob]");
        const dash = el.querySelector<SVGPathElement>("[data-dash]");
        const V = 1.2; // arc fraction travelled per unit of progress
        const slot = (k: number) => 0.12 + k * ((1 - 0.12 * 1.0) / Math.max(1, count - 1)) * 0.98;
        let W = st.clientWidth;
        let H = st.clientHeight;

        const render = (p: number) => {
          cards.forEach((c, k) => {
            const a = 0.5 + (slot(k) - p) * V;
            const d = Math.abs(a - 0.5);
            const pt = arcPoint(gsap.utils.clamp(0, 1, a), W, H);
            const edge = Math.min(a, 1 - a);
            gsap.set(c, {
              x: pt.x,
              y: pt.y - H * 0.24,
              xPercent: -50,
              yPercent: -50,
              rotation: (a - 0.5) * 30,
              scale: 1 - 0.2 * Math.min(1, d * 2),
              opacity: gsap.utils.clamp(0, 1, edge / 0.1 + 0.001),
              zIndex: 10 - Math.round(d * 6),
            });
          });
          if (walker && bob) {
            const a = 0.2 + 0.6 * p;
            const pt = arcPoint(a, W, H);
            gsap.set(walker, { x: pt.x, y: pt.y, xPercent: -50, yPercent: -92, rotation: (a - 0.5) * 26 });
            const step = Math.abs(Math.sin(p * Math.PI * 22));
            gsap.set(bob, { y: -step * 12, rotation: Math.sin(p * Math.PI * 22) * 3, scaleY: 1 - (1 - step) * 0.04, transformOrigin: "50% 100%" });
          }
          if (dash) dash.style.strokeDashoffset = String(-p * 520);
        };

        const proxy = { p: 0 };
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: st,
            start: "top top",
            end: "+=170%",
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => {
              W = st.clientWidth;
              H = st.clientHeight;
              render(proxy.p);
            },
          },
        });
        tl.to(proxy, { p: 1, ease: "none", duration: 1, onUpdate: () => render(proxy.p) });
        render(0);
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set([...cards, walker, bob].filter(Boolean) as HTMLElement[], { clearProps: "all" });
        };
      });
    },
    { scope: root, dependencies: [count] },
  );

  return (
    <section ref={root} id={id} aria-labelledby={`${id ?? "process"}-title`} className={cn("relative overflow-clip text-ink", TONES[tone], className)} data-header-theme="light">
      <div ref={stage} className="relative py-section motion-safe:md:h-svh motion-safe:md:overflow-hidden motion-safe:md:py-0">
        {/* the dotted arc + walker (pinned mode only) */}
        <svg aria-hidden="true" focusable="false" viewBox="0 0 1000 700" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 hidden size-full motion-safe:md:block">
          <path
            data-dash=""
            d={dots}
            fill="none"
            stroke="var(--color-maroon)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0.1 20"
            vectorEffect="non-scaling-stroke"
            opacity="0.55"
          />
        </svg>
        <div aria-hidden="true" data-walker="" className="pointer-events-none absolute left-0 top-0 z-[12] hidden w-[clamp(96px,10vw,150px)] motion-safe:md:block">
          <div data-bob="">
            <Image src={buddy.src} alt="" width={buddy.width} height={buddy.height} sizes="150px" className="h-auto w-full select-none" draggable={false} />
          </div>
        </div>

        <Container className="relative z-20 motion-safe:md:absolute motion-safe:md:inset-x-0 motion-safe:md:top-0 motion-safe:md:pt-[calc(var(--header-h)+1.5rem)]">
          <div className="mx-auto max-w-[44rem] text-center">
            {eyebrow && <Eyebrow className="mb-3 text-red">{eyebrow}</Eyebrow>}
            <TypeIn as="h2" id={`${id ?? "process"}-title`} text={title} className="display-type text-[length:clamp(2.2rem,3.8vw,3.75rem)] leading-[0.94]" />
          </div>
        </Container>

        <Container className="relative z-10 mt-10 motion-safe:md:static motion-safe:md:mt-0 motion-safe:md:max-w-none motion-safe:md:p-0">
          <ol className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4 motion-safe:md:block motion-safe:md:gap-0">
            {steps.map((s, i) => (
              <li
                key={s.n}
                data-step=""
                className={cn(
                  "relative flex min-h-[260px] flex-col justify-between gap-6 overflow-hidden rounded-card p-6 shadow-[var(--shadow-lift)]",
                  "motion-safe:md:absolute motion-safe:md:left-0 motion-safe:md:top-0 motion-safe:md:h-[clamp(230px,21vw,290px)] motion-safe:md:w-[clamp(240px,21vw,310px)] motion-safe:md:min-h-0",
                  CARD_TONES[i % CARD_TONES.length],
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span aria-hidden="true" className="display-type text-outline text-[length:clamp(3.5rem,6vw,5.5rem)] leading-[0.8] [--stroke-color:var(--o)] [--stroke:2px]">
                    {s.n}
                  </span>
                  {s.shape && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={shapeSrc(s.shape)} alt="" width={96} height={96} loading="lazy" draggable={false} className="size-[clamp(3.5rem,5.5vw,5rem)] rotate-[8deg] select-none" style={{ "--r": "8deg" } as CSSProperties} />
                  )}
                </div>
                <div>
                  <h3 className="display-type text-[length:clamp(1.4rem,2vw,1.9rem)] leading-[0.95]">{s.title}</h3>
                  <p className="mt-2 text-[0.98rem] leading-snug">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </div>
    </section>
  );
}
