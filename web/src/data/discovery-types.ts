import type { StaticImageData } from "next/image";

export type PerformerKind = "artist" | "band" | "traditional";

export interface DiscoveryPerformer {
  id: string;
  kind: PerformerKind;
  name: string;
  category: string;
  location: string;
  description?: string;
  rating: number;
  reviewCount?: number;
  completedEvents?: number;
  startingPrice: number;
  tags: readonly string[];
  verified: boolean;
  trustBadges?: readonly string[];
  href: string;
  image: StaticImageData;
  imageAlt: string;
}

export interface DiscoveryCategory {
  id: string;
  name: string;
  description: string;
  performerCount: number;
  href: string;
  image: StaticImageData;
  imageAlt: string;
}

export interface DiscoveryEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  category: string;
  priceFrom?: number;
  href: string;
  image: StaticImageData;
  imageAlt: string;
}

export interface FilterOption {
  label: string;
  value: string;
}
