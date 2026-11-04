"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { whenInView } from "@/components/motion/entrance";
import { shapeSrc } from "@/lib/media";
import { mq } from "@/lib/tokens";

const KERNELS = [
  { name: "makhana-1", x: 14, y: -8, s: 20, r: -18 },
  { name: "makhana-3", x: 34, y: -30, s: 22, r: 14 },
  { name: "makhana-2", x: 52, y: -10, s: 19, r: 30 },
  { name: "makhana-4", x: 24, y: -48, s: 15, r: -40 },
  { name: "makhana-5", x: 46, y: -52, s: 14, r: 22 },
] as const;

/** WHY-03: the tiffin lid pops, makhana kernels pop out. Final (open) state under reduced motion. */
export function TiffinMoment({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const lid = el.querySelector("[data-lid]");
      const kernels = el.querySelectorAll("[data-kernel]");
      const mm = gsap.matchMedia();
      mm.add(mq.reduce, () => {
        gsap.set(lid, { x: 30, y: -38, rotation: 16 });
        gsap.set(kernels, { opacity: 1, scale: 1 });
      });
      mm.add(mq.motion, () => {
        gsap.set(lid, { x: 0, y: 0, rotation: 0 });
        gsap.set(kernels, { opacity: 0, scale: 0.2, y: 50 });
        const tl = gsap.timeline({ paused: true });
        tl.to(lid, { x: 30, y: -38, rotation: 16, duration: 0.45, ease: "back.out(2.2)" })
          .to(kernels, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(2)", stagger: 0.07 }, "-=0.2");
        const stop = whenInView(el, "top 70%", () => tl.play());
        // gentle bob once open
        const bob = gsap.to(kernels, { y: "-=6", duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: { each: 0.2, from: "random" }, paused: true });
        tl.eventCallback("onComplete", () => void bob.play());
        return () => {
          stop();
          tl.kill();
          bob.kill();
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" className={className} style={{ aspectRatio: "1 / 1" }}>
      <div className="relative size-full">
        <svg viewBox="0 0 200 200" className="absolute inset-[6%] size-[88%] overflow-visible" focusable="false">
          <g>
            <path d="M44 92C44 86 156 86 156 92V130C156 138 44 138 44 130Z" fill="#CBD1DA" />
            <path d="M44 92C44 86 156 86 156 92C156 98 44 98 44 92Z" fill="#EEF1F5" />
            <path d="M126 96C148 94 156 94 156 92V130C156 138 130 138 124 136Z" fill="#9AA4B2" />
            <path d="M44 138C44 132 156 132 156 138V176C156 184 44 184 44 176Z" fill="#CBD1DA" />
            <path d="M44 138C44 132 156 132 156 138C156 144 44 144 44 138Z" fill="#EEF1F5" />
            <path d="M126 142C148 140 156 140 156 138V176C156 184 130 184 124 182Z" fill="#9AA4B2" />
            <path d="M36 88H46V170H36Z" fill="#5E6672" />
            <path d="M154 88H164V170H154Z" fill="#5E6672" />
          </g>
          <g data-lid="" style={{ transformBox: "fill-box" }}>
            <path d="M70 34C70 16 130 16 130 34L124 34C124 24 76 24 76 34Z" fill="#5E6672" />
            <path d="M98 30h4v18h-4Z" fill="#5E6672" />
            <path d="M44 46C44 40 156 40 156 46V84C156 92 44 92 44 84Z" fill="#CBD1DA" />
            <path d="M44 46C44 40 156 40 156 46C156 52 44 52 44 46Z" fill="#EEF1F5" />
            <path d="M126 50C148 48 156 48 156 46V84C156 92 130 92 124 90Z" fill="#9AA4B2" />
            <path d="M36 40H46V88H36Z" fill="#5E6672" />
            <path d="M154 40H164V88H154Z" fill="#5E6672" />
            <path d="M32 36h18v8H32Z" fill="#454C57" />
            <path d="M150 36h18v8h-18Z" fill="#454C57" />
          </g>
        </svg>
        {KERNELS.map((k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={k.name} data-kernel="" src={shapeSrc(k.name)} alt="" width={120} height={120} draggable={false} className="absolute opacity-0 motion-reduce:opacity-100" style={{ left: `${k.x}%`, top: `${44 + k.y * 0.6}%`, width: `${k.s}%`, rotate: `${k.r}deg` }} />
        ))}
      </div>
    </div>
  );
}
