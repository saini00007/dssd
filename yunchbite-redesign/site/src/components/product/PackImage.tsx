import Image from "next/image";
import { ViewTransition } from "react";
import { packSrc } from "@/lib/media";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: "(min-width: 768px) 120px, 90px",
  md: "(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw",
  lg: "(min-width: 1024px) 420px, 70vw",
  hero: "(min-width: 1024px) 560px, 80vw",
} as const;

export interface PackImageProps {
  product: { slug: string; name: string; formatLabel: string; flavourKey: string };
  /** Preset for the `sizes` attribute: sm 120px, md card (default), lg, hero. */
  size?: keyof typeof SIZES;
  /** Overrides the preset. */
  sizes?: string;
  /** Above-the-fold packs (hero, LCP). */
  priority?: boolean;
  /** Wrap in <ViewTransition name="pack-<slug>"> so a card pack morphs into the product hero. */
  morph?: boolean;
  /** Decorative (alt=""), e.g. when the name is shown right next to it. */
  decorative?: boolean;
  className?: string;
  imgClassName?: string;
}

/** The pack cut-out. Fills its (relatively positioned) box and keeps the pack's aspect ratio. */
export function PackImage({ product, size = "md", sizes, priority, morph, decorative, className, imgClassName }: PackImageProps) {
  const pack = packSrc(product);
  const img = (
    <div className={cn("relative w-full", className)} style={{ aspectRatio: `${pack.width} / ${pack.height}` }}>
      <Image
        src={pack.src}
        alt={decorative ? "" : `${product.name} ${product.formatLabel} pack`}
        fill
        sizes={sizes ?? SIZES[size]}
        priority={priority}
        className={cn("object-contain", imgClassName)}
      />
    </div>
  );
  if (!morph) return img;
  return (
    <ViewTransition name={`pack-${product.slug}`} share="morph" default="none">
      {img}
    </ViewTransition>
  );
}
