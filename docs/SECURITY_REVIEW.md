# BandVerse Security Review (OWASP-aligned)

## Implemented controls

| Control | Implementation |
|---------|----------------|
| AuthN | jose JWT access + hashed refresh sessions + bcrypt passwords |
| AuthZ | RBAC + ABAC ownership checks |
| CSRF | Double-submit cookie helper (`csrf.ts`), enforce via `CSRF_PROTECTION` |
| CSP + security headers | Next middleware (`securityHeaders`) |
| Brute force | Login lockout after 5 failures / 15m |
| Rate limiting | Per-bucket in-memory (Redis-ready for multi-node) |
| Token revocation | `/api/v1/auth/revoke` + session revoke-all |
| Suspicious activity | 401/403 signals → metrics + structured warn logs |
| Input validation | Zod on API boundaries |
| Media upload validation | MIME/size/extension checks |
| Payment webhooks | HMAC verification + idempotency |
| Audit | Append-oriented audit log writer |

## Residual risks

| Risk | Rank | Notes |
|------|------|-------|
| CSRF not enforced in non-production by default | Medium | Set `CSRF_PROTECTION=true` |
| In-memory brute-force/rate-limit state | High | Move to Redis in multi-node |
| Webhook idempotency set is process-local | High | Persist unique webhook event IDs |
| CSP allows unsafe-inline/eval for Next/dev tooling | Medium | Tighten for strict production CSP |
| No MFA yet | High | Required for admin/organizer later |

## OWASP Top 10 mapping

See also `web/src/backend/infrastructure/security/owasp.ts` checklist module.
