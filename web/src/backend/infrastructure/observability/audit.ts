export {
  writeAuditLog,
  writeImmutableAudit,
  type AuditEvent,
} from "@/backend/infrastructure/audit/audit-framework";

/** @deprecated Use AuditEvent from audit-framework. */
export type { AuditEvent as AuditEventInput } from "@/backend/infrastructure/audit/audit-framework";
