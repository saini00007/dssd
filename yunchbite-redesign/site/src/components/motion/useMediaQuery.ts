"use client";
import { useSyncExternalStore } from "react";
import { mq } from "@/lib/tokens";

/** SSR-safe matchMedia hook. `serverValue` is what the server (and first hydration) sees. */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (notify) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", notify);
      return () => m.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** True when the user prefers reduced motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery(mq.reduce);
}

/** True on devices with a precise hover pointer (mouse/trackpad). */
export function useFinePointer(): boolean {
  return useMediaQuery(mq.fine);
}

/** True on touch-first devices (the inverse of useFinePointer; server assumes touch). */
export function useIsTouch(): boolean {
  return !useMediaQuery(mq.fine, false);
}
