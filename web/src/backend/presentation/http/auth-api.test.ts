import { beforeEach, describe, expect, it } from "vitest";

import { POST as register } from "@/app/api/v1/auth/register/route";
import { POST as login } from "@/app/api/v1/auth/login/route";
import { GET as me } from "@/app/api/v1/auth/me/route";
import { resetBackendContainer } from "@/backend/infrastructure/container";

describe("auth API routes", () => {
  beforeEach(() => {
    process.env.BANDVERSE_PERSISTENCE = "mock";
    resetBackendContainer();
  });

  it("registers and returns current user via /me", async () => {
    const registerResponse = await register(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: `api-${Date.now()}@bandverse.test`,
          password: "password123",
          displayName: "API User",
          role: "organizer",
        }),
      }),
    );
    expect(registerResponse.status).toBe(201);
    const registered = (await registerResponse.json()) as {
      data: { accessToken: string; user: { email: string } };
    };

    const meResponse = await me(
      new Request("http://localhost/api/v1/auth/me", {
        headers: { authorization: `Bearer ${registered.data.accessToken}` },
      }),
    );
    expect(meResponse.status).toBe(200);
    const meBody = (await meResponse.json()) as { data: { email: string } };
    expect(meBody.data.email).toBe(registered.data.user.email);

    const loginResponse = await login(
      new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: registered.data.user.email,
          password: "password123",
        }),
      }),
    );
    expect(loginResponse.status).toBe(200);
  });
});
