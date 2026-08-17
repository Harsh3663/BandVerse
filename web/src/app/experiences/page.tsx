import type { Metadata } from "next";

import { ExperiencesHubPage } from "@/modules/marketplace/components/experience-pages";

export const metadata: Metadata = {
  title: "Experience Packages",
  description:
    "Book curated multi-artist experiences with timelines, equipment, and suggested budgets.",
  alternates: { canonical: "/experiences" },
};

export default ExperiencesHubPage;
