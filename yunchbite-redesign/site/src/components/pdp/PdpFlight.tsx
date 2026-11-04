"use client";
import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/components/motion/gsap";
import { popElement } from "@/components/motion/pop";
import { whenLoaderDone } from "@/components/motion/loader-gate";
import { dur, ease, mq } from "@/lib/tokens";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** True while the browser runs a view transition (we arrived by a link, e.g. a pack card morphing into the hero). */
function viewTransitionActive() {
  try {
    return document.documentElement.matches(":active-view-transition");
  } catch {
    return false;
  }
}

/**
 * Runs the product page choreography. It wraps the whole page and finds its parts through data-* hooks:
 *  - Entrance (R1 E26, about 1.5 s): title types in (TypeIn) -> sub-line -> chips -> pack rises -> Buddy pops (~1 s after the title).
 *  - Pack flight (R2-C3, desktop + motion): the stage is sticky for 0.8 viewport; the pack tilts and rises ACROSS the title (scrubbed),
 *    then glides down the page and lands on the empty slot beside the data cards (`[data-land]`). Pure transform, scrubbed by scroll.
 *  - Mobile / tablet: entrance + a gentle tilt on scroll. Reduced motion: nothing moves, the pack stays where it is.
 * `data-flight="on"` is set on the root while the flight is active (the landing slot and the card layout key off it).
 */
export function PdpFlight({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = <T extends HTMLElement>(s: string) => el.querySelector<T>(s);
      const hero = q("[data-hero]");
      const stage = q("[data-stage]");
      const slot = q("[data-slot]");
      const pack = q("[data-pack]");
      const packIn = q("[data-in=pack]");
      const title = q("h1");
      const disc = q("[data-disc]");
      const sub = q("[data-in=sub]");
      const chips = q("[data-in=chips]");
      const aside = q("[data-in=aside]");
      const buddy = q("[data-in=buddy]");
      const marks = [disc, sub, chips, aside, buddy, packIn].filter(Boolean) as HTMLElement[];
      if (!hero || !stage || !slot || !pack) return;

      const mm = gsap.matchMedia();
      mm.add(mq.reduce, () => marks.forEach((m) => m.setAttribute("data-yb-ready", "")));

      // ---- entrance --------------------------------------------------------------------------------------------
      mm.add(mq.motion, () => {
        const viaTransition = viewTransitionActive();
        const tl = gsap.timeline({ paused: true });
        if (disc) {
          gsap.set(disc, { scale: 0.7, opacity: 0 });
          tl.to(disc, { scale: 1, opacity: 1, duration: dur.roast + 0.2, ease: ease.glide }, 0);
        }
        if (packIn && !viaTransition) {
          const rise = Math.max(window.innerHeight - slot.getBoundingClientRect().top + 60, 300);
          gsap.set(packIn, { y: rise, rotate: 9, opacity: 1 });
          tl.to(packIn, { y: 0, rotate: 0, duration: 1.15, ease: "expo.out" }, 0.25);
        }
        if (sub) {
          gsap.set(sub, { opacity: 0, y: 14 });
          tl.to(sub, { opacity: 1, y: 0, duration: dur.move, ease: ease.glide }, 0.5);
        }
        if (chips) {
          gsap.set(chips, { opacity: 0, y: 14 });
          tl.to(chips, { opacity: 1, y: 0, duration: dur.move, ease: ease.glide }, 0.57);
        }
        if (aside) {
          gsap.set(aside, { opacity: 0, x: -20 });
          tl.to(aside, { opacity: 1, x: 0, duration: dur.move, ease: ease.glide }, 0.85);
        }
        if (buddy) {
          gsap.set(buddy, { opacity: 0, scale: 0.55 });
          tl.add(() => void popElement(buddy), 1.03);
        }
        marks.forEach((m) => m.setAttribute("data-yb-ready", ""));
        const cancel = whenLoaderDone(() => tl.play());
        return () => {
          cancel();
          tl.kill();
          gsap.set(marks, { clearProps: "transform,opacity" });
          if (packIn) gsap.set(packIn, { clearProps: "transform,opacity" });
        };
      });

      // ---- flight: desktop ---------------------------------------------------------------------------------------
      mm.add(`${mq.motion} and (min-width: 1024px)`, () => {
        const land = q("[data-land]");
        if (!land) return;
        el.dataset.flight = "on";
        gsap.set(pack, { transformOrigin: "50% 50%" });

        const update = () => {
          const sr = slot.getBoundingClientRect();
          const lr = land.getBoundingClientRect();
          const hr = stage.getBoundingClientRect();
          const H = window.innerHeight;
          const s = window.scrollY;
          const slotC = { x: sr.left + sr.width / 2, y: sr.top + sr.height / 2 };
          const landC = { x: lr.left + lr.width / 2, y: lr.top + lr.height / 2 };
          const run = Math.max(hero.offsetHeight - stage.offsetHeight, 1);
          const sLand = Math.min(Math.max(sr.height > 0 ? lr.height / sr.height : 1, 0.2), 1.6);
          const sLandW = sr.width > 0 ? lr.width / sr.width : 1;
          const scaleLand = Math.min(sLand, sLandW);

          // Phase A: stage pinned. Pack rises across the title and tilts.
          const tr = title?.getBoundingClientRect();
          const titleRelY = tr ? tr.top + tr.height / 2 - hr.top : H * 0.28;
          const p1 = { x: slotC.x + (el.clientWidth * 0.1), y: hr.top + titleRelY + H * 0.1 };
          const a = clamp01(s / run);
          const eA = gsap.parseEase("power2.inOut")(a);

          let x: number, y: number, rot: number, sc: number;
          if (s <= run) {
            x = lerp(slotC.x, p1.x, eA);
            y = lerp(slotC.y, p1.y, eA);
            rot = lerp(0, -16, eA);
            sc = lerp(1, 0.92, eA);
          } else {
            // Phase B: glide from the title to the landing slot (which scrolls up to meet it).
            const sEnd = landC.y + s - H * 0.52; // scroll position at which the slot sits at 52% of the viewport
            const b = clamp01((s - run) / Math.max(sEnd - run, H * 0.5));
            const eB = gsap.parseEase("power3.inOut")(b);
            // fixed start point = where phase A ended (stage still pinned at that instant: stage top 0)
            const startY = titleRelY + H * 0.1;
            const startX = slotC.x + el.clientWidth * 0.1;
            x = lerp(startX, landC.x, eB);
            y = lerp(startY, landC.y, eB);
            rot = lerp(-16, 0, gsap.parseEase("back.out(2.2)")(b));
            sc = lerp(0.92, scaleLand, eB);
          }
          gsap.set(pack, { x: x - slotC.x, y: y - slotC.y, rotation: rot, scale: sc });
        };

        const st = ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onUpdate: update,
          onRefresh: update,
        });
        update();
        return () => {
          st.kill();
          delete el.dataset.flight;
          gsap.set(pack, { clearProps: "transform,opacity" });
        };
      });

      // ---- tablet / phone: a gentle tilt as the hero scrolls away -------------------------------------------------
      mm.add(`${mq.motion} and (max-width: 1023px)`, () => {
        const tween = gsap.to(pack, {
          y: -50,
          rotation: -7,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5 },
        });
        return () => {
          tween.revert();
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="group/pdp">
      {children}
    </div>
  );
}
