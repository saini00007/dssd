"use client";
import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { deferIn } from "@/components/motion/entrance";
import { FlavourBuddy } from "@/components/product/FlavourBuddy";
import { PackImage } from "@/components/product/PackImage";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { TypeIn } from "@/components/motion/TypeIn";
import { useCursorLabel } from "@/components/layout/CursorLabel";
import { cursorLabel } from "@/data/copy/shared";
import type { ShapeName } from "@/data/types";
import { dur, mq } from "@/lib/tokens";
import { cn } from "@/lib/cn";

// Same arch as ui/ArchReveal (P07), applied to the whole stage.
const ARCH = "inset(0vw 0% 0% 0% round 50% 50% 0% 0% / 10vw 10vw 0% 0%)";
const ARCH_FROM = "inset(6vw 9% 0% 9% round 50% 50% 0% 0% / 22vw 22vw 0% 0%)";

export interface FlavourSlide {
  key: string;
  name: string;
  tagline: string;
  color: string;
  ink: string;
  dark: boolean;
  ingredient: ShapeName;
  product: { slug: string; name: string; formatLabel: string; flavourKey: string };
}

export interface FlavourStageViewProps {
  slides: FlavourSlide[];
  title: string;
  id: string;
  eyebrow?: string;
  ctaLabel: string;
  numberLabel: string;
  prevLabel: string;
  nextLabel: string;
  headingLevel: 1 | 2;
  morph: boolean;
  arch: boolean;
  behind?: string;
  children?: ReactNode;
}

const pad = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function FlavourStageView({
  slides,
  title,
  id,
  eyebrow,
  ctaLabel,
  numberLabel,
  prevLabel,
  nextLabel,
  headingLevel,
  morph,
  arch,
  behind,
  children,
}: FlavourStageViewProps) {
  const n = slides.length;
  const root = useRef<HTMLElement>(null);
  const bgA = useRef<HTMLDivElement>(null);
  const bgB = useRef<HTMLDivElement>(null);
  const buddyWrap = useRef<HTMLDivElement>(null);
  const slideEls = useRef<(HTMLDivElement | null)[]>([]);
  const nameEls = useRef<(HTMLDivElement | null)[]>([]);
  const numEls = useRef<(HTMLDivElement | null)[]>([]);
  const infoEls = useRef<(HTMLDivElement | null)[]>([]);
  const pos = useRef({ v: 0 });
  const target = useRef(0);
  const activeRef = useRef(0);
  const swipe = useRef<{ x: number; id: number } | null>(null);
  const [active, setActive] = useState(0);
  const [buddyIdx, setBuddyIdx] = useState(0);
  const cursor = useCursorLabel(cursorLabel);

  // Position of slide i relative to the (fractional) centre, wrapped to [-n/2, n/2).
  const relOf = (i: number, p: number) => {
    let r = (((i - p) % n) + n) % n;
    if (r >= n / 2) r -= n;
    return r;
  };

  const layout = (p: number) => {
    for (let i = 0; i < n; i++) {
      const r = relOf(i, p);
      const a = Math.abs(r);
      const el = slideEls.current[i];
      if (el) {
        el.style.setProperty("--rel", r.toFixed(4));
        el.style.setProperty("--sc", (1 + 0.4 * clamp(1 - a, 0, 1)).toFixed(4));
        el.style.setProperty("--rot", `${(r * 2.4).toFixed(3)}deg`);
        el.style.opacity = String(clamp(a <= 1 ? 1 - a * 0.08 : a <= 2.2 ? 0.92 - (a - 1) * 0.1 : (3.2 - a) * 0.8, 0, 1));
        el.style.zIndex = String(20 - Math.round(a * 2));
      }
      const nm = nameEls.current[i];
      if (nm) nm.style.setProperty("--rel", r.toFixed(4));
      const nu = numEls.current[i];
      if (nu) nu.style.setProperty("--rel", r.toFixed(4));
      const inf = infoEls.current[i];
      if (inf) {
        inf.style.setProperty("--rel", r.toFixed(4));
        inf.style.opacity = String(clamp(1 - a * 1.9, 0, 1));
      }
    }
  };

  const api = useRef<{ goTo: (index: number, dir: number) => void; go: (dir: number) => void } | null>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const el = root.current;
      if (!el) return;
      const safe = contextSafe as <T extends (...a: never[]) => unknown>(f: T) => T;
      if (arch) {
        const mm = gsap.matchMedia();
        mm.add(mq.motion, (_c, safe) => {
          const off = deferIn(safe, () => {
          gsap.fromTo(el, { clipPath: ARCH_FROM }, { clipPath: ARCH, ease: "none", scrollTrigger: { trigger: el, start: "top 98%", end: "top 40%", scrub: true } });
          });
          return () => off();
        });
      }

      const goTo = safe((index: number, dir: number) => {
        const reduce = window.matchMedia(mq.reduce).matches;
        target.current += dir;
        activeRef.current = index;
        setActive(index);
        const s = slides[index];

        // 1. row + odometer slide one slot (roast)
        gsap.to(pos.current, { v: target.current, duration: reduce ? 0 : dur.roast, ease: "power2.inOut", overwrite: true, onUpdate: () => layout(pos.current.v) });
        if (reduce) layout(target.current);

        // 2. stage background crossfade through the mixed tint (opacity only), colours + header theme
        const a = bgA.current;
        const b = bgB.current;
        if (a && b) {
          if (Number(gsap.getProperty(b, "opacity")) > 0.5) a.style.backgroundColor = b.style.backgroundColor;
          b.style.backgroundColor = s.color;
          gsap.fromTo(
            b,
            { opacity: 0 },
            {
              opacity: 1,
              duration: reduce ? 0.3 : dur.switch,
              ease: "power1.inOut",
              overwrite: true,
              onComplete: () => {
                a.style.backgroundColor = s.color;
                gsap.set(b, { opacity: 0 });
              },
            },
          );
        }
        el.style.setProperty("--flavour", s.color);
        el.style.setProperty("--flavour-ink", s.ink);
        el.dataset.headerTheme = s.dark ? "dark" : "light";
        el.classList.toggle("on-dark", s.dark);

        // 3. Buddy ducks behind the pack, swaps the ingredient, pops back out
        const bw = buddyWrap.current;
        if (bw) {
          gsap.killTweensOf(bw);
          if (reduce) {
            setBuddyIdx(index);
          } else {
            gsap.to(bw, {
              xPercent: -75,
              opacity: 0,
              duration: 0.2,
              ease: "power2.in",
              onComplete: () => {
                setBuddyIdx(activeRef.current);
                gsap.fromTo(bw, { xPercent: -75, yPercent: 14, scale: 0.7, opacity: 0 }, { xPercent: 0, yPercent: 0, scale: 1, opacity: 1, duration: dur.pop + 0.2, delay: 0.32, ease: "back.out(1.7)" });
              },
            });
          }
        }
      });
      api.current = { goTo, go: (dir) => goTo((((activeRef.current + dir) % n) + n) % n, dir) };
      return () => {
        api.current = null;
      };
    },
    { scope: root },
  );

  const go = (dir: number) => api.current?.go(dir);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  const onDown = (e: PointerEvent) => {
    swipe.current = { x: e.clientX, id: e.pointerId };
  };
  const onUp = (e: PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || e.pointerId !== s.id) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
  };

  const first = slides[0];
  const rel0 = (i: number) => {
    let r = i % n;
    if (r >= n / 2) r -= n;
    return r;
  };
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const buddySlide = slides[buddyIdx];

  const rootStyle = {
    "--flavour": first.color,
    "--flavour-ink": first.ink,
    "--w": "clamp(128px, 15vw, 232px)",
    "--step": "clamp(112px, 17vw, 268px)",
    clipPath: arch ? ARCH : undefined,
  } as CSSProperties;

  const section = (
    <section
      ref={root}
      id={id}
      aria-labelledby={`${id}-title`}
      data-header-theme={first.dark ? "dark" : "light"}
      onKeyDown={onKey}
      style={rootStyle}
      className={cn("relative isolate overflow-hidden text-flavour-ink transition-colors duration-300 ease-out", first.dark && "on-dark")}
    >
      {/* background crossfade: two layers, opacity only */}
      <div ref={bgA} aria-hidden="true" className="absolute inset-0 -z-10" style={{ backgroundColor: first.color }} />
      <div ref={bgB} aria-hidden="true" className="absolute inset-0 -z-10 opacity-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{ background: "radial-gradient(60% 55% at 50% 52%, rgb(255 255 255 / 0.28), transparent 70%)" }}
      />

      <Container className="relative pb-[clamp(3rem,5vw,5rem)] pt-[clamp(5.5rem,8vw,7.5rem)]">
        <div className="text-center">
          {eyebrow && <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em]">{eyebrow}</p>}
          <TypeIn as={Heading} id={`${id}-title`} text={title} className="display-type text-[length:clamp(2.3rem,5.2vw,5rem)] leading-[0.92]" />
        </div>

        <div role="group" aria-roledescription="carousel" aria-label={title} className="mt-[clamp(1rem,2vw,2rem)]">
          {/* the row */}
          <div
            className="relative mx-auto select-none [touch-action:pan-y]"
            style={{ height: "calc(var(--w) * 1.95)" }}
            onPointerDown={onDown}
            onPointerUp={onUp}
            onPointerCancel={() => (swipe.current = null)}
            onDragStart={(e) => e.preventDefault()}
            {...cursor}
          >
            {/* disc */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 -translate-x-1/2 rounded-full transition-[background-color] duration-[var(--dur-switch)] ease-[var(--ease-roast)]"
              style={{
                width: "calc(var(--w) * 1.9)",
                aspectRatio: "1",
                bottom: "calc(var(--w) * 0.04)",
                background: "color-mix(in srgb, var(--flavour) 52%, white)",
                boxShadow: "0 0 0 calc(var(--w) * 0.09) color-mix(in srgb, var(--flavour) 70%, white / 0)",
                zIndex: 1,
              }}
            />
            {/* Buddy, popping from behind the centre pack */}
            <div className="pointer-events-none absolute left-1/2 z-[15]" style={{ bottom: "calc(var(--w) * 0.78)", marginLeft: "calc(var(--w) * 0.30)", width: "calc(var(--w) * 0.78)" }}>
              <div ref={buddyWrap} style={{ transformOrigin: "0% 100%" }}>
                <FlavourBuddy flavour={{ ingredient: buddySlide.ingredient, name: buddySlide.name }} pose="peek" hand={{ x: 70, y: 14, size: 32, rotate: 22 }} />
              </div>
            </div>

            {slides.map((s, i) => {
              const r = rel0(i);
              const a = Math.abs(r);
              return (
                <div
                  key={s.key}
                  ref={(el) => {
                    slideEls.current[i] = el;
                  }}
                  data-slide={s.key}
                  className="absolute bottom-0 left-1/2 w-[var(--w)] will-change-transform"
                  style={
                    {
                      "--rel": r,
                      "--sc": 1 + 0.4 * clamp(1 - a, 0, 1),
                      "--rot": `${r * 2.4}deg`,
                      transformOrigin: "50% 100%",
                      transform: "translate3d(calc(-50% + var(--rel) * var(--step)), 0, 0) rotate(var(--rot)) scale(var(--sc))",
                      opacity: clamp(a <= 1 ? 1 - a * 0.08 : a <= 2.2 ? 0.92 - (a - 1) * 0.1 : (3.2 - a) * 0.8, 0, 1),
                      zIndex: 20 - Math.round(a * 2),
                    } as CSSProperties
                  }
                >
                  <TransitionLink
                    href={`/products/${s.product.slug}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    draggable={false}
                    onClick={(e) => {
                      if (activeRef.current !== i) {
                        e.preventDefault();
                        let d = i - (((target.current % n) + n) % n);
                        if (d > n / 2) d -= n;
                        if (d < -n / 2) d += n;
                        api.current?.goTo(i, d);
                      }
                    }}
                    className="block"
                  >
                    <div className="relative" style={{ height: "calc(var(--w) * 1.3)" }}>
                      <PackImage
                        product={s.product}
                        fit
                        decorative
                        morph={morph}
                        sizes="(min-width: 1024px) 300px, 45vw"
                        imgClassName="drop-shadow-[0_20px_26px_rgb(0_0_0/0.28)]"
                      />
                    </div>
                  </TransitionLink>
                </div>
              );
            })}

            {/* round buttons */}
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={prevLabel}
              className="group/b absolute left-0 top-[48%] z-30 grid size-12 -translate-y-1/2 place-items-center rounded-full border-2 border-current bg-transparent transition-[background-color,color,transform] duration-[var(--dur-quick)] ease-[var(--ease-crunch)] hover:scale-110 hover:bg-flavour-ink hover:text-flavour active:scale-95 md:size-14 lg:left-[2vw]"
            >
              <Icon name="arrow-left" className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={nextLabel}
              className="group/b absolute right-0 top-[48%] z-30 grid size-12 -translate-y-1/2 place-items-center rounded-full border-2 border-current bg-transparent transition-[background-color,color,transform] duration-[var(--dur-quick)] ease-[var(--ease-crunch)] hover:scale-110 hover:bg-flavour-ink hover:text-flavour active:scale-95 md:size-14 lg:right-[2vw]"
            >
              <Icon name="arrow" className="size-6" />
            </button>
          </div>

          {/* number + name odometer */}
          <div className="mt-[clamp(0.5rem,1.2vw,1rem)] flex flex-col items-center text-center" aria-hidden="true">
            <div className="flex items-center gap-2 rounded-pill border-2 border-current px-4 py-1.5 text-sm font-bold uppercase tracking-[0.16em]">
              <span>{numberLabel}</span>
              <span className="tabular relative grid overflow-hidden" style={{ height: "1.25em" }}>
                {slides.map((s, i) => (
                  <span
                    key={s.key}
                    ref={(el) => {
                      numEls.current[i] = el as HTMLDivElement | null;
                    }}
                    className="[grid-area:1/1] leading-[1.25]"
                    style={{ "--rel": rel0(i), transform: "translate3d(0, calc(var(--rel) * 100%), 0)" } as CSSProperties}
                  >
                    {pad(i + 1)}
                  </span>
                ))}
              </span>
            </div>
            <div className="relative mt-3 grid w-full overflow-hidden py-[0.05em]" style={{ minHeight: "1.02em", fontSize: "clamp(2.2rem,4.8vw,4.5rem)" }}>
              {slides.map((s, i) => (
                <div
                  key={s.key}
                  ref={(el) => {
                    nameEls.current[i] = el;
                  }}
                  className="display-type [grid-area:1/1] whitespace-nowrap leading-[1]"
                  style={{ "--rel": rel0(i), transform: "translate3d(0, calc(var(--rel) * 110%), 0)" } as CSSProperties}
                >
                  {s.name}
                </div>
              ))}
            </div>
          </div>

          {/* tagline + CTA (crossfade) */}
          <div className="mx-auto mt-3 grid max-w-[40rem] text-center">
            {slides.map((s, i) => {
              const r = rel0(i);
              return (
                <div
                  key={s.key}
                  ref={(el) => {
                    infoEls.current[i] = el;
                  }}
                  inert={i !== active}
                  aria-hidden={i !== active}
                  className="flex flex-col items-center gap-5 [grid-area:1/1]"
                  style={{ "--rel": r, opacity: clamp(1 - Math.abs(r) * 1.9, 0, 1), transform: "translate3d(0, calc(var(--rel) * 16px), 0)" } as CSSProperties}
                >
                  <h3 className="sr-only">{s.name}</h3>
                  <p className="text-[length:clamp(1.05rem,1.5vw,1.35rem)] font-medium leading-snug">{s.tagline}</p>
                  <TransitionLink
                    href={`/products/${s.product.slug}`}
                    eager={i === 0}
                    className="group/btn inline-flex h-14 items-center justify-center gap-2 rounded-pill border-2 border-flavour-ink bg-flavour-ink px-8 text-lg font-bold leading-none text-flavour transition-[background-color,color,transform] duration-[var(--dur-quick)] ease-[var(--ease-glide)] hover:bg-transparent hover:text-flavour-ink active:scale-[0.97]"
                  >
                    <span>
                      {ctaLabel}
                      <span className="sr-only"> {s.name}</span>
                    </span>
                  </TransitionLink>
                </div>
              );
            })}
          </div>

          {children && <div className="mt-8 text-center text-sm font-semibold">{children}</div>}
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {slides[active].name}, {active + 1} of {n}
          </p>
        </div>
      </Container>
    </section>
  );

  return arch ? <div style={{ background: behind }}>{section}</div> : section;
}
