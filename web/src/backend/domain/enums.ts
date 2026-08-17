/**
 * Canonical domain enums for BandVerse.
 * Marketplace UI types remain the source of truth for current mock surfaces;
 * these enums define the production contract for API + persistence.
 */

export const UserStatus = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  PENDING_VERIFICATION: "pending_verification",
  DELETED: "deleted",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const RoleName = {
  GUEST: "guest",
  USER: "user",
  PERFORMER: "performer",
  ORGANIZER: "organizer",
  VENUE_MANAGER: "venue_manager",
  ADMIN: "admin",
  SUPPORT: "support",
} as const;
export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export const PermissionAction = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage",
  APPROVE: "approve",
  PUBLISH: "publish",
  PAY: "pay",
  MESSAGE: "message",
} as const;
export type PermissionAction =
  (typeof PermissionAction)[keyof typeof PermissionAction];

export const PermissionResource = {
  USER: "user",
  PERFORMER: "performer",
  ORGANIZER: "organizer",
  VENUE: "venue",
  EVENT: "event",
  BOOKING: "booking",
  APPLICATION: "application",
  OFFER: "offer",
  CONTRACT: "contract",
  PAYMENT: "payment",
  REVIEW: "review",
  MEDIA: "media",
  PORTFOLIO: "portfolio",
  MESSAGE: "message",
  NOTIFICATION: "notification",
  ANALYTICS: "analytics",
  RECOMMENDATION: "recommendation",
  AVAILABILITY: "availability",
  PACKAGE: "package",
  VERIFICATION: "verification",
  ADMIN: "admin",
} as const;
export type PermissionResource =
  (typeof PermissionResource)[keyof typeof PermissionResource];

export const PerformerKind = {
  SOLO: "solo",
  BAND: "band",
  TRADITIONAL_GROUP: "traditional-group",
  DJ: "dj",
  ENSEMBLE: "ensemble",
} as const;
export type PerformerKind = (typeof PerformerKind)[keyof typeof PerformerKind];

export const VenueType = {
  HOTEL: "hotel",
  CAFE: "cafe",
  RESTAURANT: "restaurant",
  RESORT: "resort",
  WEDDING_HALL: "wedding-hall",
  WEDDING_VENUE: "wedding-venue",
  BANQUET_HALL: "banquet-hall",
  CLUB: "club",
  LOUNGE: "lounge",
  CORPORATE_VENUE: "corporate-venue",
  CORPORATE_OFFICE: "corporate-office",
  COLLEGE_VENUE: "college-venue",
  COLLEGE: "college",
} as const;
export type VenueType = (typeof VenueType)[keyof typeof VenueType];

export const EventStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CLOSED: "closed",
  CANCELLED: "cancelled",
  ARCHIVED: "archived",
} as const;
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

export const ApplicationStatus = {
  SUBMITTED: "submitted",
  SHORTLISTED: "shortlisted",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  WITHDRAWN: "withdrawn",
} as const;
export type ApplicationStatus =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const BookingStatus = {
  REQUESTED: "requested",
  CONFIRMED: "confirmed",
  ADVANCE_PENDING: "advance-pending",
  ADVANCE_PAID: "advance-paid",
  COMPLETED: "completed",
  REVIEWED: "reviewed",
  CANCELLED: "cancelled",
  DECLINED: "declined",
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const OfferStatus = {
  DRAFT: "draft",
  SENT: "sent",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXPIRED: "expired",
  WITHDRAWN: "withdrawn",
} as const;
export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus];

export const ContractStatus = {
  DRAFT: "draft",
  SENT: "sent",
  SIGNED: "signed",
  ACTIVE: "active",
  COMPLETED: "completed",
  TERMINATED: "terminated",
  VOID: "void",
} as const;
export type ContractStatus = (typeof ContractStatus)[keyof typeof ContractStatus];

export const PaymentStatus = {
  NOT_STARTED: "not-started",
  PENDING: "pending",
  AUTHORIZED: "authorized",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentKind = {
  ADVANCE: "advance",
  BALANCE: "balance",
  REFUND: "refund",
} as const;
export type PaymentKind = (typeof PaymentKind)[keyof typeof PaymentKind];

export const MediaKind = {
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  DOCUMENT: "document",
} as const;
export type MediaKind = (typeof MediaKind)[keyof typeof MediaKind];

export const AvailabilityStatus = {
  AVAILABLE: "available",
  BOOKED: "booked",
  TENTATIVE: "tentative",
  BLOCKED: "blocked",
  HOLIDAY: "holiday",
  TRAVEL: "travel",
} as const;
export type AvailabilityStatus =
  (typeof AvailabilityStatus)[keyof typeof AvailabilityStatus];

export const VerificationStatus = {
  UNVERIFIED: "unverified",
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
  EXPIRED: "expired",
} as const;
export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const NotificationChannel = {
  IN_APP: "in_app",
  EMAIL: "email",
  SMS: "sms",
  PUSH: "push",
} as const;
export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationStatus = {
  PENDING: "pending",
  SENT: "sent",
  READ: "read",
  FAILED: "failed",
} as const;
export type NotificationStatus =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const ActivityVerb = {
  CREATED: "created",
  UPDATED: "updated",
  DELETED: "deleted",
  STATUS_CHANGED: "status_changed",
  VIEWED: "viewed",
  MESSAGED: "messaged",
  PAID: "paid",
  REVIEWED: "reviewed",
} as const;
export type ActivityVerb = (typeof ActivityVerb)[keyof typeof ActivityVerb];

export const AuditAction = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  LOGIN: "login",
  LOGOUT: "logout",
  PERMISSION_DENIED: "permission_denied",
  EXPORT: "export",
  ADMIN_OVERRIDE: "admin_override",
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];
