import type { Metadata } from "next";

import { DiscoverPage } from "@/features/search/discovery-pages";

export const metadata: Metadata = {
  title: "Discover",
  description: "Discover live performers, categories, and events across India.",
  alternates: { canonical: "/discover" },
};

export default DiscoverPage;
