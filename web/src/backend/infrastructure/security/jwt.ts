/**
 * JWT architecture notes + re-exports for the production auth service.
 * Cryptographic JWT issuance lives in `auth-service.ts` (jose + bcrypt).
 */

export {
  authTokenTtl,
  createMemoryAuthService,
  createPrismaAuthService,
} from "./auth-service";

export const jwtArchitectureNotes = {
  accessTtlSeconds: 15 * 60,
  refreshTtlSeconds: 30 * 24 * 60 * 60,
  algorithm: "HS256",
  rotation: "rotate-on-refresh with hashed refresh token in sessions table",
  storage: "refresh token hash in sessions; access token never persisted",
  transport:
    "Authorization: Bearer <access>; refresh via httpOnly secure cookie (bv_refresh)",
} as const;
