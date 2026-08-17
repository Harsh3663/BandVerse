import type { Coordinates } from "../types";

export interface MarketplaceCity {
  id: string;
  label: string;
  state: string;
  coordinates: Coordinates;
}

export const marketplaceCities = [
  {
    id: "mumbai",
    label: "Mumbai",
    state: "Maharashtra",
    coordinates: { latitude: 19.076, longitude: 72.8777 },
  },
  {
    id: "pune",
    label: "Pune",
    state: "Maharashtra",
    coordinates: { latitude: 18.5204, longitude: 73.8567 },
  },
  {
    id: "nashik",
    label: "Nashik",
    state: "Maharashtra",
    coordinates: { latitude: 19.9975, longitude: 73.7898 },
  },
  {
    id: "nagpur",
    label: "Nagpur",
    state: "Maharashtra",
    coordinates: { latitude: 21.1458, longitude: 79.0882 },
  },
  {
    id: "bengaluru",
    label: "Bengaluru",
    state: "Karnataka",
    coordinates: { latitude: 12.9716, longitude: 77.5946 },
  },
  {
    id: "delhi",
    label: "Delhi",
    state: "Delhi",
    coordinates: { latitude: 28.6139, longitude: 77.209 },
  },
  {
    id: "delhi-ncr",
    label: "Delhi NCR",
    state: "Delhi NCR",
    coordinates: { latitude: 28.4595, longitude: 77.0266 },
  },
  {
    id: "chennai",
    label: "Chennai",
    state: "Tamil Nadu",
    coordinates: { latitude: 13.0827, longitude: 80.2707 },
  },
  {
    id: "hyderabad",
    label: "Hyderabad",
    state: "Telangana",
    coordinates: { latitude: 17.385, longitude: 78.4867 },
  },
  {
    id: "kolkata",
    label: "Kolkata",
    state: "West Bengal",
    coordinates: { latitude: 22.5726, longitude: 88.3639 },
  },
  {
    id: "jaipur",
    label: "Jaipur",
    state: "Rajasthan",
    coordinates: { latitude: 26.9124, longitude: 75.7873 },
  },
  {
    id: "goa",
    label: "Goa",
    state: "Goa",
    coordinates: { latitude: 15.2993, longitude: 74.124 },
  },
] as const satisfies readonly MarketplaceCity[];

export const minimumRatingOptions = [
  { value: 4, label: "4+ stars" },
  { value: 4.5, label: "4.5+ stars" },
  { value: 4.8, label: "4.8+ stars" },
] as const;

export const maximumDistanceOptions = [
  { value: 25, label: "Within 25 km" },
  { value: 50, label: "Within 50 km" },
  { value: 100, label: "Within 100 km" },
  { value: 250, label: "Within 250 km" },
  { value: 500, label: "Within 500 km" },
] as const;

export const marketplaceDiscoveryConfig = {
  cities: marketplaceCities,
  minimumRatings: minimumRatingOptions,
  maximumDistances: maximumDistanceOptions,
} as const;

export function resolveMarketplaceCity(value: string): MarketplaceCity | undefined {
  const normalized = value.trim().toLocaleLowerCase("en-IN");
  return marketplaceCities.find(
    (city) =>
      city.id === normalized || city.label.toLocaleLowerCase("en-IN") === normalized,
  );
}
