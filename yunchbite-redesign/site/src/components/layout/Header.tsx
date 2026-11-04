"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/cn";
import { logo } from "@/lib/media";
import { headerCta, primaryNav } from "@/data/site";
import { useMenu } from "./MenuContext";

const COLLAPSE_AT = 120;

function RollLabel({ open }: { open: boolean }) {
  const a = "MENU";
  const b = "CLOSE";
  return (
    <span aria-hidden="true" data-open={open} className="inline-flex">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className="roll-col" style={{ ["--i" as string]: i }}>
          <span>{a[i] ?? "\u00a0"}</span>
          <span>{b[i] ?? "\u00a0"}</span>
        </span>
      ))}
    </span>
  );
}

/** G-02. Full at the top; past ~120 px scrolling down it collapses to logo + CTA + MENU, and returns on scroll up. */
export function Header() {
  const pathname = usePathname();
  const { open, toggle, buttonRef } = useMenu();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let isCollapsed = false;
    let isDark = false;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const dy = y - lastY;
      let next = isCollapsed;
      if (y <= COLLAPSE_AT) {
        next = false;
        lastY = y;
      } else if (Math.abs(dy) > 6) {
        next = dy > 0;
        lastY = y;
      }
      if (next !== isCollapsed) {
        isCollapsed = next;
        setCollapsed(next);
      }
      // Dark sections under the header band?
      const probe = 36;
      let nowDark = false;
      document.querySelectorAll<HTMLElement>('[data-header-theme="dark"]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.top <= probe && r.bottom > probe) nowDark = true;
      });
      if (nowDark !== isDark) {
        isDark = nowDark;
        setDark(nowDark);
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const t1 = window.setTimeout(update, 60);
    const t2 = window.setTimeout(update, 900); // after a page transition has settled
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname]);

  const lightText = dark || open;
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <header
      id="site-header"
      data-state={collapsed && !open ? "collapsed" : "top"}
      data-theme={lightText ? "dark" : "light"}
      data-menu-open={open || undefined}
      style={{ viewTransitionName: "site-header" }}
      className="group/hdr pointer-events-none fixed inset-x-0 top-0 z-[60] [--hdr-fg:var(--color-ink)] data-[theme=dark]:[--hdr-fg:var(--color-cream)]"
    >
      <div className="mx-auto flex max-w-[var(--container-max)] items-start justify-between px-gutter pt-3 md:pt-5">
        <TransitionLink
          href="/"
          aria-label="Yunch Bite, home"
          className="pointer-events-auto block origin-top-left transition-transform duration-[var(--dur-move)] ease-[var(--ease-roast)] group-data-[state=collapsed]/hdr:scale-[0.62]"
        >
          <Image
            src={logo.src}
            alt=""
            width={logo.width}
            height={logo.height}
            priority
            sizes="(min-width: 768px) 150px, 112px"
            className="h-auto w-[112px] md:w-[150px] transition-[filter] duration-[var(--dur-quick)] group-data-[theme=dark]/hdr:[filter:drop-shadow(1.5px_0_0_#fffdf5)_drop-shadow(-1.5px_0_0_#fffdf5)_drop-shadow(0_1.5px_0_#fffdf5)_drop-shadow(0_-1.5px_0_#fffdf5)]"
          />
        </TransitionLink>

        <div
          className={cn(
            "pointer-events-auto flex items-center gap-1 rounded-pill p-1 md:gap-1.5 md:p-1.5",
            "transition-[background-color,box-shadow,backdrop-filter] duration-[var(--dur-move)] ease-[var(--ease-roast)]",
            "group-data-[state=collapsed]/hdr:bg-cream/80 group-data-[state=collapsed]/hdr:shadow-[var(--shadow-pill)] group-data-[state=collapsed]/hdr:backdrop-blur-md group-data-[state=collapsed]/hdr:[--hdr-fg:var(--color-ink)]",
          )}
        >
          <nav
            aria-label="Primary"
            inert={open}
            className="hidden grid-cols-[1fr] transition-[grid-template-columns,opacity] duration-[var(--dur-move)] ease-[var(--ease-roast)] md:grid group-data-[state=collapsed]/hdr:grid-cols-[0fr] group-data-[state=collapsed]/hdr:opacity-0 group-data-[menu-open]/hdr:opacity-0"
          >
            <ul className="flex min-w-0 items-center gap-1 overflow-hidden">
              {primaryNav.map((l) => (
                <li key={l.href}>
                  <TransitionLink
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={cn(
                      "block rounded-pill border-2 border-[color-mix(in_srgb,var(--hdr-fg)_22%,transparent)] px-4 py-2 text-[0.95rem] font-semibold whitespace-nowrap text-[var(--hdr-fg)]",
                      "transition-[background-color,color,border-color] duration-[var(--dur-quick)] hover:border-[var(--hdr-fg)] hover:bg-[color-mix(in_srgb,var(--hdr-fg)_10%,transparent)]",
                      "aria-[current=page]:border-[var(--hdr-fg)] aria-[current=page]:bg-[color-mix(in_srgb,var(--hdr-fg)_10%,transparent)]",
                    )}
                  >
                    {l.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>

          <div inert={open} className="hidden transition-opacity duration-[var(--dur-quick)] sm:block group-data-[menu-open]/hdr:opacity-0">
            <ButtonLink href={headerCta.href + "#partner"} size="md" arrow={false} magnetic={false} className="h-11 px-5 text-[0.95rem]">
              {headerCta.label}
            </ButtonLink>
          </div>

          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-haspopup="dialog"
            onClick={toggle}
            className={cn(
              "group/menu relative flex h-11 items-center justify-center rounded-pill px-5 text-[0.95rem] font-bold tracking-wide",
              "transition-[background-color,color,transform] duration-[var(--dur-quick)] ease-[var(--ease-glide)] active:scale-[0.96]",
              open || dark
                ? "bg-cream text-red hover:bg-yellow hover:text-ink group-data-[state=collapsed]/hdr:bg-ink group-data-[state=collapsed]/hdr:text-cream"
                : "bg-ink text-cream hover:bg-red",
            )}
          >
            <span className="sr-only">{open ? "Close menu" : "Menu"}</span>
            <RollLabel open={open} />
          </button>
        </div>
      </div>
    </header>
  );
}
