import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TypeIn } from "@/components/motion/TypeIn";
import { Reveal } from "@/components/motion/Reveal";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { PageTransition } from "@/components/layout/PageTransition";
import { buddyImage } from "@/lib/media";
import { menuCategories } from "@/data/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page has wandered off. Head back to the crunch.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <PageTransition>
      <div className="bg-cream pb-section pt-[clamp(7rem,16vh,10rem)]">
        <Container className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Eyebrow className="mb-5 text-red">Error 404</Eyebrow>
            <TypeIn as="h1" trigger="load" text="Yeh page toh koi kha gaya!" className="display-type text-[length:var(--text-display)] leading-[0.92]" />
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-[44ch] text-lg text-ink/80">
                Buddy looked everywhere, but this page has wandered off. Let&apos;s get you back to something crunchy.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href="/" variant="solid" size="lg">
                  Back home
                </ButtonLink>
                <ButtonLink href="/products" variant="ghost" size="lg">
                  See all products
                </ButtonLink>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-semibold">
                {menuCategories.map((c) => (
                  <li key={c.href}>
                    <TransitionLink href={c.href} className="underline decoration-red/40 underline-offset-4 hover:decoration-red">
                      {c.label}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <div className="relative mx-auto w-full max-w-[420px]">
            <Image src={buddyImage("confused").src} alt="Makhana Buddy looking lost" width={buddyImage("confused").width} height={buddyImage("confused").height} priority sizes="(min-width: 768px) 420px, 80vw" className="h-auto w-full [mask-image:linear-gradient(to_right,transparent_0,#000_10%)]" />
          </div>
        </Container>
      </div>
    </PageTransition>
  );
}
