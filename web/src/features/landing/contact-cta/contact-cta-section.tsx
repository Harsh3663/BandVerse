import { ArrowRight, MessageCircleQuestion } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ContactCtaSection() {
  return (
    <section aria-labelledby="contact-cta-title" className="bg-background py-16 sm:py-20">
      <Container>
        <Card>
          <CardContent className="flex flex-col items-start justify-between gap-7 p-3 sm:p-6 md:flex-row md:items-center">
            <div className="flex gap-4">
              <span className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-lg">
                <MessageCircleQuestion
                  className="size-6"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </span>
              <div>
                <h2
                  id="contact-cta-title"
                  className="font-display text-2xl font-semibold sm:text-3xl"
                >
                  Still planning the details?
                </h2>
                <p className="text-muted-foreground mt-2 max-w-xl leading-relaxed">
                  Tell us what you are trying to create, and find the right next step.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link href={"/contact" as Route}>
                Contact us <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
