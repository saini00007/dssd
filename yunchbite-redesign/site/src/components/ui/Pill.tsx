import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PillTone = "outline" | "cream" | "red" | "yellow" | "ink" | "flavour";

const tones: Record<PillTone, string> = {
  outline: "border-current/40 text-current",
  cream: "border-transparent bg-cream text-ink",
  red: "border-transparent bg-red text-cream",
  yellow: "border-transparent bg-yellow text-ink",
  ink: "border-transparent bg-ink text-cream",
  flavour: "border-transparent bg-flavour text-flavour-ink",
};

export interface PillProps {
  as?: ElementType;
  tone?: PillTone;
  size?: "sm" | "md";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Static pill / chip label (format, size, claim). Use `style={{"--flavour": c, "--flavour-ink": i}}` with tone="flavour". */
export function Pill({ as: Tag = "span", tone = "outline", size = "md", className, style, children }: PillProps) {
  return (
    <Tag
      style={style}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border font-semibold leading-none whitespace-nowrap",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm",
        tones[tone],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export { Pill as Chip };
