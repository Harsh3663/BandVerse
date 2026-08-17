import type { StaticImageData } from "next/image";

import banjoImage from "@/assets/traditional/traditional-banjo.jpg";
import culturalBandImage from "@/assets/traditional/traditional-cultural-band.jpg";
import dholTashaImage from "@/assets/traditional/traditional-dhol-tasha.jpg";
import folkImage from "@/assets/traditional/traditional-folk.jpg";
import lezimImage from "@/assets/traditional/traditional-lezim.jpg";
import nashikDholImage from "@/assets/traditional/traditional-nashik-dhol.jpg";

export interface TraditionalPerformer {
  name: string;
  category: string;
  city: string;
  rating: number;
  eventsCompleted: number;
  startingPrice: number;
  description: string;
  /** Real IA path — docs/InformationArchitecture.md § Sitemap, "Traditional
   * Group Profile (/group/[handle])". Doesn't resolve to a real page yet,
   * same deferred-route pattern already used by the Hero and Featured
   * Categories (link to the real future path, not a placeholder "#"). */
  href: string;
  image: StaticImageData;
  imageAlt: string;
}

/**
 * IMPORTANT — PLACEHOLDER CONTENT:
 * Named performers, ratings, event counts, and prices below are illustrative
 * placeholders standing in for real, verified troupe profiles (none exist in
 * the platform yet). The imagery is AI-generated, graded to match the
 * Design System's photography style, purely so this section isn't blocked
 * on onboarding real troupes/photography. Swapping either requires no
 * changes anywhere else — `TraditionalPerformerCard` consumes this shape
 * generically.
 */
export const traditionalPerformers: TraditionalPerformer[] = [
  {
    name: "Shivgarjana Dhol Pathak",
    category: "Dhol Tasha",
    city: "Pune",
    rating: 4.9,
    eventsCompleted: 320,
    startingPrice: 15_000,
    description:
      "A 40-member Dhol Tasha troupe bringing festival-grade energy and precision rhythm to processions and stage events alike.",
    href: "/group/shivgarjana-dhol-pathak",
    image: dholTashaImage,
    imageAlt: "A Dhol Tasha performer mid-strike in traditional saffron attire",
  },
  {
    name: "Nashik Dhunkiraj Pathak",
    category: "Nashik Dhol",
    city: "Nashik",
    rating: 4.8,
    eventsCompleted: 210,
    startingPrice: 18_000,
    description:
      "Specialists in the deeper, larger Nashik dhol tradition — a commanding sound built for grand entrances and processions.",
    href: "/group/nashik-dhunkiraj-pathak",
    image: nashikDholImage,
    imageAlt: "A Nashik-style dhol performer carrying a large drum during a procession",
  },
  {
    name: "Royal Banjo Party",
    category: "Banjo Group",
    city: "Mumbai",
    rating: 4.7,
    eventsCompleted: 275,
    startingPrice: 12_000,
    description:
      "A full brass-and-banjo wedding procession band, lighting up baraats and entrances with live, unmistakably festive sound.",
    href: "/group/royal-banjo-party",
    image: banjoImage,
    imageAlt:
      "A banjo-party musician playing trumpet during an evening wedding procession",
  },
  {
    name: "Sanskruti Lezim Pathak",
    category: "Lezim",
    city: "Pune",
    rating: 4.9,
    eventsCompleted: 150,
    startingPrice: 10_000,
    description:
      "A coordinated Lezim ensemble whose rhythmic footwork and jingling percussion turn any stage into a festival ground.",
    href: "/group/sanskruti-lezim-pathak",
    image: lezimImage,
    imageAlt:
      "A Lezim folk dance performer mid-motion holding the traditional instrument",
  },
  {
    name: "Rajasthan Lok Kalakar",
    category: "Folk Performers",
    city: "Jaipur",
    rating: 4.8,
    eventsCompleted: 190,
    startingPrice: 20_000,
    description:
      "Rajasthani folk singers and instrumentalists carrying centuries-old desert storytelling traditions to modern stages.",
    href: "/group/rajasthan-lok-kalakar",
    image: folkImage,
    imageAlt: "A Rajasthani folk musician singing while playing a traditional ektara",
  },
  {
    name: "Manoos Cultural Ensemble",
    category: "Cultural Band",
    city: "Nagpur",
    rating: 4.6,
    eventsCompleted: 160,
    startingPrice: 22_000,
    description:
      "A fusion ensemble blending traditional regional instruments with contemporary arrangements for a genuinely original sound.",
    href: "/group/manoos-cultural-ensemble",
    image: culturalBandImage,
    imageAlt:
      "A lead singer fronting a small cultural fusion ensemble on an intimate stage",
  },
];
