import {
  buildBudgetEstimate,
  estimatePackageVendorCost,
  estimateVenueCost,
} from "./budget-engine";
import { curatedVendorPackages, getVendorPackageById } from "./packages";
import type {
  EventVendorRequirement,
  PlannerRecommendation,
  VendorEventPackage,
  VendorProfile,
} from "./types";
import type { VendorType } from "./vendor-taxonomy";

function pickVendor(
  vendors: readonly VendorProfile[],
  vendorType: VendorType,
  city: string,
  budgetSlice: number,
): VendorProfile | undefined {
  const cityNorm = city.toLocaleLowerCase("en-IN");
  return [...vendors]
    .filter((v) => v.vendorType === vendorType)
    .filter(
      (v) =>
        v.city.toLocaleLowerCase("en-IN") === cityNorm ||
        v.coverageAreas.some((a) => a.toLocaleLowerCase("en-IN") === cityNorm),
    )
    .filter(
      (v) => (v.pricing.typicalAmount ?? v.pricing.startingAmount) <= budgetSlice * 1.2,
    )
    .sort((a, b) => {
      const score =
        b.reviews.average * 10 +
        (b.verification.verified ? 5 : 0) -
        (a.reviews.average * 10 + (a.verification.verified ? 5 : 0));
      return score;
    })[0];
}

export function selectPackageForBrief(input: {
  eventTypeId: string;
  budget: number;
  guestCount: number;
  city: string;
}): VendorEventPackage | undefined {
  const candidates = curatedVendorPackages.filter((pkg) => {
    if (pkg.eventTypeId !== input.eventTypeId && input.eventTypeId !== "wedding") {
      // allow wedding packages only for wedding unless exact match
      if (pkg.eventTypeId !== input.eventTypeId) return false;
    }
    if (pkg.eventTypeId !== input.eventTypeId) return false;
    if (input.guestCount < pkg.guestRange.min || input.guestCount > pkg.guestRange.max) {
      return false;
    }
    return pkg.basePrice <= input.budget * 1.15;
  });
  if (!candidates.length) {
    return curatedVendorPackages
      .filter((p) => p.eventTypeId === input.eventTypeId)
      .sort((a, b) => a.basePrice - b.basePrice)[0];
  }
  return candidates.sort((a, b) => {
    const aCity = a.cityHints.some(
      (c) => c.toLocaleLowerCase("en-IN") === input.city.toLocaleLowerCase("en-IN"),
    )
      ? 1
      : 0;
    const bCity = b.cityHints.some(
      (c) => c.toLocaleLowerCase("en-IN") === input.city.toLocaleLowerCase("en-IN"),
    )
      ? 1
      : 0;
    if (aCity !== bCity) return bCity - aCity;
    return Math.abs(a.basePrice - input.budget) - Math.abs(b.basePrice - input.budget);
  })[0];
}

export function planEvent(input: {
  eventTypeId: string;
  budget: number;
  city: string;
  guestCount: number;
  packageId?: string;
  vendors: readonly VendorProfile[];
  venueSuggestion?: { venueId: string; name: string; city: string; matchScore: number };
}): PlannerRecommendation {
  const pkg =
    (input.packageId ? getVendorPackageById(input.packageId) : undefined) ??
    selectPackageForBrief(input);

  const slots = pkg?.slots ?? defaultRequirements(input.eventTypeId);
  const vendorStack = slots.map((slot) => {
    const budgetSlice =
      "includedBudget" in slot
        ? slot.includedBudget
        : Math.round(input.budget / Math.max(slots.length, 1));
    const vendor = pickVendor(
      input.vendors,
      slot.vendorType,
      input.city,
      budgetSlice,
    );
    const estimatedCost = vendor
      ? vendor.pricing.typicalAmount ?? vendor.pricing.startingAmount
      : budgetSlice;
    return {
      vendorType: slot.vendorType,
      quantity: slot.quantity,
      vendor,
      estimatedCost: estimatedCost * slot.quantity,
    };
  });

  const vendorCost = pkg
    ? estimatePackageVendorCost(
        pkg,
        vendorStack.map((s) => s.vendor).filter(Boolean) as VendorProfile[],
      )
    : vendorStack.reduce((sum, s) => sum + s.estimatedCost, 0);

  const venueCost = pkg?.includesVenueEstimate
    ? estimateVenueCost({
        guestCount: input.guestCount,
        city: input.city,
        budget: input.budget,
      })
    : input.venueSuggestion
      ? estimateVenueCost({
          guestCount: input.guestCount,
          city: input.city,
          budget: input.budget,
        })
      : 0;

  const estimate = buildBudgetEstimate({
    budget: input.budget,
    vendorCost,
    venueCost,
  });

  const reasons: string[] = [];
  if (pkg) reasons.push(`Package: ${pkg.title}`);
  if (input.venueSuggestion) {
    reasons.push(
      `Venue match ${input.venueSuggestion.matchScore}: ${input.venueSuggestion.name}`,
    );
  }
  const filled = vendorStack.filter((s) => s.vendor).length;
  reasons.push(`${filled}/${vendorStack.length} vendor slots filled from marketplace`);
  if (estimate.withinBudget) reasons.push("Estimate within budget including taxes & fees");
  else reasons.push("Estimate exceeds budget — consider trimming premium slots");

  return {
    eventTypeId: input.eventTypeId,
    city: input.city,
    guestCount: input.guestCount,
    budget: input.budget,
    recommendedPackage: pkg,
    vendorStack,
    recommendedVenue: input.venueSuggestion,
    estimate,
    reasons,
  };
}

export function defaultRequirements(eventTypeId: string): EventVendorRequirement[] {
  if (eventTypeId === "wedding") {
    return [
      { vendorType: "musician", quantity: 1 },
      { vendorType: "dj", quantity: 1 },
      { vendorType: "photographer", quantity: 2 },
      { vendorType: "decorator", quantity: 1 },
      { vendorType: "mehendi_artist", quantity: 2 },
    ];
  }
  if (eventTypeId === "garba") {
    return [
      { vendorType: "garba_team", quantity: 1 },
      { vendorType: "dj", quantity: 1 },
      { vendorType: "sound_vendor", quantity: 1 },
    ];
  }
  if (eventTypeId === "corporate") {
    return [
      { vendorType: "anchor", quantity: 1 },
      { vendorType: "band", quantity: 1 },
      { vendorType: "sound_vendor", quantity: 1 },
    ];
  }
  return [
    { vendorType: "musician", quantity: 1 },
    { vendorType: "sound_vendor", quantity: 1 },
  ];
}
