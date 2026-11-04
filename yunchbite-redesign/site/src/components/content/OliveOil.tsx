"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { whenInView } from "@/components/motion/entrance";
import { RingBurst, type RingBurstHandle } from "@/components/motion/RingBurst";
import { shapeSrc } from "@/lib/media";
import { dur, ease, mq } from "@/lib/tokens";
import { photos } from "@/data/assets";

/**
 * IQ-03 stage: an oil drop falls (ease.exit) onto the makhana bowl, a ring splash and three small drops pop out,
 * the bowl takes the hit with a little bounce. Plays once on enter. Reduced motion: the still bowl.
 */
export function OliveOil({ neverFried }: { neverFried: string }) {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<RingBurstHandle>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const drop = el.querySelector("[data-drop]");
      const bowl = el.querySelector("[data-bowl]");
      const splash = el.querySelectorAll("[data-splash]");
      const badge = el.querySelector("[data-badge]");
      const mm = gsap.matchMedia();
      mm.add(mq.reduce, () => void gsap.set(badge, { opacity: 1 }));
      mm.add(mq.motion, () => {
        gsap.set(drop, { opacity: 0, y: 0 });
        gsap.set(splash, { opacity: 0, scale: 0 });
        gsap.set(badge, { opacity: 0, scale: 0.5, rotate: -12 });
        const fall = el.clientHeight * 0.36;
        const tl = gsap.timeline({ paused: true });
        tl.to(drop, { opacity: 1, duration: 0.15 })
          .to(drop, { y: fall, scaleY: 1.25, duration: 0.7, ease: ease.exit }, 0)
          .set(drop, { opacity: 0 })
          .call(() => ring.current?.burst())
          .fromTo(bowl, { y: 0 }, { y: 8, duration: 0.09, yoyo: true, repeat: 1, ease: "power1.out" }, "<")
          .to(splash, { opacity: 1, scale: 1, x: (i) => [-70, 0, 70][i], y: (i) => [-50, -90, -44][i], rotate: (i) => [-30, 0, 30][i], duration: dur.pop, ease: ease.crunch, stagger: 0.04 }, "<")
          .to(splash, { opacity: 0, y: "+=40", duration: 0.5, ease: "power2.in" }, ">0.15")
          .to(badge, { opacity: 1, scale: 1, rotate: -4, duration: dur.pop + 0.1, ease: ease.crunch }, "<-0.2");
        const stop = whenInView(el, "top 65%", () => tl.play());
        return () => {
          stop();
          tl.kill();
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative mx-auto aspect-[1/1] w-full max-w-[560px]">
      <div data-bowl="" className="absolute inset-x-0 bottom-0">
        <Image src={photos.makhanaBowl.src} alt={photos.makhanaBowl.alt} width={photos.makhanaBowl.width} height={photos.makhanaBowl.height} sizes="(min-width: 1024px) 560px, 90vw" className="h-auto w-full" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-drop="" src={shapeSrc("oil-drop")} alt="" width={120} height={120} className="absolute left-1/2 top-[2%] h-auto w-[16%] -translate-x-1/2 opacity-0 motion-reduce:hidden" />
        <div className="absolute left-1/2 top-[44%] size-[22%] -translate-x-1/2">
          <RingBurst ref={ring} color="#FFD200" />
          {[0, 1, 2].map((i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} data-splash="" src={shapeSrc("oil-drop")} alt="" width={60} height={60} className="absolute left-1/2 top-1/2 h-auto w-[34%] -translate-x-1/2 -translate-y-1/2 opacity-0" />
          ))}
        </div>
      </div>
      <p data-badge="" className="display-type absolute right-0 top-[4%] rotate-[-4deg] rounded-pill bg-yellow px-6 py-3 text-[length:clamp(1.4rem,3vw,2.4rem)] text-ink shadow-[var(--shadow-pill)]">
        {neverFried}
      </p>
    </div>
  );
}
