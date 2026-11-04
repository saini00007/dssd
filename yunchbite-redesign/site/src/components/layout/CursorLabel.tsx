"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";
import { gsap } from "@/components/motion/gsap";
import { useFinePointer } from "@/components/motion/useMediaQuery";
import { mq } from "@/lib/tokens";

// ---- store: the current label text (null = hidden) -------------------------------------------------------------
let current: string | null = null;
const subs = new Set<() => void>();
function setLabel(t: string | null) {
  if (current === t) return;
  current = t;
  subs.forEach((f) => f());
}
const subscribe = (f: () => void) => (subs.add(f), () => void subs.delete(f));

interface Api {
  show: (text: string) => void;
  hide: () => void;
}
const Ctx = createContext<Api>({ show: () => {}, hide: () => {} });

/** Global provider for the trailing "Taste me →" pill. Render <CursorLabel /> once inside it. */
export function CursorLabelProvider({ children }: { children: ReactNode }) {
  const api = useMemo<Api>(() => ({ show: setLabel, hide: () => setLabel(null) }), []);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

/**
 * Pointer handlers that show the global trailing label while the (mouse) pointer is over the element.
 * Spread onto any element: `<div {...useCursorLabel("Taste me →")}>`. No-op for touch and pen.
 */
export function useCursorLabel(text: string) {
  const { show, hide } = useContext(Ctx);
  const onPointerEnter = useCallback((e: PointerEvent) => e.pointerType === "mouse" && show(text), [show, text]);
  const onPointerLeave = useCallback(() => hide(), [hide]);
  return { onPointerEnter, onPointerLeave };
}

/** The pill itself: two layers with different lerps (ring lags more than the label) so it stretches as you move. */
export function CursorLabel() {
  const fine = useFinePointer();
  const text = useSyncExternalStore(subscribe, () => current, () => null);
  const wrap = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const textEl = useRef<HTMLSpanElement>(null);
  const shown = useRef(false);
  const api = useRef<{ show: () => void; hide: () => void } | null>(null);

  useEffect(() => {
    if (!fine || !window.matchMedia(mq.motion).matches) return;
    const w = wrap.current;
    const r = ring.current;
    const l = label.current;
    if (!w || !r || !l) return;

    const t = { x: -100, y: -100 };
    const lp = { x: -100, y: -100 };
    const rp = { x: -100, y: -100 };
    let seen = false;
    let running = false;

    const tick = () => {
      lp.x += (t.x - lp.x) * 0.24;
      lp.y += (t.y - lp.y) * 0.24;
      const px = rp.x;
      const py = rp.y;
      rp.x += (t.x - rp.x) * 0.1;
      rp.y += (t.y - rp.y) * 0.1;
      const vx = rp.x - px;
      const vy = rp.y - py;
      const speed = Math.hypot(vx, vy);
      const stretch = 1 + Math.min(speed * 0.03, 0.55);
      gsap.set(l, { x: lp.x + 18, y: lp.y + 18 });
      gsap.set(r, { x: rp.x, y: rp.y, rotation: (Math.atan2(vy, vx) * 180) / Math.PI, scaleX: stretch, scaleY: 1 / Math.sqrt(stretch) });
    };
    const start = () => {
      if (running) return;
      running = true;
      gsap.ticker.add(tick);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      gsap.ticker.remove(tick);
    };

    const move = (e: globalThis.PointerEvent) => {
      t.x = e.clientX;
      t.y = e.clientY;
      if (!seen) {
        seen = true;
        lp.x = rp.x = t.x;
        lp.y = rp.y = t.y;
      }
    };
    const leave = () => setLabel(null);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);

    api.current = {
      show: () => {
        if (!seen) return;
        start();
        gsap.killTweensOf([r, l]);
        gsap.to(w, { autoAlpha: 1, duration: 0.01, overwrite: true });
        gsap.fromTo(l, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.38, ease: "back.out(1.8)", transformOrigin: "0 0" });
        gsap.fromTo(r, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      },
      hide: () => {
        gsap.to([l, r], {
          opacity: 0,
          duration: 0.18,
          overwrite: true,
          onComplete: () => {
            gsap.set(w, { autoAlpha: 0 });
            stop();
          },
        });
      },
    };

    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      stop();
      api.current = null;
    };
  }, [fine]);

  useEffect(() => {
    if (textEl.current && text) textEl.current.textContent = text;
    if (text && !shown.current) {
      shown.current = true;
      api.current?.show();
    } else if (!text && shown.current) {
      shown.current = false;
      api.current?.hide();
    }
  }, [text]);

  if (!fine) return null;
  return (
    <div ref={wrap} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[90] invisible">
      <div ref={ring} className="absolute -left-7 -top-7 size-14 rounded-full border-2 border-red opacity-0" />
      <div
        ref={label}
        className="absolute left-0 top-0 whitespace-nowrap rounded-pill bg-red px-4 py-2 text-sm font-bold text-cream opacity-0 shadow-[var(--shadow-pill)]"
      >
        <span ref={textEl} />
      </div>
    </div>
  );
}
