import type { Metadata } from "next";

import { SearchResultsPage } from "@/features/search/search-results-page";
import type { SearchParams } from "@/features/search/search";

export const metadata: Metadata = {
  title: "Search results",
  description: "Filtered results for artists, bands, and traditional performers.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <SearchResultsPage searchParams={searchParams} action="/search/results" />;
}
