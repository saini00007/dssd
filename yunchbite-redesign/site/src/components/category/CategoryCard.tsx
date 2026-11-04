import { TransitionLink } from "@/components/ui/TransitionLink";
import { Icon } from "@/components/ui/Icon";
import { PackImage } from "@/components/product/PackImage";
import type { PackData } from "@/components/products/groups";
import type { CSSProperties } from "react";

/** CAT-05: card for another range: category colour, name, line and a pair of packs that tilt on hover. */
export function CategoryCard({ name, subline, href, color, ink, packs, count }: { name: string; subline: string; href: string; color: string; ink: string; packs: PackData[]; count: number }) {
  return (
    <TransitionLink
      href={href}
      className="group/cc relative flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-card p-7 outline-offset-4 transition-shadow duration-[var(--dur-pop)] hover:shadow-[var(--shadow-lift)] focus-visible:shadow-[var(--shadow-lift)] md:p-9"
      style={{ background: color, color: ink, "--flavour": color, "--flavour-ink": ink } as CSSProperties}
    >
      <div aria-hidden="true" className="absolute -right-[12%] top-[8%] aspect-square w-[62%] rounded-full bg-cream/45" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[2%] top-[10%] flex h-[62%] w-[60%] items-end justify-center">
        {packs.slice(0, 2).map((p, i) => (
          <div
            key={p.slug}
            className="relative h-full w-1/2 transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)]"
            style={{ rotate: i ? "7deg" : "-8deg", marginLeft: i ? "-8%" : 0 }}
          >
            <div className={i ? "absolute inset-0 transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/cc:translate-x-[6%] group-hover/cc:rotate-[4deg]" : "absolute inset-0 transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/cc:-translate-x-[6%] group-hover/cc:-rotate-[4deg]"}>
              <PackImage product={p} fit decorative sizes="200px" imgClassName="drop-shadow-[0_14px_18px_rgb(42_18_16/0.3)]" />
            </div>
          </div>
        ))}
      </div>
      <p className="relative text-sm font-bold uppercase tracking-[0.14em] opacity-80">{count} flavours</p>
      <div className="relative flex items-end justify-between gap-4">
        <div>
          <h3 className="display-type text-[length:clamp(2.4rem,4.6vw,4.4rem)] leading-[0.9]">{name}</h3>
          <p className="mt-2 max-w-[26ch] font-semibold">{subline}</p>
        </div>
        <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-ink text-cream transition-[background-color,transform] duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/cc:rotate-[-45deg] group-hover/cc:bg-red">
          <Icon name="arrow" className="size-6" />
        </span>
      </div>
    </TransitionLink>
  );
}
