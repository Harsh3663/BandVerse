/**
 * Database performance recommendations for BandVerse.
 */
export const databasePerformanceRecommendations = {
  query: [
    "Always filter soft-deleted rows with deletedAt IS NULL in repository defaults.",
    "Prefer covering indexes for list endpoints (status + city + startsAt).",
    "Use keyset pagination for high-volume feeds (messages, notifications, audit).",
    "Avoid SELECT * for performer list cards; project list DTOs.",
    "Materialize organizer/performer analytics snapshots hourly for dashboards.",
  ],
  index: [
    "Composite indexes should match WHERE + ORDER BY column order.",
    "Partial indexes for hot statuses: WHERE deleted_at IS NULL AND status = 'published'.",
    "GIN indexes on JSON payload fields only after measured need.",
    "Unique (eventId, performerId) prevents duplicate applications.",
  ],
  read: [
    "Read replicas for discovery/search and analytics queries.",
    "Redis cache for performer-by-handle and category taxonomies (TTL 5–15m).",
    "CDN for public media; signed URL cache for private media short TTL.",
  ],
  write: [
    "Idempotency keys on booking/payment create endpoints.",
    "Optimistic concurrency via version column on Event/Booking/Contract.",
    "Outbox pattern for notification + webhook side effects.",
    "Batch availability slot upserts; avoid row-by-row calendar sync.",
  ],
  softDelete: [
    "Never hard-delete financial or contract rows; soft-delete + audit.",
    "Unique constraints that include deletedAt or use partial unique indexes.",
  ],
  versioning: [
    "Bump version on every update; reject stale writes with 409 CONFLICT.",
    "Keep AuditLog append-only with before/after snapshots for admin actions.",
  ],
} as const;
