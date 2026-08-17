import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/shared/page-hero";
import { LazyRecommendationsPanel } from "@/modules/marketplace/components/recommendations-panel.lazy";

export const metadata: Metadata = {
  title: "Recommendations",
  robots: { index: false, follow: false },
};

export default function OrganizerRecommendationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Organizer"
        title="Performer recommendations"
        description="Use the rule-based recommendation engine to shortlist performers for your venue events."
      />
      <Container className="py-10 sm:py-14">
        <LazyRecommendationsPanel />
      </Container>
    </>
  );
}
