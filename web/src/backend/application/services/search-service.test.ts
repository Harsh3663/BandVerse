import { describe, expect, it } from "vitest";

import { createCacheServiceSync } from "@/backend/infrastructure/cache";
import { createMockPlatformRepositories } from "@/backend/infrastructure/persistence/mock/platform-repositories";
import { createSearchService } from "./search-service";

describe("search service", () => {
  it("searches performers with pagination", async () => {
    const repos = createMockPlatformRepositories();
    const search = createSearchService(repos, createCacheServiceSync());
    const page = await search.searchPerformers({
      page: 1,
      pageSize: 3,
      sortOrder: "desc",
      sort: "rating",
    });
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.length).toBeLessThanOrEqual(3);
    expect(page.meta.page).toBe(1);
  });

  it("filters venues by city keyword", async () => {
    const repos = createMockPlatformRepositories();
    const search = createSearchService(repos, createCacheServiceSync());
    const all = await repos.venues.list();
    const city = all[0]?.location.city;
    const page = await search.searchVenues({
      page: 1,
      pageSize: 20,
      sortOrder: "asc",
      city,
    });
    expect(page.items.every((venue) => venue.location.city === city)).toBe(true);
  });
});
