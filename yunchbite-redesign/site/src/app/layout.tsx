import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import { SITE_URL, jsonLd, defaultOgImage } from "@/lib/seo";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { CursorLabel, CursorLabelProvider } from "@/components/layout/CursorLabel";
import { MenuProvider } from "@/components/layout/MenuContext";
import { Header } from "@/components/layout/Header";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Footer } from "@/components/layout/Footer";
import { Loader } from "@/components/layout/Loader";

// Fonts. Swapping the brand fonts later (open question Q3) is a one-line change each.
const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});
const body = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const og = defaultOgImage();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${site.name} | ${site.tagline}`, template: "%s | Yunch Bite" },
  description: site.shortDescription,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    url: "/",
    title: `${site.name} | ${site.tagline}`,
    description: site.shortDescription,
    images: [og],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | ${site.tagline}`,
    description: site.shortDescription,
    images: [og.url],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#D61610",
  width: "device-width",
  initialScale: 1,
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  legalName: site.legalName,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo.png`,
  slogan: site.tagline,
  description: site.shortDescription,
  foundingDate: site.founded,
  founder: { "@type": "Person", name: site.founder.name },
  email: site.contact.email,
  telephone: site.contact.phone,
  sameAs: site.social.map((s) => s.href),
  address: {
    "@type": "PostalAddress",
    streetAddress: site.contact.address.lines[0],
    addressLocality: site.contact.address.locality,
    addressRegion: site.contact.address.region,
    postalCode: site.contact.address.postalCode,
    addressCountry: site.contact.address.country,
  },
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: SITE_URL,
  inLanguage: "en-IN",
};

// Runs before first paint: marks JS as available (so animated content can wait for GSAP) and decides whether the
// first-visit loader shows (home page, first visit this session, motion allowed). No-JS visitors never see either.
const bootScript = `(function(){var d=document.documentElement;d.setAttribute('data-js','');try{var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;if(location.pathname==='/'&&!rm&&!sessionStorage.getItem('yb-loader')){d.setAttribute('data-yb-loader','on')}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <noscript>
          <style>{`.yb-loader{display:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <SmoothScroll>
          <CursorLabelProvider>
            <MenuProvider>
              <a className="skip-link" href="#main">
                Skip to content
              </a>
              <Header />
              <MenuOverlay />
              <main id="main" tabIndex={-1} className="outline-none">
                {children}
              </main>
              <Footer />
              <Loader />
              <CursorLabel />
            </MenuProvider>
          </CursorLabelProvider>
        </SmoothScroll>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([organization, website]) }} />
      </body>
    </html>
  );
}
