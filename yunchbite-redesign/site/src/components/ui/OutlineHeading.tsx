import type { CSSProperties, ElementType } from "react";
import { TypeIn } from "@/components/motion/TypeIn";
import { cn } from "@/lib/cn";

export interface OutlineHeadingProps {
  as?: ElementType;
  /** The whole heading text. */
  text: string;
  /** Part of `text` that fills solid as you scroll (default: all of it). The rest stays outline. */
  solid?: string;
  className?: string;
  /** Outline stroke width in px (default 2). */
  stroke?: number;
}

/**
 * Giant outline headline (P13). The outline is a decorative copy (aria-hidden); the real, accessible text sits on top
 * and its solid letters type in over the outline on scroll. Colour = currentColor.
 */
export function OutlineHeading({ as: Tag = "h2", text, solid, className, stroke = 2 }: OutlineHeadingProps) {
  const idx = solid ? text.indexOf(solid) : -1;
  const hasPart = solid != null && idx >= 0 && solid !== text;
  const before = hasPart ? text.slice(0, idx) : "";
  const mid = hasPart ? solid! : text;
  const after = hasPart ? text.slice(idx + mid.length) : "";

  return (
    <Tag className={cn("display-type relative text-display", className)}>
      <span aria-hidden="true" className="text-outline block" style={{ "--stroke": `${stroke}px` } as CSSProperties}>
        {text}
      </span>
      <span className="absolute inset-0 block">
        {before && (
          <span className="opacity-0">
            {before}
          </span>
        )}
        <TypeIn text={mid} trigger="scroll" />
        {after && (
          <span className="opacity-0">
            {after}
          </span>
        )}
      </span>
    </Tag>
  );
}
