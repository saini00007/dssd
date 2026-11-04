import { Fragment, type ReactNode } from "react";

// Allergen groups and the words that name them. Only groups the product's allergen statement mentions are bold.
const GROUPS: { test: RegExp; words: string[] }[] = [
  { test: /milk|dairy/i, words: ["milk solids", "milk", "dairy", "cheese", "whey"] },
  // "Fox Nuts" is makhana, not a tree nut: never bold it.
  { test: /nut|almond|cashew/i, words: ["tree nuts", "cashew nuts", "cashews", "cashew", "almonds", "almond", "(?<!fox )nuts?"] },
  { test: /gluten|wheat/i, words: ["gluten", "wheat"] },
  { test: /sulph?ite|sulfite/i, words: ["sulphites", "sulphite", "sulfites", "sulfite"] },
  { test: /soy/i, words: ["soy"] },
  { test: /mustard/i, words: ["mustard"] },
  { test: /sesame/i, words: ["sesame"] },
];

/**
 * Wraps allergen words in <strong> (React nodes only: no raw HTML). `allergenText` decides which allergen groups
 * count for this product; `text` is the string to mark up (ingredients or the allergen statement itself).
 */
export function emphasizeAllergens(text: string, allergenText: string): ReactNode {
  const words = GROUPS.filter((g) => g.test.test(allergenText)).flatMap((g) => g.words);
  if (words.length === 0) return text;
  const re = new RegExp(`(?<![\\w-])(${words.sort((a, b) => b.length - a.length).join("|")})(?![\\w])`, "gi");
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) out.push(<Fragment key={`t${last}`}>{text.slice(last, i)}</Fragment>);
    out.push(
      <strong key={`s${i}`} className="font-extrabold">
        {m[0]}
      </strong>,
    );
    last = i + m[0].length;
  }
  if (last < text.length) out.push(<Fragment key={`t${last}`}>{text.slice(last)}</Fragment>);
  return out;
}
