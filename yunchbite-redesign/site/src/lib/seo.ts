import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { BASE_PATH } from "@/lib/base-path";

export const SITE_URL = "https://yunchbite.com";
export const BRAND = "Yunch Bite";
/** /brand/og.jpg when the assets agent has produced it, otherwise the logo. */
export function defaultOgImage(): { url: string; width: number; height: number; alt: string } {
  const hasOg = existsSync(join(process.cwd(), "public/brand/og.jpg"));
  return hasOg
    ? { url: "/brand/og.jpg", width: 1200, height: 630, alt: "Yunch Bite: Yunchy. Crunchy. Healthy Bite." }
    : { url: "/brand/logo.png", width: 362, height: 186, alt: "Yunch Bite" };
}

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
  const img = typeof image === "string" ? { url: image } : (image ?? defaultOgImage());
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
    // The GitHub Pages preview (served under a base path) must never be indexed ahead of yunchbite.com.
    ...(noindex || BASE_PATH ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Safe JSON-LD serialiser (escapes "<"). Use inside <script type="application/ld+json">. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
