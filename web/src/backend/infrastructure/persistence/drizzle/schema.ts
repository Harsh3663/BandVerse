/**
 * Drizzle ORM schema (PostgreSQL) — compatible mirror of prisma/schema.prisma.
 * Install `drizzle-orm` + `postgres` when enabling persistence.
 * This file is intentionally type-only / declarative until Drizzle is adopted.
 */

export const drizzleSchemaPlan = {
  dialect: "postgresql",
  softDeleteColumn: "deletedAt",
  optimisticLockColumn: "version",
  moneyStrategy: "integer paise + currency code",
  tables: [
    "users",
    "roles",
    "permissions",
    "user_roles",
    "role_permissions",
    "sessions",
    "organizers",
    "performers",
    "venues",
    "events",
    "applications",
    "bookings",
    "offers",
    "contracts",
    "payments",
    "reviews",
    "media_assets",
    "packages",
    "availability_slots",
    "conversations",
    "conversation_participants",
    "messages",
    "notifications",
    "verifications",
    "recommendation_runs",
    "analytics_snapshots",
    "activities",
    "audit_logs",
  ],
  criticalIndexes: [
    "performers(city, deleted_at)",
    "performers(kind, verified, deleted_at)",
    "performers(rating_avg, rating_count)",
    "events(host_id, status, deleted_at)",
    "events(starts_at, city)",
    "applications(event_id, performer_id) UNIQUE",
    "bookings(host_id, status, deleted_at)",
    "bookings(performer_id, status, deleted_at)",
    "payments(booking_id, kind)",
    "messages(conversation_id, sent_at)",
    "notifications(user_id, status, created_at)",
    "audit_logs(resource, resource_id, created_at)",
  ],
} as const;

/**
 * Example Drizzle table sketch (enable when dependency is added):
 *
 * export const performers = pgTable("performers", {
 *   id: text("id").primaryKey(),
 *   userId: text("user_id").notNull().unique(),
 *   handle: text("handle").notNull().unique(),
 *   city: text("city").notNull(),
 *   ratingAvg: doublePrecision("rating_avg").notNull().default(0),
 *   deletedAt: timestamp("deleted_at", { withTimezone: true }),
 * }, (t) => [
 *   index("performers_city_deleted_idx").on(t.city, t.deletedAt),
 * ]);
 */
