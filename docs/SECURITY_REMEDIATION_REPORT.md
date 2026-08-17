# Security Remediation Report

## P0 closures

| Issue | Fix |
|-------|-----|
| MFA secret recoverable | AES-256-GCM (`v1.iv.tag.ciphertext`) via `MFA_ENCRYPTION_KEY`/`JWT_SECRET` |
| MFA login bypass | Login returns `mfaRequired` + challenge token; no access/refresh until `/auth/mfa/verify` |
| Payments list open | `GET /payments` requires `PAYMENT:READ` + booking party scope |
| Performer analytics open | Auth + `assertOwnership` on performer `userId` |
| Booking/application IDOR | `OwnershipGuard` on GET/PATCH; booking list defaults to host scope |
| Session revocation ignored | `getContextFromAccessToken` validates `sid` not revoked |
| Refresh in JSON | Cookie-only refresh; omitted from login/register/refresh JSON |

## Additional P1

- CSRF enforced on cookie refresh (`assertCsrf` + `setCsrfCookie`)
- Atomic refresh rotate + reuse → revoke-all
- Reusable `ownership-guard.ts`

## APIs secured

`/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/mfa/verify`, `/payments`, `/analytics/performer/:id`, `/bookings`, `/bookings/:id`, `/applications/:id`, `/performers/:id` (owner attribute)

## Tests

`security-hardening.test.ts`, updated auth service revoke checks.
