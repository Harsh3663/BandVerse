import type { Metadata } from "next";

import { PerformerDirectoryPage } from "@/features/search/discovery-pages";

export const metadata: Metadata = {
  title: "Bands",
  description: "Find live bands for weddings, festivals, venues, and corporate events.",
  alternates: { canonical: "/bands" },
};

export default function BandsPage() {
  return <PerformerDirectoryPage kind="band" />;
}
