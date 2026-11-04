"use client";
import { useId, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export interface PillFaqItem {
  q: string;
  a: string;
}

export interface PillFaqProps {
  items: PillFaqItem[];
  /** 2 columns from `md` up (default 2). */
  columns?: 1 | 2;
  tone?: "light" | "dark";
  /** Allow several open at once (default false: opening one closes the others). */
  multiple?: boolean;
  className?: string;
}

/**
 * Pill accordion (P14). Real buttons with aria-expanded/aria-controls. All answers are in the HTML (collapsed with
 * a CSS grid-rows transition), so crawlers and screen readers see everything.
 */
export function PillFaq({ items, columns = 2, tone = "light", multiple = false, className }: PillFaqProps) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const id = useId();

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(multiple ? prev : []);
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  // Distribute into columns so opening one doesn't re-flow the other column.
  const cols: { item: PillFaqItem; i: number }[][] = columns === 2 ? [[], []] : [[]];
  items.forEach((item, i) => cols[i % cols.length].push({ item, i }));

  return (
    <div className={cn("grid gap-3 md:gap-x-4", columns === 2 && "md:grid-cols-2", className)}>
      {cols.map((col, c) => (
        <div key={c} className="flex flex-col gap-3 self-start">
          {col.map(({ item, i }) => {
            const isOpen = open.has(i);
            return (
              <div
                key={i}
                className={cn(
                  "rounded-[32px] border-2 transition-colors duration-[var(--dur-quick)]",
                  tone === "dark" ? "border-cream/40 text-cream" : "border-ink/20 text-ink",
                  isOpen && (tone === "dark" ? "bg-cream text-red border-cream" : "bg-yellow border-yellow"),
                )}
              >
                <h3 className="font-body text-base font-bold md:text-lg">
                  <button
                    type="button"
                    id={`${id}-b${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${id}-p${i}`}
                    onClick={() => toggle(i)}
                    className="flex w-full items-center justify-between gap-4 rounded-[32px] px-6 py-4 text-left"
                  >
                    <span>{item.q}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)]",
                        tone === "dark" && !isOpen ? "bg-cream text-red" : "bg-ink text-cream",
                        isOpen && "rotate-45",
                      )}
                    >
                      <Icon name="plus" className="size-4" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`${id}-p${i}`}
                  role="region"
                  aria-labelledby={`${id}-b${i}`}
                  className={cn(
                    "grid transition-[grid-template-rows,visibility] duration-[var(--dur-move)] ease-[var(--ease-roast)]",
                    isOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 pr-16 text-[0.98rem] leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
