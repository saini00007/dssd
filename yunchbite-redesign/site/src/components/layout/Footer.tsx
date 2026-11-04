import { footerColumns, footerPartner, site } from "@/data/site";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";
import { FooterBuddy } from "./FooterBuddy";
import { FooterShell } from "./FooterShell";

const linkCls =
  "relative inline-block py-0.5 text-cream/90 transition-colors duration-[var(--dur-quick)] hover:text-yellow after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-yellow after:transition-transform after:duration-[var(--dur-quick)] after:ease-[var(--ease-glide)] hover:after:scale-x-100";

const colTitle = "mb-4 text-sm font-bold uppercase tracking-[0.14em] text-yellow";

/** G-04. Arch-topped maroon footer with the giant wordmark, columns, social and the partner pill. */
export function Footer() {
  return (
    <FooterShell>
      <Container className="pt-[clamp(5rem,12vw,9rem)]">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-cream/15 pb-12 md:flex-row md:items-end">
          <p className="display-type max-w-[18ch] text-[length:clamp(1.9rem,4.2vw,3.6rem)] leading-[0.95]">{site.signOff}</p>
          <ButtonLink href={footerPartner.href + "#partner"} variant="yellow" size="lg">
            {footerPartner.label.replace(/\s*→\s*$/, "")}
          </ButtonLink>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-4 lg:grid-cols-[1fr_1fr_1fr_1.5fr]">
          {footerColumns.slice(0, 3).map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className={colTitle}>{col.title}</h2>
              <ul className="space-y-1.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <TransitionLink href={l.href} className={linkCls}>
                      {l.label}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 md:col-span-1">
            <h2 className={colTitle}>Contact</h2>
            <ul className="space-y-3 text-cream/90">
              <li>
                <a href={site.contact.emailHref} className={`${linkCls} inline-flex items-center gap-2`}>
                  <Icon name="mail" className="size-[1.1em] text-yellow" />
                  {site.contact.email}
                </a>
              </li>
              <li>
                <a href={site.contact.phoneHref} className={`${linkCls} inline-flex items-center gap-2`}>
                  <Icon name="phone" className="size-[1.1em] text-yellow" />
                  {site.contact.phone}
                </a>
              </li>
              <li>
                <address className="flex items-start gap-2 not-italic">
                  <Icon name="pin" className="mt-1 size-[1.1em] shrink-0 text-yellow" />
                  <span>
                    {site.contact.address.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </address>
              </li>
            </ul>
            <ul className="mt-6 flex gap-2.5">
              {site.social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.label} (${s.handle})`}
                    className="grid size-11 place-items-center rounded-full border-2 border-cream/30 text-cream transition-[background-color,color,border-color,transform] duration-[var(--dur-pop)] ease-[var(--ease-crunch)] hover:-translate-y-1 hover:border-yellow hover:bg-yellow hover:text-ink"
                  >
                    <Icon name={s.label.toLowerCase() as "instagram" | "facebook" | "linkedin"} className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* Giant wordmark; Buddy sits on it */}
      <div className="@container relative overflow-hidden">
        <div className="relative mx-auto max-w-[var(--container-max)] px-gutter">
          <FooterBuddy />
          <p
            aria-hidden="true"
            className="display-type select-none whitespace-nowrap text-center text-red text-[length:clamp(4rem,19.6cqw,18rem)] leading-[0.78] tracking-[-0.02em]"
            style={{ fontStretch: "75%" }}
          >
            Yunch Bite
          </p>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <Container className="flex flex-col gap-2 py-5 text-sm text-cream/70 md:flex-row md:items-center md:justify-between">
          <p>{site.legal}</p>
          {site.fssai ? <p>FSSAI Lic. No. {site.fssai}</p> : null}
          <p>{site.hashtag}</p>
        </Container>
      </div>
    </FooterShell>
  );
}
