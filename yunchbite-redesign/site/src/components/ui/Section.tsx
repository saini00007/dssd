import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArchReveal } from "./ArchReveal";

export type SectionTone = "cream" | "soft" | "red" | "maroon" | "yellow" | "flavour";

const toneClass: Record<SectionTone, string> = {
  cream: "bg-cream text-ink",
  soft: "bg-cream-2 text-ink",
  red: "bg-red text-cream",
  maroon: "bg-maroon text-cream",
  yellow: "bg-yellow text-ink",
  flavour: "bg-flavour text-flavour-ink",
};

function isDarkHex(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  // Relative luminance (sRGB)
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) < 0.28;
}

export interface SectionProps {
  as?: ElementType;
  tone?: SectionTone;
  /** Arched top edge (P07) with the scroll-scrubbed arch reveal. */
  arch?: boolean;
  /** Colour visible in the corners beside the arch (the previous section's background). Default: page cream. */
  behind?: string;
  /** For tone="flavour": the flavour colour and its readable ink. */
  flavour?: { color: string; ink: string };
  /** Default true: vertical section padding `clamp(4rem,10vw,9rem)`. */
  padded?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children?: ReactNode;
}

/**
 * Section wrapper. Sets the background/ink for its tone and `data-header-theme="dark"` on dark tones
 * so the fixed header switches to cream text while it overlaps this section.
 */
export function Section({
  as: Tag = "section",
  tone = "cream",
  arch,
  behind,
  flavour,
  padded = true,
  className,
  style,
  children,
  ...aria
}: SectionProps) {
  const dark = tone === "red" || tone === "maroon" || (tone === "flavour" && !!flavour && isDarkHex(flavour.color));
  const merged: CSSProperties = {
    ...(tone === "flavour" && flavour ? ({ "--flavour": flavour.color, "--flavour-ink": flavour.ink } as CSSProperties) : null),
    ...style,
  };
  const cls = cn("relative", toneClass[tone], padded && "py-section", dark && "on-dark", className);

  if (arch) {
    return (
      <ArchReveal as={Tag} behind={behind} className={cls} style={merged} headerTheme={dark ? "dark" : "light"} {...aria}>
        {children}
      </ArchReveal>
    );
  }
  return (
    <Tag className={cls} style={merged} data-header-theme={dark ? "dark" : "light"} {...aria}>
      {children}
    </Tag>
  );
}
