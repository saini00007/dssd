// Remembers that a navigation was started by one of our links (vs browser back/forward),
// so scroll-to-top only runs for link navigations and the browser restores scroll on back/forward.
let intent = false;
export function markNavIntent() {
  intent = true;
}
export function consumeNavIntent(): boolean {
  const v = intent;
  intent = false;
  return v;
}
