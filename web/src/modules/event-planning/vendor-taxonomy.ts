/**
 * Multi-vendor event planning taxonomy — Indian cultural + modern event vendors.
 * Separate from performer kinds; does not modify marketplace taxonomy modules.
 */

export const VENDOR_TYPES = [
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
] as const;

export type VendorType = (typeof VENDOR_TYPES)[number];

export const VENDOR_TYPE_LABELS: Record<VendorType, string> = {
  musician: "Musicians",
  band: "Bands",
  dj: "DJs",
  photographer: "Photographers",
  videographer: "Videographers",
  decorator: "Decorators",
  anchor: "Anchors",
  mc: "MCs",
  dance_group: "Dance Groups",
  mehendi_artist: "Mehendi Artists",
  makeup_artist: "Makeup Artists",
  sound_vendor: "Sound Vendors",
  lighting_vendor: "Lighting Vendors",
  wedding_planner: "Wedding Planners",
  pandit_services: "Pandit Services",
  bhajan_mandali: "Bhajan Mandali",
  qawwali_group: "Qawwali Groups",
  folk_artist: "Folk Artists",
  garba_team: "Garba Teams",
  dhol_tasha_team: "Dhol-Tasha Teams",
  classical_artist: "Classical Artists",
};

export const CULTURAL_VENDOR_TYPES: readonly VendorType[] = [
  "pandit_services",
  "bhajan_mandali",
  "qawwali_group",
  "folk_artist",
  "garba_team",
  "dhol_tasha_team",
  "classical_artist",
  "mehendi_artist",
];

export function isVendorType(value: string): value is VendorType {
  return (VENDOR_TYPES as readonly string[]).includes(value);
}

/** Map marketplace performer kinds onto closest vendor types for bridging. */
export function vendorTypeFromPerformerKind(kind: string): VendorType | undefined {
  switch (kind) {
    case "solo":
      return "musician";
    case "band":
    case "ensemble":
      return "band";
    case "dj":
      return "dj";
    case "traditional-group":
      return "folk_artist";
    default:
      return undefined;
  }
}
