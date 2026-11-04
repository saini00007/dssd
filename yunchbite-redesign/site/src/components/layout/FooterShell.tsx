"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { ArchReveal } from "@/components/ui/ArchReveal";

/** Reads the colour of the last section above the footer so the arch corners blend into it. */
function lastSectionColor(): string {
  let el: Element | null = document.getElementById("main");
  for (let depth = 0; depth < 4 && el?.lastElementChild; depth++) {
    el = el.lastElementChild;
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
  }
  return "";
}

export function FooterShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apply = () => {
      if (wrap.current) wrap.current.style.background = lastSectionColor();
    };
    apply();
    const t = window.setTimeout(apply, 800);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <div ref={wrap}>
      <ArchReveal as="footer" id="site-footer" headerTheme="dark" className="on-dark relative bg-maroon-deep text-cream">
        {children}
      </ArchReveal>
    </div>
  );
}
