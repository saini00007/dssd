import type { ReactNode } from "react";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export interface NumberedCardProps {
  /** "01", "02"… */
  number: string;
  title: string;
  children?: ReactNode;
  /** Makes the whole card a link. */
  href?: string;
  tone?: "cream" | "red" | "yellow" | "maroon";
  as?: "div" | "li" | "article";
  className?: string;
}

const tones = {
  cream: "bg-cream-2 text-ink hover:bg-yellow",
  yellow: "bg-yellow text-ink hover:bg-cream",
  red: "bg-red text-cream hover:bg-maroon",
  maroon: "bg-maroon text-cream hover:bg-red",
} as const;

/** R3-C4 numbered card: the outline number fills on hover / focus, the card lifts. */
export function NumberedCard({ number, title, children, href, tone = "cream", as: Tag = "div", className }: NumberedCardProps) {
  const body = (
    <>
      <span
        aria-hidden="true"
        className="display-type text-outline block text-[length:clamp(5rem,9vw,8rem)] leading-[0.8] transition-[color,transform] duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/num:text-current group-hover/num:-translate-y-1 group-focus-visible/num:text-current"
      >
        {number}
      </span>
      <span className="mt-8 block">
        <span className="display-type block text-[length:var(--text-h3)] leading-[0.95]">{title}</span>
        {children && <span className="mt-3 block max-w-[34ch] text-[0.98rem] leading-snug opacity-90">{children}</span>}
      </span>
      {href && (
        <span aria-hidden="true" className="absolute bottom-6 right-6 grid size-11 place-items-center rounded-full bg-ink text-cream transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/num:rotate-[-45deg]">
          <Icon name="arrow" />
        </span>
      )}
    </>
  );
  const cls = cn(
    "group/num relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-card p-7 transition-[background-color,transform,box-shadow] duration-[var(--dur-pop)] ease-[var(--ease-crunch)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)] md:p-8",
    tones[tone],
    className,
  );
  if (href) {
    return (
      <Tag className="h-full">
        <TransitionLink href={href} className={cls}>
          {body}
        </TransitionLink>
      </Tag>
    );
  }
  return <Tag className={cls}>{body}</Tag>;
}
