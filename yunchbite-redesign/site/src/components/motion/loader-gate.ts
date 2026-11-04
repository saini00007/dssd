"use client";
// The first-visit loader flags <html data-yb-loader="on"> from an inline head script. Hero animations
// wait for the `yb:loader-done` event (fired as the curtain starts leaving) before they play.

export const LOADER_DONE_EVENT = "yb:loader-done";

export function loaderActive(): boolean {
  return typeof document !== "undefined" && document.documentElement.dataset.ybLoader === "on";
}

/** Runs `cb` now if no loader is showing, otherwise when it finishes. Returns a cancel function. */
export function whenLoaderDone(cb: () => void): () => void {
  if (!loaderActive()) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener(LOADER_DONE_EVENT, handler, { once: true });
  return () => window.removeEventListener(LOADER_DONE_EVENT, handler);
}
