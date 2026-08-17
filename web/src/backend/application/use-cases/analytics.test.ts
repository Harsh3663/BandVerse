import { describe, expect, it } from "vitest";

import { createMockPlatformRepositories } from "@/backend/infrastructure/persistence/mock/platform-repositories";
import { getOrganizerAnalyticsUseCase } from "./analytics";

describe("analytics use cases", () => {
  it("resolves organizer analytics from dashboard data", async () => {
    const repos = createMockPlatformRepositories();
    const result = await getOrganizerAnalyticsUseCase(repos);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.value.upcomingEvents).toBe("number");
      expect(result.value.budgetUsed.currency).toBe("INR");
    }
  });
});
