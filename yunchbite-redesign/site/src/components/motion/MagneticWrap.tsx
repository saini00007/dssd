"use client";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "./gsap";
import { mq } from "@/lib/tokens";

export interface MagneticWrapProps {
  children: ReactNode;
  /** 0..1: how far the child follows the pointer (default 0.28). */
  strength?: number;
  as?: ElementType;
  className?: string;
}

/** Subtle magnetic pull toward the pointer. Fine pointers only, never with reduced motion. */
export function MagneticWrap({ children, strength = 0.28, as: Tag = "span", className }: MagneticWrapProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const inner = el?.firstElementChild as HTMLElement | null;
      if (!el || !inner) return;
      const mm = gsap.matchMedia();
      mm.add(`${mq.fine} and ${mq.motion}`, () => {
        const xTo = gsap.quickTo(inner, "x", { duration: 0.6, ease: "elastic.out(1, 0.55)" });
        const yTo = gsap.quickTo(inner, "y", { duration: 0.6, ease: "elastic.out(1, 0.55)" });
        let rect: DOMRect | null = null;
        const enter = () => {
          rect = el.getBoundingClientRect();
        };
        const move = (e: PointerEvent) => {
          if (!rect) rect = el.getBoundingClientRect();
          xTo((e.clientX - (rect.left + rect.width / 2)) * strength);
          yTo((e.clientY - (rect.top + rect.height / 2)) * strength);
        };
        const leave = () => {
          rect = null;
          xTo(0);
          yTo(0);
        };
        el.addEventListener("pointerenter", enter);
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointerenter", enter);
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
          gsap.set(inner, { clearProps: "transform" });
        };
      });
    },
    { scope: ref, dependencies: [strength] },
  );

  return (
    <Tag ref={ref} className={`inline-block p-2 -m-2 ${className ?? ""}`}>
      {children}
    </Tag>
  );
}
