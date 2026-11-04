import { useId } from "react";
import { cn } from "@/lib/cn";

/** Round "Bestseller" ring stamp (text on a circle, slowly turning). Decorative; the label is also read out. */
export function BestsellerStamp({ label = "Bestseller", className }: { label?: string; className?: string }) {
  const id = useId();
  const text = `${label} · ${label} · ${label} · `;
  return (
    <span className={cn("pointer-events-none relative grid place-items-center rounded-full bg-yellow text-ink shadow-[var(--shadow-pill)]", className)}>
      <span className="sr-only">{label}</span>
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className="size-full motion-safe:animate-spin [animation-duration:20s]">
        <defs>
          <path id={id} d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0" />
        </defs>
        <text fontSize="10.5" fontWeight="800" letterSpacing="1.6" fill="currentColor" style={{ textTransform: "uppercase", fontFamily: "var(--font-display)" }}>
          <textPath href={`#${id}`} startOffset="0">
            {text}
          </textPath>
        </text>
      </svg>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="absolute size-[30%] text-red">
        <path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6-4.5-4.2 6.1-.8z" fill="currentColor" />
      </svg>
    </span>
  );
}
