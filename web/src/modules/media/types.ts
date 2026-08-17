export type EntityId = string;
export type ISODate = string;

export type MediaItemType = "image" | "video" | "short" | "audio" | "pdf";

export type MediaItemCategory =
  | "stage-photos"
  | "event-highlights"
  | "behind-the-scenes"
  | "repertoire"
  | "performance"
  | "shorts"
  | "original"
  | "cover"
  | "instrument-demo"
  | "practice"
  | "live-recording";

export type VideoEventFilter =
  "wedding" | "corporate" | "cafe" | "festival" | "temple" | "club" | "luxury";

export type AudioShowcaseKind =
  "original" | "cover" | "instrument-demo" | "practice" | "live-recording";

export interface PortfolioMediaItem {
  id: EntityId;
  title: string;
  type: MediaItemType;
  category: MediaItemCategory;
  thumbnail?: string;
  source: string;
  duration?: number;
  uploadedAt: ISODate;
  featured: boolean;
  views: number;
  likes: number;
  description: string;
  eventFilter?: VideoEventFilter;
  audioKind?: AudioShowcaseKind;
  provider?:
    "youtube" | "instagram-reel" | "spotify" | "soundcloud" | "uploaded" | "external";
}

export interface PerformanceHistoryItem {
  id: EntityId;
  title: string;
  venue: string;
  city: string;
  audienceSize: number;
  performedOn: ISODate;
  photoIds: readonly EntityId[];
  videoIds: readonly EntityId[];
  organizerReview?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}

export interface SocialProofMetrics {
  followers: number;
  repeatBookings: number;
  responseRatePercent: number;
  bookingSuccessPercent: number;
  completionRatePercent: number;
  yearsOfExperience: number;
}

export type VerificationChannel =
  | "government-id"
  | "phone"
  | "email"
  | "gst"
  | "business"
  | "social"
  | "bank"
  | "verified-performer";

export interface PerformerVerification {
  channels: readonly VerificationChannel[];
  verifiedPerformer: boolean;
}

export type AwardKind =
  | "competition"
  | "certificate"
  | "tv"
  | "radio"
  | "album"
  | "collaboration"
  | "verified-badge";

export type ReviewKind = "organizer" | "venue" | "audience" | "photo" | "video";

export const videoEventFilters: readonly {
  id: VideoEventFilter;
  label: string;
}[] = [
  { id: "wedding", label: "Wedding" },
  { id: "corporate", label: "Corporate" },
  { id: "cafe", label: "Cafe" },
  { id: "festival", label: "Festival" },
  { id: "temple", label: "Temple" },
  { id: "club", label: "Club" },
  { id: "luxury", label: "Luxury" },
] as const;

export const mediaCategoryLabels: Record<MediaItemCategory, string> = {
  "stage-photos": "Stage photos",
  "event-highlights": "Event highlights",
  "behind-the-scenes": "Behind the scenes",
  repertoire: "Repertoire",
  performance: "Performance",
  shorts: "Shorts",
  original: "Original songs",
  cover: "Cover songs",
  "instrument-demo": "Instrument demos",
  practice: "Practice sessions",
  "live-recording": "Live recordings",
};
