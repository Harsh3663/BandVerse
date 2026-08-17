import type { Coordinates, ISODate, PerformerProfile, Weekday } from "./types";

export interface PerformerQuery {
  instrumentIds?: readonly string[];
  categoryIds?: readonly string[];
  city?: string;
  minimumBudget?: number;
  maximumBudget?: number;
  languageIds?: readonly string[];
  genreIds?: readonly string[];
  availableOn?: ISODate;
  minimumRating?: number;
  origin?: Coordinates;
  maximumDistanceKm?: number;
  eventTypeId?: string;
}

const weekdays: readonly Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const normalize = (value: string) => value.trim().toLocaleLowerCase("en-IN");

function overlaps(values: readonly string[], requested?: readonly string[]): boolean {
  if (!requested?.length) return true;
  const normalized = new Set(values.map(normalize));
  return requested.some((value) => normalized.has(normalize(value)));
}

export function isPerformerAvailableOn(
  profile: PerformerProfile,
  date: ISODate,
): boolean {
  const calendar = profile.availability;
  if (calendar.blockedDates.includes(date)) return false;
  if (calendar.availableDates?.includes(date)) return true;

  const parsedDate = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsedDate.valueOf())) return false;

  const weekday = weekdays[parsedDate.getUTCDay()];
  return calendar.weekly.some(
    (slot) => slot.weekday === weekday && slot.ranges.length > 0,
  );
}

export function distanceInKm(from: Coordinates, to: Coordinates): number {
  const earthRadiusKm = 6_371;
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const originLatitude = radians(from.latitude);
  const destinationLatitude = radians(to.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function matchesPerformerQuery(
  profile: PerformerProfile,
  query: PerformerQuery,
): boolean {
  if (!overlaps(profile.instrumentIds, query.instrumentIds)) return false;
  if (!overlaps(profile.categoryIds, query.categoryIds)) return false;
  if (!overlaps(profile.languageIds, query.languageIds)) return false;
  if (!overlaps(profile.genreIds, query.genreIds)) return false;

  if (
    query.city &&
    normalize(profile.travel.baseLocation.city) !== normalize(query.city)
  ) {
    return false;
  }

  const prices = profile.pricingPackages.map(
    (pricingPackage) => pricingPackage.price.amount,
  );
  const minimumBudget = query.minimumBudget ?? Number.NEGATIVE_INFINITY;
  const maximumBudget = query.maximumBudget ?? Number.POSITIVE_INFINITY;
  if (!prices.some((price) => price >= minimumBudget && price <= maximumBudget)) {
    return false;
  }

  if (query.availableOn && !isPerformerAvailableOn(profile, query.availableOn)) {
    return false;
  }
  if (query.minimumRating !== undefined && profile.rating.average < query.minimumRating) {
    return false;
  }
  if (query.eventTypeId) {
    const requestedEventTypeId = normalize(query.eventTypeId);
    if (
      !profile.supportedEventTypeIds.some(
        (eventTypeId) => normalize(eventTypeId) === requestedEventTypeId,
      )
    ) {
      return false;
    }
  }

  if (query.maximumDistanceKm !== undefined) {
    const performerCoordinates = profile.travel.baseLocation.coordinates;
    if (!query.origin || !performerCoordinates) return false;
    if (distanceInKm(query.origin, performerCoordinates) > query.maximumDistanceKm) {
      return false;
    }
  }

  return true;
}

export function filterPerformers(
  profiles: readonly PerformerProfile[],
  query: PerformerQuery,
): PerformerProfile[] {
  return profiles.filter((profile) => matchesPerformerQuery(profile, query));
}
