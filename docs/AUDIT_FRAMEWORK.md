# BandVerse Audit Framework

## Design

Append-only immutable audit events with SHA-256 content hash. Application code never updates or deletes audit rows.

## Event shape

| Field | Description |
|-------|-------------|
| actor | `actorUserId` |
| timestamp | ISO-8601 (`createdAt` / event timestamp) |
| action | e.g. `login`, `mfa.enable`, `create`, `gdpr.erasure_completed` |
| resource / resourceId | Domain target |
| before / after | JSON snapshots |
| correlationId | Request/trace correlation |
| immutableHash | Canonical SHA-256 over actor/action/resource/before/after/correlation/timestamp |

## Tracked domains

- Authentication (login, MFA, session revoke)
- Bookings (create/update/status)
- Payments (intent, webhook, ledger)
- Reviews
- Profile / venue / event updates (via existing resource audits)
- Role changes (RBAC mutations)
- GDPR erasure

## Writer API

```ts
await writeImmutableAudit(prisma, {
  actorUserId,
  action: "booking.update",
  resource: "booking",
  resourceId,
  before: { status: "requested" },
  after: { status: "confirmed" },
  correlationId,
});
```

`writeAuditLog` remains as a compatibility wrapper.

## Persistence

- Prisma `AuditLog` model when `DATABASE_URL` is set
- Structured logger fallback in mock/CI mode
- Metric: `audit_events_total`
