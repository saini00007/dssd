"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { buddySrc } from "@/lib/media";
import { dur, ease, mq } from "@/lib/tokens";

/** Buddy sits on the footer wordmark and peeks up when you hover the wordmark area. */
export function FooterBuddy() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const zone = el?.parentElement;
      if (!el || !zone) return;
      const mm = gsap.matchMedia();
      mm.add(`${mq.fine} and ${mq.motion}`, () => {
        const up = () => gsap.to(el, { yPercent: -14, rotate: -3, duration: dur.pop, ease: ease.crunch, overwrite: true });
        const down = () => gsap.to(el, { yPercent: 0, rotate: 0, duration: dur.move, ease: ease.roast, overwrite: true });
        zone.addEventListener("pointerenter", up);
        zone.addEventListener("pointerleave", down);
        return () => {
          zone.removeEventListener("pointerenter", up);
          zone.removeEventListener("pointerleave", down);
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none absolute bottom-[78%] right-[6%] z-10 w-[clamp(90px,13cqw,190px)]">
      <Image src={buddySrc("sit")} alt="" width={480} height={560} sizes="(min-width: 1024px) 190px, 90px" className="h-auto w-full select-none" />
    </div>
  );
}
