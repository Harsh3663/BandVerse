import { ArrowRight, HeartHandshake, Music2, ShieldCheck } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  { icon: Music2, label: "Live talent across styles and traditions" },
  { icon: ShieldCheck, label: "Clear information for confident decisions" },
  { icon: HeartHandshake, label: "A marketplace built for both sides of the stage" },
] as const;

export function AboutPreviewSection() {
  return (
    <section
      aria-labelledby="about-preview-title"
      className="bg-background py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div>
            <p className="text-primary mb-3 text-xs font-semibold tracking-[0.08em] uppercase">
              Why BandVerse
            </p>
            <h2
              id="about-preview-title"
              className="font-display text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
            >
              Every kind of stage deserves the right artist.
            </h2>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              BandVerse is being built to make discovering and booking live performers
              clearer, while giving artists a thoughtful place to present their work.
            </p>
            <Button asChild variant="outline" className="mt-7">
              <Link href={"/about" as Route}>
                Our story <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4">
            {values.map(({ icon: Icon, label }) => (
              <Card key={label}>
                <CardContent className="flex items-center gap-4">
                  <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <p className="font-medium">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
