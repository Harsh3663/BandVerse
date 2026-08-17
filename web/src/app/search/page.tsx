import type { Metadata } from "next";

import { SearchResultsPage } from "@/features/search/search-results-page";
import type { SearchParams } from "@/features/search/search";

export const metadata: Metadata = {
  title: "Search performers",
  description: "Search artists, bands, and traditional performers by category and city.",
  alternates: { canonical: "/search" },
};

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <SearchResultsPage searchParams={searchParams} action="/search" />;
}
