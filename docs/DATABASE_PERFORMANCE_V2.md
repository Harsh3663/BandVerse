# Database Performance V2

## Before / after

| Area | Before | After |
|------|--------|-------|
| Caching | None | Memory/Redis cache for listings, search, recommendations, analytics |
| Search | Full list + in-memory filter every request | Cached SearchService + FTS/ES-ready facade |
| Analytics | Recomputed per request | Cached + aggregation job enqueue |
| Indexes | Strong baseline from V1 | Additional composite indexes + payment lookup guidance |

## Recommended indexes (incremental)

| Table | Index | Why |
|------|-------|-----|
| events | partial `WHERE status='published' AND deleted_at IS NULL` | Hot public feed |
| performers | `(city, rating_avg DESC) WHERE deleted_at IS NULL` | Ranked city discovery |
| payments | unique `(provider, provider_reference)` where reference not null | Webhook idempotency |
| audit_logs | BRIN `(created_at)` on large volumes | Cheap time-range scans |
| messages | `(conversation_id, sent_at DESC)` | Chat history pages |

## Slow query candidates

1. Organizer dashboard join graph (events × applications × performers) — prefer cached analytics snapshot.
2. Recommendation corpus scan — warm via job + cache.
3. `profileJson` full document reads on list endpoints — introduce list DTO projection later.
4. Unbounded `audit_logs` scans — always constrain by time + resource.

## N+1 avoidance

- Repository methods already batch list loads for dashboards.
- Realtime/chat should load messages by `conversationId` with keyset pagination, never per-message participant queries.

## Query pattern guidance

- Always include `deletedAt: null` in Prisma `where`.
- Prefer keyset pagination for messages/notifications.
- Use `select` projections for public cards once API DTO split lands.
