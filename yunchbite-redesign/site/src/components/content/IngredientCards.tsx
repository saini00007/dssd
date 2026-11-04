import type { ShapeName } from "@/data/types";
import { Pop } from "@/components/motion/Pop";
import { shapeSrc } from "@/lib/media";
import { cn } from "@/lib/cn";

const ART: ShapeName[] = ["makhana-1", "pudina-leaf", "herb-sprig", "cashew", "almond"];
const TONES = ["bg-yellow text-ink", "bg-cream-2 text-ink", "bg-maroon text-cream", "bg-cream-2 text-ink", "bg-red text-cream"];

/** IQ-02: five clean-ingredient points, each with a paper-cut cut-out that pops. */
export function IngredientCards({ points }: { points: string[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
      {points.map((p, i) => (
      <li key={p} className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"}>
          <div className={cn("relative flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-card p-7", TONES[i % TONES.length])}>
            <Pop delay={i * 0.05} from={0.3} className="absolute -right-4 -top-4 w-[38%] max-w-[170px] rotate-[14deg]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shapeSrc(ART[i % ART.length])} alt="" width={160} height={160} draggable={false} className="h-auto w-full" />
            </Pop>
            <span aria-hidden="true" className="display-type text-outline text-[length:clamp(3rem,5vw,4.5rem)] leading-[0.8]">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="display-type mt-10 max-w-[14ch] text-[length:var(--text-h3)] leading-[0.98]">{p}</h3>
          </div>
        </li>
      ))}
    </ul>
  );
}
