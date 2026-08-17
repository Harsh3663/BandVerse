# BandVerse Database Optimization Report

## Strategy

- Soft delete via `deletedAt`
- Optimistic concurrency via `version`
- Money as integer paise
- JSON payload columns for rich marketplace profiles (`profileJson`, `payloadJson`)
- Hot-path composite indexes aligned to list/filter/sort queries

## Index catalog

| Table | Index | Reason | Expected benefit |
|------|-------|--------|------------------|
| users | `(status, deletedAt)` | Active account filters | Faster authz/user admin lists |
| users | `(createdAt)` | Onboarding analytics | Efficient chronological scans |
| sessions | `(userId, revokedAt)` | Refresh/logout lookups | O(log n) session validation |
| sessions | `(expiresAt)` | Expiry cleanup jobs | Cheap TTL sweeps |
| performers | `(city, deletedAt)` | City discovery | Lower latency on city search |
| performers | `(kind, verified, deletedAt)` | Category + trust filters | Selective discovery queries |
| performers | `(ratingAvg, ratingCount)` | Ranking/sort | Avoid filesort on list endpoints |
| performers | `(handle)` unique | Profile route resolution | Point lookup by handle |
| performers | `(userId, deletedAt)` | Owner profile fetch | Join-free owner resolution |
| venues | `(city, type, deletedAt)` | Venue directory filters | Composite filter selectivity |
| venues | `(ownerUserId, deletedAt)` | Dashboard ownership | Fast owner venue lists |
| events | `(hostId, status, deletedAt)` | Organizer event boards | Dashboard query speed |
| events | `(startsAt, city)` | Calendar/city browse | Range scan for upcoming events |
| events | `(eventTypeId, status)` | Opportunity matching | Faster opportunity feeds |
| events | `(status, startsAt, deletedAt)` | Published upcoming lists | Partial hot-path coverage |
| events | `(city, status, deletedAt)` | City event search | Reduced heap fetches |
| applications | `(eventId, performerId)` unique | Prevent duplicate applications | Integrity + upsert safety |
| applications | `(performerId, status, deletedAt)` | Performer inbox | Inbox pagination |
| applications | `(eventId, status)` | Organizer triage | Status-bucketed triage |
| bookings | `(hostId, status, deletedAt)` | Organizer booking boards | Dashboard performance |
| bookings | `(performerId, status, deletedAt)` | Performer booking boards | Dashboard performance |
| bookings | `(status, updatedAt, deletedAt)` | Ops monitoring | Status timeline queries |
| bookings | `(hostId, updatedAt)` | Recent host activity | Sorted host feeds |
| payments | `(bookingId, kind)` | Advance/balance fetch | Booking payment panels |
| payments | `(status, dueAt)` | Collections jobs | Due payment sweeps |
| payments | `(provider, providerReference)` | Webhook idempotency lookup | Fast provider reconciliation |
| reviews | `(performerId, rating, deletedAt)` | Profile rating aggregates | Review list + rating filters |
| messages | `(conversationId, sentAt)` | Chat history | Ordered message pages |
| notifications | `(userId, status, createdAt)` | Inbox unread queries | Notification center latency |
| audit_logs | `(resource, resourceId, createdAt)` | Entity audit trail | Compliance investigations |
| audit_logs | `(actorUserId, createdAt)` | Actor activity | Security reviews |
| availability_slots | `(ownerType, ownerId, startsAt)` | Calendar fetch | Availability windows |
| analytics_snapshots | unique `(subjectType, subjectId, periodStart, periodEnd)` | Snapshot idempotency | Safe recompute upserts |

## Query optimization notes

1. Avoid N+1 by loading related aggregates in repository methods (events + applications + bookings for analytics dashboards).
2. Prefer projecting list DTOs instead of full `profileJson` for discovery once read models are introduced.
3. Use keyset pagination for messages/notifications/audit at scale.
4. Materialize analytics snapshots for revenue/booking dashboards under load.
5. Keep soft-delete predicates in every repository default (`deletedAt: null`).

## Cascade rules

- User delete cascades sessions, roles, notifications.
- Event retains applications/bookings via FK; soft-delete preferred over hard delete for financial history.
- Conversation delete cascades participants/messages.
