// Media helpers: the single adapter between components and the asset manifest (src/data/assets.ts).
import type { BuddyPose, ShapeName } from "@/data/types";
import { brand, buddy, packAssets, placeholderPack, PLACEHOLDER_SIZE, shapes } from "@/data/assets";
import type { FlavourKey } from "@/data/keys";

export const logo = brand.logo;

export function shapeSrc(name: ShapeName): string {
  return shapes[name];
}

export interface BuddyImage {
  src: string;
  width: number;
  height: number;
  /** The pose actually shown (after fallbacks). */
  pose: BuddyPose;
}

/** Buddy image for a pose, following the manifest's fallback chain when the pose has no file yet. */
export function buddyImage(pose: BuddyPose): BuddyImage {
  let p: BuddyPose = pose;
  for (let i = 0; i < 4; i++) {
    const e = buddy[p];
    if (e.available) return { src: e.src, width: e.width, height: e.height, pose: p };
    if (!e.fallback) break;
    p = e.fallback;
  }
  const sit = buddy.sit;
  return { src: sit.src, width: sit.width, height: sit.height, pose: "sit" };
}

export function buddySrc(pose: BuddyPose): string {
  return buddyImage(pose).src;
}

export interface PackSrc {
  src: string;
  width: number;
  height: number;
  /** True when this is the flat placeholder (no cut-out yet). */
  placeholder: boolean;
  /** True when the cut-out is a different format's pack reused for this product. */
  interim: boolean;
}

/** The cut-out for a product pack, or its flavour placeholder. */
export function packSrc(product: { slug: string; flavourKey: string }): PackSrc {
  const a = packAssets[product.slug];
  if (a?.cutout) return { src: a.cutout, width: a.width, height: a.height, placeholder: false, interim: a.interim };
  return {
    src: placeholderPack(product.flavourKey as FlavourKey),
    width: PLACEHOLDER_SIZE.width,
    height: PLACEHOLDER_SIZE.height,
    placeholder: true,
    interim: false,
  };
}
