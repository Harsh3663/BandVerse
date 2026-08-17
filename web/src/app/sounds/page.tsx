import type { Metadata } from "next";

import { SoundsHubPage } from "@/modules/marketplace/components/cultural-sounds-pages";

export const metadata: Metadata = {
  title: "Discover India's Sounds",
  description:
    "Browse regions, instruments, festivals, and traditions shaping live performance across India.",
  alternates: { canonical: "/sounds" },
};

export default SoundsHubPage;
