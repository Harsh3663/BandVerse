import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { Button } from "@/components/ui/button";
import { landingFaqs } from "@/data/landing-experience";

export function LandingFaqSection() {
  return (
    <div className="bg-muted/40 py-16 sm:py-20 lg:py-24">
      <Container width="narrow">
        <FaqAccordion items={landingFaqs} heading="Questions before the first note?" />
        <Button asChild variant="link" className="mt-5 px-0">
          <Link href={"/faq" as Route}>
            Read all FAQs <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </Container>
    </div>
  );
}
