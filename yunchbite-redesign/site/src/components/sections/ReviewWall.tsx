import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * ReviewWall (HOME-11, R1 UGC wall): a gentle two-row marquee of review cards and/or UGC (Instagram) tiles. Pauses on
 * hover / focus; static wrapped grid under reduced motion. Server component, pure CSS motion.
 *
 * IMPORTANT: reviews are hidden until the client confirms they are genuine (`SHOW_REVIEWS` in `@/data`). Pages must
 * render this component only when `SHOW_REVIEWS` is true (Home does `{SHOW_REVIEWS && <ReviewWall .../>}`), and must not
 * emit aggregate ratings / review schema while it is false.
 *
 * Props:
 *  - `items`     `ReviewWallItem[]`: `{ kind?: "review" | "ugc", name, body, title?, rating?, date?, image?: {src,alt,width,height}, href? }`
 *  - `title`, `sub?`, `eyebrow?`, `id?`, `tone?` ("cream" default | "soft" | "yellow")
 *  - `duration`  seconds for one marquee loop (default 60)
 */
export interface ReviewWallItem {
  kind?: "review" | "ugc";
  name: string;
  body: string;
  title?: string;
  rating?: number;
  date?: string;
  image?: { src: string; alt: string; width: number; height: number };
  href?: string;
}
export interface ReviewWallProps {
  items: ReviewWallItem[];
  title: string;
  sub?: string;
  eyebrow?: string;
  id?: string;
  tone?: "cream" | "soft" | "yellow";
  duration?: number;
  className?: string;
}

const TONES = { cream: "bg-cream", soft: "bg-cream-2", yellow: "bg-yellow" } as const;

function Card({ item }: { item: ReviewWallItem }) {
  const ugc = item.kind === "ugc";
  const body = (
    <>
      {item.image && (
        <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-small">
          <Image src={item.image.src} alt={item.image.alt} fill sizes="320px" className="object-cover" />
        </div>
      )}
      {item.rating != null && (
        <p className="mb-3 flex gap-0.5 text-red" aria-label={`${item.rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Icon key={i} name="star" className={cn("size-4", i >= item.rating! && "opacity-25")} />
          ))}
        </p>
      )}
      {item.title && <h3 className="display-type text-[length:1.35rem] leading-[1]">{item.title}</h3>}
      <p className={cn("text-[0.98rem] leading-snug", item.title && "mt-2")}>{item.body}</p>
      <p className="mt-4 text-sm font-bold">
        {ugc ? "@" : ""}
        {item.name}
      </p>
    </>
  );
  const cls = "block w-[min(80vw,340px)] shrink-0 rounded-card bg-cream p-6 text-ink shadow-[var(--shadow-lift)]";
  return item.href ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={cn(cls, "transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] hover:-translate-y-1")}>
      {body}
    </a>
  ) : (
    <article className={cls}>{body}</article>
  );
}

function Lane({ items, dup, reverse, duration }: { items: ReviewWallItem[]; dup?: boolean; reverse?: boolean; duration: number }) {
  return (
    <div className="yb-marquee overflow-hidden py-3" aria-hidden={dup || undefined}>
      <div className="yb-marquee-track flex w-max gap-5" style={{ ["--marquee-dur" as string]: `${duration}s`, animationDirection: reverse ? "reverse" : undefined }}>
        {[0, 1].map((k) => (
          <ul key={k} {...(k === 1 ? { "data-dup": "", "aria-hidden": true } : {})} className="flex shrink-0 gap-5 pr-5">
            {items.map((it, i) => (
              <li key={`${it.name}-${i}`} className="flex">
                <Card item={it} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export function ReviewWall({ items, title, sub, eyebrow, id, tone = "cream", duration = 60, className }: ReviewWallProps) {
  if (items.length === 0) return null;
  const lane1 = items.filter((_, i) => i % 2 === 0);
  const lane2 = items.filter((_, i) => i % 2 === 1);
  const lanes = lane2.length ? [lane1, lane2] : [lane1];
  return (
    <section id={id} aria-labelledby={`${id ?? "reviews"}-title`} className={cn("relative overflow-hidden py-section", TONES[tone], className)} data-header-theme="light">
      <Container className="mb-10 text-center">
        {eyebrow && <Eyebrow className="mb-3 text-red">{eyebrow}</Eyebrow>}
        <h2 id={`${id ?? "reviews"}-title`} className="display-type text-[length:var(--text-display)]">
          {title}
        </h2>
        {sub && <p className="mx-auto mt-4 max-w-[36rem] text-lg">{sub}</p>}
      </Container>
      <div className="flex flex-col gap-2">
        {lanes.map((l, i) => (
          <Lane key={i} items={l} reverse={i === 1} duration={duration + i * 9} />
        ))}
      </div>
    </section>
  );
}
