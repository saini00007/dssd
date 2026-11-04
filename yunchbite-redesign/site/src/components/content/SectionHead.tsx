import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TypeIn } from "@/components/motion/TypeIn";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

export interface SectionHeadProps {
  /** "01" style number shown in the eyebrow. */
  n?: string;
  eyebrow?: string;
  heading: string;
  lead?: ReactNode;
  id?: string;
  as?: "h2" | "h3";
  /** Centre the block. */
  center?: boolean;
  className?: string;
  size?: "lg" | "md";
}

/** Eyebrow + h2 (types in) + lead paragraph: the editorial section opener used on every content page. */
export function SectionHead({ n, eyebrow, heading, lead, id, as = "h2", center, className, size = "md" }: SectionHeadProps) {
  return (
    <div className={cn(center && "text-center", className)}>
      {(n || eyebrow) && (
        <Eyebrow className="mb-4">
          {n && <span className="tabular">{n}</span>}
          {n && eyebrow ? <span aria-hidden="true">·</span> : null}
          {eyebrow}
        </Eyebrow>
      )}
      <TypeIn
        as={as}
        id={id}
        text={heading}
        className={cn(
          "display-type block",
          size === "lg" ? "text-[length:var(--text-display)] leading-[0.92]" : "text-[length:var(--text-h2)] leading-[0.98]",
        )}
      />
      {lead && (
        <Reveal y={24} className={cn("mt-6 max-w-[62ch] text-[1.1rem] leading-[1.65] text-current/85", center && "mx-auto")}>
          <p>{lead}</p>
        </Reveal>
      )}
    </div>
  );
}
