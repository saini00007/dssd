"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { buddyImage } from "@/lib/media";
import { dur, ease, mq } from "@/lib/tokens";

/** Buddy sits on the footer wordmark and peeks up when you hover the wordmark area. */
export function FooterBuddy() {
  const img = buddyImage("sit");
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
    <div ref={root} aria-hidden="true" className="pointer-events-none absolute right-[calc(var(--gutter)+3%)] z-10 w-[clamp(120px,16cqw,240px)]" style={{ bottom: "calc(100% - var(--wm) * 0.1)", maskImage: "linear-gradient(to right, transparent 0, #000 14%)", WebkitMaskImage: "linear-gradient(to right, transparent 0, #000 14%)" }}>
      <Image src={img.src} alt="" width={img.width} height={img.height} sizes="(min-width: 1024px) 340px, 150px" className="h-auto w-full select-none" />
    </div>
  );
}
