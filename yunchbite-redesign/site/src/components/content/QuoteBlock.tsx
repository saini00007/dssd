import { TypeIn } from "@/components/motion/TypeIn";
import { cn } from "@/lib/cn";

export interface QuoteBlockProps {
  quote: string;
  cite?: string;
  tone?: "ink" | "cream";
  className?: string;
}

/** Pull quote: a giant opening mark, the quote types in on scroll. */
export function QuoteBlock({ quote, cite, tone = "ink", className }: QuoteBlockProps) {
  return (
    <figure className={cn("relative", className)}>
      <span aria-hidden="true" className={cn("display-type absolute -left-1 -top-10 text-[9rem] leading-none md:-top-14 md:text-[12rem]", tone === "cream" ? "text-yellow" : "text-red")}>
        “
      </span>
      <blockquote className="relative pt-14 md:pt-20">
        <TypeIn as="p" text={quote} className="display-type block max-w-[22ch] text-[length:clamp(2.2rem,5.2vw,4.8rem)] leading-[0.98]" />
      </blockquote>
      {cite && <figcaption className="mt-6 text-sm font-bold uppercase tracking-[0.14em] opacity-80">{cite}</figcaption>}
    </figure>
  );
}
