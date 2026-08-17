import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export function PerformersCtaSection() {
  return (
    <section
      aria-labelledby="performers-cta-title"
      className="bg-primary text-primary-foreground py-16 sm:py-20"
    >
      <Container>
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.08em] text-white/70 uppercase">
              For performers
            </p>
            <h2
              id="performers-cta-title"
              className="font-display text-3xl font-semibold sm:text-4xl"
            >
              Your talent deserves to be discovered.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              Build a profile, share your sound, and connect with people planning
              meaningful events.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-gold-500 hover:bg-gold-300 shrink-0 text-neutral-900"
          >
            <Link href={"/become-performer" as Route}>
              Join as a performer <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
