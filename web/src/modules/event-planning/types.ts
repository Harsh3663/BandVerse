import type { VendorType } from "./vendor-taxonomy";

export interface VendorPricing {
  readonly currency: "INR";
  readonly startingAmount: number;
  readonly typicalAmount?: number;
  readonly negotiable: boolean;
}

export interface VendorProfile {
  readonly id: string;
  readonly handle: string;
  readonly displayName: string;
  readonly vendorType: VendorType;
  readonly services: readonly string[];
  readonly pricing: VendorPricing;
  readonly coverageAreas: readonly string[];
  readonly teamSize: number;
  readonly availability: {
    readonly timezone: string;
    readonly blockedDates: readonly string[];
    readonly weeklyOpenDays: readonly string[];
  };
  readonly portfolioUrls: readonly string[];
  readonly reviews: {
    readonly average: number;
    readonly count: number;
  };
  readonly verification: {
    readonly verified: boolean;
    readonly phoneVerified: boolean;
    readonly emailVerified: boolean;
    readonly businessVerified: boolean;
  };
  readonly city: string;
  readonly state: string;
  readonly description: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface EventVendorRequirement {
  readonly vendorType: VendorType;
  readonly quantity: number;
  readonly notes?: string;
}

export interface EventPlanDraft {
  readonly id: string;
  readonly title: string;
  readonly eventTypeId: string;
  readonly city: string;
  readonly guestCount: number;
  readonly budget: number;
  readonly eventDate?: string;
  readonly requirements: readonly EventVendorRequirement[];
  readonly selectedPackageId?: string;
  readonly selectedVendorIds: readonly string[];
  readonly venueId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface VendorPackageSlot {
  readonly vendorType: VendorType;
  readonly quantity: number;
  readonly includedBudget: number;
}

export interface VendorEventPackage {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly eventTypeId: string;
  readonly cityHints: readonly string[];
  readonly guestRange: { readonly min: number; readonly max: number };
  readonly basePrice: number;
  readonly currency: "INR";
  readonly slots: readonly VendorPackageSlot[];
  readonly includesVenueEstimate: boolean;
  readonly tags: readonly string[];
  readonly createdAt: string;
}

export interface BudgetEstimateLine {
  readonly label: string;
  readonly amount: number;
  readonly kind: "vendor" | "venue" | "tax" | "service_fee" | "other";
}

export interface BudgetEstimate {
  readonly currency: "INR";
  readonly vendorCost: number;
  readonly venueCost: number;
  readonly subtotal: number;
  readonly taxes: number;
  readonly serviceFees: number;
  readonly total: number;
  readonly lines: readonly BudgetEstimateLine[];
  readonly withinBudget: boolean;
  readonly budget: number;
}

export interface PlannerRecommendation {
  readonly eventTypeId: string;
  readonly city: string;
  readonly guestCount: number;
  readonly budget: number;
  readonly recommendedPackage?: VendorEventPackage;
  readonly vendorStack: readonly {
    readonly vendorType: VendorType;
    readonly quantity: number;
    readonly vendor?: VendorProfile;
    readonly estimatedCost: number;
  }[];
  readonly recommendedVenue?: {
    readonly venueId: string;
    readonly name: string;
    readonly city: string;
    readonly matchScore: number;
  };
  readonly estimate: BudgetEstimate;
  readonly reasons: readonly string[];
}

export interface VendorDiscoveryFilters {
  readonly vendorType?: VendorType;
  readonly city?: string;
  readonly budgetMax?: number;
  readonly budgetMin?: number;
  readonly minRating?: number;
  readonly availableOn?: string;
}

export interface EventPlanningAnalytics {
  readonly packageViews: number;
  readonly vendorViews: number;
  readonly quoteRequests: number;
  readonly bookings: number;
  readonly revenue: number;
  readonly conversionRate: number;
}

export const GST_RATE = 0.18;
export const SERVICE_FEE_RATE = 0.05;
