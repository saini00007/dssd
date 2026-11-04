"use client";
import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { deferIn } from "@/components/motion/entrance";
import { mq } from "@/lib/tokens";

// Final (resting) arch. The CSS class in globals-free inline style keeps SSR output identical to the end state.
const ARCH = "inset(0vw 0% 0% 0% round 50% 50% 0% 0% / 10vw 10vw 0% 0%)";
const ARCH_FROM = "inset(6vw 9% 0% 9% round 50% 50% 0% 0% / 22vw 22vw 0% 0%)";

export interface ArchRevealProps {
  as?: ElementType;
  behind?: string;
  className?: string;
  style?: CSSProperties;
  headerTheme?: "dark" | "light";
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children?: ReactNode;
}

/** Section with an arched top edge that rises into place as it enters (P07, scroll-scrubbed). */
export function ArchReveal({ as: Tag = "section", behind, className, style, headerTheme, children, ...aria }: ArchRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.motion, (_c, safe) => {
        const off = deferIn(safe, () => {
        gsap.fromTo(
          el,
          { clipPath: ARCH_FROM },
          {
            clipPath: ARCH,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 98%", end: "top 40%", scrub: true },
          },
        );
        });
        return () => off();
      });
    },
    { scope: ref },
  );

  return (
    <div style={{ background: behind }}>
      <Tag ref={ref} className={className} style={{ ...style, clipPath: ARCH }} data-header-theme={headerTheme} {...aria}>
        {children}
      </Tag>
    </div>
  );
}
