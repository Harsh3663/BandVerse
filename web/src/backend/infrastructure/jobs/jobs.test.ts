import { describe, expect, it } from "vitest";

import { createMemoryJobSystem, registerDefaultJobHandlers } from "./index";

describe("job system", () => {
  it("enqueues and processes booking jobs", async () => {
    const system = createMemoryJobSystem();
    registerDefaultJobHandlers(system.jobs, system.queue);
    await system.queue.enqueue("booking.process", { bookingId: "b1" });
    const processed = await system.jobs.processDue(10);
    expect(processed).toBeGreaterThanOrEqual(1);
    // booking handler enqueues email notification
    expect(await system.queue.size()).toBeGreaterThanOrEqual(1);
  });
});
