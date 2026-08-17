import { describe, expect, it } from "vitest";

import { createMockPlatformRepositories } from "@/backend/infrastructure/persistence/mock/platform-repositories";
import { listPerformersUseCase, getPerformerByIdUseCase } from "./performers";

describe("performer use cases", () => {
  it("lists and paginates performers from repository", async () => {
    const repos = createMockPlatformRepositories();
    const result = await listPerformersUseCase(repos.performers, {
      page: 1,
      pageSize: 5,
      sortOrder: "desc",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.items.length).toBeGreaterThan(0);
      expect(result.value.items.length).toBeLessThanOrEqual(5);
      expect(result.value.meta.page).toBe(1);
    }
  });

  it("returns not found for unknown performer", async () => {
    const repos = createMockPlatformRepositories();
    const result = await getPerformerByIdUseCase(repos.performers, "missing-id");
    expect(result.ok).toBe(false);
  });
});
