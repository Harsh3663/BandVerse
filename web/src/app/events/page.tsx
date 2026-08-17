import type { Metadata } from "next";

import { EventsPage } from "@/features/search/discovery-pages";

export const metadata: Metadata = {
  title: "Events",
  description: "Discover upcoming live music and cultural events across India.",
  alternates: { canonical: "/events" },
};

export default EventsPage;
