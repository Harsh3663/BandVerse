import { z } from "zod";

import {
  ApplicationStatus,
  BookingStatus,
  EventStatus,
  MediaKind,
  OfferStatus,
  PaymentKind,
  PaymentStatus,
  PerformerKind,
  RoleName,
  VenueType,
  VerificationStatus,
} from "@/backend/domain/enums";
import { paginationQuerySchema } from "../pagination";
import {
  addressSchema,
  emailSchema,
  entityIdSchema,
  handleSchema,
  isoDateSchema,
  moneySchema,
  phoneSchema,
  stringListSchema,
} from "./primitives";

const enumValues = <T extends Record<string, string>>( enumeration: T) =>
  Object.values(enumeration) as [T[keyof T], ...T[keyof T][]];

export const authLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
  rememberMe: z.boolean().optional(),
});

export const authRegisterSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
  displayName: z.string().trim().min(2).max(120),
  phone: phoneSchema.optional(),
  role: z.enum([RoleName.PERFORMER, RoleName.ORGANIZER, RoleName.USER]),
});

export const authRefreshSchema = z.object({
  refreshToken: z.string().min(20).max(2048),
});

export const userUpdateSchema = z.object({
  displayName: z.string().trim().min(2).max(120).optional(),
  phone: phoneSchema.optional(),
  avatarUrl: z.string().url().optional(),
});

export const performerQuerySchema = paginationQuerySchema.extend({
  city: z.string().trim().min(1).max(120).optional(),
  categoryIds: stringListSchema.optional(),
  genreIds: stringListSchema.optional(),
  instrumentIds: stringListSchema.optional(),
  languageIds: stringListSchema.optional(),
  kind: z.enum(enumValues(PerformerKind)).optional(),
  minimumBudget: z.coerce.number().nonnegative().optional(),
  maximumBudget: z.coerce.number().nonnegative().optional(),
  minimumRating: z.coerce.number().min(0).max(5).optional(),
  availableOn: isoDateSchema.optional(),
  eventTypeId: z.string().trim().min(1).max(64).optional(),
});

export const venueQuerySchema = paginationQuerySchema.extend({
  city: z.string().trim().min(1).max(120).optional(),
  type: z.enum(enumValues(VenueType)).optional(),
  verified: z.coerce.boolean().optional(),
});

export const venueCreateSchema = z.object({
  handle: handleSchema,
  name: z.string().trim().min(2).max(160),
  type: z.enum(enumValues(VenueType)),
  description: z.string().trim().min(1).max(5000),
  location: addressSchema,
  capacity: z
    .object({
      seated: z.number().int().positive().optional(),
      standing: z.number().int().positive().optional(),
    })
    .default({}),
  amenityIds: stringListSchema.default([]),
  preferredGenreIds: stringListSchema.default([]),
  preferredEventTypeIds: stringListSchema.default([]),
});

export const eventCreateSchema = z.object({
  title: z.string().trim().min(3).max(160),
  eventTypeId: z.string().trim().min(1).max(64),
  eventDate: isoDateSchema,
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  venueId: entityIdSchema.optional(),
  city: z.string().trim().min(1).max(120),
  budgetMinimum: z.number().nonnegative().optional(),
  budgetMaximum: z.number().positive(),
  audienceSize: z.number().int().positive().optional(),
  dressCode: z.string().trim().max(120).optional(),
  theme: z.string().trim().max(120).optional(),
  languageIds: stringListSchema.default([]),
  preferredGenreIds: stringListSchema.default([]),
  specialRequirements: z.string().trim().max(2000).optional(),
  timeline: z
    .array(
      z.object({
        id: entityIdSchema,
        label: z.string().trim().min(1).max(120),
        kind: z.enum([
          "setup",
          "sound-check",
          "artist-arrival",
          "performance",
          "break",
          "closing",
          "custom",
        ]),
        startTime: z.string().min(1).max(16),
        endTime: z.string().min(1).max(16).optional(),
        status: z.enum(["pending", "active", "completed", "delayed"]),
        notes: z.string().max(500).optional(),
      }),
    )
    .max(40)
    .default([]),
  status: z.enum(enumValues(EventStatus)).default(EventStatus.DRAFT),
  description: z.string().trim().max(5000).optional(),
});

export const eventUpdateSchema = eventCreateSchema.partial().extend({
  id: entityIdSchema,
});

export const eventQuerySchema = paginationQuerySchema.extend({
  hostId: entityIdSchema.optional(),
  status: z.enum(enumValues(EventStatus)).optional(),
  city: z.string().trim().min(1).max(120).optional(),
  eventTypeId: z.string().trim().min(1).max(64).optional(),
});

export const applicationCreateSchema = z.object({
  eventId: entityIdSchema,
  performerId: entityIdSchema,
  proposedPackageId: entityIdSchema.optional(),
  quotedPrice: moneySchema,
  message: z.string().trim().min(1).max(2000),
});

export const applicationStatusUpdateSchema = z.object({
  status: z.enum(enumValues(ApplicationStatus)),
});

export const applicationQuerySchema = paginationQuerySchema.extend({
  eventId: entityIdSchema.optional(),
  performerId: entityIdSchema.optional(),
  status: z.enum(enumValues(ApplicationStatus)).optional(),
});

export const bookingCreateSchema = z.object({
  performerId: entityIdSchema,
  eventId: entityIdSchema.optional(),
  eventTypeId: z.string().trim().min(1).max(64),
  eventDate: isoDateSchema,
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  venueId: entityIdSchema,
  venueName: z.string().trim().min(1).max(160),
  city: z.string().trim().min(1).max(120),
  audienceSize: z.number().int().positive(),
  packageId: entityIdSchema.optional(),
  budget: moneySchema,
  specialRequirements: z.string().trim().max(2000).default(""),
});

export const bookingStatusUpdateSchema = z.object({
  status: z.enum(enumValues(BookingStatus)),
  cancellationReason: z.string().trim().max(1000).optional(),
});

export const bookingQuerySchema = paginationQuerySchema.extend({
  hostId: entityIdSchema.optional(),
  performerId: entityIdSchema.optional(),
  status: z.enum(enumValues(BookingStatus)).optional(),
});

export const offerCreateSchema = z.object({
  eventId: entityIdSchema,
  organizerId: entityIdSchema,
  performerId: entityIdSchema,
  applicationId: entityIdSchema.optional(),
  amount: moneySchema,
  packageId: entityIdSchema.optional(),
  message: z.string().trim().max(2000).optional(),
  expiresAt: z.string().datetime().optional(),
  status: z.enum(enumValues(OfferStatus)).default(OfferStatus.SENT),
});

export const contractCreateSchema = z.object({
  bookingId: entityIdSchema,
  organizerId: entityIdSchema,
  performerId: entityIdSchema,
  termsMarkdown: z.string().trim().min(20).max(50_000),
});

export const paymentCreateSchema = z.object({
  bookingId: entityIdSchema,
  kind: z.enum(enumValues(PaymentKind)),
  amount: moneySchema,
  provider: z.enum(["razorpay", "stripe", "manual", "placeholder"]).default("placeholder"),
  dueAt: z.string().datetime().optional(),
});

export const paymentQuerySchema = paginationQuerySchema.extend({
  bookingId: entityIdSchema.optional(),
  status: z.enum(enumValues(PaymentStatus)).optional(),
});

export const reviewCreateSchema = z.object({
  bookingId: entityIdSchema,
  performerId: entityIdSchema,
  rating: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  title: z.string().trim().max(160).optional(),
  comment: z.string().trim().min(3).max(4000),
});

export const recommendationRequestSchema = z.object({
  eventTypeId: z.string().trim().min(1).max(64),
  budget: z.number().positive(),
  guests: z.number().int().positive(),
  city: z.string().trim().min(1).max(120),
  languageIds: stringListSchema.default([]),
  genreIds: stringListSchema.default([]),
  eventDate: isoDateSchema.optional(),
});

export const mediaUploadMetadataSchema = z.object({
  title: z.string().trim().min(1).max(160),
  kind: z.enum(enumValues(MediaKind)),
  mimeType: z
    .string()
    .regex(
      /^(image|video|audio|application)\/[a-z0-9.+-]+$/i,
      "Unsupported MIME type.",
    ),
  sizeBytes: z.number().int().positive().max(100 * 1024 * 1024),
  alt: z.string().trim().max(300).optional(),
  visibility: z.enum(["public", "private", "unlisted"]).default("public"),
});

export const portfolioUpdateSchema = z.object({
  mediaIds: z.array(entityIdSchema).max(100),
  headline: z.string().trim().max(200).optional(),
});

export const portfolioMediaTypeSchema = z.enum([
  "performance_video",
  "audio_sample",
  "photo",
  "youtube",
  "instagram_reel",
  "spotify",
  "website",
]);

export const portfolioMediaCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  mediaType: portfolioMediaTypeSchema,
  thumbnail: z.string().url().optional(),
  url: z.string().url(),
  duration: z.number().positive().max(24 * 60 * 60).optional(),
  featured: z.boolean().optional(),
  hero: z.boolean().optional(),
  mimeType: z.string().trim().max(120).optional(),
  sizeBytes: z.number().int().positive().max(100 * 1024 * 1024).optional(),
  originalName: z.string().trim().max(255).optional(),
});

export const portfolioMediaUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  thumbnail: z.string().url().optional(),
  url: z.string().url().optional(),
  duration: z.number().positive().max(24 * 60 * 60).optional(),
  featured: z.boolean().optional(),
  hero: z.boolean().optional(),
});

export const setlistEventTypeSchema = z.enum([
  "wedding",
  "corporate",
  "sufi_night",
  "bollywood_night",
  "classical",
  "garba",
  "dj",
]);

export const setlistCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  songs: z.array(z.string().trim().min(1).max(200)).min(1).max(100),
  duration: z.number().positive().max(24 * 60),
  eventType: setlistEventTypeSchema,
});

export const setlistUpdateSchema = setlistCreateSchema.partial();

export const verifiedPerformanceCreateSchema = z.object({
  eventId: entityIdSchema,
  organizerId: entityIdSchema,
});

export const verifiedPerformanceReviewSchema = z.object({
  status: z.enum(["pending", "verified", "rejected"]),
});

export const portfolioAvailabilityDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["available", "tentative", "booked", "blocked"]),
  note: z.string().trim().max(500).optional(),
  relatedLifecycleId: entityIdSchema.optional(),
});

export const portfolioAnalyticsEventSchema = z.object({
  event: z.enum([
    "video_view",
    "portfolio_view",
    "profile_view",
    "click",
    "booking_start",
    "booking_conversion",
  ]),
  mediaId: entityIdSchema.optional(),
});

export const discoveryRankSchema = z.object({
  performerIds: z.array(entityIdSchema).min(1).max(200),
});

export const availabilityUpsertSchema = z.object({
  ownerType: z.enum(["performer", "venue", "host"]),
  ownerId: entityIdSchema,
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  status: z.enum([
    "available",
    "booked",
    "tentative",
    "blocked",
    "holiday",
    "travel",
  ]),
  relatedBookingId: entityIdSchema.optional(),
});

export const packageUpsertSchema = z.object({
  performerId: entityIdSchema,
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(1).max(2000),
  price: moneySchema,
  durationMinutes: z.number().int().positive().max(24 * 60),
  inclusions: stringListSchema,
  eventTypeIds: stringListSchema.optional(),
  negotiable: z.boolean(),
  travelIncluded: z.boolean().optional(),
  equipmentIncluded: z.boolean().optional(),
  artistsIncluded: z.number().int().positive().optional(),
});

export const messageCreateSchema = z.object({
  conversationId: entityIdSchema,
  body: z.string().trim().min(1).max(5000).optional(),
  messageType: z.enum(["text", "image", "document", "audio"]).default("text"),
  content: z.string().trim().max(5000).optional(),
  attachmentUrl: z.string().url().optional(),
  mimeType: z.string().trim().max(200).optional(),
  sizeBytes: z.number().int().positive().max(100 * 1024 * 1024).optional(),
  originalName: z.string().trim().max(255).optional(),
});

export const conversationCreateSchema = z.object({
  organizerId: entityIdSchema,
  performerId: entityIdSchema,
  bookingId: entityIdSchema.optional(),
  eventId: entityIdSchema.optional(),
});

export const negotiationOfferCreateSchema = z.object({
  amount: z.number().positive().max(100_000_000),
  currency: z.literal("INR").default("INR"),
  notes: z.string().trim().max(2000).optional(),
});

export const negotiationCounterSchema = z.object({
  amount: z.number().positive().max(100_000_000),
  currency: z.literal("INR").optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const typingIndicatorSchema = z.object({
  typing: z.boolean(),
});

export const messageEditSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

export const notificationQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["pending", "sent", "read", "failed"]).optional(),
});

export const venueFacilitiesSchema = z.object({
  stageAvailable: z.boolean(),
  soundSystem: z.boolean(),
  lighting: z.boolean(),
  parking: z.boolean(),
  foodAvailable: z.boolean(),
  accommodationAvailable: z.boolean(),
});

export const venueGalleryCreateSchema = z.object({
  kind: z.enum(["photo", "video", "virtual_tour"]),
  title: z.string().trim().min(1).max(200),
  url: z.string().url(),
  thumbnail: z.string().url().optional(),
  mimeType: z.string().trim().max(200).optional(),
  sizeBytes: z.number().int().positive().max(100 * 1024 * 1024).optional(),
  originalName: z.string().trim().max(255).optional(),
});

export const venueVerificationPatchSchema = z.object({
  gstVerified: z.boolean().optional(),
  businessVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
});

export const recurringGigCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  weekdays: z.array(z.string().trim().min(1).max(16)).min(1).max(7),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  neededRoles: z.array(z.string().trim().min(1).max(80)).min(1).max(20),
  preferredGenreIds: stringListSchema.optional(),
  budgetPaise: z.number().int().positive().optional(),
  activeFrom: isoDateSchema.optional(),
  activeUntil: isoDateSchema.optional(),
});

export const eventDiscoverQuerySchema = z.object({
  city: z.string().trim().max(120).optional(),
  budgetMin: z.coerce.number().nonnegative().optional(),
  budgetMax: z.coerce.number().positive().optional(),
  category: z.string().trim().max(64).optional(),
  dateFrom: isoDateSchema.optional(),
  dateTo: isoDateSchema.optional(),
  performerType: z.string().trim().max(64).optional(),
});

export const nearbyOpportunitiesQuerySchema = z.object({
  city: z.string().trim().min(1).max(120),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const matchingContextQuerySchema = z.object({
  eventTypeId: z.string().trim().min(1).max(64),
  budget: z.coerce.number().positive(),
  city: z.string().trim().min(1).max(120),
  date: isoDateSchema.optional(),
  eventId: entityIdSchema.optional(),
  audienceSize: z.coerce.number().int().positive().optional(),
  audienceType: z.string().trim().max(64).optional(),
  genreIds: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) =>
      value === undefined
        ? undefined
        : Array.isArray(value)
          ? value
          : value.split(",").map((v) => v.trim()).filter(Boolean),
    ),
  languageIds: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) =>
      value === undefined
        ? undefined
        : Array.isArray(value)
          ? value
          : value.split(",").map((v) => v.trim()).filter(Boolean),
    ),
  venueId: entityIdSchema.optional(),
  capacityNeeded: z.coerce.number().int().positive().optional(),
  requiredAmenities: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) =>
      value === undefined
        ? undefined
        : Array.isArray(value)
          ? value
          : value.split(",").map((v) => v.trim()).filter(Boolean),
    ),
});

export const matchingEventsQuerySchema = z.object({
  performerId: entityIdSchema,
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const matchingAnalyticsTrackSchema = z.object({
  event: z.enum(["impression", "click", "application", "booking"]),
});

export const vendorTypeSchema = z.enum([
  "musician",
  "band",
  "dj",
  "photographer",
  "videographer",
  "decorator",
  "anchor",
  "mc",
  "dance_group",
  "mehendi_artist",
  "makeup_artist",
  "sound_vendor",
  "lighting_vendor",
  "wedding_planner",
  "pandit_services",
  "bhajan_mandali",
  "qawwali_group",
  "folk_artist",
  "garba_team",
  "dhol_tasha_team",
  "classical_artist",
]);

export const vendorCreateSchema = z.object({
  handle: handleSchema,
  displayName: z.string().trim().min(2).max(160),
  vendorType: vendorTypeSchema,
  services: z.array(z.string().trim().min(1).max(80)).min(1).max(40),
  pricing: z.object({
    currency: z.literal("INR"),
    startingAmount: z.number().positive(),
    typicalAmount: z.number().positive().optional(),
    negotiable: z.boolean(),
  }),
  coverageAreas: z.array(z.string().trim().min(1).max(80)).min(1).max(30),
  teamSize: z.number().int().positive().max(500),
  availability: z.object({
    timezone: z.string().trim().min(1).max(64),
    blockedDates: z.array(isoDateSchema).max(366).default([]),
    weeklyOpenDays: z.array(z.string().trim().min(1).max(16)).max(7),
  }),
  portfolioUrls: z.array(z.string().url()).max(20).default([]),
  reviews: z.object({
    average: z.number().min(0).max(5),
    count: z.number().int().nonnegative(),
  }),
  verification: z.object({
    verified: z.boolean(),
    phoneVerified: z.boolean(),
    emailVerified: z.boolean(),
    businessVerified: z.boolean(),
  }),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(5000),
});

export const vendorQuerySchema = z.object({
  vendorType: vendorTypeSchema.optional(),
  city: z.string().trim().max(120).optional(),
  budgetMax: z.coerce.number().positive().optional(),
  budgetMin: z.coerce.number().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  availableOn: isoDateSchema.optional(),
});

export const eventPlanCreateSchema = z.object({
  title: z.string().trim().min(2).max(160),
  eventTypeId: z.string().trim().min(1).max(64),
  city: z.string().trim().min(1).max(120),
  guestCount: z.number().int().positive().max(50_000),
  budget: z.number().positive(),
  eventDate: isoDateSchema.optional(),
  packageId: entityIdSchema.optional(),
  requirements: z
    .array(
      z.object({
        vendorType: vendorTypeSchema,
        quantity: z.number().int().positive().max(50),
        notes: z.string().trim().max(500).optional(),
      }),
    )
    .max(40)
    .optional(),
});

export const eventPlanCustomizeSchema = z.object({
  packageId: entityIdSchema.optional(),
  selectedVendorIds: z.array(entityIdSchema).max(100).optional(),
  venueId: entityIdSchema.optional(),
  requirements: z
    .array(
      z.object({
        vendorType: vendorTypeSchema,
        quantity: z.number().int().positive().max(50),
        notes: z.string().trim().max(500).optional(),
      }),
    )
    .max(40)
    .optional(),
});

export const budgetEstimatorSchema = z.object({
  budget: z.number().positive(),
  city: z.string().trim().min(1).max(120),
  guestCount: z.number().int().positive().max(50_000),
  packageId: entityIdSchema.optional(),
  vendorIds: z.array(entityIdSchema).max(100).optional(),
  includeVenue: z.boolean().optional(),
});

export const eventPlannerSchema = z.object({
  eventTypeId: z.string().trim().min(1).max(64),
  budget: z.number().positive(),
  city: z.string().trim().min(1).max(120),
  guestCount: z.number().int().positive().max(50_000),
  packageId: entityIdSchema.optional(),
});

export const eventPlanningAnalyticsTrackSchema = z.object({
  event: z.enum(["package_view", "vendor_view", "quote_request", "booking"]),
  revenue: z.number().nonnegative().optional(),
});

export const vendorPackageUpsertSchema = z.object({
  id: entityIdSchema.optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(1).max(2000),
  eventTypeId: z.string().trim().min(1).max(64),
  cityHints: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  guestRange: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  }),
  basePrice: z.number().positive(),
  currency: z.literal("INR"),
  slots: z
    .array(
      z.object({
        vendorType: vendorTypeSchema,
        quantity: z.number().int().positive().max(50),
        includedBudget: z.number().nonnegative(),
      }),
    )
    .min(1)
    .max(40),
  includesVenueEstimate: z.boolean(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
});

export const verificationSubmitSchema = z.object({
  subjectType: z.enum(["user", "performer", "venue", "organizer"]),
  subjectId: entityIdSchema,
  documentMediaIds: z.array(entityIdSchema).min(1).max(10),
  notes: z.string().trim().max(2000).optional(),
});

export const verificationReviewSchema = z.object({
  status: z.enum([
    VerificationStatus.VERIFIED,
    VerificationStatus.REJECTED,
    VerificationStatus.PENDING,
  ]),
  notes: z.string().trim().max(2000).optional(),
});

export const analyticsQuerySchema = z.object({
  subjectType: z.enum(["organizer", "performer", "venue", "platform"]),
  subjectId: entityIdSchema,
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
});

export const adminUserQuerySchema = paginationQuerySchema.extend({
  role: z.enum(enumValues(RoleName)).optional(),
  status: z.enum(["active", "suspended", "pending_verification", "deleted"]).optional(),
});

export const handleParamSchema = z.object({
  handle: handleSchema,
});

export const idParamSchema = z.object({
  id: entityIdSchema,
});

export type AuthLoginInput = z.infer<typeof authLoginSchema>;
export type AuthRegisterInput = z.infer<typeof authRegisterSchema>;
export type PerformerQueryInput = z.infer<typeof performerQuerySchema>;
export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
export type RecommendationRequestInput = z.infer<typeof recommendationRequestSchema>;
export type MediaUploadMetadataInput = z.infer<typeof mediaUploadMetadataSchema>;
