import { beforeEach, describe, expect, it } from "vitest";

import { RoleName } from "@/backend/domain/enums";
import { resetBackendContainer } from "@/backend/infrastructure/container";
import { createMemoryAuthService } from "./auth-service";

describe("auth service (memory)", () => {
  beforeEach(() => {
    resetBackendContainer();
  });

  it("registers, logs in, refreshes, and resolves me", async () => {
    const auth = createMemoryAuthService();
    const registered = await auth.register({
      email: "performer@bandverse.test",
      password: "password123",
      displayName: "Test Performer",
      role: RoleName.PERFORMER,
    });

    expect(registered.accessToken).toBeTruthy();
    expect(registered.user.roles).toContain(RoleName.PERFORMER);

    const loggedIn = await auth.login("performer@bandverse.test", "password123");
    expect(loggedIn.status).toBe("authenticated");
    if (loggedIn.status !== "authenticated") throw new Error("expected authenticated");
    expect(loggedIn.user.id).toBe(registered.user.id);

    const refreshed = await auth.refresh(loggedIn.refreshToken);
    expect(refreshed.accessToken).toBeTruthy();

    const context = await auth.getContextFromAccessToken(refreshed.accessToken);
    expect(context?.userId).toBe(registered.user.id);

    const me = await auth.getMe(registered.user.id);
    expect(me?.email).toBe("performer@bandverse.test");

    const revoked = await auth.revokeAllSessions(registered.user.id);
    expect(revoked).toBeGreaterThanOrEqual(1);

    const afterRevoke = await auth.getContextFromAccessToken(refreshed.accessToken);
    expect(afterRevoke).toBeUndefined();
  });

  it("rejects invalid credentials", async () => {
    const auth = createMemoryAuthService();
    await auth.register({
      email: "organizer@bandverse.test",
      password: "password123",
      displayName: "Org",
      role: RoleName.ORGANIZER,
    });

    await expect(auth.login("organizer@bandverse.test", "wrong-password")).rejects.toThrow(
      /Invalid credentials/,
    );
  });
});
