import { beforeEach, describe, expect, it } from "vitest";
import * as OTPAuth from "otpauth";

import { POST as register } from "@/app/api/v1/auth/register/route";
import { POST as login } from "@/app/api/v1/auth/login/route";
import { GET as paymentsGet } from "@/app/api/v1/payments/route";
import { GET as performerAnalytics } from "@/app/api/v1/analytics/performer/[performerId]/route";
import { resetBackendContainer, getBackendContainer } from "@/backend/infrastructure/container";
import { assertOwnership } from "@/backend/presentation/http/ownership-guard";
import { RoleName } from "@/backend/domain/enums";
import { assertCsrf, issueCsrfToken, setCsrfCookie } from "@/backend/infrastructure/security/csrf";
import { NextResponse } from "next/server";

describe("security hardening", () => {
  beforeEach(() => {
    process.env.BANDVERSE_PERSISTENCE = "mock";
    process.env.CSRF_PROTECTION = "true";
    resetBackendContainer();
  });

  it("rejects unauthenticated payment listing", async () => {
    const response = await paymentsGet(
      new Request("http://localhost/api/v1/payments"),
    );
    expect(response.status).toBe(401);
  });

  it("rejects unauthenticated performer analytics", async () => {
    const response = await performerAnalytics(
      new Request("http://localhost/api/v1/analytics/performer/p1"),
      { params: Promise.resolve({ performerId: "p1" }) },
    );
    expect(response.status).toBe(401);
  });

  it("ownership guard allows party and denies strangers", () => {
    const context = {
      userId: "user_a",
      roles: [RoleName.ORGANIZER],
      permissions: [],
    };
    expect(assertOwnership(context, ["user_a"]).ok).toBe(true);
    expect(assertOwnership(context, ["user_b"]).ok).toBe(false);
  });

  it("enforces CSRF double-submit cookie", () => {
    const token = issueCsrfToken();
    const response = NextResponse.json({});
    setCsrfCookie(response, token);
    const cookie = response.cookies.get("bv_csrf")?.value ?? token;
    expect(() =>
      assertCsrf(
        new Request("http://localhost/api/v1/auth/refresh", {
          method: "POST",
          headers: {
            "x-csrf-token": token,
            cookie: `bv_csrf=${cookie}`,
          },
        }),
        { enforce: true },
      ),
    ).not.toThrow();
    expect(() =>
      assertCsrf(
        new Request("http://localhost/api/v1/auth/refresh", {
          method: "POST",
          headers: { "x-csrf-token": "bad" },
        }),
        { enforce: true },
      ),
    ).toThrow(/CSRF/);
  });

  it("MFA login challenge then completion issues access without prior token", async () => {
    const email = `mfa-${Date.now()}@bandverse.test`;
    const registerResponse = await register(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password: "password123",
          displayName: "MFA User",
          role: "organizer",
        }),
      }),
    );
    const registered = (await registerResponse.json()) as {
      data: { accessToken: string; user: { id: string } };
    };

    const container = getBackendContainer();
    const setup = await container.mfa.beginSetup(registered.data.user.id, email);
    const totp = new OTPAuth.TOTP({
      issuer: "BandVerse",
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(setup.secret),
    });
    await container.mfa.enable(registered.data.user.id, totp.generate());

    const loginResponse = await login(
      new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password: "password123" }),
      }),
    );
    expect(loginResponse.status).toBe(200);
    const loginBody = (await loginResponse.json()) as {
      data: { mfaRequired?: boolean; mfaChallengeToken?: string; accessToken?: string };
    };
    expect(loginBody.data.mfaRequired).toBe(true);
    expect(loginBody.data.accessToken).toBeUndefined();
    expect(loginBody.data.mfaChallengeToken).toBeTruthy();
  });

  it("does not return refreshToken in register JSON", async () => {
    const response = await register(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: `norefresh-${Date.now()}@bandverse.test`,
          password: "password123",
          displayName: "No Refresh",
          role: "organizer",
        }),
      }),
    );
    const body = (await response.json()) as { data: Record<string, unknown> };
    expect(body.data.refreshToken).toBeUndefined();
    expect(body.data.accessToken).toBeTruthy();
  });
});
