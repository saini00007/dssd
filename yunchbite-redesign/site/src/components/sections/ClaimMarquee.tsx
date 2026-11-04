import { claimChips } from "@/data/site";
import { cn } from "@/lib/cn";

export interface ClaimMarqueeProps {
  /** Claim labels (default: the five core claim chips). */
  items?: readonly string[];
  tone?: "red" | "cream" | "yellow" | "maroon";
  /** Seconds for one full loop (default 40). */
  duration?: number;
  /** Accessible name of the list. */
  label?: string;
  className?: string;
}

const tones = {
  red: { band: "bg-red text-cream", pill: "border-cream/50 text-cream", dot: "bg-yellow" },
  maroon: { band: "bg-maroon text-cream", pill: "border-cream/40 text-cream", dot: "bg-yellow" },
  cream: { band: "bg-cream text-ink", pill: "border-ink/30 text-ink", dot: "bg-red" },
  yellow: { band: "bg-yellow text-ink", pill: "border-ink/40 text-ink", dot: "bg-red" },
} as const;

function Row({ items, tone, dup }: { items: readonly string[]; tone: (typeof tones)[keyof typeof tones]; dup?: boolean }) {
  return (
    <ul
      {...(dup ? { "data-dup": "", "aria-hidden": true } : {})}
      className="flex shrink-0 items-center gap-3 pr-3"
    >
      {items.map((t, i) => (
        <li key={`${t}-${i}`} className={cn("flex items-center gap-3 rounded-pill border-2 px-6 py-3 text-[length:clamp(1rem,1.6vw,1.35rem)] font-bold whitespace-nowrap", tone.pill)}>
          <span aria-hidden="true" className={cn("size-2.5 rounded-full", tone.dot)} />
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Endless marquee of claim pills. Pauses on hover/focus; static wrapped row under reduced motion. Pure CSS. */
export function ClaimMarquee({ items = claimChips, tone = "red", duration = 40, label = "What makes Yunch Bite better", className }: ClaimMarqueeProps) {
  const t = tones[tone];
  // Repeat so one copy is always wider than the viewport, then duplicate for the seamless loop.
  const copy = [...items, ...items, ...items];
  return (
    <div role="group" aria-label={label} className={cn("yb-marquee overflow-hidden py-5", t.band, className)} data-header-theme={tone === "red" || tone === "maroon" ? "dark" : "light"}>
      <div className="yb-marquee-track flex w-max" style={{ ["--marquee-dur" as string]: `${duration}s` }}>
        <Row items={copy} tone={t} />
        <Row items={copy} tone={t} dup />
      </div>
    </div>
  );
}
