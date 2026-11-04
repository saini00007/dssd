"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TypeIn } from "@/components/motion/TypeIn";
import { Reveal } from "@/components/motion/Reveal";
import { DriftShapes } from "@/components/sections/DriftShapes";
import { buddyImage } from "@/lib/media";
import { dur, mq } from "@/lib/tokens";

export interface BuddyIntroProps {
  heading: string;
  body: string;
  bubble: string;
  clickHint: string;
  lines: string[];
}

// Eye geometry in the 819x735 source (point pose): sclera ellipse + iris radius.
const EYES = [
  { cx: 272, cy: 308, rx: 56, ry: 47, ir: 33, id: "l" },
  { cx: 428, cy: 277, rx: 40, ry: 45, ir: 29, id: "r" },
] as const;

/** HOME-09: Buddy large on brand yellow, pupils follow the cursor, click = pop + a random line. */
export function BuddyIntro({ heading, body, bubble, clickHint, lines }: BuddyIntroProps) {
  const root = useRef<HTMLElement>(null);
  const [line, setLine] = useState(bubble);
  const lastLine = useRef(-1);
  const img = buddyImage("point");

  const pokeRef = useRef<(() => void) | null>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`${mq.motion}`, () => {
        const body = el.querySelector<HTMLElement>("[data-buddy-body]");
        const svg = el.querySelector<SVGSVGElement>("[data-eyes]");
        const irises = gsap.utils.toArray<SVGGElement>("[data-iris]", el);
        // subtle idle bob (paused off screen)
        const bob = body ? gsap.to(body, { y: -7, rotation: 0.6, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true }) : null;
        const io = new IntersectionObserver(
          ([e]) => {
            near = e.isIntersecting;
            rect = null;
            bob?.paused(!near);
          },
          { rootMargin: "80px" },
        );
        io.observe(el);

        const setters = irises.map((g) => ({ x: gsap.quickTo(g, "x", { duration: 0.35, ease: "power3.out" }), y: gsap.quickTo(g, "y", { duration: 0.35, ease: "power3.out" }) }));
        let raf = 0;
        let last: { x: number; y: number } | null = null;
        // Cached geometry: re-measured only after a scroll / resize, never per pointer move.
        let rect: DOMRect | null = null;
        const dirty = () => {
          rect = null;
        };
        window.addEventListener("scroll", dirty, { passive: true });
        window.addEventListener("resize", dirty, { passive: true });
        let near = false;
        const look = () => {
          raf = 0;
          if (!svg || !last || !near) return;
          const r = (rect ??= svg.getBoundingClientRect());
          const k = r.width / 819;
          EYES.forEach((e, i) => {
            const ex = r.left + e.cx * k;
            const ey = r.top + e.cy * k;
            const dx = last!.x - ex;
            const dy = last!.y - ey;
            const dist = Math.hypot(dx, dy) || 1;
            const reach = Math.min(1, dist / (r.width * 0.6));
            const max = Math.min(e.rx - e.ir * 0.55, e.ry - e.ir * 0.5) * 0.92;
            setters[i].x((dx / dist) * max * reach);
            setters[i].y((dy / dist) * max * reach);
          });
        };
        const move = (ev: PointerEvent) => {
          last = { x: ev.clientX, y: ev.clientY };
          if (!raf) raf = requestAnimationFrame(look);
        };
        window.addEventListener("pointermove", move, { passive: true });
        return () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("scroll", dirty);
          window.removeEventListener("resize", dirty);
          if (raf) cancelAnimationFrame(raf);
          io.disconnect();
          bob?.kill();
        };
      });
      pokeRef.current = (contextSafe as <T extends (...a: never[]) => unknown>(f: T) => T)(() => {
        let i = Math.floor(Math.random() * lines.length);
        if (lines.length > 1 && i === lastLine.current) i = (i + 1) % lines.length;
        lastLine.current = i;
        setLine(lines[i]);
        if (window.matchMedia(mq.reduce).matches) return;
        const squash = el.querySelector("[data-buddy-pop]");
        const bubbleEl = el.querySelector("[data-bubble]");
        if (squash) gsap.fromTo(squash, { scaleX: 1.1, scaleY: 0.88 }, { scaleX: 1, scaleY: 1, duration: dur.pop + 0.35, ease: "elastic.out(1.1, 0.4)", transformOrigin: "50% 100%", overwrite: true });
        if (bubbleEl) gsap.fromTo(bubbleEl, { scale: 0.7, rotation: -5 }, { scale: 1, rotation: -2, duration: dur.pop + 0.1, ease: "back.out(2)", transformOrigin: "20% 100%", overwrite: true });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="buddy-title" data-header-theme="light" className="relative overflow-hidden bg-yellow py-section text-ink">
      <DriftShapes shapes={["makhana-1", "chilli", "makhana-3", "pudina-leaf", "makhana-5", "olive"]} className="opacity-80" />
      <Container className="relative z-10 grid items-center gap-10 md:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div className="order-2 md:order-1">
          <Eyebrow className="mb-5 text-red">Makhana Buddy</Eyebrow>
          <TypeIn as="h2" id="buddy-title" text={heading} className="display-type text-[length:clamp(2.6rem,5.6vw,5.5rem)] leading-[0.92]" />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[34rem] text-[length:clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed">{body}</p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 text-sm font-bold uppercase tracking-wider text-yellow">
              <span aria-hidden="true" className="size-2 rounded-full bg-yellow" />
              {clickHint}
            </p>
          </Reveal>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-[560px] md:order-2">
          <div aria-hidden="true" className="absolute left-1/2 top-1/2 aspect-square w-[92%] -translate-x-1/2 -translate-y-[46%] rounded-full bg-cream" />
          <div aria-hidden="true" data-bubble="" className="absolute left-[2%] top-[2%] z-20 max-w-[58%] -rotate-2 rounded-[26px] rounded-bl-md bg-ink px-5 py-3 text-base font-bold leading-snug text-cream shadow-[var(--shadow-pill)] md:text-lg">
            {line}
          </div>
          <p className="sr-only" aria-live="polite">
            {line}
          </p>
          <button
            type="button"
            onClick={() => pokeRef.current?.()}
            aria-label="Poke Makhana Buddy"
            className="group/buddy relative z-10 mx-auto block w-[min(78vw,400px)] cursor-pointer rounded-[40px] outline-offset-8 active:scale-[0.985]"
          >
            <span data-buddy-pop="" className="block">
              <span data-buddy-body="" className="relative block">
                <Image src={img.src} alt="" width={img.width} height={img.height} sizes="(min-width: 768px) 400px, 78vw" className="h-auto w-full select-none drop-shadow-[0_28px_30px_rgb(42_18_16/0.25)]" draggable={false} />
                {/* pupils that follow the cursor, drawn over his painted eyes */}
                <svg data-eyes="" viewBox="0 0 819 735" aria-hidden="true" focusable="false" className="pointer-events-none absolute inset-0 size-full">
                  <defs>
                    {EYES.map((e) => (
                      <clipPath id={`buddy-eye-${e.id}`} key={e.id}>
                        <ellipse cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} />
                      </clipPath>
                    ))}
                    <radialGradient id="buddy-iris" cx="50%" cy="38%" r="70%">
                      <stop offset="0" stopColor="#8a4a22" />
                      <stop offset="1" stopColor="#4a2410" />
                    </radialGradient>
                    <radialGradient id="buddy-sclera" cx="50%" cy="55%" r="65%">
                      <stop offset="0.6" stopColor="#ffffff" />
                      <stop offset="1" stopColor="#efe2d4" />
                    </radialGradient>
                  </defs>
                  {EYES.map((e) => (
                    <g key={e.id}>
                      <ellipse cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} fill="url(#buddy-sclera)" stroke="#d8b99c" strokeWidth="3" />
                      <g clipPath={`url(#buddy-eye-${e.id})`}>
                        <g data-iris="">
                          <circle cx={e.cx} cy={e.cy + 2} r={e.ir} fill="url(#buddy-iris)" />
                          <circle cx={e.cx} cy={e.cy + 2} r={e.ir * 0.5} fill="#170904" />
                          <circle cx={e.cx + e.ir * 0.28} cy={e.cy - e.ir * 0.3} r={e.ir * 0.26} fill="#fff" />
                          <circle cx={e.cx - e.ir * 0.3} cy={e.cy + e.ir * 0.38} r={e.ir * 0.11} fill="#fff" opacity="0.8" />
                        </g>
                        {/* upper lid shadow */}
                        <ellipse cx={e.cx} cy={e.cy - e.ry * 0.95} rx={e.rx} ry={e.ry * 0.35} fill="#000" opacity="0.07" />
                      </g>
                    </g>
                  ))}
                </svg>
              </span>
            </span>
          </button>
        </div>
      </Container>
    </section>
  );
}
