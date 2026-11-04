"use client";
import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { gsap } from "@/components/motion/gsap";
import { dur, ease } from "@/lib/tokens";
import { cn } from "@/lib/cn";

export interface FilterOption {
  value: string;
  label: string;
  /** Optional count shown in a small badge. */
  count?: number;
}

export interface FilterPillsProps {
  options: FilterOption[];
  /** Controlled value. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Accessible name of the group (e.g. "Filter by range"). */
  label: string;
  tone?: "light" | "dark";
  className?: string;
}

/** Accessible radiogroup of pills with a sliding highlight. Arrow keys move and select; Home/End jump. */
export function FilterPills({ options, value, defaultValue, onChange, label, tone = "light", className }: FilterPillsProps) {
  const [inner, setInner] = useState(defaultValue ?? options[0]?.value);
  const current = value ?? inner;
  const group = useRef<HTMLDivElement>(null);
  const hl = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  const id = useId();

  const select = (v: string) => {
    if (value === undefined) setInner(v);
    onChange?.(v);
  };

  // Slide the highlight under the selected pill.
  useLayoutEffect(() => {
    const g = group.current;
    const h = hl.current;
    if (!g || !h) return;
    const place = (animate: boolean) => {
      const btn = g.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]');
      if (!btn) return;
      const vars = { x: btn.offsetLeft, y: btn.offsetTop, width: btn.offsetWidth, height: btn.offsetHeight, opacity: 1 };
      if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.to(h, { ...vars, duration: dur.move * 0.8, ease: ease.roast, overwrite: true });
      } else {
        gsap.set(h, vars);
      }
    };
    place(!first.current);
    first.current = false;
    const ro = new ResizeObserver(() => place(false));
    ro.observe(g);
    return () => ro.disconnect();
  }, [current, options]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const i = options.findIndex((o) => o.value === current);
    let n = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % options.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + options.length) % options.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = options.length - 1;
    select(options[n].value);
    requestAnimationFrame(() => group.current?.querySelector<HTMLElement>(`[data-v="${CSS.escape(options[n].value)}"]`)?.focus());
  };

  return (
    <div
      ref={group}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKey}
      className={cn("relative inline-flex flex-wrap gap-2", className)}
    >
      <span
        ref={hl}
        aria-hidden="true"
        className={cn("pointer-events-none absolute left-0 top-0 rounded-pill opacity-0", tone === "dark" ? "bg-cream" : "bg-ink")}
      />
      {options.map((o) => {
        const on = o.value === current;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            id={`${id}-${o.value}`}
            data-v={o.value}
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => select(o.value)}
            className={cn(
              "relative z-10 inline-flex h-11 items-center gap-2 rounded-pill border-2 px-5 text-[0.95rem] font-bold transition-colors duration-[var(--dur-quick)]",
              tone === "dark"
                ? on
                  ? "border-transparent text-red"
                  : "border-cream/40 text-cream hover:border-cream"
                : on
                  ? "border-transparent text-cream"
                  : "border-ink/25 text-ink hover:border-ink",
            )}
          >
            {o.label}
            {o.count != null && (
              <span className={cn("rounded-full px-2 py-0.5 text-xs tabular", on ? "bg-current/20" : "bg-current/10")}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
