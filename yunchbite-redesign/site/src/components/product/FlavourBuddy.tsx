"use client";
import Image from "next/image";
import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import type { BuddyPose, Flavour } from "@/data/types";
import { popElement } from "@/components/motion/pop";
import { buddyImage, shapeSrc } from "@/lib/media";
import { cn } from "@/lib/cn";

export interface FlavourBuddyHandle {
  /** Character pop: Buddy and his ingredient scale up with the crunch overshoot. */
  pop: () => void;
}

export interface FlavourBuddyProps {
  flavour: Pick<Flavour, "ingredient" | "name">;
  pose?: BuddyPose;
  /** CSS width of the whole figure (default "100%": fills its box). */
  width?: string | number;
  /** Where the ingredient sits on Buddy, in % of the figure (tune per pose). */
  hand?: { x: number; y: number; size?: number; rotate?: number };
  /** Plays the pop whenever this flips to true (and once on mount when `popOnMount`). */
  active?: boolean;
  popOnMount?: boolean;
  priority?: boolean;
  className?: string;
  ref?: Ref<FlavourBuddyHandle>;
}

/** Makhana Buddy holding the flavour's ingredient (a paper-cut shape in/near his hand). Decorative (alt=""). */
export function FlavourBuddy({
  flavour,
  pose = "peek",
  width = "100%",
  hand = { x: -4, y: 56, size: 34, rotate: -16 },
  active,
  popOnMount,
  priority,
  className,
  ref,
}: FlavourBuddyProps) {
  const root = useRef<HTMLDivElement>(null);
  const img = buddyImage(pose);
  const prev = useRef<boolean | undefined>(popOnMount ? false : active);

  const pop = () => {
    if (!root.current) return;
    popElement(root.current);
  };
  useImperativeHandle(ref, () => ({ pop }));

  useEffect(() => {
    if (active && !prev.current) pop();
    prev.current = active;
  }, [active]);

  return (
    <div ref={root} className={cn("relative", className)} style={{ width }} aria-hidden="true">
      <Image src={img.src} alt="" width={img.width} height={img.height} priority={priority} sizes="(min-width: 768px) 240px, 40vw" className="h-auto w-full select-none" draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={shapeSrc(flavour.ingredient)}
        alt=""
        width={120}
        height={120}
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{
          left: `${hand.x}%`,
          top: `${hand.y}%`,
          width: `${hand.size ?? 34}%`,
          height: "auto",
          transform: `rotate(${hand.rotate ?? 0}deg)`,
        }}
      />
    </div>
  );
}
