import type { EventFieldDefinition, EventTypeDefinition } from "../types";

const audienceSize: EventFieldDefinition = {
  id: "audience-size",
  label: "Expected audience",
  type: "number",
  required: true,
  minimum: 1,
};

const performanceDuration: EventFieldDefinition = {
  id: "performance-duration-minutes",
  label: "Performance duration (minutes)",
  type: "number",
  required: true,
  minimum: 30,
  maximum: 480,
};

const soundSystem: EventFieldDefinition = {
  id: "sound-system",
  label: "Sound system available",
  type: "boolean",
  required: true,
};

function defineEventType(definition: EventTypeDefinition): EventTypeDefinition {
  return definition;
}

export const eventTypes = [
  defineEventType({
    id: "wedding",
    label: "Wedding",
    description: "Ceremonies, baraats and wedding-day celebrations.",
    performerCategoryIds: ["band", "traditional-group", "vocalist", "instrumentalist"],
    suggestedGenreIds: ["bollywood", "classical", "folk", "bhangra"],
    fields: [
      audienceSize,
      performanceDuration,
      soundSystem,
      {
        id: "ceremony",
        label: "Ceremony",
        type: "multi-select",
        required: true,
        options: ["Baraat", "Jaimala", "Pheras", "Vidaai"],
      },
    ],
  }),
  defineEventType({
    id: "reception",
    label: "Reception",
    description: "Evening wedding receptions and cocktail celebrations.",
    performerCategoryIds: ["band", "dj", "vocalist", "instrumentalist"],
    suggestedGenreIds: ["bollywood", "jazz", "fusion"],
    fields: [audienceSize, performanceDuration, soundSystem],
  }),
  defineEventType({
    id: "corporate",
    label: "Corporate Event",
    description: "Conferences, launches, award nights and office celebrations.",
    performerCategoryIds: ["band", "dj", "instrumentalist"],
    suggestedGenreIds: ["jazz", "instrumental", "fusion"],
    fields: [
      audienceSize,
      performanceDuration,
      soundSystem,
      {
        id: "brand-guidelines",
        label: "Brand or content guidelines",
        type: "textarea",
        required: false,
      },
    ],
  }),
  defineEventType({
    id: "birthday",
    label: "Birthday",
    description: "Milestone birthdays and family celebrations.",
    performerCategoryIds: ["band", "dj", "vocalist"],
    suggestedGenreIds: ["bollywood", "rock", "edm"],
    fields: [audienceSize, performanceDuration, soundSystem],
  }),
  defineEventType({
    id: "cafe",
    label: "Cafe",
    description: "Intimate cafe sets and recurring live-music evenings.",
    performerCategoryIds: ["vocalist", "instrumentalist", "band"],
    suggestedGenreIds: ["acoustic", "jazz", "indie"],
    fields: [audienceSize, performanceDuration, soundSystem],
  }),
  defineEventType({
    id: "hotel",
    label: "Hotel",
    description: "Hotel dining, lobby, brunch and guest entertainment.",
    performerCategoryIds: ["instrumentalist", "vocalist", "band"],
    suggestedGenreIds: ["instrumental", "jazz", "classical"],
    fields: [audienceSize, performanceDuration, soundSystem],
  }),
  defineEventType({
    id: "concert",
    label: "Concert",
    description: "Ticketed concerts, festivals and large public performances.",
    performerCategoryIds: ["band", "vocalist", "traditional-group"],
    suggestedGenreIds: ["rock", "indie", "folk", "fusion"],
    fields: [audienceSize, performanceDuration, soundSystem],
  }),
  defineEventType({
    id: "temple",
    label: "Temple",
    description: "Temple festivals, devotional programs and processions.",
    performerCategoryIds: ["devotional", "traditional-group", "instrumentalist"],
    suggestedGenreIds: ["bhajan", "classical", "folk"],
    fields: [audienceSize, performanceDuration, soundSystem],
  }),
  defineEventType({
    id: "garba",
    label: "Garba",
    description: "Community and private garba celebrations.",
    performerCategoryIds: ["band", "traditional-group", "dance-group"],
    suggestedGenreIds: ["garba", "folk"],
    fields: [audienceSize, performanceDuration, soundSystem],
  }),
  defineEventType({
    id: "navratri",
    label: "Navratri",
    description: "Multi-night Navratri and dandiya programs.",
    performerCategoryIds: ["band", "traditional-group", "dance-group"],
    suggestedGenreIds: ["garba", "folk", "fusion"],
    fields: [
      audienceSize,
      performanceDuration,
      soundSystem,
      {
        id: "night-count",
        label: "Number of nights",
        type: "number",
        required: true,
        minimum: 1,
        maximum: 9,
      },
    ],
  }),
  defineEventType({
    id: "private-party",
    label: "Private Party",
    description: "House parties, anniversaries and invitation-only gatherings.",
    performerCategoryIds: ["band", "dj", "vocalist", "instrumentalist"],
    suggestedGenreIds: ["bollywood", "jazz", "acoustic", "edm"],
    fields: [audienceSize, performanceDuration, soundSystem],
  }),
] as const satisfies readonly EventTypeDefinition[];

export type BuiltInEventTypeId = (typeof eventTypes)[number]["id"];

export const eventTypeRegistry: Readonly<
  Record<BuiltInEventTypeId, EventTypeDefinition>
> = Object.fromEntries(
  eventTypes.map((eventType) => [eventType.id, eventType]),
) as Record<BuiltInEventTypeId, EventTypeDefinition>;

export function createEventTypeRegistry(
  extensions: readonly EventTypeDefinition[] = [],
): ReadonlyMap<string, EventTypeDefinition> {
  return new Map(
    [...eventTypes, ...extensions].map((eventType) => [eventType.id, eventType]),
  );
}
