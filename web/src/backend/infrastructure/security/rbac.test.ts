import { describe, expect, it } from "vitest";

import { PermissionAction, PermissionResource, RoleName } from "@/backend/domain/enums";
import {
  createAuthorizationService,
  evaluateAbac,
  permissionsForRoles,
} from "./rbac";

describe("RBAC/ABAC", () => {
  it("grants organizer event publish permission", () => {
    const permissions = permissionsForRoles([RoleName.ORGANIZER]);
    expect(permissions).toContain("event:publish");
  });

  it("denies performer event create", () => {
    const context = {
      userId: "u1",
      roles: [RoleName.PERFORMER],
      permissions: permissionsForRoles([RoleName.PERFORMER]),
    };
    expect(
      evaluateAbac(context, PermissionResource.EVENT, PermissionAction.CREATE),
    ).toBe(false);
  });

  it("blocks non-owner updates via ABAC", () => {
    const authz = createAuthorizationService();
    const context = {
      userId: "owner-1",
      roles: [RoleName.PERFORMER],
      permissions: permissionsForRoles([RoleName.PERFORMER]),
    };
    expect(
      authz.can(context, PermissionResource.PERFORMER, PermissionAction.UPDATE, {
        ownerUserId: "other-user",
      }),
    ).toBe(false);
  });

  it("allows admin manage on all resources", () => {
    const context = {
      userId: "admin",
      roles: [RoleName.ADMIN],
      permissions: permissionsForRoles([RoleName.ADMIN]),
    };
    expect(
      evaluateAbac(context, PermissionResource.ADMIN, PermissionAction.MANAGE),
    ).toBe(true);
  });
});
