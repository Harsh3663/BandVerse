import type {
  PerformanceHistoryItem,
  PortfolioMediaItem,
  PerformerVerification,
  SocialProofMetrics,
  VideoEventFilter,
} from "./types";

const eventFilters: readonly VideoEventFilter[] = [
  "wedding",
  "corporate",
  "cafe",
  "festival",
  "temple",
  "club",
  "luxury",
];

export function buildPortfolioMedia(input: {
  performerId: string;
  displayName: string;
  handle: string;
  imageSrc: string;
  index: number;
}): readonly PortfolioMediaItem[] {
  const { performerId, displayName, handle, imageSrc, index } = input;
  const baseViews = 1_200 + index * 340;
  const uploaded = (offsetDays: number) => {
    const date = new Date(Date.UTC(2026, 0, 12 + ((index + offsetDays) % 120)));
    return date.toISOString().slice(0, 10);
  };

  const videos: PortfolioMediaItem[] = eventFilters.map((filter, filterIndex) => ({
    id: `${performerId}-video-${filter}`,
    title: `${displayName} · ${titleCase(filter)} set`,
    type: filterIndex % 3 === 0 ? "short" : "video",
    category: filterIndex % 3 === 0 ? "shorts" : "performance",
    thumbnail: imageSrc,
    source: `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `${displayName} ${filter} live`,
    )}`,
    duration: filterIndex % 3 === 0 ? 38 + filterIndex * 4 : 140 + filterIndex * 18,
    uploadedAt: uploaded(filterIndex * 7),
    featured: filterIndex === index % eventFilters.length,
    views: baseViews + filterIndex * 520,
    likes: 80 + filterIndex * 27 + index * 5,
    description: `Highlight reel from a ${filter} performance by ${displayName}.`,
    eventFilter: filter,
    provider: filterIndex % 2 === 0 ? "youtube" : "instagram-reel",
  }));

  const images: PortfolioMediaItem[] = [
    {
      id: `${performerId}-img-stage`,
      title: `${displayName} on stage`,
      type: "image",
      category: "stage-photos",
      thumbnail: imageSrc,
      source: imageSrc,
      uploadedAt: uploaded(2),
      featured: true,
      views: baseViews + 90,
      likes: 64 + index * 3,
      description: `Stage photograph from a recent live show.`,
    },
    {
      id: `${performerId}-img-highlight`,
      title: `${displayName} event highlight`,
      type: "image",
      category: "event-highlights",
      thumbnail: imageSrc,
      source: imageSrc,
      uploadedAt: uploaded(11),
      featured: false,
      views: baseViews + 40,
      likes: 41 + index * 2,
      description: `Moment captured during a booked event.`,
    },
    {
      id: `${performerId}-img-bts`,
      title: `${displayName} behind the scenes`,
      type: "image",
      category: "behind-the-scenes",
      thumbnail: imageSrc,
      source: imageSrc,
      uploadedAt: uploaded(19),
      featured: false,
      views: baseViews + 20,
      likes: 28 + index,
      description: `Sound check and prep before the doors opened.`,
    },
  ];

  const audio: PortfolioMediaItem[] = [
    {
      id: `${performerId}-audio-original`,
      title: `${displayName} · Original`,
      type: "audio",
      category: "original",
      thumbnail: imageSrc,
      source: `https://open.spotify.com/search/${encodeURIComponent(displayName)}`,
      duration: 214,
      uploadedAt: uploaded(4),
      featured: true,
      views: baseViews + 210,
      likes: 95 + index * 4,
      description: "Original composition sample for booking references.",
      audioKind: "original",
      provider: "spotify",
    },
    {
      id: `${performerId}-audio-cover`,
      title: `${displayName} · Cover set`,
      type: "audio",
      category: "cover",
      thumbnail: imageSrc,
      source: `https://open.spotify.com/search/${encodeURIComponent(`${displayName} cover`)}`,
      duration: 198,
      uploadedAt: uploaded(14),
      featured: false,
      views: baseViews + 160,
      likes: 72 + index * 3,
      description: "Popular cover arrangement suited for receptions and cafes.",
      audioKind: "cover",
      provider: "spotify",
    },
    {
      id: `${performerId}-audio-demo`,
      title: `${displayName} · Instrument demo`,
      type: "audio",
      category: "instrument-demo",
      thumbnail: imageSrc,
      source: `https://soundcloud.com/search?q=${encodeURIComponent(displayName)}`,
      duration: 126,
      uploadedAt: uploaded(22),
      featured: false,
      views: baseViews + 70,
      likes: 39 + index * 2,
      description: "Tone and technique demo for organizers evaluating fit.",
      audioKind: "instrument-demo",
      provider: "soundcloud",
    },
    {
      id: `${performerId}-audio-practice`,
      title: `${displayName} · Practice session`,
      type: "audio",
      category: "practice",
      thumbnail: imageSrc,
      source: `https://soundcloud.com/search?q=${encodeURIComponent(`${displayName} rehearsal`)}`,
      duration: 312,
      uploadedAt: uploaded(28),
      featured: false,
      views: baseViews + 35,
      likes: 22 + index,
      description: "Rehearsal take shared for repertoire transparency.",
      audioKind: "practice",
      provider: "soundcloud",
    },
    {
      id: `${performerId}-audio-live`,
      title: `${displayName} · Live recording`,
      type: "audio",
      category: "live-recording",
      thumbnail: imageSrc,
      source: `https://open.spotify.com/search/${encodeURIComponent(`${displayName} live`)}`,
      duration: 245,
      uploadedAt: uploaded(33),
      featured: index % 2 === 0,
      views: baseViews + 300,
      likes: 110 + index * 5,
      description: "Audience-mic live recording from a recent booking.",
      audioKind: "live-recording",
      provider: "spotify",
    },
  ];

  const pdf: PortfolioMediaItem = {
    id: `${performerId}-pdf-repertoire`,
    title: `${displayName} repertoire list`,
    type: "pdf",
    category: "repertoire",
    thumbnail: imageSrc,
    source: `https://www.google.com/search?q=${encodeURIComponent(
      `${displayName} repertoire pdf`,
    )}`,
    uploadedAt: uploaded(8),
    featured: false,
    views: baseViews + 15,
    likes: 12 + index,
    description: `Downloadable repertoire PDF for ${handle}.`,
    provider: "external",
  };

  return [...videos, ...images, ...audio, pdf];
}

export function buildPerformanceHistory(input: {
  performerId: string;
  displayName: string;
  city: string;
  index: number;
  media: readonly PortfolioMediaItem[];
}): readonly PerformanceHistoryItem[] {
  const venues = [
    "Amber Palace Hotel",
    "The Banyan Table",
    "Konkani Tides Resort",
    "Blue Note Club",
    "City Cultural Centre",
  ];
  const photoIds = input.media
    .filter((item) => item.type === "image")
    .slice(0, 2)
    .map((item) => item.id);
  const videoIds = input.media
    .filter((item) => item.type === "video" || item.type === "short")
    .slice(0, 2)
    .map((item) => item.id);

  return Array.from({ length: 3 }, (_, historyIndex) => {
    const venue = venues[(input.index + historyIndex) % venues.length];
    const month = 2 + historyIndex * 2;
    return {
      id: `${input.performerId}-history-${historyIndex + 1}`,
      title: `${input.displayName} at ${venue}`,
      venue,
      city: input.city,
      audienceSize: 120 + historyIndex * 90 + input.index * 15,
      performedOn: `2026-${String(month).padStart(2, "0")}-${String(8 + historyIndex * 3).padStart(2, "0")}`,
      photoIds,
      videoIds,
      organizerReview:
        historyIndex === 0
          ? "Professional coordination and a memorable set for our guests."
          : undefined,
      rating: (5 - (historyIndex % 2)) as 1 | 2 | 3 | 4 | 5,
    };
  });
}

export function buildSocialProof(input: {
  years: number;
  completedEvents?: number;
  responseTimeMinutes?: number;
  index: number;
}): SocialProofMetrics {
  const completed = input.completedEvents ?? 24 + input.index * 3;
  return {
    followers: 2_400 + input.index * 680,
    repeatBookings: Math.max(3, Math.round(completed * 0.28)),
    responseRatePercent:
      input.responseTimeMinutes && input.responseTimeMinutes <= 60 ? 98 : 92,
    bookingSuccessPercent: 86 + (input.index % 8),
    completionRatePercent: 94 + (input.index % 5),
    yearsOfExperience: input.years,
  };
}

export function buildVerification(input: {
  verified: boolean;
  index: number;
}): PerformerVerification {
  const channels = [
    ...(input.verified ? (["verified-performer", "government-id"] as const) : []),
    "phone",
    "email",
    "social",
    ...(input.index % 2 === 0 ? (["gst", "business"] as const) : []),
    ...(input.index % 3 === 0 ? (["bank"] as const) : []),
  ] as const;

  return {
    channels: [...new Set(channels)],
    verifiedPerformer: input.verified,
  };
}

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
