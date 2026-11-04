import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { MagneticWrap } from "@/components/motion/MagneticWrap";
import { TransitionLink, type TransitionLinkProps } from "./TransitionLink";
import { Icon } from "./Icon";

export type ButtonVariant = "solid" | "ghost" | "cream" | "yellow";
export type ButtonSize = "md" | "lg" | "sm";

const variants: Record<ButtonVariant, string> = {
  solid: "bg-red text-cream border-red hover:bg-red-deep hover:border-red-deep",
  ghost: "bg-transparent text-current border-current hover:bg-current/10",
  cream: "bg-cream text-red border-cream hover:bg-yellow hover:text-ink hover:border-yellow",
  yellow: "bg-yellow text-ink border-yellow hover:bg-cream hover:border-cream",
};
const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-8 text-lg",
};

/** Class string for the pill button, for places that need a raw <button>/<a> (forms). */
export function buttonClass(variant: ButtonVariant = "solid", size: ButtonSize = "md", extra?: string) {
  return cn(
    "group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-pill border-2 font-bold leading-none whitespace-nowrap",
    "transition-[background-color,color,border-color,transform] duration-[var(--dur-quick)] ease-[var(--ease-glide)] active:scale-[0.97]",
    variants[variant],
    sizes[size],
    extra,
  );
}

/** Arrow that swaps: the first slides out right, a copy slides in from the left. */
export function SlideArrow() {
  return (
    <span aria-hidden="true" className="relative inline-block size-[1.1em] overflow-hidden">
      <Icon
        name="arrow"
        className="absolute inset-0 size-full transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/btn:translate-x-[130%] group-focus-visible/btn:translate-x-[130%]"
      />
      <Icon
        name="arrow"
        className="absolute inset-0 size-full -translate-x-[130%] transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/btn:translate-x-0 group-focus-visible/btn:translate-x-0"
      />
    </span>
  );
}

export interface ButtonLinkProps extends Omit<TransitionLinkProps, "className" | "children"> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show the sliding arrow (default true). */
  arrow?: boolean;
  /** Magnetic pull on fine pointers (default true). */
  magnetic?: boolean;
  className?: string;
  children: ReactNode;
}

const isExternal = (href: string) => /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");

/** Pill CTA. Internal hrefs use TransitionLink (curtain), external/mailto/tel render a plain <a>. */
export function ButtonLink({ href, variant = "solid", size = "md", arrow = true, magnetic = true, className, children, ...rest }: ButtonLinkProps) {
  const cls = buttonClass(variant, size, className);
  const inner = (
    <>
      <span>{children}</span>
      {arrow && <SlideArrow />}
    </>
  );
  const el = isExternal(href) ? (
    <a
      href={href}
      className={cls}
      {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {inner}
    </a>
  ) : (
    <TransitionLink href={href} className={cls} {...rest}>
      {inner}
    </TransitionLink>
  );
  return magnetic ? <MagneticWrap>{el}</MagneticWrap> : el;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
}

/** Same look as ButtonLink, as a real <button> (forms, toggles). */
export function Button({ variant = "solid", size = "md", arrow = false, className, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      <span>{children}</span>
      {arrow && <SlideArrow />}
    </button>
  );
}
