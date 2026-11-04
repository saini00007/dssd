"use client";
import { useRef, type CSSProperties, type ElementType } from "react";
import { gsap, SplitText, useGSAP } from "./gsap";
import { entranceOn, observe, revealOnView } from "./entrance";
import { whenLoaderDone } from "./loader-gate";
import { dur, mq, stagger as stg } from "@/lib/tokens";

export interface TypeInProps {
  /** Rendered tag, default span. Use "h1"/"h2"… for headings. */
  as?: ElementType;
  /** The full text. It is always in the server HTML; the animation only moves the letters. */
  text: string;
  /**
   * "load": hero title, in the first viewport by construction (implies `lcp`): visible in the server HTML on a hard load
   * (no split, no entrance); types in under the home loader and after a client-side navigation.
   * "scroll": split lazily (about a viewport ahead) and type in when it reaches the reveal line.
   */
  trigger?: "load" | "scroll";
  /** Force the LCP-safe mode for a "scroll" TypeIn that sits in the first viewport. */
  lcp?: boolean;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

/**
 * Letter-by-letter headline (y 0.35em -> 0, opacity, 22 ms stagger, subtle crunch).
 * SplitText with autoSplit re-splits on resize / late font loads. aria "hidden" keeps the text accessible on any tag.
 * Reduced motion: no split, text shown as is.
 */
export function TypeIn({ as: Tag = "span", text, trigger = "scroll", lcp, delay = 0, className, style, id }: TypeInProps) {
  const ref = useRef<HTMLElement>(null);
  const isHeading = typeof Tag === "string" && /^h[1-6]$/.test(Tag);
  const hero = lcp || trigger === "load";

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(mq.reduce, () => {
        el.setAttribute("data-yb-ready", "");
      });

      mm.add(mq.motion, () => {
        let played = false;
        let revealed = false;
        let split: SplitText | null = null;
        let tween: gsap.core.Tween | null = null;
        let cancelWait: () => void = () => {};
        const stops: Array<() => void> = [];

        const doSplit = () => {
          if (split) return;
          split = SplitText.create(el, {
            type: "words,chars",
            autoSplit: true,
            // Headings may carry an aria-label: "auto" labels the heading and hides the chars, keeping its role and a
            // single copy of the text. A plain span/p may not carry aria-label: "hidden" hides the split element and adds
            // a screen-reader copy next to it (inside the parent heading, so the heading's name stays correct).
            aria: isHeading ? "auto" : "hidden",
            onSplit(self) {
              if (played) return; // re-split after the animation finished: leave the chars in their final state
              tween = gsap.fromTo(
                self.chars,
                { opacity: 0, yPercent: 38 },
                {
                  opacity: 1,
                  yPercent: 0,
                  duration: dur.quick + 0.2,
                  ease: "back.out(1.3)",
                  stagger: stg.char,
                  delay,
                  paused: !revealed,
                  onComplete: () => {
                    played = true;
                  },
                },
              );
              el.setAttribute("data-yb-ready", "");
              return tween;
            },
          });
        };
        const play = () => {
          revealed = true;
          if (!split) doSplit();
          else tween?.play();
        };

        if (hero) {
          if (!entranceOn()) {
            // hard load, no loader: the heading is already painted from the server HTML; leave it alone
            el.setAttribute("data-yb-ready", "");
          } else {
            el.setAttribute("data-yb-ready", "wait");
            doSplit();
            cancelWait = whenLoaderDone(() => play());
          }
        } else {
          // Split about a viewport before it is needed (layout work stays out of hydration), play at the reveal line.
          stops.push(
            revealOnView(el, {
              onWait: () => {
                const stopNear = observe(el, "100% 0px 100% 0px", (e) => {
                  if (!e.isIntersecting) return;
                  stopNear();
                  if (!played) doSplit();
                });
                stops.push(stopNear);
              },
              play: (instant) => {
                if (instant) {
                  // static first paint, or already behind the reader: no animation
                  played = true;
                  tween?.progress(1);
                  el.setAttribute("data-yb-ready", "");
                  return;
                }
                play();
              },
            }),
          );
        }

        return () => {
          cancelWait();
          stops.forEach((s) => s());
          split?.revert();
          split = null;
        };
      });
    },
    { scope: ref, dependencies: [text, trigger, delay, isHeading, hero], revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} id={id} className={className} style={style} data-yb-anim={hero ? "lcp" : ""}>
      {text}
    </Tag>
  );
}
