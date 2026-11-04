"use client";
import Link from "next/link";
import { useState, type ComponentProps, type MouseEvent } from "react";
import { markNavIntent } from "@/lib/nav-intent";

type LinkProps = ComponentProps<typeof Link>;

export interface TransitionLinkProps extends Omit<LinkProps, "transitionTypes"> {
  /** "forward" (default): curtain wipes up. "back": wipes down. */
  direction?: "forward" | "back";
  /** Load the full page content (not only the shell) as soon as the link is in view. Default: on hover/focus only. */
  eager?: boolean;
  transitionTypes?: string[];
}

/**
 * next/link tagged with the "curtain" view-transition type (see globals.css / PageTransition).
 * Prefetch: the App Shell loads when the link is in view (Next default); the full content is requested on hover/focus
 * (or immediately with `eager`), so the curtain never waits on the network.
 */
export function TransitionLink({ direction = "forward", eager, transitionTypes, prefetch, onClick, onPointerEnter, onFocus, ...rest }: TransitionLinkProps) {
  const [warm, setWarm] = useState(false);
  const types = transitionTypes ?? (direction === "back" ? ["curtain-back"] : ["curtain"]);
  const resolvedPrefetch = prefetch !== undefined ? prefetch : eager || warm ? true : undefined;

  return (
    <Link
      {...rest}
      prefetch={resolvedPrefetch}
      transitionTypes={types}
      onPointerEnter={(e) => {
        setWarm(true);
        onPointerEnter?.(e);
      }}
      onFocus={(e) => {
        setWarm(true);
        onFocus?.(e);
      }}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        markNavIntent();
        onClick?.(e);
      }}
    />
  );
}
