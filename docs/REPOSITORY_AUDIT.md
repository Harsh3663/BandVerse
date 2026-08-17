# BandVerse Repository Audit (Pre-Remediation)

**Date:** 2026-08-10  
**Mode:** Analysis only (no code changes in this phase)  
**Baseline score:** 72/100 (see `FINAL_ARCHITECTURAL_AUDIT.md`)

---

## Current architecture

Next.js App Router app under `web/` with layered backend:

- `web/src/backend/domain` — entities, enums  
- `web/src/backend/application` — use cases, ports, search  
- `web/src/backend/infrastructure` — auth, Prisma/mock, cache, jobs, payments, realtime, observability  
- `web/src/backend/presentation/http` — guards, responses, governance  
- `web/src/app/api/v1/*` — HTTP surface  
- `web/prisma/schema.prisma` — Postgres model  
- `web/src/modules/marketplace` — product domain + **mock UI data** (frontend freeze: not rewritten)

DI: `getBackendContainer()` selects Prisma vs mock via `DATABASE_URL` / `BANDVERSE_PERSISTENCE`.

---

## Existing backend modules

| Module | Path | Status |
|--------|------|--------|
| Auth / JWT / cookies | `infrastructure/security/*` | Partial — MFA/session gaps |
| MFA / sessions | `security/mfa.ts`, `sessions.ts` | Present, P0 crypto/login |
| RBAC/ABAC | `security/rbac.ts` | RBAC OK; ABAC underused |
| Prisma repos | `persistence/prisma/repositories.ts` | Core entities; chats/offers/contracts mock |
| Mock repos | `persistence/mock/*`, marketplace mocks | Used when no DB / UI |
| Cache | Redis or memory | Redis optional |
| Jobs | Memory always wired | BullMQ adapter unused |
| Payments | Stub providers + ledger | Not live PSP |
| Event bus | In-process | No broker |
| Realtime | In-process SSE | Single-node |
| Audit / retention | Present | Incomplete GDPR |

---

## Existing APIs (`/api/v1`)

Auth, MFA, sessions, performers, venues, events, bookings, applications, reviews, payments (+intent/webhook/recover), search, recommendations, analytics, jobs/process, realtime/sse, health/ready/live/metrics, privacy/erasure.

---

## Auth flow (current)

1. Register/login → bcrypt + jose JWT + refresh cookie **and** JSON refresh  
2. Access token carries roles/`sid`; **not** checked against revoked sessions  
3. MFA setup/enable/verify exist but **login does not challenge**  
4. CSRF helpers exist but **unused**

---

## Payment flow (current)

1. Intent → stub provider synthesizes IDs  
2. Webhook → HMAC verify (Razorpay OK-ish; Stripe non-standard)  
3. Ledger + WebhookDelivery models  
4. Reconcile **always returns paid**  
5. `GET /payments` **unauthenticated**

---

## Database / persistence

- Prisma 6 schema with User, Session, MFA, Booking, Payment, Ledger, AuditLog, etc.  
- Optimistic `version` columns **incremented without CAS**  
- Production API path can use Prisma; UI dashboards still call `mockMarketplaceRepositories`

---

## Queues / cache / security controls

| Control | Implementation | Gap |
|---------|----------------|-----|
| Queue | Memory JobSystem | Not BullMQ in container |
| Cache | Redis if `REDIS_URL` else memory | OK with fallback |
| Rate limit | In-memory Map | Not Redis-shared |
| Brute force | In-memory | Not shared |
| Headers | CSP weak; no HSTS | P1 |
| MFA secret | HMAC+Base64 | P0 |

---

## Test coverage (current)

~31 Vitest tests: auth happy path, MFA unit, payments stub, bookings, RBAC unit, cache, jobs, resilience, event bus.  
Missing: MFA login gate, ownership IDOR, CSRF, session revoke, payment authz, optimistic lock, refunds.

---

## Issue register

### P0
1. MFA secret recoverable (not encrypted)  
2. MFA login bypass  
3. `GET /payments` unauthenticated  
4. Performer analytics unauthenticated  
5. Booking/application object IDOR  
6. Payment providers stub; auto-paid reconcile  
7. (Frontend) Dashboards on mocks — **deferred**: frontend UX freeze; backend APIs will be DB-backed

### P1
1. CSRF unused  
2. Access token ignores session revoke  
3. Refresh in JSON body  
4. Refresh rotation not atomic / no reuse detection  
5. Memory jobs/rate-limit despite Redis  
6. Optimistic locking not CAS  
7. GDPR erasure incomplete  
8. Analytics dashboard not tenant-scoped  
9. Performer ABAC wrong owner id  
10. Docker secrets/migrate gaps  

### P2
Metrics public · Redis KEYS · SSE single-node · payload Content-Length bypass · docs overstatement · weak CSP/HSTS · unique index gaps  

---

## Remediation plan (next phases)

Close all P0/P1 in backend/security/payments/redis/queues/observability/GDPR/devops/tests without frontend UX changes.
