// Motion + colour tokens. Mirrored by the CSS custom properties in src/app/globals.css (@theme).
// Durations are seconds (GSAP). CSS uses --dur-* / --ease-*.

export const dur = { micro: 0.12, quick: 0.22, pop: 0.38, move: 0.6, roast: 0.9, switch: 1.0 } as const;

export const ease = {
  roast: "power2.inOut", // = cubic-bezier(0.645, 0.045, 0.355, 1) (Agrume, measured)
  crunch: "back.out(1.6)", // CSS: cubic-bezier(0.34, 1.56, 0.64, 1)
  glide: "expo.out", // CSS: cubic-bezier(0.22, 1, 0.36, 1)
  exit: "expo.in", // CSS: cubic-bezier(0.7, 0, 0.84, 0)
} as const;

export const stagger = { char: 0.022, item: 0.065 } as const;
export const reveal = { start: "top 80%" } as const;
export const lenis = { lerp: 0.1 } as const;

export const colors = {
  red: "#D61610",
  redDeep: "#BA0403",
  maroon: "#8B1313",
  maroonDeep: "#5A0B0B",
  yellow: "#FFD200",
  cream: "#FFFDF5",
  cream2: "#FBEFD9",
  makhana: "#F1C396",
  ink: "#2A1210",
} as const;

/** Media queries used by matchMedia / gsap.matchMedia. */
export const mq = {
  reduce: "(prefers-reduced-motion: reduce)",
  motion: "(prefers-reduced-motion: no-preference)",
  fine: "(hover: hover) and (pointer: fine)",
  desktop: "(min-width: 768px)",
} as const;
