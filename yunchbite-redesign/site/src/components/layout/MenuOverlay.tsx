"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { useLenis } from "@/components/motion/SmoothScroll";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { Icon } from "@/components/ui/Icon";
import { PackImage } from "@/components/product/PackImage";
import { getProduct } from "@/data/products";
import { categories } from "@/data/categories";
import { menuPages, site } from "@/data/site";
import { buddySrc } from "@/lib/media";
import { dur, ease, mq, stagger } from "@/lib/tokens";
import { useMenu } from "./MenuContext";

const CLOSED = "inset(0% 0% 100% 0% round 0px 0px 70px 70px)";
const OPEN = "inset(0% 0% 0% 0% round 0px 0px 0px 0px)";

// One representative pack per category for the tiles.
const TILE_PRODUCTS: Record<string, string> = {
  makhana: "makhana-zipper-peri-peri",
  popcorn: "popcorn-salted",
  "dry-fruits": "dryfruits-roasted-almonds",
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** G-03. Full-screen brand-red menu: a real modal dialog (focus trap, Esc, focus return, scroll lock). */
export function MenuOverlay() {
  const { open, setOpen, buttonRef, immediateRef } = useMenu();
  const pathname = usePathname();
  const lenis = useLenis();
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const closedByNav = useRef(false);

  // Close when a navigation completes (under the page curtain).
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      closedByNav.current = true;
      setOpen(false, { immediate: true });
    }
  }, [pathname, setOpen]);

  // Animation
  const { contextSafe } = useGSAP({ scope: root });
  useEffect(() => {
    const p = panel.current;
    const el = root.current;
    if (!p || !el) return;
    if (open === wasOpen.current) return;
    wasOpen.current = open;
    const immediate = immediateRef.current;
    const reduce = window.matchMedia(mq.reduce).matches;
    const items = el.querySelectorAll("[data-menu-item]");
    const extras = el.querySelectorAll("[data-menu-extra]");
    const buddy = el.querySelector("[data-menu-buddy]");

    const run = contextSafe(() => {
      gsap.killTweensOf([p, items, extras, buddy]);
      if (open) {
        gsap.set(p, { visibility: "visible" });
        if (reduce || immediate) {
          gsap.set(p, { clipPath: OPEN });
          gsap.set([items, extras, buddy], { clearProps: "all" });
          return;
        }
        const tl = gsap.timeline();
        tl.fromTo(p, { clipPath: CLOSED }, { clipPath: OPEN, duration: dur.move, ease: ease.roast }, 0);
        tl.fromTo(items, { yPercent: 115, skewY: 5 }, { yPercent: 0, skewY: 0, duration: 0.8, ease: ease.glide, stagger: stagger.item }, 0.18);
        tl.fromTo(extras, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: ease.glide, stagger: 0.07 }, 0.4);
        if (buddy) tl.fromTo(buddy, { yPercent: 105, rotate: -6 }, { yPercent: 0, rotate: 0, duration: 0.8, ease: ease.crunch }, 0.5);
      } else {
        if (reduce || immediate) {
          gsap.set(p, { clipPath: CLOSED, visibility: "hidden" });
          return;
        }
        gsap.to(p, {
          clipPath: CLOSED,
          duration: dur.move * 0.85,
          ease: ease.roast,
          onComplete: () => void gsap.set(p, { visibility: "hidden" }),
        });
      }
    });
    run();
  }, [open, contextSafe, immediateRef]);

  // Scroll lock, inert background, focus management, Esc, focus trap.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const main = document.getElementById("main");
    const footer = document.getElementById("site-footer");
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    lenis?.stop();
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");

    const first = panel.current?.querySelector<HTMLElement>("a[href]");
    const focusTimer = window.setTimeout(() => first?.focus({ preventScroll: true }), 120);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const inPanel = Array.from(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      const list = [...inPanel, ...(buttonRef.current ? [buttonRef.current] : [])];
      if (!list.length) return;
      const active = document.activeElement as HTMLElement | null;
      const idx = active ? list.indexOf(active) : -1;
      if (e.shiftKey) {
        if (idx <= 0) {
          e.preventDefault();
          list[list.length - 1].focus();
        }
      } else if (idx === -1 || idx === list.length - 1) {
        e.preventDefault();
        list[0].focus();
      }
    };
    document.addEventListener("keydown", onKey);

    const button = buttonRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      html.style.overflow = prevOverflow;
      lenis?.start();
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      if (!closedByNav.current) button?.focus({ preventScroll: true });
      closedByNav.current = false;
    };
  }, [open, lenis, setOpen, buttonRef]);

  const onLinkClick = (href: string) => {
    const path = href.split("#")[0] || "/";
    if (path === pathname) setOpen(false);
  };

  return (
    <div ref={root}>
      <div
        ref={panel}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        data-header-theme="dark"
        data-lenis-prevent
        style={{ clipPath: CLOSED, visibility: "hidden" }}
        className="on-dark fixed inset-0 z-[55] overflow-y-auto overflow-x-clip bg-red text-cream"
      >
        <div className="mx-auto flex min-h-full max-w-[var(--container-max)] flex-col px-gutter pb-8 pt-[clamp(5rem,13vh,7.5rem)] md:flex-row md:gap-10 lg:gap-16">
          <nav aria-label="Main pages" className="flex-1">
            <ul className="flex flex-col" style={{ ["--step" as string]: "clamp(0.75rem, 3.2vw, 3.25rem)" }}>
              {menuPages.map((p, i) => {
                const current = p.href === "/" ? pathname === "/" : pathname === p.href || pathname.startsWith(p.href + "/");
                return (
                  <li key={p.href} style={{ paddingLeft: `calc(${i} * var(--step))` }}>
                    <TransitionLink
                      href={p.href}
                      aria-current={current ? "page" : undefined}
                      onClick={() => onLinkClick(p.href)}
                      className="group/item relative inline-flex items-center gap-[0.35em] py-[0.04em] text-[length:clamp(1.9rem,min(7.4vh,9vw),5.2rem)] leading-[0.98] transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] hover:translate-x-[0.35em] focus-visible:translate-x-[0.35em]"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-block size-[0.2em] shrink-0 scale-0 rounded-full bg-yellow transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/item:scale-100 group-focus-visible/item:scale-100 group-aria-[current=page]/item:scale-100"
                      />
                      <span className="block overflow-hidden pb-[0.06em] pt-[0.02em]">
                        <span data-menu-item className="display-type block origin-left">
                          {p.label}
                        </span>
                      </span>
                    </TransitionLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-10 flex flex-1 flex-col justify-between gap-8 md:mt-0 md:max-w-[560px]">
            <div data-menu-extra>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-cream/80">Choose your crunch</p>
              <ul className="grid grid-cols-3 gap-3">
                {categories.map((c) => {
                  const product = getProduct(TILE_PRODUCTS[c.key]);
                  return (
                    <li key={c.key}>
                      <TransitionLink
                        href={`/categories/${c.slug}`}
                        onClick={() => onLinkClick(`/categories/${c.slug}`)}
                        className="group/tile relative flex aspect-[3/4] flex-col items-center justify-end overflow-hidden rounded-[22px] p-2 transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] hover:-translate-y-1.5 focus-visible:-translate-y-1.5 md:aspect-[4/5]"
                        style={{ background: c.color, color: c.ink }}
                      >
                        {product && (
                          <span className="absolute inset-x-[14%] top-[8%] bottom-[22%] transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/tile:scale-110 group-hover/tile:-rotate-3">
                            <PackImage product={product} size="sm" />
                          </span>
                        )}
                        <span className="relative text-[0.95rem] font-bold leading-tight">{c.name}</span>
                      </TransitionLink>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div data-menu-extra className="flex flex-col gap-4">
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.95rem] font-semibold">
                <li>
                  <TransitionLink href="/contact" onClick={() => onLinkClick("/contact")} className="underline decoration-cream/40 underline-offset-4 hover:decoration-yellow">
                    Contact
                  </TransitionLink>
                </li>
                {site.social.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 underline decoration-cream/40 underline-offset-4 hover:decoration-yellow">
                      <Icon name={s.label.toLowerCase() as "instagram" | "facebook" | "linkedin"} className="size-4" />
                      {s.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={site.contact.emailHref} className="inline-flex items-center gap-1.5 underline decoration-cream/40 underline-offset-4 hover:decoration-yellow">
                    <Icon name="mail" className="size-4" />
                    {site.contact.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Makhana Buddy waves from the bottom-right */}
        <div aria-hidden="true" className="pointer-events-none fixed bottom-0 right-[clamp(0.5rem,4vw,4rem)] hidden w-[clamp(120px,15vw,230px)] overflow-hidden md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-menu-buddy src={buddySrc("wave")} alt="" width={480} height={560} className="h-auto w-full" />
        </div>
      </div>
    </div>
  );
}
