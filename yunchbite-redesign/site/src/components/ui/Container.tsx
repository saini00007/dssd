import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ContainerProps {
  as?: ElementType;
  /** "default" 1440 px, "narrow" 1040 px (reading), "wide" full-bleed with gutters. */
  size?: "default" | "narrow" | "wide";
  className?: string;
  children?: ReactNode;
  id?: string;
}

/** Centred page container with the site gutters (20 px mobile / 40 px desktop). */
export function Container({ as: Tag = "div", size = "default", className, children, id }: ContainerProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "mx-auto w-full px-gutter",
        size === "default" && "max-w-[var(--container-max)]",
        size === "narrow" && "max-w-[1040px]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
