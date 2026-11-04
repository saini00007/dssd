"use client";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/useMediaQuery";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { Icon } from "@/components/ui/Icon";
import { PackImage } from "@/components/product/PackImage";
import { useCursorLabel } from "@/components/layout/CursorLabel";
import { cursorLabel } from "@/data/copy/shared";
import { ease, mq } from "@/lib/tokens";
import { cn } from "@/lib/cn";
import type { FlavourGroup } from "@/components/products/groups";

export interface PackCarouselProps {
  items: FlavourGroup[];
  /** Disc colour and the readable ink on it. */
  color: string;
  ink: string;
  /** Text on the rotating ring. */
  ringText: string;
  labels: { prev: string; next: string; region: string; view: string; hint: string; formats: string };
}

const wrap = (d: number, n: number) => ((((d + n / 2) % n) + n) % n) - n / 2;

/** Layout of one pack for an offset `d` (in steps from the centre). Pure: used for SSR and for every frame. */
function place(d: number, n: number) {
  const a = Math.abs(d);
  const fs = Math.min(2, n / 2 - 0.5);
  const fe = Math.min(3, n / 2);
  const opacity = Math.max(0, Math.min(1, (fe - a) / (fe - fs)));
  const sc = 1 / (1 + 0.55 * a);
  const rot = Math.max(-20, Math.min(20, d * 9));
  return {
    transform: `translate3d(calc(var(--step) * ${d.toFixed(3)}), ${(a * 16).toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`,
    opacity,
    zIndex: 100 - Math.round(a * 10),
    visibility: opacity < 0.02 ? ("hidden" as const) : ("visible" as const),
  };
}

function Item({
  g,
  i,
  d,
  n,
  center,
  onSelect,
  isDragged,
  setRef,
}: {
  g: FlavourGroup;
  i: number;
  d: number;
  n: number;
  center: boolean;
  onSelect: (i: number) => void;
  isDragged: () => boolean;
  setRef: (el: HTMLLIElement | null) => void;
}) {
  const cursor = useCursorLabel(cursorLabel);
  const p = place(d, n);
  return (
    <li ref={setRef} data-item={i} className="absolute left-1/2 top-[52%] w-[var(--step)] will-change-transform" style={{ ...p, marginLeft: "calc(var(--step) / -2)", marginTop: "calc(var(--stage-h) * -0.4)", height: "calc(var(--stage-h) * 0.8)" }}>
      <TransitionLink
        href={`/products/${g.rep.slug}`}
        {...cursor}
        aria-label={`${g.name}, ${g.formats.map((f) => f.formatLabel).join(", ")}`}
        aria-current={center ? "true" : undefined}
        draggable={false}
        onClick={(e) => {
          if (isDragged()) return e.preventDefault();
          if (!center) {
            e.preventDefault();
            onSelect(i);
          }
        }}
        onFocus={(e) => {
          if (e.currentTarget.matches(":focus-visible") && !center) onSelect(i);
        }}
        className="block size-full rounded-[28px] outline-offset-2"
      >
        <span data-float="" className="block size-full">
          <PackImage product={g.rep} fit decorative sizes="(min-width: 1024px) 360px, 60vw" priority={Math.abs(d) < 1.5} imgClassName="drop-shadow-[0_26px_28px_rgb(42_18_16/0.34)]" />
        </span>
      </TransitionLink>
    </li>
  );
}

function MotionCarousel({ items, color, ink, ringText, labels }: PackCarouselProps) {
  const n = items.length;
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const dashes = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const state = useRef({ pos: 0 });
  const shown = useRef(0);
  const dragged = useRef(false);
  const [active, setActive] = useState(0);

  const render = () => {
    const pos = state.current.pos;
    items.forEach((_, i) => {
      const el = refs.current[i];
      if (!el) return;
      const d = wrap(i - pos, n);
      const p = place(d, n);
      el.style.transform = p.transform;
      el.style.opacity = String(p.opacity);
      el.style.zIndex = String(p.zIndex);
      el.style.visibility = p.visibility;
      const link = el.firstElementChild as HTMLElement | null;
      if (link) link.style.pointerEvents = p.opacity < 0.25 ? "none" : "";
    });
    if (ring.current) ring.current.style.transform = `rotate(${(pos * -28).toFixed(2)}deg)`;
    if (dashes.current) dashes.current.style.transform = `rotate(${(pos * 40).toFixed(2)}deg)`;
    const idx = (((Math.round(pos) % n) + n) % n) as number;
    if (idx !== shown.current) {
      shown.current = idx;
      setActive(idx);
    }
  };

  const goTo = (target: number, duration = 0.85) => {
    gsap.to(state.current, { pos: target, duration, ease: ease.glide, overwrite: true, onUpdate: render });
  };
  const step = (dir: number) => goTo(Math.round(state.current.pos) + dir);
  const select = (i: number) => {
    // shortest way round
    const cur = Math.round(state.current.pos);
    const d = wrap(i - cur, n);
    goTo(cur + Math.round(d));
  };

  // float + ring spin (motion only)
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.motion, () => {
        el.querySelectorAll<HTMLElement>("[data-float]").forEach((f, i) => {
          gsap.to(f, { y: -12 - (i % 3) * 3, rotation: i % 2 ? 1.5 : -1.5, duration: 2.4 + (i % 4) * 0.3, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.17 });
        });
        const spin = el.querySelector("[data-spin]");
        if (spin) gsap.to(spin, { rotation: 360, duration: 70, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
        render();
      });
    },
    { scope: root },
  );

  // wheel: only horizontal intent (trackpad swipe, shift + wheel) moves the carousel; vertical scrolling is never trapped.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (e: WheelEvent) => {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2 || (e.shiftKey && e.deltaY !== 0);
      if (!horizontal) return;
      e.preventDefault();
      e.stopPropagation();
      const dx = Math.abs(e.deltaX) > 0 ? e.deltaX : e.deltaY;
      const stepPx = refs.current[0]?.offsetWidth || 300;
      gsap.to(state.current, { pos: state.current.pos + dx / (stepPx * 1.1), duration: 0.5, ease: "power3.out", overwrite: true, onUpdate: render });
      clearTimeout(idle);
      idle = setTimeout(() => goTo(Math.round(state.current.pos), 0.6), 140);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(idle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // drag
  const drag = useRef<{ x: number; pos: number; moved: boolean; samples: { x: number; t: number }[]; id: number } | null>(null);
  const onDown = (e: RPointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragged.current = false;
    drag.current = { x: e.clientX, pos: state.current.pos, moved: false, samples: [{ x: e.clientX, t: e.timeStamp }], id: e.pointerId };
  };
  const onMove = (e: RPointerEvent) => {
    const dr = drag.current;
    if (!dr || dr.id !== e.pointerId) return;
    const dx = e.clientX - dr.x;
    if (!dr.moved && Math.abs(dx) > 7) {
      dr.moved = true;
      dragged.current = true;
      gsap.killTweensOf(state.current);
      stage.current?.setPointerCapture(e.pointerId);
    }
    if (!dr.moved) return;
    const stepPx = refs.current[0]?.offsetWidth || 300;
    state.current.pos = dr.pos - dx / stepPx;
    dr.samples.push({ x: e.clientX, t: e.timeStamp });
    if (dr.samples.length > 5) dr.samples.shift();
    render();
  };
  const onUp = (e: RPointerEvent) => {
    const dr = drag.current;
    if (!dr || dr.id !== e.pointerId) return;
    drag.current = null;
    if (!dr.moved) return;
    const a = dr.samples[0];
    const b = dr.samples[dr.samples.length - 1];
    const stepPx = refs.current[0]?.offsetWidth || 300;
    const v = b.t > a.t ? -(b.x - a.x) / (b.t - a.t) / stepPx : 0; // steps per ms
    goTo(Math.round(state.current.pos + Math.max(-2, Math.min(2, v * 320))), 0.9);
    setTimeout(() => (dragged.current = false), 0);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    }
  };

  const vars = { "--stage-h": "clamp(16rem, 50vh, 33rem)", "--step": "calc(var(--stage-h) * 0.62)", "--flavour": color, "--flavour-ink": ink } as CSSProperties;
  const cur = items[active];
  const ringFull = `${ringText} · `.repeat(2);

  return (
    <div ref={root} role="region" aria-roledescription="carousel" aria-label={labels.region} onKeyDown={onKey} style={vars} className="relative">
      <div
        ref={stage}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative mx-auto h-[var(--stage-h)] w-full max-w-[1200px] cursor-grab touch-pan-y select-none active:cursor-grabbing"
      >
        {/* colour disc, dashed inner ring and the rotating ring text */}
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[52%] aspect-square w-[min(84vw,calc(var(--stage-h)*0.9))] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 rounded-full bg-flavour" />
          <div ref={dashes} className="absolute inset-[6%] rounded-full border-2 border-dashed border-flavour-ink/30" />
          <div ref={ring} className="absolute left-1/2 top-1/2 aspect-square w-[114%] -translate-x-1/2 -translate-y-1/2">
            <svg data-spin="" viewBox="0 0 200 200" className="size-full overflow-visible" focusable="false">
              <defs>
                <path id="pc-ring" d="M100 100 m-90 0 a90 90 0 1 1 180 0 a90 90 0 1 1 -180 0" />
              </defs>
              <text fontSize="11.5" fontWeight="800" letterSpacing="2" fill="currentColor" className="text-ink" style={{ fontFamily: "var(--font-display)" }}>
                <textPath href="#pc-ring" textLength="560" lengthAdjust="spacing">
                  {ringFull}
                </textPath>
              </text>
            </svg>
          </div>
        </div>

        <ul className="absolute inset-0 m-0 list-none p-0">
          {items.map((g, i) => (
            <Item key={g.key} g={g} i={i} d={wrap(i, n)} n={n} center={active === i} onSelect={select} isDragged={() => dragged.current} setRef={(el) => void (refs.current[i] = el)} />
          ))}
        </ul>
      </div>

      <div className="relative z-10 mx-auto mt-6 flex max-w-[1200px] items-center justify-center gap-5">
        <button type="button" onClick={() => step(-1)} aria-label={labels.prev} className="grid size-14 place-items-center rounded-full bg-ink text-cream transition-[background-color,transform] duration-[var(--dur-pop)] ease-[var(--ease-crunch)] hover:-translate-x-0.5 hover:bg-red active:scale-95">
          <Icon name="arrow-left" className="size-6" />
        </button>
        <div className="min-w-[min(70vw,20rem)] text-center" aria-live="polite" aria-atomic="true">
          <p className="display-type text-[length:clamp(1.4rem,2.4vw,2.1rem)] leading-none">{cur.name}</p>
          <p className="mt-1.5 text-sm font-semibold opacity-80">
            {labels.formats}: {cur.formats.map((f) => f.formatLabel).join(" · ")}
          </p>
        </div>
        <button type="button" onClick={() => step(1)} aria-label={labels.next} className="grid size-14 place-items-center rounded-full bg-ink text-cream transition-[background-color,transform] duration-[var(--dur-pop)] ease-[var(--ease-crunch)] hover:translate-x-0.5 hover:bg-red active:scale-95">
          <Icon name="arrow" className="size-6" />
        </button>
      </div>
      <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.14em] opacity-80">{labels.hint}</p>
    </div>
  );
}

/** Reduced motion: no carousel at all, just the packs in a static, wrapping row. */
function StaticRow({ items, color, ink, labels }: PackCarouselProps) {
  return (
    <div role="region" aria-label={labels.region}>
      <ul className="mx-auto flex max-w-[1200px] flex-wrap justify-center gap-x-6 gap-y-8">
        {items.map((g) => (
          <li key={g.key} className="w-[min(44vw,13rem)]">
            <TransitionLink href={`/products/${g.rep.slug}`} className={cn("block rounded-[28px] p-3 text-center")} style={{ background: color, color: ink }}>
              <span className="relative block h-44">
                <PackImage product={g.rep} fit decorative sizes="208px" />
              </span>
              <span className="display-type mt-3 block text-lg leading-none">{g.name}</span>
            </TransitionLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** CAT-01 (P19 = R2-C1): the range's packs float over a colour disc; drag, sideways scroll, ◁ ▷ or arrow keys move them. */
export function PackCarousel(props: PackCarouselProps) {
  const reduce = useReducedMotion();
  return reduce ? <StaticRow {...props} /> : <MotionCarousel {...props} />;
}
