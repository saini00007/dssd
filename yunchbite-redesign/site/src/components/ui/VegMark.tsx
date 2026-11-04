/** FSSAI vegetarian symbol: green dot in a green square. */
export function VegMark({ className = "size-5", title = "Vegetarian" }: { className?: string; title?: string | null }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <rect x="1.5" y="1.5" width="21" height="21" rx="2.5" fill="#fff" stroke="#0F8A3C" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" fill="#0F8A3C" />
    </svg>
  );
}
