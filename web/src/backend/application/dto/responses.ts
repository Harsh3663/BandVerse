import type {
  Application,
  Booking,
  MarketplaceEvent,
  PaymentPlaceholder,
  PerformerProfile,
  RecommendationResult,
  Review,
  VenueProfile,
} from "@/modules/marketplace/types";
import type { OrganizerAnalytics, PerformerAnalytics } from "@/modules/marketplace/types";
import type { PageMeta } from "@/backend/shared/pagination";

export interface ApiSuccessResponse<T> {
  readonly data: T;
  readonly meta?: PageMeta;
  readonly requestId?: string;
}

export interface ApiErrorBody {
  readonly code: string;
  readonly message: string;
  readonly details?: readonly unknown[];
}

export interface ApiErrorResponse {
  readonly error: ApiErrorBody;
}

export type PerformerListResponse = ApiSuccessResponse<readonly PerformerProfile[]>;
export type PerformerDetailResponse = ApiSuccessResponse<PerformerProfile>;
export type VenueListResponse = ApiSuccessResponse<readonly VenueProfile[]>;
export type VenueDetailResponse = ApiSuccessResponse<VenueProfile>;
export type EventListResponse = ApiSuccessResponse<readonly MarketplaceEvent[]>;
export type EventDetailResponse = ApiSuccessResponse<MarketplaceEvent>;
export type ApplicationListResponse = ApiSuccessResponse<readonly Application[]>;
export type ApplicationDetailResponse = ApiSuccessResponse<Application>;
export type BookingListResponse = ApiSuccessResponse<readonly Booking[]>;
export type BookingDetailResponse = ApiSuccessResponse<Booking>;
export type ReviewListResponse = ApiSuccessResponse<readonly Review[]>;
export type PaymentListResponse = ApiSuccessResponse<readonly PaymentPlaceholder[]>;
export type RecommendationResponse = ApiSuccessResponse<RecommendationResult>;
export type OrganizerAnalyticsResponse = ApiSuccessResponse<OrganizerAnalytics>;
export type PerformerAnalyticsResponse = ApiSuccessResponse<PerformerAnalytics>;

export interface AuthTokensResponseData {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly tokenType: "Bearer";
  readonly expiresIn: number;
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly displayName: string;
    readonly roles: readonly string[];
  };
}

export type AuthTokensResponse = ApiSuccessResponse<AuthTokensResponseData>;

export interface HealthResponseData {
  readonly status: "ok";
  readonly service: "bandverse-api";
  readonly timestamp: string;
  readonly mode: "mock" | "production";
}

export type HealthResponse = ApiSuccessResponse<HealthResponseData>;
