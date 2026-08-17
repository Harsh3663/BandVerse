import { discoveryPerformers, type DiscoveryPerformer } from "@/data/discovery";
import { matchesSearch, slugify } from "@/lib/discovery";
import {
  eventTypes,
  genres,
  instruments,
  languages,
  maximumDistanceOptions,
  minimumRatingOptions,
  mockPerformerProfiles,
  performerCategories,
  performerKinds,
  resolveMarketplaceCity,
  resolveTaxonomyId,
  matchesPerformerQuery,
  type PerformerKind,
  type PerformerQuery,
} from "@/modules/marketplace";

export const searchSortOptions = [
  { label: "Best match", value: "relevance" },
  { label: "Highest rated", value: "rating" },
  { label: "Price: low to high", value: "price-low" },
  { label: "Price: high to low", value: "price-high" },
  { label: "Name: A to Z", value: "name" },
] as const;

export type SearchSort = (typeof searchSortOptions)[number]["value"];

export interface SearchQuery {
  q: string;
  city: string;
  category: string;
  kind: PerformerKind | "";
  sort: SearchSort;
  instrument: string;
  minimumBudget?: number;
  maximumBudget?: number;
  language: string;
  genre: string;
  availableOn: string;
  minimumRating?: number;
  maximumDistanceKm?: number;
  eventType: string;
}

export type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function configuredId(
  value: string | string[] | undefined,
  options: Parameters<typeof resolveTaxonomyId>[1],
): string {
  return resolveTaxonomyId(first(value), options) ?? "";
}

function nonNegativeNumber(value: string | string[] | undefined): number | undefined {
  const raw = first(value).trim();
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function configuredNumber(
  value: string | string[] | undefined,
  options: readonly { value: number }[],
): number | undefined {
  const parsed = nonNegativeNumber(value);
  return options.some((option) => option.value === parsed) ? parsed : undefined;
}

function isoDate(value: string | string[] | undefined): string {
  const date = first(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  const parsed = new Date(`${date}T12:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(date)
    ? date
    : "";
}

function performerKind(value: string | string[] | undefined): PerformerKind | "" {
  const raw = first(value).trim().toLocaleLowerCase("en-IN");
  const legacy =
    raw === "artist" ? "solo" : raw === "traditional" ? "traditional-group" : raw;
  return performerKinds.some((option) => option.id === legacy)
    ? (legacy as PerformerKind)
    : "";
}

const legacyCategories = [
  "solo-artists",
  "bands",
  "djs",
  "dhol-tasha",
  "banjo",
  "folk",
  "folk-artists",
  "wedding-bands",
] as const;

function category(value: string | string[] | undefined): string {
  const raw = slugify(first(value));
  return (
    resolveTaxonomyId(raw, performerCategories) ??
    (legacyCategories.some((candidate) => candidate === raw) ? raw : "")
  );
}

export function parseSearchQuery(params: SearchParams): SearchQuery {
  const sort = first(params.sort);
  const city = resolveMarketplaceCity(first(params.city) || first(params.location));
  let minimumBudget = nonNegativeNumber(params.minimumBudget ?? params.minBudget);
  let maximumBudget = nonNegativeNumber(params.maximumBudget ?? params.maxBudget);
  if (
    minimumBudget !== undefined &&
    maximumBudget !== undefined &&
    minimumBudget > maximumBudget
  ) {
    [minimumBudget, maximumBudget] = [maximumBudget, minimumBudget];
  }
  const maximumDistanceKm = city
    ? configuredNumber(
        params.maximumDistanceKm ?? params.maxDistance,
        maximumDistanceOptions,
      )
    : undefined;

  return {
    q: first(params.q).trim(),
    city: city?.label ?? "",
    category: category(params.category),
    kind: performerKind(params.kind),
    sort: searchSortOptions.some((option) => option.value === sort)
      ? (sort as SearchSort)
      : "relevance",
    instrument: configuredId(params.instrument, instruments),
    minimumBudget,
    maximumBudget,
    language: configuredId(params.language, languages),
    genre: configuredId(params.genre, genres),
    availableOn: isoDate(params.availableOn ?? params.availabilityDate),
    minimumRating: configuredNumber(
      params.minimumRating ?? params.minRating,
      minimumRatingOptions,
    ),
    maximumDistanceKm,
    eventType: eventTypes.some((eventType) => eventType.id === first(params.eventType))
      ? first(params.eventType)
      : "",
  };
}

export function performerMatchesCategory(
  performer: DiscoveryPerformer,
  category: string,
): boolean {
  const wanted = slugify(category);
  if (!wanted) return true;

  const performerCategory = slugify(performer.category);
  const tags = performer.tags.map(slugify);

  if (wanted === "solo-artists") return performer.kind === "artist";
  if (wanted === "bands") return performer.kind === "band";
  if (wanted === "djs") return performerCategory === "dj";
  if (wanted === "dhol-tasha") return performerCategory.includes("dhol-tasha");
  if (wanted === "banjo") return performerCategory.includes("banjo");
  if (wanted === "folk" || wanted === "folk-artists")
    return performerCategory.includes("folk") || tags.some((tag) => tag.includes("folk"));
  if (wanted === "wedding-bands")
    return (
      performerCategory.includes("wedding") || tags.some((tag) => tag.includes("wedding"))
    );

  return (
    performerCategory === wanted ||
    performerCategory.includes(wanted) ||
    tags.some((tag) => tag === wanted || tag.includes(wanted))
  );
}

export function filterPerformers(
  query: SearchQuery,
  performers: readonly DiscoveryPerformer[] = discoveryPerformers,
): DiscoveryPerformer[] {
  const city = resolveMarketplaceCity(query.city);
  const configuredCategory = resolveTaxonomyId(query.category, performerCategories);
  const marketplaceQuery: PerformerQuery = {
    instrumentIds: query.instrument ? [query.instrument] : undefined,
    categoryIds: configuredCategory ? [configuredCategory] : undefined,
    city: query.maximumDistanceKm === undefined ? query.city || undefined : undefined,
    minimumBudget: query.minimumBudget,
    maximumBudget: query.maximumBudget,
    languageIds: query.language ? [query.language] : undefined,
    genreIds: query.genre ? [query.genre] : undefined,
    availableOn: query.availableOn || undefined,
    minimumRating: query.minimumRating,
    origin: city?.coordinates,
    maximumDistanceKm:
      city && query.maximumDistanceKm !== undefined ? query.maximumDistanceKm : undefined,
    eventTypeId: query.eventType || undefined,
  };
  const profiles = new Map(mockPerformerProfiles.map((profile) => [profile.id, profile]));

  const results = performers.filter((performer) => {
    const profile = profiles.get(performer.id);
    return (
      profile !== undefined &&
      matchesSearch(query.q, [
        performer.name,
        performer.category,
        performer.location,
        performer.tags,
        profile.headline,
        profile.genreIds,
        profile.instrumentIds,
        profile.languageIds,
      ]) &&
      (configuredCategory !== undefined ||
        !query.category ||
        performerMatchesCategory(performer, query.category)) &&
      (!query.kind || profile.kind === query.kind) &&
      matchesPerformerQuery(profile, marketplaceQuery)
    );
  });

  return [...results].sort((a, b) => {
    switch (query.sort) {
      case "rating":
        return b.rating - a.rating || a.name.localeCompare(b.name);
      case "price-low":
        return a.startingPrice - b.startingPrice || a.name.localeCompare(b.name);
      case "price-high":
        return b.startingPrice - a.startingPrice || a.name.localeCompare(b.name);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
}

export function hasActiveSearch(query: SearchQuery): boolean {
  return Boolean(
    query.q ||
    query.city ||
    query.category ||
    query.kind ||
    query.sort !== "relevance" ||
    query.instrument ||
    query.minimumBudget !== undefined ||
    query.maximumBudget !== undefined ||
    query.language ||
    query.genre ||
    query.availableOn ||
    query.minimumRating !== undefined ||
    query.maximumDistanceKm !== undefined ||
    query.eventType,
  );
}

function optionLabel(
  id: string,
  options: readonly { id: string; label: string }[],
): string | undefined {
  return options.find((option) => option.id === id)?.label;
}

export function activeSearchFilters(query: SearchQuery): string[] {
  const labels: string[] = [];
  if (query.q) labels.push(`Search: “${query.q}”`);
  if (query.city)
    labels.push(
      query.maximumDistanceKm === undefined
        ? `City: ${query.city}`
        : `Origin: ${query.city}`,
    );
  if (query.category)
    labels.push(
      `Category: ${optionLabel(query.category, performerCategories) ?? query.category}`,
    );
  if (query.kind)
    labels.push(`Performer: ${optionLabel(query.kind, performerKinds) ?? query.kind}`);
  if (query.instrument)
    labels.push(`Instrument: ${optionLabel(query.instrument, instruments)}`);
  if (query.minimumBudget !== undefined)
    labels.push(`Budget from ₹${query.minimumBudget.toLocaleString("en-IN")}`);
  if (query.maximumBudget !== undefined)
    labels.push(`Budget to ₹${query.maximumBudget.toLocaleString("en-IN")}`);
  if (query.language) labels.push(`Language: ${optionLabel(query.language, languages)}`);
  if (query.genre) labels.push(`Genre: ${optionLabel(query.genre, genres)}`);
  if (query.availableOn) labels.push(`Available: ${query.availableOn}`);
  if (query.minimumRating !== undefined)
    labels.push(`Rating: ${query.minimumRating}+ stars`);
  if (query.maximumDistanceKm !== undefined && query.city)
    labels.push(`Distance: ${query.maximumDistanceKm} km`);
  if (query.eventType)
    labels.push(
      `Event: ${eventTypes.find((item) => item.id === query.eventType)?.label}`,
    );
  if (query.sort !== "relevance")
    labels.push(
      `Sort: ${searchSortOptions.find((item) => item.value === query.sort)?.label}`,
    );
  return labels;
}
