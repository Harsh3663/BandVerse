/**
 * Production domain entities.
 * Existing marketplace types are reused where shapes already match UI needs.
 * New entities (Offer, Contract, Notification, etc.) extend the platform model.
 */

import type {
  Application as MarketplaceApplication,
  AvailabilityCalendar,
  Booking as MarketplaceBooking,
  ChatMessage,
  ChatThread,
  MarketplaceEvent,
  Money,
  PaymentPlaceholder,
  PerformerKind,
  PerformerProfile,
  PricingPackage,
  Review as MarketplaceReview,
  VenueProfile,
  VenueType,
} from "@/modules/marketplace/types";

import type {
  ActivityVerb,
  ApplicationStatus,
  AuditAction,
  AvailabilityStatus,
  BookingStatus,
  ContractStatus,
  EventStatus,
  MediaKind,
  NotificationChannel,
  NotificationStatus,
  OfferStatus,
  PaymentKind,
  PaymentStatus,
  PermissionAction,
  PermissionResource,
  RoleName,
  UserStatus,
  VerificationStatus,
} from "./enums";
import type { Auditable, EntityId, ISODateTime, SoftDeletable, Versioned } from "../shared/types";

export interface User extends Auditable, SoftDeletable, Versioned {
  readonly id: EntityId;
  readonly email: string;
  readonly phone?: string;
  readonly displayName: string;
  readonly avatarUrl?: string;
  readonly status: UserStatus;
  readonly roleIds: readonly EntityId[];
  readonly emailVerifiedAt?: ISODateTime;
  readonly phoneVerifiedAt?: ISODateTime;
  readonly lastLoginAt?: ISODateTime;
}

export interface Role extends Auditable {
  readonly id: EntityId;
  readonly name: RoleName;
  readonly description: string;
  readonly permissionIds: readonly EntityId[];
}

export interface Permission {
  readonly id: EntityId;
  readonly resource: PermissionResource;
  readonly action: PermissionAction;
  readonly description: string;
}

export interface Session extends Auditable {
  readonly id: EntityId;
  readonly userId: EntityId;
  readonly refreshTokenHash: string;
  readonly userAgent?: string;
  readonly ipAddress?: string;
  readonly expiresAt: ISODateTime;
  readonly revokedAt?: ISODateTime;
}

export interface Organizer extends Auditable, SoftDeletable, Versioned {
  readonly id: EntityId;
  readonly userId: EntityId;
  readonly displayName: string;
  readonly organizationName?: string;
  readonly hostId: EntityId;
  readonly primaryVenueId?: EntityId;
  readonly verified: boolean;
}

export interface Performer extends Auditable, SoftDeletable, Versioned {
  readonly id: EntityId;
  readonly userId: EntityId;
  readonly profile: PerformerProfile;
}

export interface Band {
  readonly id: EntityId;
  readonly performerId: EntityId;
  readonly name: string;
  readonly memberCount: number;
  readonly kind: Extract<PerformerKind, "band" | "traditional-group" | "ensemble">;
}

export interface Venue extends Auditable, SoftDeletable, Versioned {
  readonly id: EntityId;
  readonly ownerUserId: EntityId;
  readonly profile: VenueProfile;
  readonly type: VenueType;
}

export interface EventEntity extends Auditable, SoftDeletable, Versioned {
  readonly id: EntityId;
  readonly data: MarketplaceEvent;
  readonly status: EventStatus;
}

export interface BookingEntity extends Auditable, SoftDeletable, Versioned {
  readonly id: EntityId;
  readonly data: MarketplaceBooking;
  readonly status: BookingStatus;
}

export interface ApplicationEntity extends Auditable, SoftDeletable, Versioned {
  readonly id: EntityId;
  readonly data: MarketplaceApplication;
  readonly status: ApplicationStatus;
}

export interface Offer extends Auditable, SoftDeletable, Versioned {
  readonly id: EntityId;
  readonly eventId: EntityId;
  readonly organizerId: EntityId;
  readonly performerId: EntityId;
  readonly applicationId?: EntityId;
  readonly amount: Money;
  readonly packageId?: EntityId;
  readonly message?: string;
  readonly status: OfferStatus;
  readonly expiresAt?: ISODateTime;
}

export interface Contract extends Auditable, SoftDeletable, Versioned {
  readonly id: EntityId;
  readonly bookingId: EntityId;
  readonly organizerId: EntityId;
  readonly performerId: EntityId;
  readonly status: ContractStatus;
  readonly termsMarkdown: string;
  readonly signedByOrganizerAt?: ISODateTime;
  readonly signedByPerformerAt?: ISODateTime;
  readonly documentMediaId?: EntityId;
}

export interface Payment extends Auditable, SoftDeletable, Versioned {
  readonly id: EntityId;
  readonly bookingId: EntityId;
  readonly kind: PaymentKind;
  readonly amount: Money;
  readonly status: PaymentStatus;
  readonly provider: "razorpay" | "stripe" | "manual" | "placeholder";
  readonly providerReference?: string;
  readonly dueAt?: ISODateTime;
  readonly paidAt?: ISODateTime;
}

export interface ReviewEntity extends Auditable, SoftDeletable {
  readonly id: EntityId;
  readonly data: MarketplaceReview;
}

export interface MediaAssetEntity extends Auditable, SoftDeletable {
  readonly id: EntityId;
  readonly ownerUserId: EntityId;
  readonly kind: MediaKind;
  readonly url: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly checksumSha256?: string;
  readonly title: string;
  readonly alt?: string;
  readonly visibility: "public" | "private" | "unlisted";
  readonly scanStatus: "pending" | "clean" | "quarantined";
}

export interface Portfolio {
  readonly id: EntityId;
  readonly performerId: EntityId;
  readonly mediaIds: readonly EntityId[];
  readonly headline?: string;
  readonly updatedAt: ISODateTime;
}

export interface AvailabilitySlot extends Auditable {
  readonly id: EntityId;
  readonly ownerType: "performer" | "venue" | "host";
  readonly ownerId: EntityId;
  readonly startsAt: ISODateTime;
  readonly endsAt: ISODateTime;
  readonly status: AvailabilityStatus;
  readonly relatedBookingId?: EntityId;
  readonly calendar?: AvailabilityCalendar;
}

export interface PackageEntity extends Auditable, SoftDeletable {
  readonly id: EntityId;
  readonly performerId: EntityId;
  readonly data: PricingPackage;
}

export interface RecommendationRecord extends Auditable {
  readonly id: EntityId;
  readonly requesterUserId: EntityId;
  readonly eventContextHash: string;
  readonly performerIds: readonly EntityId[];
  readonly scores: Readonly<Record<EntityId, number>>;
  readonly reasons: readonly string[];
}

export interface Notification extends Auditable {
  readonly id: EntityId;
  readonly userId: EntityId;
  readonly channel: NotificationChannel;
  readonly status: NotificationStatus;
  readonly title: string;
  readonly body: string;
  readonly href?: string;
  readonly readAt?: ISODateTime;
  readonly meta?: Readonly<Record<string, string | number | boolean>>;
}

export interface Conversation {
  readonly id: EntityId;
  readonly thread: ChatThread;
}

export interface Message {
  readonly id: EntityId;
  readonly data: ChatMessage;
}

export interface AnalyticsSnapshot extends Auditable {
  readonly id: EntityId;
  readonly subjectType: "organizer" | "performer" | "venue" | "platform";
  readonly subjectId: EntityId;
  readonly periodStart: ISODateTime;
  readonly periodEnd: ISODateTime;
  readonly metrics: Readonly<Record<string, number>>;
}

export interface AuditLog {
  readonly id: EntityId;
  readonly actorUserId?: EntityId;
  readonly action: AuditAction;
  readonly resource: string;
  readonly resourceId?: EntityId;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly createdAt: ISODateTime;
}

export interface Activity {
  readonly id: EntityId;
  readonly actorUserId: EntityId;
  readonly verb: ActivityVerb;
  readonly objectType: string;
  readonly objectId: EntityId;
  readonly summary: string;
  readonly createdAt: ISODateTime;
}

export interface Verification {
  readonly id: EntityId;
  readonly subjectType: "user" | "performer" | "venue" | "organizer";
  readonly subjectId: EntityId;
  readonly status: VerificationStatus;
  readonly documentMediaIds: readonly EntityId[];
  readonly reviewerUserId?: EntityId;
  readonly notes?: string;
  readonly submittedAt: ISODateTime;
  readonly reviewedAt?: ISODateTime;
  readonly expiresAt?: ISODateTime;
}

/** Bridge helpers: wrap marketplace aggregates into versioned entities. */
export function toPaymentEntity(payment: PaymentPlaceholder): Payment {
  return {
    id: payment.id,
    bookingId: payment.bookingId,
    kind: payment.kind,
    amount: payment.amount,
    status: payment.status,
    provider: "placeholder",
    providerReference: payment.providerReference,
    dueAt: payment.dueAt,
    paidAt: payment.paidAt,
    createdAt: payment.paidAt ?? payment.dueAt ?? new Date(0).toISOString(),
    updatedAt: payment.paidAt ?? payment.dueAt ?? new Date(0).toISOString(),
    version: 1,
  };
}
