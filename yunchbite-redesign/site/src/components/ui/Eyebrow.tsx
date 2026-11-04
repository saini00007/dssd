import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Small uppercase label with a dot, used above headings. Inherits colour. */
export function Eyebrow({ children, className, dot = true }: { children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <p className={cn("inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em]", className)}>
      {dot && <span aria-hidden="true" className="inline-block size-2 rounded-full bg-current" />}
      {children}
    </p>
  );
}
