"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, SplitText } from "@/components/motion/gsap";
import { LOADER_DONE_EVENT } from "@/components/motion/loader-gate";
import { loader as loaderCopy } from "@/data/copy/shared";
import { shapeSrc } from "@/lib/media";
import { ease } from "@/lib/tokens";
import type { ShapeName } from "@/data/types";

// Deterministic layout (SSR-safe): x/y in vw/vh from the bottom centre, rotation, size, shape.
const PILE: { s: ShapeName; x: number; y: number; r: number; w: number }[] = [
  { s: "makhana-1", x: -22, y: 0, r: -18, w: 15 },
  { s: "makhana-2", x: -8, y: 1, r: 12, w: 17 },
  { s: "makhana-3", x: 8, y: 0, r: -9, w: 16 },
  { s: "makhana-4", x: 23, y: 1, r: 20, w: 14 },
  { s: "chilli", x: -30, y: 11, r: 28, w: 10 },
  { s: "makhana-5", x: -14, y: 14, r: -30, w: 14 },
  { s: "pudina-leaf", x: 2, y: 15, r: 14, w: 11 },
  { s: "makhana-1", x: 16, y: 13, r: -14, w: 13 },
  { s: "cheese", x: 30, y: 12, r: 8, w: 10 },
  { s: "makhana-3", x: -6, y: 27, r: 24, w: 12 },
  { s: "pepper", x: 9, y: 27, r: -20, w: 9 },
  { s: "makhana-2", x: -20, y: 26, r: -8, w: 11 },
  { s: "berry", x: 21, y: 25, r: 16, w: 9 },
  { s: "makhana-4", x: 1, y: 38, r: 6, w: 10 },
];

const STORAGE_KEY = "yb-loader";

/**
 * G-01. First-visit loader on `/` only. Flagged by the inline <head> script (html[data-yb-loader="on"]), so the cream
 * cover is in the first paint and hydration cannot flash the page. Content is SSR'd underneath. Skippable.
 */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const el = root.current;
    if (!el || html.dataset.ybLoader !== "on") return;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage blocked: loader may repeat, harmless */
    }

    const shapes = el.querySelectorAll("[data-shape]");
    const line = el.querySelector<HTMLElement>("[data-line]");
    const cover = el.querySelector("[data-cover]");
    const curtain = el.querySelector("[data-curtain]");
    let finished = false;
    let split: SplitText | null = null;

    const finish = () => {
      if (finished) return;
      finished = true;
      tl.kill();
      split?.revert();
      delete html.dataset.ybLoader;
      setGone(true);
      cleanup();
    };
    const skip = () => {
      if (finished) return;
      // Jump to the curtain exit so the handover still reads as one motion.
      tl.timeScale(5);
    };

    const ctx = gsap.context(() => {
      split = SplitText.create(line, { type: "chars" });
    }, el);

    const tl = gsap.timeline({ onComplete: finish });
    tl.set([shapes, line], { visibility: "visible" }, 0)
      .fromTo(
        shapes,
        { y: () => window.innerHeight * 1.1, rotation: () => gsap.utils.random(-70, 70), scale: 0.7 },
        { y: 0, rotation: (i: number) => PILE[i]?.r ?? 0, scale: 1, duration: 0.55, ease: ease.crunch, stagger: 0.03 },
        0,
      )
      .fromTo(split!.chars, { opacity: 0, yPercent: 40 }, { opacity: 1, yPercent: 0, duration: 0.3, ease: "back.out(1.4)", stagger: 0.022 }, 0.2)
      // brand-red curtain rises over everything...
      .fromTo(curtain, { yPercent: 102 }, { yPercent: 0, duration: 0.4, ease: ease.roast }, 0.72)
      .set(cover, { autoAlpha: 0 })
      // ...and wipes up and off; the hero starts as it leaves.
      .add(() => {
        html.dataset.ybLoader = "leaving"; // overlay stays, but "loader active" is over for the hero
        window.dispatchEvent(new Event(LOADER_DONE_EVENT));
      }, ">+0.02")
      .to(curtain, { yPercent: -102, duration: 0.5, ease: ease.exit }, ">");

    const onKey = () => skip();
    window.addEventListener("pointerdown", skip, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    function cleanup() {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
    }

    return () => {
      cleanup();
      tl.kill();
      ctx.revert();
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} aria-hidden="true" className="yb-loader pointer-events-auto fixed inset-0 z-[100] overflow-hidden">
      <div data-cover="" className="absolute inset-0 bg-cream">
        <div className="absolute inset-x-0 bottom-0 h-[60vh]">
          {PILE.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              data-shape=""
              src={shapeSrc(p.s)}
              alt=""
              draggable={false}
              className="absolute bottom-0 left-1/2 h-auto select-none will-change-transform"
              style={{
                width: `${p.w}vmin`,
                marginLeft: `calc(${p.x}vw - ${p.w / 2}vmin)`,
                bottom: `${p.y}vh`,
                visibility: "hidden",
              }}
            />
          ))}
        </div>
        <p className="display-type absolute inset-x-0 top-[34%] text-center text-[length:clamp(2rem,6vw,5.5rem)] text-red">
          <span data-line="" style={{ visibility: "hidden" }}>
            {loaderCopy.line}
          </span>
        </p>
      </div>
      <div data-curtain="" className="absolute inset-0 translate-y-[102%] bg-red [border-radius:50%_50%_0_0/12vw_12vw_0_0]" />
    </div>
  );
}
