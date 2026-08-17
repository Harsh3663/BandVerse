import { describe, expect, it } from "vitest";

import { createMockPlatformRepositories } from "./platform-repositories";

describe("mutable mock repositories", () => {
  it("creates and updates an application", async () => {
    const repos = createMockPlatformRepositories();
    const created = await (
      repos.applications as unknown as {
        create: (application: {
          id: string;
          eventId: string;
          performerId: string;
          quotedPrice: { amount: number; currency: "INR" };
          message: string;
          status: "submitted";
          submittedAt: string;
          updatedAt: string;
        }) => Promise<{ id: string; status: string }>;
      }
    ).create({
      id: "app-test-1",
      eventId: "event-1",
      performerId: "performer-1",
      quotedPrice: { amount: 10000, currency: "INR" },
      message: "Interested",
      status: "submitted",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(created.id).toBe("app-test-1");
    const fetched = await repos.applications.getById("app-test-1");
    expect(fetched?.message).toBe("Interested");
  });
});
