import Image from "next/image";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { Pill } from "@/components/ui/Pill";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export interface ArticleCardData {
  slug: string;
  title: string;
  category: string;
  dateISO: string;
  dateLabel: string;
  readTime: string;
  lead: string;
  image: { src: string; width: number; height: number; alt: string };
}

export interface ArticleCardProps {
  article: ArticleCardData;
  /** Large horizontal card for the latest article. */
  featured?: boolean;
  badge?: string;
  readMore: string;
  priority?: boolean;
  headingLevel?: 2 | 3;
  className?: string;
}

/** BLOG-02 / ART-05 card: image zooms 1.04 and the arrow slides on hover/focus. The whole card is one link. */
export function ArticleCard({ article: a, featured, badge, readMore, priority, headingLevel = 3, className }: ArticleCardProps) {
  const H = `h${headingLevel}` as "h2" | "h3";
  return (
    <article className={cn("group/card relative h-full", className)}>
      <TransitionLink
        href={`/articles/${a.slug}`}
        className={cn("flex h-full overflow-hidden rounded-card bg-cream-2 transition-[transform,box-shadow] duration-[var(--dur-pop)] ease-[var(--ease-glide)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]", featured ? "flex-col md:grid md:grid-cols-[1.3fr_1fr]" : "flex-col")}
      >
        <span className={cn("relative block overflow-hidden", featured ? "aspect-[16/10] md:aspect-auto md:min-h-[460px]" : "aspect-[16/10]")}>
          <Image src={a.image.src} alt={a.image.alt} width={a.image.width} height={a.image.height} priority={priority} sizes={featured ? "(min-width: 768px) 56vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"} className="absolute inset-0 size-full object-cover transition-transform duration-[var(--dur-move)] ease-[var(--ease-glide)] group-hover/card:scale-[1.04] group-focus-within/card:scale-[1.04]" />
          {badge && <span className="display-type absolute left-4 top-4 rounded-pill bg-yellow px-4 py-2 text-sm text-ink">{badge}</span>}
        </span>
        <span className={cn("flex flex-1 flex-col p-6 md:p-8", featured && "justify-center md:p-12")}>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink/75">
            <Pill tone="outline" size="sm" className="border-ink/30 text-ink">{a.category}</Pill>
            <time dateTime={a.dateISO}>{a.dateLabel}</time>
            <span aria-hidden="true">·</span>
            <span>{a.readTime}</span>
          </span>
          <H className={cn("display-type mt-4 leading-[0.96]", featured ? "text-[length:clamp(2rem,3.6vw,3.4rem)]" : "text-[length:var(--text-h3)]")}>{a.title}</H>
          <span className={cn("mt-3 block text-ink/80", featured ? "max-w-[44ch] text-[1.05rem] leading-relaxed" : "line-clamp-3 text-[0.98rem] leading-relaxed")}>{a.lead}</span>
          <span className="mt-auto inline-flex items-center gap-2 pt-6 font-bold text-red">
            {readMore.replace(/\s*→\s*$/, "")}
            <Icon name="arrow" className="size-5 transition-transform duration-[var(--dur-quick)] group-hover/card:translate-x-1.5" />
          </span>
        </span>
      </TransitionLink>
    </article>
  );
}
