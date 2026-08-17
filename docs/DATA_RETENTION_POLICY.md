# BandVerse Data Retention Policy

## Principles

1. Soft-delete first for recoverable domain entities.
2. Archive long-lived compliance records before hard delete.
3. GDPR erasure anonymizes PII and revokes sessions/devices immediately.
4. Retention sweeps are idempotent and auditable.

## Default policies

| Resource | Soft delete | Archive | Hard delete |
|----------|-------------|---------|-------------|
| session | — | — | 90 days |
| notification | — | — | 180 days (read) |
| audit_log | — | 365 days | 2555 days (~7y) |
| webhook_delivery | — | — | 365 days |
| user | 30 days | — | 90 days after soft delete |

## GDPR erasure flow

`POST /api/v1/privacy/erasure`

1. Audit `gdpr.erasure_requested`
2. Anonymize email/phone/name/avatar/password/MFA secret
3. Soft-delete user (`deletedAt`, `anonymizedAt`, status `deleted`)
4. Revoke sessions + trusted devices
5. Audit `gdpr.erasure_completed`

Financial/booking history may remain as non-PII operational records for legal retention.

## Operational sweep

`RetentionService.runSoftDeleteSweep()` removes expired sessions and stale read notifications. Schedule via existing job/scheduler ports in production.
