// Media path helpers. Single adapter between the components and the asset manifest (src/data/assets.ts).
import type { BuddyPose, ShapeName } from "@/data/types";

export const logo = { src: "/brand/logo.png", width: 362, height: 186 };

export function shapeSrc(name: ShapeName): string {
  return `/shapes/${name}.svg`;
}

/** Poses we try in order when the asked-for pose has no file yet. */
const POSE_FALLBACK: Record<BuddyPose, BuddyPose[]> = {
  point: ["point", "sit"],
  sit: ["sit"],
  peek: ["peek", "sit"],
  wave: ["wave", "point", "sit"],
  walk: ["walk", "sit"],
  thumbs: ["thumbs", "sit"],
  confused: ["confused", "sit"],
  pop: ["pop", "sit"],
};

export function buddySrc(pose: BuddyPose): string {
  return `/brand/buddy/${POSE_FALLBACK[pose][0]}.png`;
}

export interface PackSrc {
  src: string;
  width: number;
  height: number;
  /** True when this is the flat placeholder (no cut-out yet). */
  placeholder: boolean;
}

/** The cut-out for a product pack (or its flavour placeholder). */
export function packSrc(product: { slug: string; flavourKey: string }): PackSrc {
  return { src: `/packs/placeholder/${product.flavourKey}.svg`, width: 600, height: 800, placeholder: true };
}
