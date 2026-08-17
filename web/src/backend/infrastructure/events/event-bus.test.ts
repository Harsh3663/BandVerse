import { describe, expect, it } from "vitest";

import { createInProcessEventBus } from "./event-bus";

describe("in-process event bus", () => {
  it("publishes domain events to subscribers", async () => {
    const bus = createInProcessEventBus();
    const seen: string[] = [];
    bus.subscribe("BookingCreated", async (event) => {
      seen.push(String(event.payload.bookingId));
    });
    await bus.publish("BookingCreated", { bookingId: "booking_1" }, "cor_1");
    expect(seen).toEqual(["booking_1"]);
  });
});
