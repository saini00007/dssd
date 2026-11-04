import { ViewTransition, type ReactNode } from "react";

/**
 * Wrap each page's content (inside page.tsx, never in a layout) so route changes play the "curtain" wipe.
 * A single wrapper div keeps the whole page as one transition group. CSS lives in globals.css.
 *
 *   export default function Page() { return <PageTransition>…sections…</PageTransition>; }
 *
 * Do not render <main> here: the root layout already provides <main id="main">.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{ curtain: "curtain-in", "curtain-back": "curtain-in-back", default: "none" }}
      exit={{ curtain: "curtain-out", "curtain-back": "curtain-out-back", default: "none" }}
      default="none"
    >
      <div data-page="">{children}</div>
    </ViewTransition>
  );
}
