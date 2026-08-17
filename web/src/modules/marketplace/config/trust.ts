import type { TrustBadgeKind, CancellationPolicyId } from "../types";

export interface TrustBadgeDefinition {
  kind: TrustBadgeKind;
  label: string;
  description: string;
  variant: "default" | "secondary" | "outline";
}

export const trustBadgeDefinitions: Record<TrustBadgeKind, TrustBadgeDefinition> = {
  "verified-artist": {
    kind: "verified-artist",
    label: "Verified Artist",
    description: "Identity and performance history reviewed by BandVerse.",
    variant: "secondary",
  },
  "government-id-verified": {
    kind: "government-id-verified",
    label: "Government ID",
    description: "Government-issued identification verified for this profile.",
    variant: "secondary",
  },
  "professional-badge": {
    kind: "professional-badge",
    label: "Professional Badge",
    description: "Recognised credentials, certifications, or industry awards on file.",
    variant: "default",
  },
  "top-rated": {
    kind: "top-rated",
    label: "Top Rated",
    description: "Consistently high ratings from verified bookings.",
    variant: "default",
  },
  trending: {
    kind: "trending",
    label: "Trending",
    description: "High recent enquiry and shortlist activity on BandVerse.",
    variant: "outline",
  },
  featured: {
    kind: "featured",
    label: "Featured",
    description: "Highlighted in editorial picks and curated discovery lists.",
    variant: "default",
  },
  "emergency-replacement": {
    kind: "emergency-replacement",
    label: "Emergency Replacement",
    description: "Backup artist coordination available if travel or health issues arise.",
    variant: "outline",
  },
  "trusted-venue": {
    kind: "trusted-venue",
    label: "Trusted Venue",
    description: "Venue identity, capacity, and programming details verified.",
    variant: "secondary",
  },
};

export const cancellationPolicies = {
  standard: {
    id: "standard",
    label: "Standard cancellation",
    summary:
      "Free cancellation up to 14 days before the event. A 50% artist fee applies within 7–14 days. No refund within 7 days unless an emergency replacement is arranged.",
  },
  flexible: {
    id: "flexible",
    label: "Flexible cancellation",
    summary:
      "Full refund up to 7 days before the event. Reschedule once at no charge when notice is given at least 48 hours ahead.",
  },
  strict: {
    id: "strict",
    label: "Strict cancellation",
    summary:
      "50% fee if cancelled within 21 days of the event. No refund within 14 days; emergency replacement may be offered where available.",
  },
} as const;

export function getCancellationPolicy(id: CancellationPolicyId) {
  return cancellationPolicies[id];
}

export function getTrustBadgeDefinition(kind: TrustBadgeKind): TrustBadgeDefinition {
  return trustBadgeDefinitions[kind];
}
