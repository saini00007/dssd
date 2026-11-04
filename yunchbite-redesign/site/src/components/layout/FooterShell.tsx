"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { ArchReveal } from "@/components/ui/ArchReveal";

/** Reads the colour of the last section above the footer so the arch corners blend into it. */
function lastSectionColor(): string {
  const main = document.getElementById("main");
  if (!main) return "";
  // With cacheComponents, previous pages stay in <main> hidden (display: none): use the visible one.
  let el: Element | undefined = Array.from(main.children)
    .reverse()
    .find((c) => c.getClientRects().length > 0);
  for (let depth = 0; depth < 4 && el; depth++) {
    const bg = getComputedStyle(el).backgroundColor;
    if (depth > 0 && bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
    el = el.lastElementChild ?? undefined;
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
