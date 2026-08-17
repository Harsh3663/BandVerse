import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/shared/page-hero";
import { PerformerCard } from "@/components/shared/performer-card";
import { EmptyState } from "@/components/shared/result-state";

import { SearchForm } from "./search-form";
import { filterPerformers, parseSearchQuery, type SearchParams } from "./search";

interface SearchResultsPageProps {
  searchParams: Promise<SearchParams>;
  action: "/search" | "/search/results";
}

export async function SearchResultsPage({
  searchParams,
  action,
}: SearchResultsPageProps) {
  const query = parseSearchQuery(await searchParams);
  const performers = filterPerformers(query);

  return (
    <>
      <PageHero
        eyebrow="Search"
        title="Find your next performer"
        description="Search artists, bands, and traditional groups by style, city, or occasion."
      />
      <Container className="space-y-8 py-10 sm:py-14">
        <SearchForm query={query} action={action} resultCount={performers.length} />
        {performers.length ? (
          <section aria-labelledby="search-results-heading">
            <h2 id="search-results-heading" className="sr-only">
              Search results
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {performers.map((performer, index) => (
                <PerformerCard
                  key={performer.id}
                  performer={performer}
                  priority={index < 4}
                />
              ))}
            </div>
          </section>
        ) : (
          <EmptyState clearHref={action} />
        )}
      </Container>
    </>
  );
}
