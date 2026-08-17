# BandVerse Final Architectural Audit

**Auditor stance:** External Principal Architect, Security Auditor, Staff SRE, Principal Product Engineer  
**Scope:** Existing codebase only (frontend, backend, APIs, Prisma, security, auth, payments, realtime, observability, deployment, testing, documentation)  
**Constraints honored:** No features added · No architecture redesign · No speculative roadmaps  
**Date:** 2026-08-10  
**Method:** Static review of `web/` and `docs/` with path-level evidence  

---

## Executive verdict

BandVerse has a **credible layered backend foundation** (domain/application/infrastructure/presentation), a substantial Prisma model, and useful operational scaffolding (health probes, metrics hooks, Docker Compose, docs).

It is **not yet enterprise-production-safe**. Multiple **P0** issues allow unauthenticated data exposure, defeat MFA, leave payments as non-live stubs, leave the product UI on mocks, and keep critical platform services process-local despite Redis being present in Compose.

**Prior internal claim of 98/100 is not supportable under adversarial review.**

### Final enterprise readiness score: **72 / 100**

| Dimension | Score | Weight | Weighted |
|-----------|------:|-------:|---------:|
| Architecture | 84 | 10% | 8.4 |
| Security | 52 | 20% | 10.4 |
| Database | 78 | 10% | 7.8 |
| API | 58 | 15% | 8.7 |
| Frontend | 70 | 10% | 7.0 |
| Scalability | 68 | 10% | 6.8 |
| Reliability | 70 | 10% | 7.0 |
| Compliance | 62 | 5% | 3.1 |
| Cost / ops efficiency | 74 | 5% | 3.7 |
| Testing & docs honesty | 60 | 5% | 3.0 |
| **Total** | | | **72** |

**Justification:** Architecture and schema quality pull the score up; P0 authz/MFA/payments/integration gaps and production SPOFs (memory jobs/rate-limit/realtime) pull it down hard. A marketplace handling real money and PII cannot clear “enterprise ready” until P0s are closed.

---

## Severity legend

| Sev | Meaning |
|-----|---------|
| **P0 Critical** | Exploit or data-loss path in current code; block production |
| **P1 High** | Likely breach, integrity failure, or major outage under normal ops |
| **P2 Medium** | Meaningful risk at scale / compliance pressure |
| **P3 Low** | Hygiene, clarity, or minor edge cost |

---

## Finding index

| ID | Sev | Section | Title |
|----|-----|---------|-------|
| A-01 | P1 | Architecture | Prisma mode still mocks chats/offers/contracts/notifications |
| A-02 | P1 | Architecture | Container always wires memory jobs / in-process bus / memory rate limit |
| A-03 | P2 | Architecture | Dual-truth: UI mocks vs API layer |
| S-01 | P0 | Security | MFA secret storage is recoverable Base64, not encryption |
| S-02 | P0 | Security | Login issues full tokens without MFA challenge |
| S-03 | P0 | Security | `GET /api/v1/payments` unauthenticated |
| S-04 | P0 | Security | Performer analytics unauthenticated |
| S-05 | P0 | Security | Object-level IDOR on bookings/applications (role-only) |
| S-06 | P1 | Security | CSRF helpers never invoked; cookie refresh CSRF-exposed |
| S-07 | P1 | Security | Access tokens ignore session revocation |
| S-08 | P1 | Security | Refresh token returned in JSON + cookie |
| S-09 | P1 | Security | Refresh rotation lacks reuse detection / atomicity |
| S-10 | P1 | Security | Weak CSP (`unsafe-inline`/`unsafe-eval`); no HSTS |
| S-11 | P1 | Security | Brute-force / abuse / rate-limit are process-local |
| S-12 | P2 | Security | Public `/api/v1/metrics` |
| D-01 | P1 | Database | Optimistic `version` incremented without compare-and-swap |
| D-02 | P1 | Database | GDPR erasure incomplete vs related personal data |
| D-03 | P2 | Database | Missing uniques on refresh hash / payment provider refs |
| D-04 | P2 | Database | Soft-delete + `@unique` email blocks reuse |
| API-01 | P0 | API | Payment providers are stubs; reconcile always `paid` |
| API-02 | P1 | API | Analytics dashboard not tenant-scoped |
| API-03 | P1 | API | Performer update ABAC uses profile id as `ownerUserId` |
| API-04 | P1 | API | Rate limits absent on many sensitive mutations |
| API-05 | P2 | API | Payment intent lacks booking ownership / amount binding |
| API-06 | P2 | API | Venue update is role-only (any manager → any venue) |
| API-07 | P2 | API | Payload limit bypass when `Content-Length` absent |
| F-01 | P0 | Frontend | Product dashboards still bound to mock repositories |
| F-02 | P1 | Frontend | Recommendations path uses mock performer corpus |
| SC-01 | P1 | Scalability | Redis present but jobs/realtime not shared |
| SC-02 | P2 | Scalability | Redis `KEYS` used for prefix invalidation |
| SC-03 | P2 | Scalability | SSE gateway is single-process |
| R-01 | P1 | Reliability | DB resiliency helpers largely unused by repositories |
| R-02 | P1 | Reliability | Webhook idempotency TOCTOU; Stripe verify non-standard |
| R-03 | P1 | Reliability | Ledger/Payment row lifecycle incomplete |
| R-04 | P2 | Reliability | Circuit breaker half-open resets fully (thundering herd) |
| C-01 | P1 | Compliance | “Immutable” audit not DB-enforced; failures swallowed |
| C-02 | P2 | Compliance | Docs overstate controls (CSRF, MFA encryption, live payments, 98/100) |
| COST-01 | P2 | Cost | Unbounded request logging + in-memory abuse maps |
| COST-02 | P2 | Cost | Payment intent spam possible (missing limits + stub keys) |
| TD-01 | P1 | Tech debt | Enterprise docs ahead of verified controls |
| TD-02 | P2 | Tech debt | Test gaps: CSRF, IDOR, MFA login gate, payment authz, E2E |
| TD-03 | P1 | Tech debt | Docker Compose weak secrets; DB/Redis ports published; no migrate on start |
| TD-04 | P3 | Tech debt | Ready probe reports ready in mock mode |

---

## 1. Architecture review

### A-01 — Prisma platform repos still fall back to mocks for core domains
- **Severity:** P1  
- **Description:** `createPrismaPlatformRepositories` in `web/src/backend/infrastructure/persistence/prisma/repositories.ts` assigns `chats`, `offers`, `contracts`, and related surfaces to mock implementations even when `DATABASE_URL` is set.  
- **Impact:** “Prisma mode” is partial persistence; messaging/contracts/notifications are not durable.  
- **Risk:** Silent data loss across restarts; false confidence in production mode.  
- **Recommended fix:** Implement Prisma adapters for those ports, or remove/disable API exposure until durable.

### A-02 — Production DI always uses memory jobs, in-process event bus, memory rate limit
- **Severity:** P1  
- **Description:** `attachPlatformServices` in `web/src/backend/infrastructure/container.ts` always calls `createMemoryJobSystem()`, `createInProcessEventBus()`, and `createInMemoryRateLimitService()`. BullMQ adapter path is unused; Redis in Compose does not make jobs/rate limits shared.  
- **Impact:** Multi-instance deploys diverge on queues, rate limits, domain handlers, and notifications.  
- **Risk:** Lost payment reconcile jobs; rate-limit bypass; missed realtime fan-out.  
- **Recommended fix:** When `REDIS_URL` is set, wire shared queue/rate-limit adapters; fail closed in `NODE_ENV=production` if memory queue is used without explicit opt-in.

### A-03 — Dual-truth product surface (UI mocks vs API)
- **Severity:** P2  
- **Description:** Marketplace UI/dashboard pages import `mockMarketplaceRepositories` while parallel `/api/v1` routes exist.  
- **Impact:** Product and API evolve independently; E2E truth is ambiguous.  
- **Risk:** Shipping UI that never exercises production authz/persistence.  
- **Recommended fix:** Route dashboards through API clients or server use-cases; keep mocks only behind explicit `BANDVERSE_UI_MOCKS=true`.

**Architecture score: 84** — Clean layering and contracts; incomplete persistence wiring and dual-truth UI/API reduce maturity.

---

## 2. Security review

### S-01 — MFA “encryption” stores recoverable secrets
- **Severity:** P0  
- **Description:** `encryptSecret` / `decryptSecret` in `web/src/backend/infrastructure/security/mfa.ts` store `HMAC + "." + base64url(secret)`. Decrypt ignores HMAC and returns plaintext Base64 payload.  
- **Impact:** Anyone with DB/backup access recovers TOTP seeds.  
- **Risk:** MFA bypass after storage compromise; misleading field `mfaSecretEncrypted`.  
- **Recommended fix:** AES-256-GCM (or KMS) with dedicated key; verify auth tag; never persist recoverable secret material.

### S-02 — Login does not enforce MFA
- **Severity:** P0  
- **Description:** `POST /api/v1/auth/login` issues access+refresh after password only. MFA verify endpoints require an already-valid access token. `getContextFromAccessToken` never consults `mfaEnabled`.  
- **Impact:** MFA enrollment is ceremonial for login.  
- **Risk:** Credential stuffing defeats “enterprise MFA”.  
- **Recommended fix:** Return short-lived `mfa_pending` challenge token when enabled; issue full tokens only after TOTP/backup (or trusted device).

### S-03 — Unauthenticated payments list
- **Severity:** P0  
- **Description:** `GET` in `web/src/app/api/v1/payments/route.ts` has no `requireAuth` / permission check; returns `repositories.payments.list()` filtered only by query params.  
- **Impact:** Public enumeration of payment records (booking IDs, amounts, statuses).  
- **Risk:** Financial confidentiality breach; fraud reconnaissance.  
- **Recommended fix:** Require auth; scope to caller’s bookings; admin-only for global list.

### S-04 — Unauthenticated performer analytics
- **Severity:** P0  
- **Description:** `web/src/app/api/v1/analytics/performer/[performerId]/route.ts` has no auth and loads applications/bookings for any performer id.  
- **Impact:** Business activity and booking metrics leak.  
- **Risk:** Privacy / competitive intel exposure.  
- **Recommended fix:** Require analytics permission + ownership/admin ABAC.

### S-05 — Broken object-level authorization on bookings/applications
- **Severity:** P0  
- **Description:** Booking/application routes use `requirePermission` without owner/party attributes. ABAC in `rbac.ts` only applies when attributes are passed. Booking list use-case can return all bookings for any `BOOKING:READ` principal.  
- **Impact:** Cross-tenant read/update among authenticated marketplace roles.  
- **Risk:** Marketplace integrity failure; privacy incident.  
- **Recommended fix:** Enforce host/performer/organizer membership after load; default lists to subject scope.

### S-06 — CSRF protection is dead code
- **Severity:** P1  
- **Description:** `assertCsrf` in `web/src/backend/infrastructure/security/csrf.ts` is never called. Cookie-based refresh (`bv_refresh`) on `POST /api/v1/auth/refresh` is CSRF-relevant. Compose sets `CSRF_PROTECTION=true`.  
- **Impact:** Cross-site refresh/session riding for cookie clients.  
- **Risk:** Session fixation / refresh abuse.  
- **Recommended fix:** Enforce CSRF on cookie-auth mutations; issue CSRF cookie on login; add negative tests.

### S-07 — Access tokens ignore session revocation
- **Severity:** P1  
- **Description:** `getContextFromAccessToken` verifies JWT signature/claims only; does not check `Session.revokedAt`.  
- **Impact:** Logout/session revoke leaves access valid until TTL (~15m).  
- **Risk:** Post-compromise persistence.  
- **Recommended fix:** Validate `sid` against active session (or session version claim) on privileged routes / every request.

### S-08 — Refresh token dual channel (JSON + httpOnly cookie)
- **Severity:** P1  
- **Description:** Login/register/refresh return `refreshToken` in JSON while also setting httpOnly cookie.  
- **Impact:** XSS or careless logging can exfiltrate long-lived refresh tokens.  
- **Risk:** 30-day session theft.  
- **Recommended fix:** Cookie-only refresh for browsers; body token only for explicit native clients.

### S-09 — Refresh rotation lacks reuse detection
- **Severity:** P1  
- **Description:** Refresh performs find-then-update on hash without conditional update / family revoke. OWASP notes claim reuse detection that is not implemented.  
- **Impact:** Stolen refresh can be used unnoticed; concurrent refresh races.  
- **Risk:** Persistent account takeover.  
- **Recommended fix:** Atomic rotate (`UPDATE … WHERE hash=? AND revokedAt IS NULL`); on reuse of old hash, revoke all sessions.

### S-10 — Weak CSP; no HSTS
- **Severity:** P1  
- **Description:** `headers.ts` allows `'unsafe-inline' 'unsafe-eval'` in `script-src`; no `Strict-Transport-Security`.  
- **Impact:** XSS containment weakened; no browser HTTPS stickiness from app headers.  
- **Risk:** Elevated XSS blast radius; SSL stripping on misconfigured edges.  
- **Recommended fix:** Nonce/hash CSP; add HSTS at edge or middleware for HTTPS deploys.

### S-11 — Security controls are process-local Maps
- **Severity:** P1  
- **Description:** Brute-force (`brute-force.ts`), abuse scores (`api-governance.ts`), and rate limit (`rate-limit.ts`) use in-memory Maps.  
- **Impact:** Horizontal scale bypasses limits.  
- **Risk:** Credential stuffing / abuse succeeds across instances.  
- **Recommended fix:** Redis-backed shared limiters for multi-instance.

### S-12 — Public metrics scrape
- **Severity:** P2  
- **Description:** `/api/v1/metrics` returns Prometheus text with no auth.  
- **Impact:** Traffic/auth/payment counter reconnaissance.  
- **Risk:** Operational intel leak.  
- **Recommended fix:** Network-restrict or bearer/mTLS for scrapers.

**Security score: 52** — Foundations exist, but P0 exposure and MFA/authz failures dominate.

---

## 3. Database review

### D-01 — Optimistic concurrency not enforced
- **Severity:** P1  
- **Description:** Repositories increment `version` on update but `where: { id }` only (e.g. applications/bookings in Prisma repositories). No `WHERE version = expected`.  
- **Impact:** Lost updates under concurrent status transitions.  
- **Risk:** Inconsistent booking/application state.  
- **Recommended fix:** Compare-and-swap update; return 409 when `count = 0`.

### D-02 — GDPR erasure incomplete
- **Severity:** P1  
- **Description:** `requestGdprErasure` anonymizes user fields and revokes sessions/devices; does not redact messages, review text, profiles, media URLs, or audit before/after PII.  
- **Impact:** Incomplete right-to-erasure.  
- **Risk:** Regulatory non-compliance.  
- **Recommended fix:** Cascade anonymize/redact related personal content; document legal holds for financial rows; schedule hard-delete job.

### D-03 — Missing uniqueness on security/payment lookups
- **Severity:** P2  
- **Description:** `Session.refreshTokenHash` and `Payment.providerReference` lack uniqueness; audit hash is application-level only.  
- **Impact:** Ambiguous session matching; duplicate provider payment rows.  
- **Risk:** Auth/payment edge bugs under concurrency.  
- **Recommended fix:** `@@unique([refreshTokenHash])`, `@@unique([provider, providerReference])`.

### D-04 — Soft-delete + unique email
- **Severity:** P2  
- **Description:** `User.email @unique` with soft delete; without anonymize, deleted emails block re-registration. Docs mention partial unique indexes; schema does not.  
- **Impact:** Support lockouts after soft delete.  
- **Risk:** Account lifecycle friction / incidents.  
- **Recommended fix:** Partial unique index `WHERE deleted_at IS NULL`.

**Database score: 78** — Schema breadth is strong; concurrency and privacy completeness lag.

---

## 4. API review

### API-01 — Payment providers are stubs
- **Severity:** P0  
- **Description:** `providers.ts` synthesizes Razorpay/Stripe intents locally; no PSP HTTP calls. `reconcile` returns `paid`. Placeholder secrets default when env unset; Stripe `clientSecret` embeds `secretKey.slice(0, 6)`.  
- **Impact:** No real money movement; false settlement signals.  
- **Risk:** Financial loss / forged confidence if deployed as “live”.  
- **Recommended fix:** Official SDKs; fail boot in production without real secrets; never return secret fragments.

### API-02 — Analytics dashboard not tenant-scoped
- **Severity:** P1  
- **Description:** `analytics/dashboard` requires `ANALYTICS:READ` then calls `getOrganizerAnalyticsUseCase(repositories)` with no user filter (cache key includes userId but payload is global).  
- **Impact:** Cross-tenant analytics leak among organizers/performers with read permission.  
- **Risk:** Business data disclosure.  
- **Recommended fix:** Scope use case by authenticated organizer/subject id.

### API-03 — Performer update ABAC maps wrong owner
- **Severity:** P1  
- **Description:** `performers/[id]/route.ts` passes `{ ownerUserId: existing.value.id }` (performer profile id), not linked `userId`.  
- **Impact:** Legitimate self-update denied or ownership check meaningless.  
- **Risk:** Broken authz / accidental privilege paths.  
- **Recommended fix:** Pass `ownerUserId: performer.userId` from persistence.

### API-04 — Rate limits sparse on sensitive writes
- **Severity:** P1  
- **Description:** `enforceRateLimit` used on selected public/auth GETs and login/register; missing on payment intent/webhook, MFA verify/enable, bookings POST, privacy erasure, jobs process, etc.  
- **Impact:** Abuse and cost amplification.  
- **Risk:** MFA brute force, intent spam, DoS.  
- **Recommended fix:** Default write/auth policies on all mutations; shared Redis limiter.

### API-05 — Payment intent trusts client bookingId/amount
- **Severity:** P2  
- **Description:** Intent route accepts client `bookingId` + `amount` with role check only.  
- **Impact:** Arbitrary intents / wrong amounts.  
- **Risk:** Fraudulent ledger noise; settlement mismatch.  
- **Recommended fix:** Server-load booking; derive amount; assert party membership.

### API-06 — Venue updates are role-only
- **Severity:** P2  
- **Description:** `PUT /api/v1/venues/[id]` requires `VENUE:UPDATE` without ownership attributes.  
- **Impact:** Any venue manager can edit any venue.  
- **Risk:** Integrity / trust failure.  
- **Recommended fix:** ABAC on venue ownership/membership.

### API-07 — Payload limits depend on Content-Length
- **Severity:** P2  
- **Description:** `parseJsonBody` rejects oversized bodies only when `Content-Length` is present.  
- **Impact:** Chunked bodies can inflate memory.  
- **Risk:** Availability / cost spike.  
- **Recommended fix:** Stream with hard max bytes; reject unknown length on sensitive routes.

**API score: 58** — Surface area is broad; authz and payment reality have critical holes.

---

## 5. Frontend review

### F-01 — Dashboards still use mock repositories
- **Severity:** P0 (product/integration criticality)  
- **Description:** Performer/organizer dashboard pages (e.g. `web/src/app/dashboard/performer/page.tsx`, organizer analytics/events) call `mockMarketplaceRepositories` / mock personas.  
- **Impact:** UI never reflects API/Prisma state.  
- **Risk:** False readiness; untestable production flows.  
- **Recommended fix:** Bind to `/api/v1` or server use-cases; env-gate mocks.

### F-02 — Recommendations use mock corpus
- **Severity:** P1  
- **Description:** Recommendation ranking consumes `mockPerformerProfiles` even via API use-case path.  
- **Impact:** Recommendations ignore durable performer data.  
- **Risk:** Wrong matches; integration illusion.  
- **Recommended fix:** Rank against repository/search results.

**Frontend score: 70** — UX/design system quality is solid; marketplace data path is still mock-first.

---

## 6. Scalability review

### SC-01 — Redis in Compose does not make jobs/realtime shared
- **Severity:** P1  
- **Description:** See A-02; cache may use Redis, but jobs/event bus/SSE remain process-local.  
- **Impact:** Horizontal scale breaks background work and live updates.  
- **Risk:** Missed reconciles/notifications under load.  
- **Recommended fix:** Shared queue + pub/sub adapters behind existing ports.

### SC-02 — Redis `KEYS` for invalidation
- **Severity:** P2  
- **Description:** Cache adapter uses `keys()` for prefix clear/invalidation paths.  
- **Impact:** Redis blocking under large keyspaces.  
- **Risk:** Latency spikes / cache outages.  
- **Recommended fix:** `SCAN` or maintain key sets; prefer tag-based invalidation already partially present.

### SC-03 — SSE single-process
- **Severity:** P2  
- **Description:** `realtime/gateway.ts` stores subscribers in a process Map.  
- **Impact:** Events published on instance A never reach SSE clients on B.  
- **Risk:** Broken live UX in HA.  
- **Recommended fix:** Redis pub/sub behind `RealtimeGateway`.

**Scalability score: 68** — Cache path is ahead of queue/realtime consistency.

---

## 7. Reliability review

### R-01 — DB resiliency mostly unused
- **Severity:** P1  
- **Description:** `withDbResilience` / `withRetry` / circuit breaker exist but repositories do not wrap writes; only connectivity check uses them.  
- **Impact:** Documented resiliency is largely inert.  
- **Risk:** Outage flaps propagate as hard failures without controlled backoff.  
- **Recommended fix:** Wrap repository/transaction entry points; half-open with single probe.

### R-02 — Webhook idempotency race; Stripe verify non-standard
- **Severity:** P1  
- **Description:** Payment service checks processed then upserts then processes (TOCTOU). Stripe signature path is custom (`signature.includes`) rather than official `constructEvent` parsing/tolerance.  
- **Impact:** Double ledger captures under concurrency; real Stripe webhooks may fail verification.  
- **Risk:** Accounting inconsistency.  
- **Recommended fix:** Claim delivery row atomically; use official Stripe verification.

### R-03 — Ledger without durable Payment binding
- **Severity:** P1  
- **Description:** Intent path writes ledger/audit without consistently creating/updating `Payment` rows or binding ownership; webhook captures often omit `paymentId`/`bookingId`.  
- **Impact:** Orphan ledger entries; weak settlement trail.  
- **Risk:** Irreconcilable books.  
- **Recommended fix:** Single transaction: Payment + ledger; unique provider reference.

### R-04 — Circuit breaker half-open unsafe
- **Severity:** P2  
- **Description:** On cooldown expiry, breaker resets failures to 0 and allows full traffic.  
- **Impact:** Thundering herd after DB recovery.  
- **Risk:** Cascading overload.  
- **Recommended fix:** Single-probe half-open state.

**Reliability score: 70** — Good patterns sketched; incomplete wiring and stub payments limit real resilience.

---

## 8. Compliance review

### C-01 — Audit immutability is application-policy only
- **Severity:** P1  
- **Description:** `writeImmutableAudit` swallows persistence errors; no DB revoke of UPDATE/DELETE for app role; retention policy contemplates hard delete of audit logs; hash is not a hash-chain.  
- **Impact:** Non-repudiation gaps under failure or privileged DB access.  
- **Risk:** Investigation / audit failure.  
- **Recommended fix:** Fail closed on money/auth audit writes; DB privileges deny mutation; archive instead of hard delete.

### C-02 — Documentation overstates controls
- **Severity:** P2  
- **Description:** Docs claim CSRF enforcement, encrypted MFA at rest, live payment rails, Redis-capable throttling broadly, and readiness **98/100** (`ENTERPRISE_READINESS_REPORT.md`) while code shows stubs/gaps. `SECURITY_REVIEW.md` still mentions residual “No MFA yet” in places while MFA routes exist but are not login-gated.  
- **Impact:** Stakeholders ship on false assurance.  
- **Risk:** Governance failure.  
- **Recommended fix:** Align docs to verified controls; mark stubs explicitly; revise scores after fixes.

**Compliance score: 62** — Frameworks exist; enforcement and evidence integrity are incomplete.

---

## 9. Cost optimization review

### COST-01 — Unbounded structured logging + process Maps
- **Severity:** P2  
- **Description:** Every request logs completion in `withRequestContext`; abuse/rate maps grow by IP key in-process.  
- **Impact:** Log volume cost; memory growth under IP spray.  
- **Risk:** Cost overrun / OOM under abuse.  
- **Recommended fix:** Sample info logs; Redis for abuse/rate; cap cardinality.

### COST-02 — Payment intent spam / stub keys
- **Severity:** P2  
- **Description:** Missing rate limits on intents + placeholder provider path can generate unbounded ledger/audit/job noise.  
- **Impact:** DB/log/queue cost without revenue.  
- **Risk:** Cost amplification in shared environments.  
- **Recommended fix:** Strict authz + rate limits; fail closed without live keys in production.

**Cost score: 74** — No catastrophic always-on third-party spend yet; abuse/log cardinality is the main risk.

---

## 10. Technical debt review

### TD-01 — Enterprise narrative ahead of verified controls
- **Severity:** P1  
- **Description:** Large doc set (MFA, DR, cache V2, event-driven, payment reliability, enterprise report) describes capabilities that are partially stubbed or unwired.  
- **Impact:** Planning and audits use incorrect baselines.  
- **Risk:** Mis-prioritization; compliance theater.  
- **Recommended fix:** Tag each doc section `implemented | partial | planned` with code anchors.

### TD-02 — Test coverage holes on security-critical paths
- **Severity:** P2  
- **Description:** Vitest covers MFA unit, payments stub idempotency, auth happy paths; missing CSRF, payment list authz, booking IDOR, MFA login gate. Playwright (`web/tests/public-experience.spec.ts`) covers public UX only.  
- **Impact:** Regressions in authz/payment ship unnoticed.  
- **Risk:** High for security changes.  
- **Recommended fix:** Contract tests for authz/CSRF/MFA gate; E2E auth + negative IDOR cases.

### TD-03 — Deployment assets unsafe by default
- **Severity:** P1  
- **Description:** `docker-compose.yml` uses weak `JWT_SECRET`, DB password `bandverse`, publishes Postgres/Redis ports. Dockerfile sets `BANDVERSE_PERSISTENCE=mock` at build; no `prisma migrate deploy` in start path.  
- **Impact:** Easy misconfig; empty/unmigrated schema; exposed data plane.  
- **Risk:** Accidental insecure “prod” compose.  
- **Recommended fix:** Secrets from vault; no host DB ports; migrate on deploy; fail ready if mock in production.

### TD-04 — Ready probe green in mock mode
- **Severity:** P3  
- **Description:** `/api/v1/ready` returns ready when `container.mode === "mock"`.  
- **Impact:** Orchestrators may route traffic to fixture-backed instances.  
- **Risk:** Silent mock production.  
- **Recommended fix:** In production, ready must require Prisma + DB connectivity.

**Tech debt / docs-testing honesty: 60**

---

## Cross-cutting observations (not speculative)

1. **Security theater risk:** MFA, CSRF, audit “immutability”, and payment “providers” exist as modules/docs but fail adversarial checks.  
2. **Integration gap is the product gap:** UI mocks + stub PSP + memory jobs mean the “full stack” is not yet one operational system.  
3. **Authz model is RBAC-complete, ABAC-incomplete:** Permissions exist; object ownership is inconsistently applied.  
4. **Ops scaffolding > ops wiring:** Health, metrics, exporters, resiliency helpers are present; multi-instance durability is not.

---

## Remediation priority (fix-only; no redesign)

1. **P0 authz leaks:** payments GET, performer analytics, booking/application object checks  
2. **P0 MFA:** real encryption + login challenge gate  
3. **P0 payments honesty:** fail closed without live PSP **or** clearly label stubs non-production  
4. **P0 frontend:** stop serving dashboards from mocks in non-mock env  
5. **P1 CSRF + refresh cookie posture + session revoke checks**  
6. **P1 wire shared queue/rate-limit when Redis present; migrate on deploy**  
7. **P1 optimistic locking + tenant-scoped analytics + GDPR completeness**  
8. **P2 schema uniques, CSP/HSTS, metrics auth, Redis SCAN, SSE pub/sub**

---

## Score reconciliation vs prior 98/100

| Claim area | Prior narrative | Audit finding |
|------------|-----------------|---------------|
| MFA | Enterprise-ready | Not login-enforced; secrets recoverable |
| Payments | Hardened rails | Stub providers; unauthenticated list |
| Authz | RBAC/ABAC | Role checks without object scope → IDOR |
| CSRF | Documented on | Never called |
| Jobs/cache HA | Redis-ready | Jobs/rate-limit/SSE still memory/in-process |
| Frontend | Production app | Dashboards still mock-backed |
| Overall | 98/100 | **72/100** after adversarial review |

---

## Final score

# **72 / 100**

BandVerse is a **strong engineering foundation with unfinished enterprise controls**. It is suitable for continued hardening and internal staging, **not** for unsupervised enterprise production with real payments and multi-tenant data until **all P0** and the listed **P1 auth/session/deployment** items are closed and re-audited.
