import { TypeIn } from "@/components/motion/TypeIn";
import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";

/**
 * Local variant of ui/OutlineHeading (P13): giant outline headline whose `solid` part fills in (types in) on scroll.
 * Difference: the visual copies are aria-hidden and the accessible heading text is a plain sr-only string, because
 * TypeIn on a <span> gets an aria-label from SplitText (axe: aria-prohibited-attr).
 */
export function OutlineTitle({ text, solid, id, className, stroke = 2 }: { text: string; solid: string; id?: string; className?: string; stroke?: number }) {
  const idx = text.toLowerCase().indexOf(solid.toLowerCase());
  const before = idx > 0 ? text.slice(0, idx) : "";
  const mid = idx >= 0 ? text.slice(idx, idx + solid.length) : text;
  const after = idx >= 0 ? text.slice(idx + solid.length) : "";
  return (
    <h2 id={id} className={cn("display-type relative text-display", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="text-outline block" style={{ "--stroke": `${stroke}px` } as CSSProperties}>
        {text}
      </span>
      <span aria-hidden="true" className="absolute inset-0 block">
        {before && <span className="opacity-0">{before}</span>}
        <TypeIn text={mid} trigger="scroll" />
        {after && <span className="opacity-0">{after}</span>}
      </span>
    </h2>
  );
}
