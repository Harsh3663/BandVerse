import { resolveMarketplaceCity } from "./config/discovery";
import { mockVenueProfiles } from "./mock-data";
import type {
  EntityId,
  ISODate,
  ISODateTime,
  MarketplaceEvent,
  MarketplaceEventInput,
  MarketplaceEventTimelineItem,
  MarketplaceEventStatus,
} from "./types";

export const eventTimelineKinds = [
  { id: "setup", label: "Setup" },
  { id: "sound-check", label: "Sound Check" },
  { id: "artist-arrival", label: "Artist Arrival" },
  { id: "performance", label: "Performance" },
  { id: "break", label: "Break" },
  { id: "closing", label: "Closing" },
  { id: "custom", label: "Custom" },
] as const;

const timelineKindLabels = Object.fromEntries(
  eventTimelineKinds.map(({ id, label }) => [id, label]),
) as Record<MarketplaceEventTimelineItem["kind"], string>;

export function timelineKindLabel(kind: MarketplaceEventTimelineItem["kind"]): string {
  return timelineKindLabels[kind];
}

export function createTimelineItemId(): EntityId {
  return `timeline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEventId(title: string): EntityId {
  const slug = title
    .trim()
    .toLocaleLowerCase("en-IN")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  return `event-${slug || "untitled"}-${Date.now().toString(36)}`;
}

export function combineDateAndTime(date: ISODate, time: string): ISODateTime {
  return `${date}T${time}:00+05:30`;
}

export function extractEventDate(value: ISODateTime): ISODate {
  return value.slice(0, 10);
}

export function extractEventTime(value: ISODateTime): string {
  const match = value.match(/T(\d{2}:\d{2})/);
  return match?.[1] ?? "20:00";
}

export function defaultEventTimeline(): readonly MarketplaceEventTimelineItem[] {
  return [
    {
      id: createTimelineItemId(),
      label: "Setup",
      kind: "setup",
      startTime: "17:00",
      endTime: "18:30",
      status: "pending",
    },
    {
      id: createTimelineItemId(),
      label: "Sound Check",
      kind: "sound-check",
      startTime: "18:30",
      endTime: "19:15",
      status: "pending",
    },
    {
      id: createTimelineItemId(),
      label: "Artist Arrival",
      kind: "artist-arrival",
      startTime: "19:00",
      endTime: "19:30",
      status: "pending",
    },
    {
      id: createTimelineItemId(),
      label: "Performance",
      kind: "performance",
      startTime: "20:00",
      endTime: "22:30",
      status: "pending",
    },
    {
      id: createTimelineItemId(),
      label: "Closing",
      kind: "closing",
      startTime: "22:30",
      status: "pending",
    },
  ];
}

function resolveLocation(city: string, venueId?: EntityId) {
  if (venueId) {
    const venue = mockVenueProfiles.find((item) => item.id === venueId);
    if (venue) return venue.location;
  }
  const resolved = resolveMarketplaceCity(city);
  return {
    city,
    state: resolved?.state ?? city,
    countryCode: "IN" as const,
    coordinates: resolved?.coordinates,
  };
}

export function buildEventFromInput(
  input: MarketplaceEventInput,
  hostId: EntityId,
  existing?: MarketplaceEvent,
): MarketplaceEvent {
  const location = resolveLocation(input.city, input.venueId);
  const minimum =
    input.budgetMinimum && input.budgetMinimum > 0
      ? { amount: input.budgetMinimum, currency: "INR" as const }
      : undefined;

  return {
    id: existing?.id ?? createEventId(input.title),
    hostId,
    venueId: input.venueId,
    eventTypeId: input.eventTypeId,
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    startsAt: combineDateAndTime(input.eventDate, input.startTime),
    endsAt: combineDateAndTime(input.eventDate, input.endTime),
    location,
    audienceSize: input.audienceSize,
    budget: {
      minimum,
      maximum: { amount: input.budgetMaximum, currency: "INR" },
    },
    dressCode: input.dressCode?.trim() || undefined,
    theme: input.theme?.trim() || undefined,
    languageIds: input.languageIds,
    preferredGenreIds: input.preferredGenreIds,
    preferredInstrumentIds: existing?.preferredInstrumentIds ?? [],
    specialRequirements: input.specialRequirements?.trim() || undefined,
    timeline: input.timeline,
    customFieldValues: {
      ...(existing?.customFieldValues ?? {}),
      "audience-size": input.audienceSize ?? 0,
      "performance-duration-minutes": durationMinutes(input.startTime, input.endTime),
      "sound-system": true,
    },
    status: input.status,
  };
}

export function eventToFormInput(event: MarketplaceEvent): MarketplaceEventInput {
  return {
    title: event.title,
    eventTypeId: event.eventTypeId,
    eventDate: extractEventDate(event.startsAt),
    startTime: extractEventTime(event.startsAt),
    endTime: extractEventTime(event.endsAt),
    venueId: event.venueId,
    city: event.location.city,
    budgetMinimum: event.budget.minimum?.amount,
    budgetMaximum: event.budget.maximum.amount,
    audienceSize: event.audienceSize,
    dressCode: event.dressCode,
    theme: event.theme,
    languageIds: [...event.languageIds],
    preferredGenreIds: [...event.preferredGenreIds],
    specialRequirements: event.specialRequirements,
    timeline: event.timeline.length ? [...event.timeline] : defaultEventTimeline(),
    status: event.status,
    description: event.description,
  };
}

export function duplicateEventInput(event: MarketplaceEvent): MarketplaceEventInput {
  const input = eventToFormInput(event);
  return {
    ...input,
    title: `${event.title} (Copy)`,
    status: "draft",
    timeline: input.timeline.map((item) => ({
      ...item,
      id: createTimelineItemId(),
      status: "pending" as const,
    })),
  };
}

export function eventStatusBadgeVariant(
  status: MarketplaceEventStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "published":
      return "default";
    case "draft":
    case "archived":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

function durationMinutes(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  const start = startHours * 60 + startMinutes;
  const end = endHours * 60 + endMinutes;
  return Math.max(30, end - start);
}
