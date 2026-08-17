import { beforeEach, describe, expect, it } from "vitest";

import { POST as register } from "@/app/api/v1/auth/register/route";
import { GET as listBookings, POST as createBooking } from "@/app/api/v1/bookings/route";
import { resetBackendContainer } from "@/backend/infrastructure/container";

describe("bookings API", () => {
  beforeEach(() => {
    process.env.BANDVERSE_PERSISTENCE = "mock";
    resetBackendContainer();
  });

  it("creates and lists bookings for authenticated organizer", async () => {
    const registerResponse = await register(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: `bookings-${Date.now()}@bandverse.test`,
          password: "password123",
          displayName: "Booking Org",
          role: "organizer",
        }),
      }),
    );
    const registered = (await registerResponse.json()) as {
      data: { accessToken: string };
    };
    const token = registered.data.accessToken;

    const createResponse = await createBooking(
      new Request("http://localhost/api/v1/bookings", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          performerId: "performer-missing-ok-mock",
          eventTypeId: "wedding",
          eventDate: "2026-09-01",
          startTime: "19:00",
          endTime: "22:00",
          venueId: "venue-1",
          venueName: "Test Venue",
          city: "Mumbai",
          audienceSize: 100,
          budget: { amount: 50000, currency: "INR" },
          specialRequirements: "",
        }),
      }),
    );
    expect(createResponse.status).toBe(201);

    const listResponse = await listBookings(
      new Request("http://localhost/api/v1/bookings", {
        headers: { authorization: `Bearer ${token}` },
      }),
    );
    expect(listResponse.status).toBe(200);
  });
});
