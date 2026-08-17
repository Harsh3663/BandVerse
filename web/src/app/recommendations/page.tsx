import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/shared/page-hero";
import { LazyRecommendationsPanel } from "@/modules/marketplace/components/recommendations-panel.lazy";

export const metadata: Metadata = {
  title: "AI Recommendations",
  description:
    "Get rule-based performer, band, and traditional group recommendations for your event.",
  alternates: { canonical: "/recommendations" },
};

export default function RecommendationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Recommendations"
        title="Find the right performers for your event"
        description="Share your event brief and receive scored matches with budget estimates, suggested instruments, and compatibility breakdowns."
      />
      <Container className="py-10 sm:py-14">
        <LazyRecommendationsPanel />
      </Container>
    </>
  );
}
