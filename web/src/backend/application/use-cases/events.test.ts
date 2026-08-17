import { describe, expect, it } from "vitest";

import { createMockPlatformRepositories } from "@/backend/infrastructure/persistence/mock/platform-repositories";
import { getEventByIdUseCase, listEventsUseCase } from "./events";

describe("event use cases", () => {
  it("lists events", async () => {
    const repos = createMockPlatformRepositories();
    const result = await listEventsUseCase(repos.events, {
      page: 1,
      pageSize: 10,
      sortOrder: "desc",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.items.length).toBeGreaterThan(0);
  });

  it("returns not found for missing event", async () => {
    const repos = createMockPlatformRepositories();
    const result = await getEventByIdUseCase(repos.events, "missing");
    expect(result.ok).toBe(false);
  });
});
