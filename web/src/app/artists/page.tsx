import type { Metadata } from "next";

import { PerformerDirectoryPage } from "@/features/search/discovery-pages";

export const metadata: Metadata = {
  title: "Artists",
  description: "Discover singers, instrumentalists, and DJs across India.",
  alternates: { canonical: "/artists" },
};

export default function ArtistsPage() {
  return <PerformerDirectoryPage kind="artist" />;
}
