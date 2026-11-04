import { PageTransition } from "@/components/layout/PageTransition";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { TypeIn } from "@/components/motion/TypeIn";
import { Reveal } from "@/components/motion/Reveal";
import { ContactClient } from "@/components/content/ContactClient";
import { contactCopy, site } from "@/data";
import { jsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ ...contactCopy.seo, path: "/contact" });

const c = contactCopy.contact;

export default function ContactPage() {
  const d = c["CON-04"];
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.contact.address.full)}`;
  const icons = { Instagram: "instagram", Facebook: "facebook", LinkedIn: "linkedin" } as const;
  return (
    <PageTransition>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contact Yunch Bite",
            mainEntity: {
              "@type": "Organization",
              name: site.name,
              email: site.contact.email,
              telephone: site.contact.phone,
              address: { "@type": "PostalAddress", streetAddress: site.contact.address.lines[0], addressLocality: site.contact.address.locality, addressRegion: site.contact.address.region, postalCode: site.contact.address.postalCode, addressCountry: site.contact.address.country },
            },
          }),
        }}
      />
      <Section tone="cream" padded={false} className="pt-[clamp(8rem,18vh,11rem)] pb-10">
        <Container>
          <Eyebrow className="mb-5 text-red">Contact</Eyebrow>
          <TypeIn as="h1" trigger="load" text={c["CON-01"].title} className="display-type block text-[length:var(--text-hero)] leading-[0.86]" />
        </Container>
      </Section>
      <ContactClient
        paths={c["CON-01"].paths}
        partner={{ heading: c["CON-02"].heading, lead: c["CON-02"].lead, fields: c["CON-02"].fields, submit: c["CON-02"].submit, interestPlaceholder: c["CON-02"].interestPlaceholder }}
        question={{ heading: c["CON-03"].heading, lead: c["CON-03"].lead, fields: c["CON-03"].fields, submit: c["CON-03"].submit }}
      />

      {/* CON-04 */}
      <Section tone="maroon" arch behind="var(--color-cream-2)" aria-labelledby="contact-details">
        <Container>
          <TypeIn as="h2" id="contact-details" text={d.heading} className="display-type block text-[length:var(--text-display)] leading-[0.92]" />
          <Reveal stagger={0.1} className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-card bg-maroon-deep p-7">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-yellow"><Icon name="phone" className="size-5" />{d.phoneLabel}</p>
              <a href={site.contact.phoneHref} className="mt-3 block text-xl font-bold underline-offset-4 hover:underline">{site.contact.phone}</a>
            </div>
            <div className="rounded-card bg-maroon-deep p-7">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-yellow"><Icon name="mail" className="size-5" />{d.emailLabel}</p>
              <a href={site.contact.emailHref} className="mt-3 block break-all text-xl font-bold underline-offset-4 hover:underline">{site.contact.email}</a>
            </div>
            <div className="rounded-card bg-maroon-deep p-7">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-yellow"><Icon name="pin" className="size-5" />{d.addressLabel}</p>
              <address className="mt-3 text-lg not-italic leading-snug">
                {site.contact.address.lines.map((l) => (
                  <span key={l} className="block">{l}</span>
                ))}
              </address>
              <a href={mapHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 font-bold text-yellow underline-offset-4 hover:underline">
                {d.mapLabel} <span className="sr-only">(opens in a new tab)</span>
                <Icon name="arrow" className="size-5" />
              </a>
            </div>
            <div className="rounded-card bg-maroon-deep p-7">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-yellow">{d.socialHeading}</p>
              <ul className="mt-3 space-y-2">
                {site.social.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-lg font-bold underline-offset-4 hover:underline">
                      <Icon name={icons[s.label as keyof typeof icons]} className="size-6" />
                      {s.label}
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </Container>
      </Section>
    </PageTransition>
  );
}
