"use client";
import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { whenLoaderDone } from "@/components/motion/loader-gate";
import { TypeIn } from "@/components/motion/TypeIn";
import { PackImage } from "@/components/product/PackImage";
import { ButtonLink, buttonClass, SlideArrow } from "@/components/ui/ButtonLink";
import { buddyImage, shapeSrc } from "@/lib/media";
import { dur, mq, stagger } from "@/lib/tokens";
import type { ShapeName } from "@/data/types";

export interface HeroPack {
  product: { slug: string; name: string; formatLabel: string; flavourKey: string };
}
export interface HeroProps {
  headline: string;
  line: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  packs: [HeroPack, HeroPack, HeroPack, HeroPack];
}

// Pack placement (in vw / % of the hero), tilt and the way each drifts away on scroll.
const PACK_SLOTS = [
  { cls: "left-[-2%] top-[11%] w-[32vw] md:left-[3%] md:top-[16%] md:w-[19vw]", r: -11, from: -1, out: { x: "-15vw", y: "-30vh", r: -20 }, z: 20 },
  { cls: "right-[-1%] top-[10%] w-[30vw] md:right-[3%] md:top-[11%] md:w-[18.5vw]", r: 10, from: 1, out: { x: "15vw", y: "-34vh", r: 22 }, z: 20 },
  { cls: "bottom-[2%] left-[-3%] w-[34vw] md:bottom-[7%] md:left-[7%] md:w-[20vw]", r: 7, from: -1, out: { x: "-12vw", y: "-20vh", r: 16 }, z: 20 },
  { cls: "bottom-[1%] right-[-4%] w-[32vw] md:bottom-[4%] md:right-[2.5%] md:w-[19vw]", r: -8, from: 1, out: { x: "13vw", y: "-22vh", r: -18 }, z: 22 },
] as const;

const KERNELS: { s: ShapeName; l: number; t: number; w: number; r: number; fall: number }[] = [
  { s: "makhana-1", l: 30, t: 10, w: 4.2, r: 20, fall: 0.9 },
  { s: "makhana-3", l: 62, t: 7, w: 3.6, r: -30, fall: 1.15 },
  { s: "makhana-2", l: 44, t: 78, w: 4.6, r: 40, fall: 0.8 },
  { s: "makhana-5", l: 24, t: 54, w: 3.4, r: -14, fall: 1.2 },
  { s: "makhana-4", l: 73, t: 60, w: 4.2, r: 25, fall: 1.0 },
  { s: "makhana-1", l: 54, t: 90, w: 3, r: -50, fall: 1.35 },
  { s: "makhana-3", l: 88, t: 34, w: 3.4, r: 12, fall: 0.85 },
  { s: "makhana-2", l: 8, t: 42, w: 3.2, r: -24, fall: 1.1 },
  { s: "makhana-5", l: 38, t: 30, w: 2.6, r: 60, fall: 1.25 },
  { s: "makhana-4", l: 66, t: 84, w: 2.8, r: -8, fall: 0.95 },
];

export function Hero({ headline, line, primary, secondary, packs }: HeroProps) {
  const root = useRef<HTMLElement>(null);
  const buddy = buddyImage("peek");

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      const q = <T extends Element = HTMLElement>(s: string) => gsap.utils.toArray<T>(s, el);

      // Reduced motion: static, everything visible and in place.
      mm.add(mq.reduce, () => {
        [...q("[data-yb-anim]")].forEach((n) => n.setAttribute("data-yb-ready", ""));
      });

      mm.add(mq.motion, () => {
        const packsIn = q("[data-pack-in]");
        const packsOut = q("[data-pack]");
        const kernelsIn = q("[data-k-in]");
        const kernelsFloat = q("[data-k-float]");
        const kernelsOut = q("[data-k]");
        const intro = q("[data-intro]");
        const buddyEl = el.querySelector<HTMLElement>("[data-buddy]");
        const vh = window.innerHeight;

        // ---- intro (plays when the loader curtain leaves; immediately on repeat visits) ----
        const tl = gsap.timeline({ paused: true });
        packsIn.forEach((p, i) => {
          const slot = PACK_SLOTS[i];
          tl.fromTo(
            p,
            { y: -(vh * 0.95), rotation: slot.r + slot.from * -26, opacity: 1 },
            { y: 0, rotation: slot.r, duration: dur.roast + 0.15, ease: "back.out(1.5)" },
            i * 0.07,
          );
          packsOut[i].setAttribute("data-yb-ready", "");
        });
        tl.fromTo(kernelsIn, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: dur.pop + 0.1, ease: "back.out(2)", stagger: { each: stagger.item * 0.7, from: "random" } }, 0.45);
        if (buddyEl) {
          gsap.set(buddyEl, { xPercent: 70, yPercent: 10, rotation: 8 });
          tl.to(buddyEl, { xPercent: 0, yPercent: 0, rotation: 0, duration: dur.roast, ease: "back.out(1.7)" }, 1.0);
        }
        gsap.set(intro, { opacity: 0, y: 26 });
        intro.forEach((n) => n.setAttribute("data-yb-ready", ""));
        tl.to(intro, { opacity: 1, y: 0, duration: dur.roast, ease: "power3.out", stagger: stagger.item * 1.4 }, 0.55);
        const cancel = whenLoaderDone(() => tl.play());

        // ---- idle float (paused while the hero is off screen) ----
        const idle = kernelsFloat.map((k, i) =>
          gsap.to(k, { y: i % 2 ? 14 : -14, x: i % 3 ? 6 : -6, rotation: i % 2 ? 10 : -10, duration: 2.6 + (i % 4) * 0.5, ease: "sine.inOut", yoyo: true, repeat: -1 }),
        );
        const toggle = ScrollTriggerToggle(el, idle);

        // ---- scroll: packs drift apart and up, headline ghosts, kernels fall toward HOME-02 (scrubbed, no pin) ----
        const scrub = gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true }, defaults: { ease: "none" } });
        packsOut.forEach((p, i) => scrub.to(p, { x: PACK_SLOTS[i].out.x, y: PACK_SLOTS[i].out.y, rotation: PACK_SLOTS[i].out.r, duration: 1 }, 0));
        scrub.to("[data-headline]", { opacity: 0.15, y: -vh * 0.06, duration: 0.7 }, 0);
        scrub.to("[data-intro-wrap]", { opacity: 0, y: -vh * 0.08, duration: 0.55 }, 0.15);
        kernelsOut.forEach((k, i) => {
          scrub.to(k, { y: () => window.innerHeight * KERNELS[i].fall * 0.95, rotation: KERNELS[i].r * 2, duration: 1 }, 0);
          scrub.to(k, { opacity: 0, duration: 0.3 }, 0.7);
        });
        if (buddyEl) scrub.to("[data-buddy-wrap]", { y: -vh * 0.12, duration: 1 }, 0);

        return () => {
          cancel();
          tl.kill();
          toggle();
          idle.forEach((t) => t.kill());
          scrub.scrollTrigger?.kill();
          scrub.kill();
        };
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-header-theme="light" aria-labelledby="home-hero-title" className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center overflow-x-clip px-gutter pb-[10svh] pt-[calc(var(--header-h)+22svh)] md:pt-[calc(var(--header-h)+2svh)] text-center">
      {/* warm backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(75% 65% at 50% 46%, var(--color-cream-2), var(--color-cream) 72%)" }} />

      {/* kernels (behind packs) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5]">
        {KERNELS.map((k, i) => (
          <div key={i} data-k="" className="absolute" style={{ left: `${k.l}%`, top: `${k.t}%`, width: `${k.w}vw`, minWidth: 26 } as CSSProperties}>
            <div data-k-float="">
              <div data-k-in="" style={{ rotate: `${k.r}deg` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shapeSrc(k.s)} alt="" width={120} height={120} loading="lazy" draggable={false} className="h-auto w-full select-none" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* packs */}
      {packs.map((p, i) => {
        const slot = PACK_SLOTS[i];
        return (
          <div key={p.product.slug} data-pack="" data-yb-anim="" className={`pointer-events-none absolute ${slot.cls}`} style={{ zIndex: slot.z }}>
            <div data-pack-in="" style={{ rotate: "0deg" }}>
              <PackImage product={p.product} size="lg" sizes="(min-width: 768px) 20vw, 36vw" priority decorative morph={false} imgClassName="drop-shadow-[0_26px_30px_rgb(42_18_16/0.3)]" />
            </div>
          </div>
        );
      })}

      {/* Buddy peeks from behind the lower right pack */}
      <div data-buddy-wrap="" aria-hidden="true" className="pointer-events-none absolute bottom-[10%] right-[15%] z-[21] hidden w-[10vw] md:block">
        <div data-buddy="" style={{ transformOrigin: "100% 100%" }}>
          <Image src={buddy.src} alt="" width={buddy.width} height={buddy.height} sizes="180px" className="h-auto w-full select-none" draggable={false} />
        </div>
      </div>

      <div className="relative z-10 w-full">
        <div data-headline="">
          <TypeIn
            as="h1"
            id="home-hero-title"
            text={headline}
            trigger="load"
            className="display-type mx-auto block max-w-[5.7em] text-[length:clamp(3.1rem,12vw,13rem)] leading-[0.86] text-ink"
          />
        </div>
        <div data-intro-wrap="" className="relative z-30">
          <p data-intro="" data-yb-anim="" className="mx-auto mt-6 max-w-[30ch] text-[length:clamp(1.05rem,1.7vw,1.5rem)] font-medium leading-snug md:max-w-[44ch]">
            {line}
          </p>
          <div data-intro="" data-yb-anim="" className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href={primary.href} className={buttonClass("solid", "lg")}>
              <span>{primary.label}</span>
              <SlideArrow />
            </a>
            <ButtonLink href={secondary.href} variant="ghost" size="lg">
              {secondary.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Pauses the idle tweens while the hero is not near the viewport. */
function ScrollTriggerToggle(el: HTMLElement, tweens: gsap.core.Tween[]) {
  const io = new IntersectionObserver(([e]) => tweens.forEach((t) => t.paused(!e.isIntersecting)), { rootMargin: "100px" });
  io.observe(el);
  return () => io.disconnect();
}
