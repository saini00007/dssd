"use client";
import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/components/motion/gsap";
import { defer, entranceOn } from "@/components/motion/entrance";
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

      // ---- entrance (loader / client navigation only: on a hard load the hero is final in the server HTML) -------------
      mm.add(mq.motion, () => {
        if (!entranceOn()) {
          marks.forEach((m) => m.setAttribute("data-yb-ready", ""));
          return;
        }
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

      // ---- flight: desktop (built after first paint; measurements are cached, the scroll handler does pure math) -------
      mm.add(`${mq.motion} and (min-width: 1024px)`, () => {
        const land = q("[data-land]");
        if (!land) return;
        let st: ScrollTrigger | null = null;
        const off = defer(() => {
          el.dataset.flight = "on";
          gsap.set(pack, { transformOrigin: "50% 50%" });

          // Cached geometry, in document / stage-relative coordinates (re-measured on every ScrollTrigger refresh).
          let m = { H: 0, run: 1, heroTop: 0, slotX: 0, slotRelY: 0, titleRelY: 0, landX: 0, landY: 0, scaleLand: 1, w: 0 };
          const measure = () => {
            const s = window.scrollY;
            const sr = slot.getBoundingClientRect();
            const lr = land.getBoundingClientRect();
            const hr = stage.getBoundingClientRect();
            const hero0 = hero.getBoundingClientRect();
            const tr = title?.getBoundingClientRect();
            const H = window.innerHeight;
            const sLand = Math.min(Math.max(sr.height > 0 ? lr.height / sr.height : 1, 0.2), 1.6);
            const sLandW = sr.width > 0 ? lr.width / sr.width : 1;
            m = {
              H,
              run: Math.max(hero.offsetHeight - stage.offsetHeight, 1),
              heroTop: hero0.top + s,
              slotX: sr.left + sr.width / 2,
              slotRelY: sr.top + sr.height / 2 - hr.top,
              titleRelY: tr ? tr.top + tr.height / 2 - hr.top : H * 0.28,
              landX: lr.left + lr.width / 2,
              landY: lr.top + lr.height / 2 + s,
              scaleLand: Math.min(sLand, sLandW),
              w: el.clientWidth,
            };
          };

          const update = (s: number) => {
            const { H, run, heroTop, slotX, slotRelY, titleRelY, landX, landY, scaleLand, w } = m;
            // the sticky stage's top edge in the viewport at scroll `s`
            const stageTop = Math.min(Math.max(heroTop - s, 0), heroTop + run - s);
            const slotY = stageTop + slotRelY;
            const lY = landY - s;

            // Phase A: stage pinned. Pack rises across the title and tilts.
            const p1 = { x: slotX + w * 0.1, y: stageTop + titleRelY + H * 0.1 };
            const a = clamp01(s / run);
            const eA = gsap.parseEase("power2.inOut")(a);

            let x: number, y: number, rot: number, sc: number;
            if (s <= run) {
              x = lerp(slotX, p1.x, eA);
              y = lerp(slotY, p1.y, eA);
              rot = lerp(0, -16, eA);
              sc = lerp(1, 0.92, eA);
            } else {
              // Phase B: glide from the title to the landing slot (which scrolls up to meet it).
              const sEnd = landY - H * 0.52; // scroll position at which the slot sits at 52% of the viewport
              const b = clamp01((s - run) / Math.max(sEnd - run, H * 0.5));
              const eB = gsap.parseEase("power3.inOut")(b);
              // fixed start point = where phase A ended (stage still pinned at that instant: stage top 0)
              const startY = titleRelY + H * 0.1;
              const startX = slotX + w * 0.1;
              x = lerp(startX, landX, eB);
              y = lerp(startY, lY, eB);
              rot = lerp(-16, 0, gsap.parseEase("back.out(2.2)")(b));
              sc = lerp(0.92, scaleLand, eB);
            }
            setPack(x - slotX, y - slotY, rot, sc);
          };
          const setPack = (x: number, y: number, rotation: number, scale: number) => gsap.set(pack, { x, y, rotation, scale });

          measure();
          st = ScrollTrigger.create({
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => update(self.scroll()),
            onRefresh: (self) => {
              measure();
              update(self.scroll());
            },
          });
          update(window.scrollY);
        });
        return () => {
          off();
          st?.kill();
          delete el.dataset.flight;
          gsap.set(pack, { clearProps: "transform,opacity" });
        };
      });

      // ---- tablet / phone: a gentle tilt as the hero scrolls away -------------------------------------------------
      mm.add(`${mq.motion} and (max-width: 1023px)`, () => {
        let tween: gsap.core.Tween | null = null;
        const off = defer(() => {
          tween = gsap.to(pack, {
            y: -50,
            rotation: -7,
            ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5 },
          });
        });
        return () => {
          off();
          tween?.revert();
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
