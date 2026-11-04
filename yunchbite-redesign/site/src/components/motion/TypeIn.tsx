"use client";
import { useRef, type CSSProperties, type ElementType } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "./gsap";
import { whenLoaderDone } from "./loader-gate";
import { dur, mq, reveal, stagger as stg } from "@/lib/tokens";

export interface TypeInProps {
  /** Rendered tag, default span. Use "h1"/"h2"… for headings. */
  as?: ElementType;
  /** The full text. It is always in the server HTML; the animation only moves the letters. */
  text: string;
  /** "load": play on mount (waits for the first-visit loader if one is showing). "scroll": play when it enters the viewport. */
  trigger?: "load" | "scroll";
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
export function TypeIn({ as: Tag = "span", text, trigger = "scroll", delay = 0, className, style, id }: TypeInProps) {
  const ref = useRef<HTMLElement>(null);
  const isHeading = typeof Tag === "string" && /^h[1-6]$/.test(Tag);

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
        let cleanupTrigger: () => void = () => {};

        const split = SplitText.create(el, {
          type: "words,chars",
          autoSplit: true,
          // Headings may carry an aria-label: "auto" labels the heading and hides the chars, keeping its role and a
          // single copy of the text. A plain span/p may not carry aria-label: "hidden" hides the split element and adds
          // a screen-reader copy next to it (inside the parent heading, so the heading's name stays correct).
          aria: isHeading ? "auto" : "hidden",
          onSplit(self) {
            cleanupTrigger();
            if (played) return; // re-split after the animation finished: leave the chars in their final state
            const tween = gsap.fromTo(
              self.chars,
              { opacity: 0, yPercent: 38 },
              {
                opacity: 1,
                yPercent: 0,
                duration: dur.quick + 0.2,
                ease: "back.out(1.3)",
                stagger: stg.char,
                delay,
                paused: true,
                onComplete: () => {
                  played = true;
                },
              },
            );
            el.setAttribute("data-yb-ready", "");
            if (trigger === "load") {
              cleanupTrigger = whenLoaderDone(() => tween.play());
            } else {
              const st = ScrollTrigger.create({
                trigger: el,
                start: reveal.start,
                once: true,
                onEnter: () => tween.play(),
              });
              cleanupTrigger = () => st.kill();
            }
            return tween;
          },
        });

        return () => {
          cleanupTrigger();
          split.revert();
        };
      });
    },
    { scope: ref, dependencies: [text, trigger, delay, isHeading], revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} id={id} className={className} style={style} data-yb-anim="">
      {text}
    </Tag>
  );
}
