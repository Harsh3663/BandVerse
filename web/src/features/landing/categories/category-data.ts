import type { StaticImageData } from "next/image";

import bandsImage from "@/assets/categories/category-bands.jpg";
import dholTashaImage from "@/assets/categories/category-dhol-tasha.jpg";
import djsImage from "@/assets/categories/category-djs.jpg";
import folkArtistsImage from "@/assets/categories/category-folk-artists.jpg";
import soloArtistsImage from "@/assets/categories/category-solo-artists.jpg";
import weddingBandsImage from "@/assets/categories/category-wedding-bands.jpg";

import type { CategoryGlyphName } from "./category-glyph";

export interface FeaturedCategory {
  name: string;
  description: string;
  performerCount: number;
  href: string;
  image: StaticImageData;
  imageAlt: string;
  glyph: CategoryGlyphName;
}

export const featuredCategories: FeaturedCategory[] = [
  {
    name: "Solo Artists",
    description: "Distinctive voices and musicians for intimate, unforgettable moments.",
    performerCount: 3_420,
    href: "/categories/solo-artists",
    image: soloArtistsImage,
    imageAlt: "A solo vocalist performing beneath warm stage lighting",
    glyph: "solo",
  },
  {
    name: "Bands",
    description:
      "Full-stage energy spanning originals, covers, and every crowd in between.",
    performerCount: 1_500,
    href: "/categories/bands",
    image: bandsImage,
    imageAlt: "A contemporary live band performing together on stage",
    glyph: "band",
  },
  {
    name: "Dhol Tasha",
    description:
      "The unmistakable rhythm and spectacle of Maharashtra’s living tradition.",
    performerCount: 250,
    href: "/categories/dhol-tasha",
    image: dholTashaImage,
    imageAlt: "A Dhol Tasha troupe performing in traditional attire",
    glyph: "dhol",
  },
  {
    name: "Wedding Bands",
    description: "Celebratory ensembles that turn every entrance into a procession.",
    performerCount: 740,
    href: "/categories/wedding-bands",
    image: weddingBandsImage,
    imageAlt: "An Indian wedding band performing at an evening celebration",
    glyph: "wedding",
  },
  {
    name: "DJs",
    description: "Tasteful selectors and high-energy sets shaped around your crowd.",
    performerCount: 2_150,
    href: "/search?category=djs",
    image: djsImage,
    imageAlt: "A DJ performing for a live audience under violet light",
    glyph: "dj",
  },
  {
    name: "Folk Artists",
    description:
      "Regional stories, instruments, and traditions performed with authenticity.",
    performerCount: 630,
    href: "/categories/folk",
    image: folkArtistsImage,
    imageAlt: "Traditional Indian folk musicians performing together",
    glyph: "folk",
  },
];
