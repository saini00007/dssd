import { PageTransition } from "@/components/layout/PageTransition";
import { Container } from "@/components/ui/Container";
import { TransitionLink } from "@/components/ui/TransitionLink";

// TEMPORARY home (foundation). The home agent replaces this file.
export default function Home() {
  return (
    <PageTransition>
      <Container className="py-section pt-[clamp(8rem,18vh,11rem)]">
        <h1 className="display-type text-[length:var(--text-hero)]">Yunchy. Crunchy. Healthy Bite.</h1>
        <p className="mt-6 text-lg">
          Temporary home. See the{" "}
          <TransitionLink href="/lab" className="font-bold text-red underline underline-offset-4">
            /lab
          </TransitionLink>{" "}
          gallery of foundation components.
        </p>
      </Container>
    </PageTransition>
  );
}
