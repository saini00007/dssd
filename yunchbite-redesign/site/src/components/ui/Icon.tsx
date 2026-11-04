import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "arrow"
  | "arrow-left"
  | "plus"
  | "close"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "mail"
  | "phone"
  | "pin"
  | "leaf"
  | "olive"
  | "no-palm"
  | "no-preservative"
  | "protein"
  | "gluten-free"
  | "veg-mark"
  | "star"
  | "check";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const paths: Record<IconName, ReactNode> = {
  arrow: <path d="M4 12h15M13 5.5 19.5 12 13 18.5" {...stroke} />,
  "arrow-left": <path d="M20 12H5M11 5.5 4.5 12 11 18.5" {...stroke} />,
  plus: <path d="M12 4.5v15M4.5 12h15" {...stroke} />,
  close: <path d="m6 6 12 12M18 6 6 18" {...stroke} />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" {...stroke} />,
  star: <path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6-4.5-4.2 6.1-.8z" fill="currentColor" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" {...stroke} />
      <circle cx="12" cy="12" r="4" {...stroke} />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </>
  ),
  facebook: <path d="M14 21v-8h2.8l.5-3.4H14V7.5c0-1 .4-1.7 1.8-1.7h1.6V2.8C17 2.7 16 2.6 15 2.6c-2.6 0-4.3 1.600-4.3 4.400v2.600H8V13h2.700v8z" fill="currentColor" />,
  linkedin: (
    <>
      <rect x="3" y="9" width="3.8" height="12" fill="currentColor" />
      <circle cx="4.9" cy="4.8" r="2.2" fill="currentColor" />
      <path d="M10 9h3.6v1.700c.6-1.100 1.900-2 3.800-2 3.400 0 3.800 2.300 3.800 5.100V21h-3.800v-6.200c0-1.400 0-2.800-1.700-2.800s-2 1.300-2 2.700V21H10z" fill="currentColor" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" {...stroke} />
      <path d="m4 7.5 8 6 8-6" {...stroke} />
    </>
  ),
  phone: <path d="M5 4h3.5l1.600 4.200-2.200 1.500a11.500 11.500 0 0 0 5.400 5.400l1.500-2.200L19 14.500V18a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2z" {...stroke} />,
  pin: (
    <>
      <path d="M12 21s7-6.100 7-11.500a7 7 0 1 0-14 0C5 14.900 12 21 12 21z" {...stroke} />
      <circle cx="12" cy="9.500" r="2.500" {...stroke} />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" {...stroke} />
      <path d="M5 19c2-4 5-7 9-9" {...stroke} />
    </>
  ),
  olive: (
    <>
      <ellipse cx="11" cy="13.500" rx="5.500" ry="7" transform="rotate(35 11 13.500)" {...stroke} />
      <circle cx="9.800" cy="14.500" r="1.200" fill="currentColor" />
      <path d="M15.500 7c1.200-1.800 3-2.800 5-3" {...stroke} />
    </>
  ),
  "no-palm": (
    <>
      <path d="M12 21v-9M12 12c-1-3-4-4.500-7-4 1 3 4 4.500 7 4zM12 12c1-3 4-4.500 7-4-1 3-4 4.500-7 4zM12 12c-.5-3 .5-6 0-8" {...stroke} />
      <path d="m4 4 16 16" {...stroke} />
    </>
  ),
  "no-preservative": (
    <>
      <rect x="6" y="7" width="12" height="14" rx="3" {...stroke} />
      <path d="M9 7V4.500h6V7M10 12h4" {...stroke} />
      <path d="m3.500 3.500 17 17" {...stroke} />
    </>
  ),
  protein: (
    <>
      <path d="M7 8v8M17 8v8M4.500 10v4M19.500 10v4M7 12h10" {...stroke} />
    </>
  ),
  "gluten-free": (
    <>
      <path d="M12 21V8M12 8c-1.500-1-1.500-3 0-4 1.500 1 1.500 3 0 4zM12 13c-3 0-4.500-2-4.500-4 2.500 0 4.500 1.200 4.500 4zM12 13c3 0 4.500-2 4.500-4-2.500 0-4.500 1.200-4.500 4zM12 18c-3 0-4.500-2-4.500-4 2.500 0 4.500 1.200 4.500 4zM12 18c3 0 4.500-2 4.500-4-2.500 0-4.500 1.200-4.500 4z" {...stroke} />
      <path d="m4 4 16 16" {...stroke} />
    </>
  ),
  "veg-mark": (
    <>
      <rect x="2.500" y="2.500" width="19" height="19" rx="2.500" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5.500" fill="currentColor" />
    </>
  ),
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  /** Accessible name. Omit for decorative icons (they get aria-hidden). */
  title?: string;
}

/** Inline SVG icon set. Inherits `currentColor`; size with className (default 1.25em). */
export function Icon({ name, title, className = "size-[1.25em]", ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
