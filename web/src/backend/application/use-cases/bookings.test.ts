import { describe, expect, it } from "vitest";

import type { Booking } from "@/modules/marketplace/types";
import { transitionBookingCommand } from "./bookings";

describe("booking transitions", () => {
  const booking: Booking = {
    id: "b1",
    eventId: "e1",
    performerId: "p1",
    hostId: "h1",
    agreedPrice: { amount: 50000, currency: "INR" },
    status: "requested",
    requestedAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  };

  it("allows requested -> confirmed", () => {
    const result = transitionBookingCommand(booking, "confirmed");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.status).toBe("confirmed");
  });

  it("rejects invalid transition", () => {
    const result = transitionBookingCommand(booking, "reviewed");
    expect(result.ok).toBe(false);
  });
});
