import {
  GST_RATE,
  SERVICE_FEE_RATE,
  type BudgetEstimate,
  type BudgetEstimateLine,
  type VendorEventPackage,
  type VendorProfile,
} from "./types";

export function estimateVenueCost(input: {
  guestCount: number;
  city: string;
  budget: number;
}): number {
  const cityPremium = /mumbai|delhi|bengaluru|goa/i.test(input.city) ? 1.25 : 1;
  const perGuest = 900 * cityPremium;
  const estimate = Math.round(input.guestCount * perGuest);
  return Math.min(estimate, Math.round(input.budget * 0.45));
}

export function estimateVendorStackCost(
  vendors: readonly { estimatedCost: number }[],
): number {
  return vendors.reduce((sum, v) => sum + v.estimatedCost, 0);
}

export function buildBudgetEstimate(input: {
  budget: number;
  vendorCost: number;
  venueCost: number;
  includeTaxes?: boolean;
  includeServiceFee?: boolean;
}): BudgetEstimate {
  const includeTaxes = input.includeTaxes ?? true;
  const includeServiceFee = input.includeServiceFee ?? true;
  const subtotal = input.vendorCost + input.venueCost;
  const taxes = includeTaxes ? Math.round(subtotal * GST_RATE) : 0;
  const serviceFees = includeServiceFee
    ? Math.round(subtotal * SERVICE_FEE_RATE)
    : 0;
  const total = subtotal + taxes + serviceFees;
  const lines: BudgetEstimateLine[] = [
    { label: "Vendor cost", amount: input.vendorCost, kind: "vendor" },
    { label: "Venue cost", amount: input.venueCost, kind: "venue" },
  ];
  if (taxes) lines.push({ label: "GST (18%)", amount: taxes, kind: "tax" });
  if (serviceFees) {
    lines.push({
      label: "Platform service fee (5%)",
      amount: serviceFees,
      kind: "service_fee",
    });
  }

  return {
    currency: "INR",
    vendorCost: input.vendorCost,
    venueCost: input.venueCost,
    subtotal,
    taxes,
    serviceFees,
    total,
    lines,
    withinBudget: total <= input.budget,
    budget: input.budget,
  };
}

export function estimatePackageVendorCost(
  pkg: VendorEventPackage,
  selectedVendors: readonly VendorProfile[] = [],
): number {
  if (!selectedVendors.length) {
    return pkg.slots.reduce((sum, slot) => sum + slot.includedBudget, 0);
  }
  const byType = new Map<string, VendorProfile[]>();
  for (const vendor of selectedVendors) {
    const list = byType.get(vendor.vendorType) ?? [];
    list.push(vendor);
    byType.set(vendor.vendorType, list);
  }
  let total = 0;
  for (const slot of pkg.slots) {
    const pool = byType.get(slot.vendorType) ?? [];
    const chosen = pool.slice(0, slot.quantity);
    if (chosen.length) {
      total += chosen.reduce(
        (sum, v) => sum + (v.pricing.typicalAmount ?? v.pricing.startingAmount),
        0,
      );
      const missing = slot.quantity - chosen.length;
      if (missing > 0) {
        total += Math.round((slot.includedBudget / slot.quantity) * missing);
      }
    } else {
      total += slot.includedBudget;
    }
  }
  return total;
}
