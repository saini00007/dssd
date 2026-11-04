import type { Metadata } from "next";

export const SITE_URL = "https://yunchbite.com";
export const BRAND = "Yunch Bite";
export const DEFAULT_OG = "/brand/og.jpg";

interface PageMetaInput {
  /** Page title. If it already contains "Yunch Bite" it is used as-is, otherwise "%s | Yunch Bite". */
  title: string;
  description: string;
  /** Route path, e.g. "/products/makhana-zipper-peri-peri" ("/" for home). */
  path: string;
  /** Absolute or site-relative image for OG/Twitter; defaults to /brand/og.jpg. */
  image?: string | { url: string; width?: number; height?: number; alt?: string };
  type?: "website" | "article";
  noindex?: boolean;
  /** ISO date strings, for articles. */
  publishedTime?: string;
  modifiedTime?: string;
}

/** The one place pages build their `metadata` export: canonical + OG + Twitter. */
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  noindex,
  publishedTime,
  modifiedTime,
}: PageMetaInput): Metadata {
  const canonical = path === "/" ? "/" : path.replace(/\/+$/, "");
  const img = typeof image === "string" ? { url: image } : (image ?? { url: DEFAULT_OG });
  const hasBrand = title.toLowerCase().includes("yunch bite");
  const ogTitle = hasBrand ? title : `${title} | ${BRAND}`;
  return {
    title: hasBrand ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      type,
      siteName: BRAND,
      locale: "en_IN",
      title: ogTitle,
      description,
      url: canonical,
      images: [img],
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [img.url],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Safe JSON-LD serialiser (escapes "<"). Use inside <script type="application/ld+json">. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
