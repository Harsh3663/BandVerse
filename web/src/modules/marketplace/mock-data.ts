import { performerProfiles as legacyProfiles } from "@/data/performer-profiles";
import { siteConfig } from "@/config/site";
import {
  buildPerformanceHistory,
  buildPortfolioMedia,
  buildSocialProof,
  buildVerification,
} from "@/modules/media";

import { resolveMarketplaceCity } from "./config/discovery";
import { resolveTaxonomyId, genres, instruments } from "./config/taxonomy";
import type {
  Application,
  Booking,
  CalendarEntry,
  ChatThread,
  CancellationPolicyId,
  MarketplaceEvent,
  MarketplaceEventTimelineItem,
  OrganizerPersona,
  PaymentPlaceholder,
  PerformerKind,
  PerformerProfile,
  PricingPackage,
  Review,
  TrustBadgeKind,
  TrustSignals,
  VenueProfile,
  VenueType,
} from "./types";

const generatedAt = "2026-08-01T10:00:00+05:30";

const specialInstruments: Readonly<Record<string, readonly string[]>> = {
  "the-groove-collective": ["vocals", "guitar", "bass", "drums", "keyboard"],
  "taal-vidroha-pathak": ["dhol", "tabla", "percussion"],
  confluence: ["sitar", "tabla", "guitar"],
  "shivgarjana-dhol-pathak": ["dhol", "punjabi-dhol"],
  "nashik-dhunkiraj-pathak": ["dhol", "dhol-tasha"],
  "royal-banjo-party": ["banjo", "guitar"],
  "sanskruti-lezim-pathak": ["lezim", "percussion"],
  "rajasthan-lok-kalakar": ["vocals", "sarangi", "dholak"],
  "manoos-cultural-ensemble": ["tabla", "bansuri", "guitar"],
};

const specialGenres: Readonly<Record<string, readonly string[]>> = {
  "the-groove-collective": ["bollywood", "bhangra", "fusion", "retro"],
  "taal-vidroha-pathak": ["folk", "lavani"],
  confluence: ["fusion", "hindustani", "carnatic"],
  "the-blue-room-quartet": ["jazz", "blues"],
  "meridian-corporate-ensemble": ["jazz", "fusion", "pop"],
  "sunset-boulevard": ["rock", "bollywood", "metal"],
  "anthem-rising": ["indie", "rock", "pop"],
  "shivgarjana-dhol-pathak": ["folk", "lavani"],
  "nashik-dhunkiraj-pathak": ["folk"],
  "royal-banjo-party": ["bollywood", "bhangra"],
  "sanskruti-lezim-pathak": ["folk", "lavani"],
  "rajasthan-lok-kalakar": ["folk", "sufi"],
  "manoos-cultural-ensemble": ["fusion", "folk", "devotional"],
};

function buildArtistPackages(
  sourceId: string,
  basePrice: number,
  memberCount = 1,
): PricingPackage[] {
  const scale = Math.max(1, memberCount);
  return [
    {
      id: `${sourceId}-essential`,
      name: "Essential Live Set",
      description: "One curated live set with pre-event coordination.",
      price: { amount: basePrice, currency: "INR" },
      durationMinutes: 90,
      inclusions: ["Performance", "Set planning", "Local travel"],
      negotiable: false,
      travelIncluded: true,
      equipmentIncluded: false,
      artistsIncluded: scale,
    },
    {
      id: `${sourceId}-celebration`,
      name: "Celebration Package",
      description: "Two live sets with an extended planning call.",
      price: { amount: Math.round(basePrice * 1.6), currency: "INR" },
      durationMinutes: 180,
      inclusions: ["Two performances", "Set planning", "Basic sound check"],
      negotiable: true,
      travelIncluded: true,
      equipmentIncluded: true,
      artistsIncluded: scale,
    },
    {
      id: `${sourceId}-pkg-wedding`,
      name: "Wedding Package",
      description: "Ceremony and reception-ready sets with coordinated sound check.",
      price: { amount: Math.round(basePrice * 1.35), currency: "INR" },
      durationMinutes: 180,
      inclusions: ["Two live sets", "Request list", "Travel within city"],
      eventTypeIds: ["wedding", "reception"],
      negotiable: true,
      travelIncluded: true,
      equipmentIncluded: true,
      artistsIncluded: scale,
    },
    {
      id: `${sourceId}-pkg-corporate`,
      name: "Corporate Package",
      description: "Polished programming for conferences, galas, and brand evenings.",
      price: { amount: Math.round(basePrice * 1.2), currency: "INR" },
      durationMinutes: 120,
      inclusions: ["One headline set", "Background underscore", "MC coordination"],
      eventTypeIds: ["corporate"],
      negotiable: true,
      travelIncluded: true,
      equipmentIncluded: false,
      artistsIncluded: scale,
    },
    {
      id: `${sourceId}-pkg-luxury`,
      name: "Luxury Package",
      description: "Premium hospitality programming with white-glove prep.",
      price: { amount: Math.round(basePrice * 1.9), currency: "INR" },
      durationMinutes: 210,
      inclusions: ["Extended set", "Premium repertoire", "Dedicated stage manager"],
      eventTypeIds: ["private-party", "reception"],
      negotiable: false,
      travelIncluded: true,
      equipmentIncluded: true,
      artistsIncluded: Math.max(scale, 2),
    },
    {
      id: `${sourceId}-pkg-temple`,
      name: "Temple Package",
      description: "Devotional and classical repertoire suited for sacred contexts.",
      price: { amount: Math.round(basePrice * 0.95), currency: "INR" },
      durationMinutes: 90,
      inclusions: ["Bhajan or classical set", "Acoustic-friendly setup"],
      eventTypeIds: ["temple"],
      negotiable: true,
      travelIncluded: false,
      equipmentIncluded: true,
      artistsIncluded: scale,
    },
    {
      id: `${sourceId}-pkg-cafe`,
      name: "Cafe Package",
      description: "Low-volume acoustic or jazz sets for intimate rooms.",
      price: { amount: Math.round(basePrice * 0.85), currency: "INR" },
      durationMinutes: 90,
      inclusions: ["Continuous lounge set", "Compact kit"],
      eventTypeIds: ["private-party"],
      negotiable: false,
      travelIncluded: false,
      equipmentIncluded: true,
      artistsIncluded: Math.min(scale, 3),
    },
    {
      id: `${sourceId}-pkg-festival`,
      name: "Festival Package",
      description: "High-energy festival slot with tech rider coordination.",
      price: { amount: Math.round(basePrice * 1.55), currency: "INR" },
      durationMinutes: 75,
      inclusions: ["Festival set", "Rider checklist", "Backline coordination"],
      eventTypeIds: ["concert", "garba", "navratri"],
      negotiable: true,
      travelIncluded: true,
      equipmentIncluded: false,
      artistsIncluded: scale,
    },
    {
      id: `${sourceId}-pkg-private`,
      name: "Private Party Package",
      description: "Flexible house and banquet programming for private hosts.",
      price: { amount: basePrice, currency: "INR" },
      durationMinutes: 120,
      inclusions: ["Custom set list", "Local travel", "Basic sound check"],
      eventTypeIds: ["birthday", "private-party"],
      negotiable: true,
      travelIncluded: true,
      equipmentIncluded: true,
      artistsIncluded: scale,
    },
  ];
}

const toId = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase("en-IN")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function performerKind(
  routeKind: "artist" | "band" | "group",
  category: string,
): PerformerKind {
  if (category === "DJ") return "dj";
  if (routeKind === "artist") return "solo";
  return routeKind === "band" ? "band" : "traditional-group";
}

function categoryIds(routeKind: "artist" | "band" | "group", category: string): string[] {
  if (category === "DJ") return ["dj"];
  if (routeKind === "band") return ["band"];
  if (routeKind === "group") return ["traditional-group"];
  return category === "Singer" ? ["vocalist"] : ["instrumentalist"];
}

function subcategoryIds(
  routeKind: "artist" | "band" | "group",
  category: string,
  handle: string,
): string[] {
  if (category === "DJ") return ["wedding-dj"];
  if (routeKind === "band") return ["cover-band"];
  if (routeKind === "group")
    return [
      handle.includes("dhol") || handle.includes("pathak")
        ? "dhol-pathak"
        : "folk-ensemble",
    ];
  return category === "Singer" ? ["wedding-singer"] : ["solo-instrumentalist"];
}

function skillIds(routeKind: "artist" | "band" | "group", category: string): string[] {
  if (routeKind === "group")
    return ["ceremonial-performance", "audience-engagement", "ensemble-direction"];
  if (category === "Singer") return ["live-vocals", "song-requests", "set-planning"];
  return ["audience-engagement", "set-planning", "sound-check"];
}

function instrumentIds(handle: string, category: string): string[] {
  if (specialInstruments[handle]) return [...specialInstruments[handle]];
  const resolved = resolveTaxonomyId(category, instruments);
  return resolved ? [resolved] : [];
}

function genreIds(handle: string, tags: readonly string[]): string[] {
  if (specialGenres[handle]) return [...new Set(specialGenres[handle])];
  return [...new Set(tags.map((tag) => resolveTaxonomyId(tag, genres) ?? toId(tag)))];
}

function eventTypeIds(
  routeKind: "artist" | "band" | "group",
  tags: readonly string[],
): string[] {
  const mapped = tags
    .map((tag) => {
      const normalized = toId(tag);
      if (normalized === "private-events") return "private-party";
      if (normalized === "festival") return "concert";
      return normalized;
    })
    .filter((id) =>
      ["wedding", "corporate", "birthday", "private-party", "concert"].includes(id),
    );

  if (mapped.length) return mapped;
  return routeKind === "group"
    ? ["wedding", "temple", "concert", "garba", "navratri"]
    : ["wedding", "reception", "corporate", "birthday", "private-party"];
}

function buildPerformerTrustSignals(
  source: {
    verified: boolean;
    rating: number;
    reviewCount?: number;
    completedEvents?: number;
    handle: string;
  },
  index: number,
  context: {
    certificates: readonly { id: string }[];
    awards: readonly { id: string }[];
    travel: { nationwide: boolean };
    kind: PerformerKind;
  },
): TrustSignals {
  const badges: TrustBadgeKind[] = [];
  if (source.verified) badges.push("verified-artist");
  if (index === 0 || context.certificates.length) badges.push("government-id-verified");
  if (context.certificates.length || context.awards.length)
    badges.push("professional-badge");
  if (source.rating >= 4.5) badges.push("top-rated");
  if (
    index < 4 ||
    (source.reviewCount ?? 0) > 40 ||
    source.handle === "the-groove-collective"
  ) {
    badges.push("trending");
  }
  if (index < 3 || source.handle === "the-groove-collective") badges.push("featured");
  if (context.travel.nationwide || context.kind === "band") {
    badges.push("emergency-replacement");
  }

  const cancellationPolicies: readonly CancellationPolicyId[] = [
    "flexible",
    "standard",
    "strict",
  ];

  return {
    badges,
    cancellationPolicyId: cancellationPolicies[index % cancellationPolicies.length]!,
  };
}

function buildVenueTrustSignals(index: number, verified: boolean): TrustSignals {
  const badges: TrustBadgeKind[] = [];
  if (verified) badges.push("trusted-venue");
  if (index < 2) badges.push("featured");
  if (index % 2 === 0) badges.push("top-rated");
  return {
    badges,
    cancellationPolicyId: index === 3 ? "flexible" : "standard",
  };
}

function performerProfileViews(
  handle: string,
  reviewCount: number,
  completedEvents?: number,
) {
  if (handle === "the-groove-collective") return 1_842;
  if (handle === "confluence") return 986;
  return Math.max(120, reviewCount * 11 + (completedEvents ?? 0) * 4);
}

export const mockPerformerProfiles: readonly PerformerProfile[] = legacyProfiles.map(
  (source, index): PerformerProfile => {
    const city =
      resolveMarketplaceCity(source.location) ?? resolveMarketplaceCity("Delhi")!;
    const basePrice = source.startingPrice;
    const kind = performerKind(source.routeKind, source.category);
    const nationwide = source.routeKind === "band";
    const certificates =
      index === 0
        ? [
            {
              id: `${source.id}-certificate`,
              name: "Marketplace identity verification",
              issuer: "Band Project",
              issuedOn: "2026-01-15",
            },
          ]
        : [];
    const awards = [
      {
        id: `${source.id}-award-competition`,
        name: index % 2 === 0 ? "Audience Choice" : "Live Performance Excellence",
        issuer: "BandVerse Community Showcase",
        awardedOn: "2026-03-15",
        description: "Representative marketplace recognition.",
        kind: "competition" as const,
      },
      ...(index < 4
        ? [
            {
              id: `${source.id}-award-tv`,
              name: "Regional television feature",
              issuer: "City Arts Channel",
              awardedOn: "2025-11-02",
              description: "Televised live segment and artist interview.",
              kind: "tv" as const,
            },
            {
              id: `${source.id}-award-radio`,
              name: "Radio session feature",
              issuer: "FM Live India",
              awardedOn: "2025-08-20",
              description: "Live-to-air acoustic session.",
              kind: "radio" as const,
            },
          ]
        : []),
      ...(index < 3
        ? [
            {
              id: `${source.id}-award-album`,
              name: "Independent EP release",
              issuer: "Self-released",
              awardedOn: "2024-12-01",
              description: "Original recordings available for booking references.",
              kind: "album" as const,
            },
            {
              id: `${source.id}-award-collab`,
              name: "Cross-city collaboration",
              issuer: "BandVerse Collective",
              awardedOn: "2025-05-18",
              description: "Joint set with featured regional artists.",
              kind: "collaboration" as const,
            },
          ]
        : []),
      ...(source.verified
        ? [
            {
              id: `${source.id}-award-verified`,
              name: "Verified performer badge",
              issuer: "BandVerse Trust",
              awardedOn: "2026-01-10",
              description: "Identity and booking history verified.",
              kind: "verified-badge" as const,
            },
          ]
        : []),
    ];
    const trustSignals = buildPerformerTrustSignals(source, index, {
      certificates,
      awards,
      travel: { nationwide },
      kind,
    });
    const reviewCount = source.reviewCount ?? Math.max(12, source.completedEvents ?? 12);
    const imageSrc = typeof source.image === "string" ? source.image : source.image.src;
    const portfolioMedia = buildPortfolioMedia({
      performerId: source.id,
      displayName: source.name,
      handle: source.handle,
      imageSrc,
      index,
    });
    const experienceYears = source.experienceYears ?? Math.max(3, 5 + (index % 8));
    const responseTimeMinutes = source.responseTime.includes("30 minutes")
      ? 30
      : Number(source.responseTime.match(/\d+/)?.[0] ?? 24) * 60;

    return {
      id: source.id,
      handle: source.handle,
      kind,
      displayName: source.name,
      headline: source.category,
      biography: source.summary,
      coverImage: {
        id: `${source.id}-professional-cover`,
        kind: "image",
        source: source.image,
        title: `${source.name} professional cover`,
        alt: `${source.name} professional performance cover`,
        galleryCategory: "professional",
      },
      profilePhoto: {
        id: `${source.id}-profile-photo`,
        kind: "image",
        source: source.image,
        title: `${source.name} profile photo`,
        alt: source.imageAlt,
        galleryCategory: "professional",
      },
      categoryIds: categoryIds(source.routeKind, source.category),
      subcategoryIds: subcategoryIds(source.routeKind, source.category, source.handle),
      skillIds: skillIds(source.routeKind, source.category),
      instrumentIds: instrumentIds(source.handle, source.category),
      genreIds: genreIds(source.handle, source.tags),
      languageIds: source.languages.map(toId),
      typicalPerformanceDurationMinutes:
        source.routeKind === "group" ? 120 : source.routeKind === "band" ? 150 : 90,
      supportedEventTypeIds: eventTypeIds(source.routeKind, source.tags),
      mediaGallery: [
        {
          id: `${source.id}-cover`,
          kind: "image",
          source: source.image,
          title: `${source.name} performing`,
          alt: source.imageAlt,
          galleryCategory:
            source.routeKind === "group"
              ? "traditional"
              : index % 2 === 0
                ? "stage"
                : "wedding",
        },
      ],
      videos:
        index < 3
          ? [
              {
                id: `${source.id}-youtube`,
                kind: "video",
                source: `https://www.youtube.com/results?search_query=${encodeURIComponent(
                  `${source.name} live performance`,
                )}`,
                title: `${source.name} live showreel`,
                provider: "youtube",
                thumbnail: source.image,
                durationSeconds: 194,
              },
              {
                id: `${source.id}-instagram-reel`,
                kind: "video",
                source: `https://www.instagram.com/${source.handle.replaceAll("-", "")}/reels/`,
                title: `${source.name} performance reel`,
                provider: "instagram-reel",
                thumbnail: source.image,
                durationSeconds: 45,
              },
            ]
          : [],
      socialLinks: [
        {
          platform: "instagram",
          url: `https://www.instagram.com/${source.handle.replaceAll("-", "")}`,
        },
        {
          platform: "spotify",
          url: `https://open.spotify.com/search/${encodeURIComponent(source.name)}`,
        },
        {
          platform: "youtube",
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(source.name)}`,
        },
        {
          platform: "facebook",
          url: `https://www.facebook.com/search/top?q=${encodeURIComponent(source.name)}`,
        },
        {
          platform: "website",
          url: `${siteConfig.url}/${source.routeKind}/${source.handle}`,
          label: "Website",
        },
      ],
      audioSamples: [
        {
          id: `${source.id}-spotify`,
          title: `${source.name} sample tracks`,
          url: `https://open.spotify.com/search/${encodeURIComponent(source.name)}`,
          provider: "spotify",
        },
      ],
      portfolioMedia,
      performanceHistory: buildPerformanceHistory({
        performerId: source.id,
        displayName: source.name,
        city: source.location,
        index,
        media: portfolioMedia,
      }),
      socialProof: buildSocialProof({
        years: experienceYears,
        completedEvents: source.completedEvents,
        responseTimeMinutes,
        index,
      }),
      verification: buildVerification({
        verified: source.verified,
        index,
      }),
      experience: {
        years: experienceYears,
        completedEvents: source.completedEvents,
        highlights: [
          `${source.rating.toFixed(1)} average rating`,
          source.representativeReview,
        ],
      },
      pricingPackages: buildArtistPackages(source.id, basePrice, source.memberCount ?? 1),
      availability: {
        timezone: "Asia/Kolkata",
        weekly: [
          { weekday: "friday", ranges: [{ start: "18:00", end: "23:00" }] },
          { weekday: "saturday", ranges: [{ start: "10:00", end: "23:00" }] },
          { weekday: "sunday", ranges: [{ start: "10:00", end: "22:00" }] },
        ],
        blockedDates: index % 2 === 0 ? ["2026-08-15"] : ["2026-08-22"],
        availableDates: ["2026-09-12", "2026-09-19", "2026-09-26"],
        minimumLeadDays: source.routeKind === "group" ? 7 : 3,
      },
      equipment: [
        {
          id: `${source.id}-guitar-prs`,
          name: "Electric guitar",
          brand: "PRS",
          category: "instrument",
          quantity: 1,
          providedByPerformer: true,
        },
        {
          id: `${source.id}-guitar-taylor`,
          name: "Acoustic guitar",
          brand: "Taylor",
          category: "instrument",
          quantity: 1,
          providedByPerformer: true,
        },
        {
          id: `${source.id}-guitar-fender`,
          name: "Stage guitar",
          brand: "Fender",
          category: "instrument",
          quantity: 1,
          providedByPerformer: source.routeKind !== "group",
        },
        {
          id: `${source.id}-keys-roland`,
          name: "Keyboard",
          brand: "Roland",
          category: "instrument",
          quantity: 1,
          providedByPerformer: true,
        },
        {
          id: `${source.id}-keys-nord`,
          name: "Stage piano",
          brand: "Nord",
          category: "instrument",
          quantity: 1,
          providedByPerformer: source.routeKind === "band",
        },
        {
          id: `${source.id}-drums-pearl`,
          name: "Drum kit",
          brand: "Pearl",
          category: "instrument",
          quantity: 1,
          providedByPerformer: source.routeKind === "band",
        },
        {
          id: `${source.id}-drums-yamaha`,
          name: "Electronic drums",
          brand: "Yamaha",
          category: "instrument",
          quantity: 1,
          providedByPerformer: false,
        },
        {
          id: `${source.id}-mics`,
          name: "Wireless microphones",
          brand: "Shure",
          category: "sound",
          quantity: Math.max(2, source.memberCount ?? 2),
          providedByPerformer: true,
        },
        {
          id: `${source.id}-iem`,
          name: "In-ear monitors",
          brand: "Sennheiser",
          category: "sound",
          quantity: Math.max(1, source.memberCount ?? 1),
          providedByPerformer: source.routeKind === "band",
        },
        {
          id: `${source.id}-mixer`,
          name: "Digital mixer",
          brand: "Yamaha",
          category: "sound",
          quantity: 1,
          providedByPerformer: source.routeKind === "artist",
        },
        {
          id: `${source.id}-lighting`,
          name: "Stage lighting wash",
          brand: "Chauvet",
          category: "lighting",
          quantity: 1,
          providedByPerformer: false,
        },
      ],
      travel: {
        baseLocation: {
          city: source.location,
          state: city.state,
          countryCode: "IN",
          coordinates: {
            latitude: city.coordinates.latitude,
            longitude: city.coordinates.longitude,
          },
        },
        radiusKm: source.routeKind === "group" ? 250 : 100,
        nationwide,
        travelFee: { amount: 5_000, currency: "INR" },
      },
      rating: {
        average: source.rating,
        count: reviewCount,
        breakdown: {
          5: Math.round(reviewCount * 0.55),
          4: Math.round(reviewCount * 0.28),
          3: Math.round(reviewCount * 0.1),
          2: Math.round(reviewCount * 0.05),
          1: Math.max(0, Math.round(reviewCount * 0.02)),
        },
      },
      awards,
      certificates,
      faqs: [
        {
          id: `${source.id}-faq-travel`,
          question: "Do you travel for events?",
          answer:
            "Yes. Travel outside the base radius is quoted after the event details are shared.",
        },
        {
          id: `${source.id}-faq-sound`,
          question: "What sound equipment is required?",
          answer:
            "Requirements depend on audience size and venue acoustics and are confirmed before booking.",
        },
      ],
      memberCount: source.memberCount,
      verified: source.verified,
      trustSignals,
      profileViews: performerProfileViews(
        source.handle,
        reviewCount,
        source.completedEvents,
      ),
      responseTimeMinutes,
      createdAt: generatedAt,
      updatedAt: generatedAt,
    };
  },
);

/** Stable frontend persona used by performer dashboard routes until auth is connected. */
export const mockPerformerPersonaId: PerformerProfile["id"] =
  "band-the-groove-collective";

const venueSeeds: readonly {
  id: string;
  name: string;
  type: VenueType;
  city: string;
  state: string;
  capacity: number;
  genres: readonly string[];
}[] = [
  {
    id: "venue-amber-palace-hotel",
    name: "Amber Palace Hotel",
    type: "hotel",
    city: "Jaipur",
    state: "Rajasthan",
    capacity: 450,
    genres: ["classical", "folk", "instrumental"],
  },
  {
    id: "venue-banyan-table",
    name: "The Banyan Table",
    type: "restaurant",
    city: "Bengaluru",
    state: "Karnataka",
    capacity: 120,
    genres: ["acoustic", "jazz", "indie"],
  },
  {
    id: "venue-konkani-tides",
    name: "Konkani Tides Resort",
    type: "resort",
    city: "Goa",
    state: "Goa",
    capacity: 600,
    genres: ["bollywood", "jazz", "fusion"],
  },
  {
    id: "venue-blue-note-club",
    name: "Blue Note Club",
    type: "club",
    city: "Mumbai",
    state: "Maharashtra",
    capacity: 300,
    genres: ["jazz", "rock", "edm"],
  },
  {
    id: "venue-tech-park-auditorium",
    name: "Tech Park Auditorium",
    type: "corporate-office",
    city: "Hyderabad",
    state: "Telangana",
    capacity: 800,
    genres: ["instrumental", "fusion", "bollywood"],
  },
  {
    id: "venue-gulmohar-bagh",
    name: "Gulmohar Bagh",
    type: "wedding-venue",
    city: "Delhi NCR",
    state: "Delhi NCR",
    capacity: 1_200,
    genres: ["bollywood", "bhangra", "classical"],
  },
  {
    id: "venue-presidency-amphitheatre",
    name: "Presidency College Amphitheatre",
    type: "college",
    city: "Chennai",
    state: "Tamil Nadu",
    capacity: 2_000,
    genres: ["rock", "indie", "classical"],
  },
];

export const mockVenueProfiles: readonly VenueProfile[] = venueSeeds.map(
  (venue, index) => {
    const city = resolveMarketplaceCity(venue.city);
    return {
      id: venue.id,
      handle: venue.id.replace("venue-", ""),
      name: venue.name,
      type: venue.type,
      description: `${venue.name} hosts professionally managed live performances and private events.`,
      location: {
        city: venue.city,
        state: venue.state,
        countryCode: "IN",
        coordinates: city?.coordinates,
      },
      capacity: { seated: Math.round(venue.capacity * 0.7), standing: venue.capacity },
      amenityIds: ["in-house-pa", "stage", "green-room", "parking", "power-backup"],
      preferredGenreIds: venue.genres,
      preferredEventTypeIds:
        venue.type === "wedding-venue"
          ? ["wedding", "reception"]
          : venue.type === "corporate-office"
            ? ["corporate"]
            : ["cafe", "hotel", "concert", "private-party"],
      mediaGallery: [],
      recurringSchedules: [
        {
          id: `${venue.id}-weekend-live`,
          title: "Weekend Live",
          weekdays: ["friday", "saturday"],
          time: { start: "19:30", end: "22:30" },
          preferredPerformerCategoryIds: ["band", "vocalist", "instrumentalist"],
          preferredGenreIds: venue.genres,
        },
      ],
      contact: {
        name: "Events Desk",
        email: `events@${venue.id.replace("venue-", "")}.example`,
      },
      verified: true,
      trustSignals: buildVenueTrustSignals(index, true),
    };
  },
);

/** Stable organizer and venue persona used until authentication is connected. */
export const mockOrganizerPersona: OrganizerPersona = {
  id: "organizer-blue-note",
  displayName: "Maya Kapoor",
  hostId: "host-blue-note-club",
  venueId: "venue-blue-note-club",
};

const clubTimeline = (
  prefix: string,
  performanceStatus: MarketplaceEventTimelineItem["status"] = "pending",
): readonly MarketplaceEventTimelineItem[] => [
  {
    id: `${prefix}-setup`,
    label: "Setup",
    kind: "setup",
    startTime: "17:00",
    endTime: "18:30",
    status: performanceStatus === "completed" ? "completed" : "pending",
  },
  {
    id: `${prefix}-sound-check`,
    label: "Sound Check",
    kind: "sound-check",
    startTime: "18:30",
    endTime: "19:15",
    status: performanceStatus === "completed" ? "completed" : "pending",
  },
  {
    id: `${prefix}-artist-arrival`,
    label: "Artist Arrival",
    kind: "artist-arrival",
    startTime: "19:00",
    endTime: "19:30",
    status: performanceStatus === "completed" ? "completed" : "pending",
  },
  {
    id: `${prefix}-performance`,
    label: "Performance",
    kind: "performance",
    startTime: "20:00",
    endTime: "22:30",
    status: performanceStatus,
  },
  {
    id: `${prefix}-closing`,
    label: "Closing",
    kind: "closing",
    startTime: "22:30",
    status: performanceStatus === "completed" ? "completed" : "pending",
  },
];

export const mockEvents: readonly MarketplaceEvent[] = [
  {
    id: "event-sharma-reception",
    hostId: "host-sharma-family",
    venueId: "venue-gulmohar-bagh",
    eventTypeId: "reception",
    title: "Sharma Family Reception",
    startsAt: "2026-11-21T19:00:00+05:30",
    endsAt: "2026-11-21T23:30:00+05:30",
    location: mockVenueProfiles[5].location,
    audienceSize: 650,
    budget: {
      minimum: { amount: 60_000, currency: "INR" },
      maximum: { amount: 120_000, currency: "INR" },
    },
    languageIds: ["hindi", "english", "punjabi"],
    preferredGenreIds: ["bollywood", "bhangra", "fusion"],
    preferredInstrumentIds: ["vocals", "dhol"],
    specialRequirements: "Coordinate baraat entry timing with the family planner.",
    timeline: [],
    customFieldValues: {
      "audience-size": 650,
      "performance-duration-minutes": 180,
      "sound-system": true,
    },
    status: "published",
  },
  {
    id: "event-navratri-tech-park",
    hostId: "host-tech-park",
    venueId: "venue-tech-park-auditorium",
    eventTypeId: "navratri",
    title: "Tech Park Navratri Nights",
    startsAt: "2026-10-13T18:30:00+05:30",
    endsAt: "2026-10-13T23:00:00+05:30",
    location: mockVenueProfiles[4].location,
    audienceSize: 800,
    budget: { maximum: { amount: 90_000, currency: "INR" } },
    languageIds: ["hindi", "gujarati", "english"],
    preferredGenreIds: ["garba", "folk", "fusion"],
    preferredInstrumentIds: ["dhol", "dholak"],
    timeline: [],
    customFieldValues: {
      "audience-size": 800,
      "performance-duration-minutes": 240,
      "sound-system": true,
      "night-count": 3,
    },
    status: "published",
  },
  {
    id: "event-blue-note-showcase",
    hostId: "host-blue-note-club",
    venueId: "venue-blue-note-club",
    eventTypeId: "concert",
    title: "Blue Note Weekend Showcase",
    startsAt: "2026-09-12T20:00:00+05:30",
    endsAt: "2026-09-12T23:00:00+05:30",
    location: mockVenueProfiles[3].location,
    audienceSize: 260,
    budget: { maximum: { amount: 75_000, currency: "INR" } },
    languageIds: ["hindi", "english"],
    preferredGenreIds: ["rock", "fusion"],
    preferredInstrumentIds: ["vocals", "guitar", "drums"],
    dressCode: "Smart casual",
    theme: "Weekend rock showcase",
    timeline: clubTimeline("timeline-blue-note-showcase"),
    customFieldValues: {
      "audience-size": 260,
      "performance-duration-minutes": 120,
      "sound-system": true,
    },
    status: "published",
  },
  {
    id: "event-blue-note-autumn-sessions",
    hostId: "host-blue-note-club",
    venueId: "venue-blue-note-club",
    eventTypeId: "concert",
    title: "Blue Note Autumn Sessions",
    description:
      "An intimate folk-fusion headline night for the club's autumn programme.",
    startsAt: "2026-10-24T20:00:00+05:30",
    endsAt: "2026-10-24T23:00:00+05:30",
    location: mockVenueProfiles[3].location,
    audienceSize: 280,
    budget: {
      minimum: { amount: 55_000, currency: "INR" },
      maximum: { amount: 85_000, currency: "INR" },
    },
    languageIds: ["hindi", "english"],
    preferredGenreIds: ["fusion", "folk", "indie"],
    preferredInstrumentIds: ["vocals", "guitar", "tabla"],
    dressCode: "Smart casual",
    theme: "Autumn folk-fusion",
    specialRequirements: "Headline act requires a 30-minute sound check window.",
    timeline: clubTimeline("timeline-blue-note-autumn", "active"),
    customFieldValues: {
      "audience-size": 280,
      "performance-duration-minutes": 120,
      "sound-system": true,
    },
    status: "published",
  },
  {
    id: "event-blue-note-summer-finale",
    hostId: "host-blue-note-club",
    venueId: "venue-blue-note-club",
    eventTypeId: "concert",
    title: "Blue Note Summer Finale",
    description: "The closing live set of the summer club programme.",
    startsAt: "2026-06-27T20:00:00+05:30",
    endsAt: "2026-06-27T23:00:00+05:30",
    location: mockVenueProfiles[3].location,
    audienceSize: 290,
    budget: { maximum: { amount: 80_000, currency: "INR" } },
    languageIds: ["hindi", "english"],
    preferredGenreIds: ["rock", "fusion"],
    preferredInstrumentIds: ["vocals", "guitar", "drums"],
    timeline: clubTimeline("timeline-blue-note-summer", "completed"),
    customFieldValues: {
      "audience-size": 290,
      "performance-duration-minutes": 135,
      "sound-system": true,
    },
    status: "closed",
  },
  {
    id: "event-blue-note-rain-check",
    hostId: "host-blue-note-club",
    venueId: "venue-blue-note-club",
    eventTypeId: "concert",
    title: "Blue Note Rain Check",
    description: "A club showcase cancelled after severe weather disrupted travel.",
    startsAt: "2026-07-11T20:00:00+05:30",
    endsAt: "2026-07-11T23:00:00+05:30",
    location: mockVenueProfiles[3].location,
    audienceSize: 250,
    budget: { maximum: { amount: 72_000, currency: "INR" } },
    languageIds: ["hindi", "english"],
    preferredGenreIds: ["indie", "rock"],
    preferredInstrumentIds: ["vocals", "guitar", "drums"],
    timeline: clubTimeline("timeline-blue-note-rain", "delayed"),
    customFieldValues: {
      "audience-size": 250,
      "performance-duration-minutes": 120,
      "sound-system": true,
    },
    status: "cancelled",
  },
  {
    id: "event-blue-note-winter-lounge",
    hostId: "host-blue-note-club",
    venueId: "venue-blue-note-club",
    eventTypeId: "concert",
    title: "Blue Note Winter Lounge",
    description:
      "A draft acoustic lounge series still being scoped with the programming team.",
    startsAt: "2026-12-12T19:30:00+05:30",
    endsAt: "2026-12-12T22:30:00+05:30",
    location: mockVenueProfiles[3].location,
    audienceSize: 180,
    budget: {
      minimum: { amount: 40_000, currency: "INR" },
      maximum: { amount: 65_000, currency: "INR" },
    },
    languageIds: ["hindi", "english"],
    preferredGenreIds: ["jazz", "acoustic", "indie"],
    preferredInstrumentIds: ["vocals", "guitar"],
    dressCode: "Winter chic",
    theme: "Acoustic lounge",
    specialRequirements: "Prefer seated arrangements with low-volume monitoring.",
    timeline: clubTimeline("timeline-blue-note-winter"),
    customFieldValues: {
      "audience-size": 180,
      "performance-duration-minutes": 120,
      "sound-system": true,
    },
    status: "draft",
  },
  {
    id: "event-blue-note-retro-night",
    hostId: "host-blue-note-club",
    venueId: "venue-blue-note-club",
    eventTypeId: "private-party",
    title: "Blue Note Retro Night",
    description:
      "An archived members-only retro Bollywood night from the spring programme.",
    startsAt: "2026-04-18T20:00:00+05:30",
    endsAt: "2026-04-18T23:00:00+05:30",
    location: mockVenueProfiles[3].location,
    audienceSize: 220,
    budget: { maximum: { amount: 68_000, currency: "INR" } },
    languageIds: ["hindi", "english"],
    preferredGenreIds: ["bollywood", "retro"],
    preferredInstrumentIds: ["vocals", "guitar", "drums"],
    dressCode: "Retro glam",
    theme: "Bollywood classics",
    timeline: clubTimeline("timeline-blue-note-retro", "completed"),
    customFieldValues: {
      "audience-size": 220,
      "performance-duration-minutes": 150,
      "sound-system": true,
    },
    status: "archived",
  },
  {
    id: "event-banyan-anniversary",
    hostId: "host-banyan-table",
    venueId: "venue-banyan-table",
    eventTypeId: "private-party",
    title: "Banyan Table Anniversary",
    startsAt: "2026-07-18T19:30:00+05:30",
    endsAt: "2026-07-18T22:30:00+05:30",
    location: mockVenueProfiles[1].location,
    audienceSize: 110,
    budget: { maximum: { amount: 70_000, currency: "INR" } },
    languageIds: ["hindi", "english"],
    preferredGenreIds: ["acoustic", "indie", "bollywood"],
    preferredInstrumentIds: ["vocals", "guitar"],
    timeline: [],
    customFieldValues: {
      "audience-size": 110,
      "performance-duration-minutes": 120,
      "sound-system": true,
    },
    status: "closed",
  },
  {
    id: "event-konkani-monsoon",
    hostId: "host-konkani-tides",
    venueId: "venue-konkani-tides",
    eventTypeId: "concert",
    title: "Konkani Tides Monsoon Festival",
    startsAt: "2026-07-04T18:00:00+05:30",
    endsAt: "2026-07-04T22:00:00+05:30",
    location: mockVenueProfiles[2].location,
    audienceSize: 500,
    budget: { maximum: { amount: 95_000, currency: "INR" } },
    languageIds: ["hindi", "english", "konkani"],
    preferredGenreIds: ["fusion", "bollywood"],
    preferredInstrumentIds: ["vocals", "guitar", "drums"],
    timeline: [],
    customFieldValues: {
      "audience-size": 500,
      "performance-duration-minutes": 150,
      "sound-system": true,
    },
    status: "closed",
  },
  {
    id: "event-presidency-founders-day",
    hostId: "host-presidency-college",
    venueId: "venue-presidency-amphitheatre",
    eventTypeId: "concert",
    title: "Presidency Founders Day",
    startsAt: "2026-08-22T18:30:00+05:30",
    endsAt: "2026-08-22T22:00:00+05:30",
    location: mockVenueProfiles[6].location,
    audienceSize: 1_600,
    budget: { maximum: { amount: 105_000, currency: "INR" } },
    languageIds: ["english", "hindi", "tamil"],
    preferredGenreIds: ["rock", "indie"],
    preferredInstrumentIds: ["vocals", "guitar", "drums"],
    timeline: [],
    customFieldValues: {
      "audience-size": 1600,
      "performance-duration-minutes": 150,
      "sound-system": true,
    },
    status: "cancelled",
  },
];

export const mockApplications: readonly Application[] = [
  {
    id: "application-groove-navratri",
    eventId: "event-navratri-tech-park",
    performerId: "band-the-groove-collective",
    proposedPackageId: "band-the-groove-collective-celebration",
    quotedPrice: { amount: 84_000, currency: "INR" },
    message: "We propose an energetic folk-fusion set with a coordinated sound check.",
    status: "submitted",
    submittedAt: "2026-08-06T12:15:00+05:30",
    updatedAt: "2026-08-06T12:15:00+05:30",
  },
  {
    id: "application-groove-reception",
    eventId: "event-sharma-reception",
    performerId: "band-the-groove-collective",
    proposedPackageId: "band-the-groove-collective-celebration",
    quotedPrice: { amount: 110_000, currency: "INR" },
    message: "We propose a reception set with live requests and a dedicated sound check.",
    status: "accepted",
    submittedAt: "2026-08-02T11:20:00+05:30",
    updatedAt: "2026-08-04T16:00:00+05:30",
  },
  {
    id: "application-groove-showcase",
    eventId: "event-blue-note-showcase",
    performerId: "band-the-groove-collective",
    proposedPackageId: "band-the-groove-collective-essential",
    quotedPrice: { amount: 72_000, currency: "INR" },
    message: "A high-energy club set combining rock favourites and folk fusion.",
    status: "shortlisted",
    submittedAt: "2026-08-01T09:30:00+05:30",
    updatedAt: "2026-08-05T18:15:00+05:30",
  },
  {
    id: "application-groove-anniversary",
    eventId: "event-banyan-anniversary",
    performerId: "band-the-groove-collective",
    proposedPackageId: "band-the-groove-collective-essential",
    quotedPrice: { amount: 68_000, currency: "INR" },
    message: "A warm bilingual set designed for the restaurant's anniversary evening.",
    status: "rejected",
    submittedAt: "2026-06-20T13:00:00+05:30",
    updatedAt: "2026-06-23T11:45:00+05:30",
  },
  {
    id: "application-groove-monsoon",
    eventId: "event-konkani-monsoon",
    performerId: "band-the-groove-collective",
    proposedPackageId: "band-the-groove-collective-celebration",
    quotedPrice: { amount: 92_000, currency: "INR" },
    message: "An extended festival set with a dedicated production sound check.",
    status: "completed",
    submittedAt: "2026-05-02T10:10:00+05:30",
    updatedAt: "2026-07-04T23:30:00+05:30",
  },
  {
    id: "application-groove-founders-day",
    eventId: "event-presidency-founders-day",
    performerId: "band-the-groove-collective",
    proposedPackageId: "band-the-groove-collective-celebration",
    quotedPrice: { amount: 98_000, currency: "INR" },
    message: "A campus-scale rock and Bollywood set with audience requests.",
    status: "cancelled",
    submittedAt: "2026-06-12T15:20:00+05:30",
    updatedAt: "2026-07-30T12:00:00+05:30",
  },
  {
    id: "application-confluence-navratri",
    eventId: "event-navratri-tech-park",
    performerId: "band-confluence",
    proposedPackageId: "band-confluence-celebration",
    quotedPrice: { amount: 88_000, currency: "INR" },
    message: "Our folk-fusion arrangement can be expanded for three Navratri evenings.",
    status: "shortlisted",
    submittedAt: "2026-08-03T14:10:00+05:30",
    updatedAt: "2026-08-05T10:30:00+05:30",
  },
  {
    id: "application-confluence-showcase",
    eventId: "event-blue-note-showcase",
    performerId: "band-confluence",
    proposedPackageId: "band-confluence-essential",
    quotedPrice: { amount: 70_000, currency: "INR" },
    message: "A contemporary fusion set tailored for an intimate club audience.",
    status: "submitted",
    submittedAt: "2026-08-04T10:00:00+05:30",
    updatedAt: "2026-08-04T10:00:00+05:30",
  },
  {
    id: "application-confluence-autumn",
    eventId: "event-blue-note-autumn-sessions",
    performerId: "band-confluence",
    proposedPackageId: "band-confluence-celebration",
    quotedPrice: { amount: 82_000, currency: "INR" },
    message: "We can shape a two-set folk-fusion programme around the autumn theme.",
    status: "accepted",
    submittedAt: "2026-07-25T14:30:00+05:30",
    updatedAt: "2026-08-02T16:20:00+05:30",
  },
  {
    id: "application-groove-autumn",
    eventId: "event-blue-note-autumn-sessions",
    performerId: "band-the-groove-collective",
    proposedPackageId: "band-the-groove-collective-essential",
    quotedPrice: { amount: 78_000, currency: "INR" },
    message: "A flexible two-hour set combining folk hooks with club-ready arrangements.",
    status: "rejected",
    submittedAt: "2026-07-26T09:45:00+05:30",
    updatedAt: "2026-08-02T16:25:00+05:30",
  },
  {
    id: "application-groove-summer-finale",
    eventId: "event-blue-note-summer-finale",
    performerId: "band-the-groove-collective",
    proposedPackageId: "band-the-groove-collective-celebration",
    quotedPrice: { amount: 76_000, currency: "INR" },
    message: "A high-energy closing set with an encore planned for the club audience.",
    status: "completed",
    submittedAt: "2026-05-28T12:10:00+05:30",
    updatedAt: "2026-06-28T00:10:00+05:30",
  },
  {
    id: "application-confluence-rain-check",
    eventId: "event-blue-note-rain-check",
    performerId: "band-confluence",
    proposedPackageId: "band-confluence-essential",
    quotedPrice: { amount: 69_000, currency: "INR" },
    message: "A compact headline set with acoustic options for the club stage.",
    status: "cancelled",
    submittedAt: "2026-06-15T11:00:00+05:30",
    updatedAt: "2026-07-10T18:00:00+05:30",
  },
];

export const mockBookings: readonly Booking[] = [
  {
    id: "booking-groove-reception",
    eventId: "event-sharma-reception",
    performerId: "band-the-groove-collective",
    hostId: "host-sharma-family",
    applicationId: "application-groove-reception",
    packageId: "band-the-groove-collective-celebration",
    agreedPrice: { amount: 110_000, currency: "INR" },
    status: "advance-pending",
    requestedAt: "2026-08-04T16:05:00+05:30",
    updatedAt: "2026-08-04T16:30:00+05:30",
  },
  {
    id: "booking-groove-monsoon",
    eventId: "event-konkani-monsoon",
    performerId: "band-the-groove-collective",
    hostId: "host-konkani-tides",
    applicationId: "application-groove-monsoon",
    packageId: "band-the-groove-collective-celebration",
    agreedPrice: { amount: 92_000, currency: "INR" },
    status: "completed",
    requestedAt: "2026-05-10T12:00:00+05:30",
    updatedAt: "2026-07-04T23:30:00+05:30",
  },
  {
    id: "booking-groove-founders-day",
    eventId: "event-presidency-founders-day",
    performerId: "band-the-groove-collective",
    hostId: "host-presidency-college",
    applicationId: "application-groove-founders-day",
    packageId: "band-the-groove-collective-celebration",
    agreedPrice: { amount: 98_000, currency: "INR" },
    status: "cancelled",
    requestedAt: "2026-06-20T14:00:00+05:30",
    updatedAt: "2026-07-30T12:00:00+05:30",
    cancellationReason: "The host cancelled the event.",
  },
  {
    id: "booking-confluence-autumn",
    eventId: "event-blue-note-autumn-sessions",
    performerId: "band-confluence",
    hostId: "host-blue-note-club",
    applicationId: "application-confluence-autumn",
    packageId: "band-confluence-celebration",
    agreedPrice: { amount: 82_000, currency: "INR" },
    status: "confirmed",
    requestedAt: "2026-08-02T16:20:00+05:30",
    updatedAt: "2026-08-03T12:00:00+05:30",
  },
  {
    id: "booking-groove-summer-finale",
    eventId: "event-blue-note-summer-finale",
    performerId: "band-the-groove-collective",
    hostId: "host-blue-note-club",
    applicationId: "application-groove-summer-finale",
    packageId: "band-the-groove-collective-celebration",
    agreedPrice: { amount: 76_000, currency: "INR" },
    status: "completed",
    requestedAt: "2026-06-02T15:00:00+05:30",
    updatedAt: "2026-06-28T00:10:00+05:30",
  },
  {
    id: "booking-confluence-rain-check",
    eventId: "event-blue-note-rain-check",
    performerId: "band-confluence",
    hostId: "host-blue-note-club",
    applicationId: "application-confluence-rain-check",
    packageId: "band-confluence-essential",
    agreedPrice: { amount: 69_000, currency: "INR" },
    status: "cancelled",
    requestedAt: "2026-06-18T10:30:00+05:30",
    updatedAt: "2026-07-10T18:00:00+05:30",
    cancellationReason: "Severe weather disrupted artist travel.",
  },
];

export const mockReviews: readonly Review[] = [
  {
    id: "review-ananya-corporate",
    bookingId: "booking-ananya-corporate-2026",
    performerId: "artist-ananya-rao",
    reviewerId: "host-acme-india",
    rating: 5,
    title: "Polished and audience-aware",
    comment:
      "The set moved smoothly between Hindi and English and the planning was excellent.",
    createdAt: "2026-07-18T12:00:00+05:30",
    verifiedBooking: true,
    kind: "organizer",
    response: {
      comment: "Thank you — glad the bilingual set landed well with your guests.",
      createdAt: "2026-07-18T16:20:00+05:30",
    },
  },
  {
    id: "review-ananya-venue",
    bookingId: "booking-ananya-corporate-2026",
    performerId: "artist-ananya-rao",
    reviewerId: "venue-amber-palace-hotel",
    rating: 5,
    title: "Venue-ready professionalism",
    comment: "On-time sound check, tidy stage plot, and respectful green-room use.",
    createdAt: "2026-07-19T09:00:00+05:30",
    verifiedBooking: true,
    kind: "venue",
  },
  {
    id: "review-ananya-audience",
    bookingId: "booking-ananya-corporate-2026",
    performerId: "artist-ananya-rao",
    reviewerId: "guest-meera",
    rating: 4,
    title: "Guests stayed on the floor",
    comment: "Loved the Sufi-to-Bollywood arc. Photo moments were plentiful.",
    createdAt: "2026-07-19T11:30:00+05:30",
    verifiedBooking: false,
    kind: "audience",
    mediaKind: "photo",
    mediaUrl: "https://www.instagram.com/",
  },
  {
    id: "review-groove-photo",
    bookingId: "booking-groove-reception",
    performerId: "band-the-groove-collective",
    reviewerId: "host-sharma-family",
    rating: 5,
    title: "Reception energy was perfect",
    comment: "Photo and video from the dance floor capture how lively the room felt.",
    createdAt: "2026-08-03T20:00:00+05:30",
    verifiedBooking: true,
    kind: "photo",
    mediaKind: "photo",
    mediaUrl: "https://www.instagram.com/",
  },
  {
    id: "review-groove-video",
    bookingId: "booking-groove-reception",
    performerId: "band-the-groove-collective",
    reviewerId: "host-sharma-family",
    rating: 5,
    title: "Highlight reel quality",
    comment:
      "Organizers shared a short video review of the baraat-to-reception transition.",
    createdAt: "2026-08-04T10:15:00+05:30",
    verifiedBooking: true,
    kind: "video",
    mediaKind: "video",
    mediaUrl: "https://www.youtube.com/",
  },
];

export const mockPayments: readonly PaymentPlaceholder[] = [
  {
    id: "payment-groove-advance",
    bookingId: "booking-groove-reception",
    kind: "advance",
    amount: { amount: 33_000, currency: "INR" },
    status: "pending",
    dueAt: "2026-08-10T23:59:00+05:30",
  },
];

export const mockChatThreads: readonly ChatThread[] = [
  {
    id: "thread-groove-reception",
    bookingId: "booking-groove-reception",
    applicationId: "application-groove-reception",
    participants: [
      { userId: "host-sharma-family", role: "host" },
      { userId: "band-the-groove-collective", role: "performer" },
    ],
    messages: [
      {
        id: "message-groove-1",
        threadId: "thread-groove-reception",
        senderId: "host-sharma-family",
        body: "Please include a 20-minute baraat entry before the reception set.",
        sentAt: "2026-08-04T17:00:00+05:30",
        readBy: ["host-sharma-family", "band-the-groove-collective"],
      },
    ],
    updatedAt: "2026-08-04T17:00:00+05:30",
  },
];

export const mockCalendarEntries: readonly CalendarEntry[] = [
  {
    id: "calendar-groove-available",
    ownerType: "performer",
    ownerId: "band-the-groove-collective",
    title: "Open for enquiries",
    startsAt: "2026-09-04T10:00:00+05:30",
    endsAt: "2026-09-04T23:00:00+05:30",
    status: "available",
  },
  {
    id: "calendar-groove-tentative",
    ownerType: "performer",
    ownerId: "band-the-groove-collective",
    title: "Enquiry on hold",
    startsAt: "2026-09-05T18:00:00+05:30",
    endsAt: "2026-09-05T22:00:00+05:30",
    status: "tentative",
  },
  {
    id: "calendar-groove-blocked",
    ownerType: "performer",
    ownerId: "band-the-groove-collective",
    title: "Personal block",
    startsAt: "2026-09-07T00:00:00+05:30",
    endsAt: "2026-09-07T23:59:00+05:30",
    status: "blocked",
  },
  {
    id: "calendar-groove-holiday",
    ownerType: "performer",
    ownerId: "band-the-groove-collective",
    title: "Performer holiday",
    startsAt: "2026-09-06T00:00:00+05:30",
    endsAt: "2026-09-06T23:59:00+05:30",
    status: "holiday",
  },
  {
    id: "calendar-groove-travel",
    ownerType: "performer",
    ownerId: "band-the-groove-collective",
    title: "Tour travel day",
    startsAt: "2026-09-11T08:00:00+05:30",
    endsAt: "2026-09-11T20:00:00+05:30",
    status: "travel",
  },
  {
    id: "calendar-ananya-available",
    ownerType: "performer",
    ownerId: "artist-ananya-rao",
    title: "Open for enquiries",
    startsAt: "2026-09-12T10:00:00+05:30",
    endsAt: "2026-09-12T22:00:00+05:30",
    status: "available",
  },
  {
    id: "calendar-ananya-booked",
    ownerType: "performer",
    ownerId: "artist-ananya-rao",
    title: "Corporate gala",
    startsAt: "2026-09-13T18:00:00+05:30",
    endsAt: "2026-09-13T22:00:00+05:30",
    status: "booked",
  },
  {
    id: "calendar-ananya-blocked",
    ownerType: "performer",
    ownerId: "artist-ananya-rao",
    title: "Travel buffer",
    startsAt: "2026-09-14T00:00:00+05:30",
    endsAt: "2026-09-14T23:59:00+05:30",
    status: "blocked",
  },
  {
    id: "calendar-groove-reception",
    ownerType: "performer",
    ownerId: "band-the-groove-collective",
    title: "Sharma Family Reception",
    startsAt: "2026-11-21T19:00:00+05:30",
    endsAt: "2026-11-21T23:30:00+05:30",
    status: "booked",
    relatedBookingId: "booking-groove-reception",
  },
];
