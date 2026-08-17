import { ArrowRight, Globe2, Search, Smartphone } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function MobileCtaSection() {
  return (
    <section
      aria-labelledby="mobile-cta-title"
      className="bg-muted/40 overflow-hidden py-16 sm:py-20"
    >
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <Badge variant="secondary">
              <Globe2 aria-hidden="true" /> Responsive web
            </Badge>
            <h2
              id="mobile-cta-title"
              className="font-display mt-5 text-3xl leading-tight font-semibold sm:text-4xl"
            >
              Take the search with you.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl text-lg leading-relaxed">
              BandVerse works in your mobile browser, so you can browse from any screen.
              There is no native iOS or Android app yet.
            </p>
            <Button asChild className="mt-7">
              <Link href={"/search" as Route}>
                Discover performers <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="border-border bg-background relative mx-auto w-64 rounded-[2.5rem] border-8 p-4 shadow-xl">
            <div
              className="bg-muted mx-auto mb-5 h-1.5 w-16 rounded-full"
              aria-hidden="true"
            />
            <div className="bg-primary/10 flex aspect-[3/4] flex-col items-center justify-center rounded-3xl p-6 text-center">
              <Smartphone
                className="text-primary size-10"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="font-heading mt-5 text-lg font-semibold">
                BandVerse on the web
              </p>
              <div className="bg-background text-muted-foreground mt-5 flex h-11 w-full items-center gap-2 rounded-full px-4 text-left text-sm">
                <Search className="size-4" aria-hidden="true" />
                Search performers
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
