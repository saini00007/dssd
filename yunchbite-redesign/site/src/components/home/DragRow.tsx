"use client";
import { useRef, type ReactNode } from "react";
import { useDragScroll } from "./useDragScroll";
import { cn } from "@/lib/cn";

/** A horizontally scrollable row: native scroll + snap + keyboard (focusable), mouse drag-to-scroll. */
export function DragRow({ children, label, className, as: Tag = "ul" }: { children: ReactNode; label: string; className?: string; as?: "ul" | "div" }) {
  const ref = useRef<HTMLUListElement>(null);
  useDragScroll(ref);
  return (
    <Tag
      ref={ref as never}
      tabIndex={0}
      aria-label={label}
      className={cn("yb-dragrow flex cursor-grab snap-x snap-mandatory list-none overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
    >
      {children}
    </Tag>
  );
}
