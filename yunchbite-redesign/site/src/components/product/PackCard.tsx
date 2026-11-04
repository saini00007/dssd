import type { Product } from "@/data/types";
import { getFlavour } from "@/data/flavours";
import { PackCardView } from "./PackCardView";

export interface PackCardProps {
  product: Product;
  /** Above-the-fold card: preloads the pack image. */
  priority?: boolean;
  /** Share the pack with the product hero via a view transition (default true). Turn off if the same product appears twice on one page. */
  morph?: boolean;
  /** Prefetch the full destination page when the card is in view (default true). */
  eager?: boolean;
  /** Heading level for the product name (default 3). */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/**
 * Product card: pack on a flavour-colour disc, name, format + size chips. Hover/focus: ring burst, pack lift,
 * Buddy peeks over the edge; cursor label "Taste me →". The whole card is one link to /products/<slug>.
 * Server component: only the fields the card needs reach the client.
 */
export function PackCard({ product, ...rest }: PackCardProps) {
  const f = getFlavour(product.flavourKey);
  return (
    <PackCardView
      card={{
        slug: product.slug,
        name: product.name,
        flavourKey: product.flavourKey,
        formatLabel: product.formatLabel,
        sizes: product.sizes,
        color: f.color,
        ink: f.ink,
        ingredient: f.ingredient,
      }}
      {...rest}
    />
  );
}
