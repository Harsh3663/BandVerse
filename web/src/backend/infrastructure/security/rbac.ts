import {
  PermissionAction,
  PermissionResource,
  RoleName,
} from "@/backend/domain/enums";
import type { AuthContext, AuthorizationService } from "@/backend/application/ports/services";
import { forbiddenError } from "@/backend/shared/errors";

type PermissionKey = `${PermissionResource}:${PermissionAction}`;

const allActions = Object.values(PermissionAction);
const allResources = Object.values(PermissionResource);

function expand(
  resource: PermissionResource,
  actions: readonly PermissionAction[],
): PermissionKey[] {
  return actions.map((action) => `${resource}:${action}` as PermissionKey);
}

const rolePermissions: Record<RoleName, readonly PermissionKey[]> = {
  [RoleName.GUEST]: [
    ...expand(PermissionResource.PERFORMER, [PermissionAction.READ]),
    ...expand(PermissionResource.VENUE, [PermissionAction.READ]),
    ...expand(PermissionResource.EVENT, [PermissionAction.READ]),
    ...expand(PermissionResource.RECOMMENDATION, [PermissionAction.READ]),
  ],
  [RoleName.USER]: [
    ...expand(PermissionResource.PERFORMER, [PermissionAction.READ]),
    ...expand(PermissionResource.VENUE, [PermissionAction.READ]),
    ...expand(PermissionResource.EVENT, [PermissionAction.READ]),
    ...expand(PermissionResource.BOOKING, [
      PermissionAction.CREATE,
      PermissionAction.READ,
    ]),
    ...expand(PermissionResource.PAYMENT, [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.PAY,
    ]),
    ...expand(PermissionResource.REVIEW, [
      PermissionAction.CREATE,
      PermissionAction.READ,
    ]),
    ...expand(PermissionResource.MESSAGE, [
      PermissionAction.CREATE,
      PermissionAction.READ,
    ]),
    ...expand(PermissionResource.NOTIFICATION, [PermissionAction.READ]),
    ...expand(PermissionResource.RECOMMENDATION, [PermissionAction.READ]),
  ],
  [RoleName.PERFORMER]: [
    ...expand(PermissionResource.PERFORMER, [
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ]),
    ...expand(PermissionResource.APPLICATION, [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ]),
    ...expand(PermissionResource.BOOKING, [PermissionAction.READ, PermissionAction.UPDATE]),
    ...expand(PermissionResource.AVAILABILITY, [
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.MANAGE,
    ]),
    ...expand(PermissionResource.PACKAGE, [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.DELETE,
    ]),
    ...expand(PermissionResource.PORTFOLIO, [
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.MANAGE,
    ]),
    ...expand(PermissionResource.MEDIA, [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.DELETE,
    ]),
    ...expand(PermissionResource.ANALYTICS, [PermissionAction.READ]),
    ...expand(PermissionResource.MESSAGE, [
      PermissionAction.CREATE,
      PermissionAction.READ,
    ]),
    ...expand(PermissionResource.CONTRACT, [PermissionAction.READ, PermissionAction.UPDATE]),
    ...expand(PermissionResource.PAYMENT, [PermissionAction.READ]),
    ...expand(PermissionResource.VERIFICATION, [
      PermissionAction.CREATE,
      PermissionAction.READ,
    ]),
    ...expand(PermissionResource.NOTIFICATION, [PermissionAction.READ]),
    ...expand(PermissionResource.RECOMMENDATION, [PermissionAction.READ]),
  ],
  [RoleName.ORGANIZER]: [
    ...expand(PermissionResource.EVENT, [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.DELETE,
      PermissionAction.PUBLISH,
    ]),
    ...expand(PermissionResource.APPLICATION, [
      PermissionAction.READ,
      PermissionAction.APPROVE,
      PermissionAction.UPDATE,
    ]),
    ...expand(PermissionResource.BOOKING, [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.MANAGE,
    ]),
    ...expand(PermissionResource.OFFER, [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ]),
    ...expand(PermissionResource.CONTRACT, [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ]),
    ...expand(PermissionResource.PAYMENT, [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.PAY,
    ]),
    ...expand(PermissionResource.VENUE, [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.MANAGE,
    ]),
    ...expand(PermissionResource.ANALYTICS, [PermissionAction.READ]),
    ...expand(PermissionResource.RECOMMENDATION, [
      PermissionAction.CREATE,
      PermissionAction.READ,
    ]),
    ...expand(PermissionResource.MESSAGE, [
      PermissionAction.CREATE,
      PermissionAction.READ,
    ]),
    ...expand(PermissionResource.NOTIFICATION, [PermissionAction.READ]),
    ...expand(PermissionResource.REVIEW, [PermissionAction.CREATE, PermissionAction.READ]),
  ],
  [RoleName.VENUE_MANAGER]: [
    ...expand(PermissionResource.VENUE, [
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.MANAGE,
    ]),
    ...expand(PermissionResource.EVENT, [PermissionAction.READ]),
    ...expand(PermissionResource.AVAILABILITY, [
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.MANAGE,
    ]),
    ...expand(PermissionResource.ANALYTICS, [PermissionAction.READ]),
  ],
  [RoleName.SUPPORT]: allResources.flatMap((resource) =>
    expand(resource, [PermissionAction.READ, PermissionAction.UPDATE]),
  ),
  [RoleName.ADMIN]: allResources.flatMap((resource) => expand(resource, allActions)),
};

export function permissionsForRoles(roles: readonly RoleName[]): PermissionKey[] {
  const set = new Set<PermissionKey>();
  for (const role of roles) {
    for (const permission of rolePermissions[role] ?? []) {
      set.add(permission);
    }
  }
  return [...set];
}

/**
 * ABAC attribute checks layered on RBAC.
 * Attributes may include ownership, status, and resource relationships.
 */
export function evaluateAbac(
  context: AuthContext,
  resource: PermissionResource,
  action: PermissionAction,
  attributes: Readonly<Record<string, unknown>> = {},
): boolean {
  const key = `${resource}:${action}` as PermissionKey;
  const hasRbac =
    context.permissions.includes(key) ||
    context.permissions.includes(`${resource}:manage` as PermissionKey) ||
    context.roles.includes(RoleName.ADMIN);

  if (!hasRbac) return false;

  const ownerUserId = attributes.ownerUserId;
  if (
    typeof ownerUserId === "string" &&
    ownerUserId !== context.userId &&
    !context.roles.includes(RoleName.ADMIN) &&
    !context.roles.includes(RoleName.SUPPORT) &&
    (action === PermissionAction.UPDATE ||
      action === PermissionAction.DELETE ||
      action === PermissionAction.MANAGE)
  ) {
    return false;
  }

  if (attributes.resourceStatus === "deleted") {
    return context.roles.includes(RoleName.ADMIN);
  }

  return true;
}

export function createAuthorizationService(): AuthorizationService {
  return {
    can(context, resource, action, attributes) {
      return evaluateAbac(context, resource, action, attributes);
    },
    assertCan(context, resource, action, attributes) {
      if (!evaluateAbac(context, resource, action, attributes)) {
        throw forbiddenError(
          `Missing permission ${resource}:${action} for user ${context.userId}.`,
        );
      }
    },
  };
}

export { rolePermissions };
