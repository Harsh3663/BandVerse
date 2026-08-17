import type {
  OrganizerAnalytics,
  PerformerAnalytics,
  RecommendationInput,
  RecommendationResult,
} from "@/modules/marketplace/types";
import type { EntityId } from "@/backend/shared/types";
import type {
  PermissionAction,
  PermissionResource,
  RoleName,
} from "@/backend/domain/enums";

export interface RecommendationService {
  recommend(input: RecommendationInput): Promise<RecommendationResult>;
}

export interface AnalyticsService {
  resolveOrganizerAnalytics(hostId: EntityId): Promise<OrganizerAnalytics>;
  resolvePerformerAnalytics(performerId: EntityId): Promise<PerformerAnalytics>;
}

export interface AuthContext {
  readonly userId: EntityId;
  readonly roles: readonly RoleName[];
  readonly permissions: readonly `${PermissionResource}:${PermissionAction}`[];
  readonly sessionId?: EntityId;
}

export interface AuthUserView {
  readonly id: EntityId;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly RoleName[];
  readonly phone?: string;
  readonly avatarUrl?: string;
}

export interface AuthTokenBundle {
  readonly accessToken: string;
  /** Server-only refresh material for httpOnly cookie; omit from JSON responses. */
  readonly refreshToken: string;
  readonly expiresIn: number;
  readonly context: AuthContext;
  readonly user: AuthUserView;
}

export type LoginResult =
  | ({ readonly status: "authenticated" } & AuthTokenBundle)
  | {
      readonly status: "mfa_required";
      readonly mfaChallengeToken: string;
      readonly expiresIn: number;
      readonly user: Pick<AuthUserView, "id" | "email" | "displayName">;
    };

export interface AuthService {
  register(input: {
    email: string;
    password: string;
    displayName: string;
    phone?: string;
    role: RoleName;
  }): Promise<AuthTokenBundle>;
  login(email: string, password: string): Promise<LoginResult>;
  /** Exchange MFA challenge token for a full session after TOTP/backup verified. */
  completeMfaLogin(mfaChallengeToken: string): Promise<AuthTokenBundle>;
  refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }>;
  logout(sessionId: EntityId): Promise<void>;
  /** Revoke all refresh sessions for a user (security incident / password change). */
  revokeAllSessions(userId: EntityId): Promise<number>;
  getContextFromAccessToken(token: string): Promise<AuthContext | undefined>;
  getMe(userId: EntityId): Promise<AuthUserView | undefined>;
}

export interface AuthorizationService {
  can(
    context: AuthContext,
    resource: PermissionResource,
    action: PermissionAction,
    attributes?: Readonly<Record<string, unknown>>,
  ): boolean;
  assertCan(
    context: AuthContext,
    resource: PermissionResource,
    action: PermissionAction,
    attributes?: Readonly<Record<string, unknown>>,
  ): void;
}

export interface RateLimitService {
  consume(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }>;
}

export interface MediaSecurityService {
  validateUpload(input: {
    mimeType: string;
    sizeBytes: number;
    originalName: string;
  }): { accepted: boolean; reason?: string };
}
