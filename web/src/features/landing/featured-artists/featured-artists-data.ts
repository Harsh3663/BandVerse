import type { StaticImageData } from "next/image";

import djImage from "@/assets/featured-artists/featured-artist-dj.jpg";
import drummerImage from "@/assets/featured-artists/featured-artist-drummer.jpg";
import flutistImage from "@/assets/featured-artists/featured-artist-flutist.jpg";
import guitaristImage from "@/assets/featured-artists/featured-artist-guitarist.jpg";
import pianistImage from "@/assets/featured-artists/featured-artist-pianist.jpg";
import saxophonistImage from "@/assets/featured-artists/featured-artist-saxophonist.jpg";
import singerImage from "@/assets/featured-artists/featured-artist-singer.jpg";
import violinistImage from "@/assets/featured-artists/featured-artist-violinist.jpg";

import type { InstrumentGlyphName } from "./instrument-glyph";

export interface FeaturedArtist {
  name: string;
  instrument: string;
  instrumentGlyph: InstrumentGlyphName;
  city: string;
  genres: string[];
  languages: string[];
  rating: number;
  reviewCount: number;
  startingPrice: number;
  /** Short, human phrasing rather than a raw calendar widget — this section
   * is a discovery showcase, not the real Availability Calendar (per
   * docs/InformationArchitecture.md § 5.1), which doesn't exist yet. */
  availability: string;
  responseTime: string;
  experienceYears: number;
  verified: boolean;
  /** Real IA path — docs/InformationArchitecture.md § Sitemap, "Solo Artist
   * Profile (/artist/[handle])". Same deferred-route pattern as
   * traditional/traditional-data.ts: links to the real future path, not a
   * placeholder "#", so it works with zero changes the moment that route
   * ships. */
  href: string;
  image: StaticImageData;
  imageAlt: string;
}

/**
 * IMPORTANT — PLACEHOLDER CONTENT, same convention as
 * traditional/traditional-data.ts: illustrative names, ratings, and stats
 * standing in for real, verified artist profiles (none exist in the
 * platform yet). Imagery is AI-generated, graded to match the Design
 * System's photography style, purely so this section isn't blocked on
 * onboarding real artists/photography. Swapping either later requires no
 * changes anywhere else — `FeaturedArtistCard` consumes this shape
 * generically.
 */
export const featuredArtists: FeaturedArtist[] = [
  {
    name: "Ananya Rao",
    instrument: "Singer",
    instrumentGlyph: "singer",
    city: "Mumbai",
    genres: ["Bollywood", "Jazz", "Acoustic"],
    languages: ["Hindi", "English", "Marathi"],
    rating: 4.9,
    reviewCount: 214,
    startingPrice: 25_000,
    availability: "Available this weekend",
    responseTime: "Replies within 1 hour",
    experienceYears: 9,
    verified: true,
    href: "/artist/ananya-rao",
    image: singerImage,
    imageAlt:
      "Singer Ananya Rao performing into a vintage microphone under warm stage light",
  },
  {
    name: "Kabir Mehta",
    instrument: "Guitarist",
    instrumentGlyph: "guitarist",
    city: "Bengaluru",
    genres: ["Fingerstyle", "Blues", "Indie"],
    languages: ["English", "Hindi", "Kannada"],
    rating: 4.8,
    reviewCount: 168,
    startingPrice: 18_000,
    availability: "Booking 2+ weeks out",
    responseTime: "Replies within 3 hours",
    experienceYears: 7,
    verified: true,
    href: "/artist/kabir-mehta",
    image: guitaristImage,
    imageAlt: "Guitarist Kabir Mehta mid-solo on an acoustic guitar under warm light",
  },
  {
    name: "Meera Iyer",
    instrument: "Pianist",
    instrumentGlyph: "pianist",
    city: "Delhi",
    genres: ["Classical", "Contemporary", "Film Score"],
    languages: ["English", "Hindi"],
    rating: 5.0,
    reviewCount: 132,
    startingPrice: 30_000,
    availability: "Available this week",
    responseTime: "Replies within 2 hours",
    experienceYears: 14,
    verified: true,
    href: "/artist/meera-iyer",
    image: pianistImage,
    imageAlt: "Pianist Meera Iyer performing at a grand piano under a single warm light",
  },
  {
    name: "Arjun Subramaniam",
    instrument: "Violinist",
    instrumentGlyph: "violinist",
    city: "Chennai",
    genres: ["Carnatic", "Fusion", "Classical"],
    languages: ["Tamil", "English", "Hindi"],
    rating: 4.9,
    reviewCount: 187,
    startingPrice: 22_000,
    availability: "Available this weekend",
    responseTime: "Replies within 1 hour",
    experienceYears: 11,
    verified: true,
    href: "/artist/arjun-subramaniam",
    image: violinistImage,
    imageAlt: "Violinist Arjun Subramaniam performing with his bow mid-stroke",
  },
  {
    name: "Ritika Deshmukh",
    instrument: "Drummer",
    instrumentGlyph: "drummer",
    city: "Pune",
    genres: ["Rock", "Funk", "Fusion"],
    languages: ["Marathi", "Hindi", "English"],
    rating: 4.7,
    reviewCount: 96,
    startingPrice: 16_000,
    availability: "Booking 1 week out",
    responseTime: "Replies within 4 hours",
    experienceYears: 6,
    verified: true,
    href: "/artist/ritika-deshmukh",
    image: drummerImage,
    imageAlt: "Drummer Ritika Deshmukh mid-performance behind a drum kit",
  },
  {
    name: "Rohan Kapoor",
    instrument: "DJ",
    instrumentGlyph: "dj",
    city: "Hyderabad",
    genres: ["Bollywood", "EDM", "Hip-Hop"],
    languages: ["English", "Hindi", "Telugu"],
    rating: 4.8,
    reviewCount: 245,
    startingPrice: 20_000,
    availability: "Available this weekend",
    responseTime: "Replies within 30 minutes",
    experienceYears: 8,
    verified: true,
    href: "/artist/rohan-kapoor",
    image: djImage,
    imageAlt: "DJ Rohan Kapoor performing behind a mixer under violet stage light",
  },
  {
    name: "Sharmila Bose",
    instrument: "Flutist",
    instrumentGlyph: "flutist",
    city: "Kolkata",
    genres: ["Hindustani Classical", "Folk", "Devotional"],
    languages: ["Bengali", "Hindi", "English"],
    rating: 4.9,
    reviewCount: 121,
    startingPrice: 19_000,
    availability: "Available this week",
    responseTime: "Replies within 2 hours",
    experienceYears: 12,
    verified: true,
    href: "/artist/sharmila-bose",
    image: flutistImage,
    imageAlt: "Flutist Sharmila Bose playing a bamboo bansuri",
  },
  {
    name: "Vivaan Singh",
    instrument: "Saxophonist",
    instrumentGlyph: "saxophonist",
    city: "Jaipur",
    genres: ["Jazz", "Bollywood", "Instrumental"],
    languages: ["Hindi", "English", "Rajasthani"],
    rating: 4.8,
    reviewCount: 143,
    startingPrice: 21_000,
    availability: "Booking 2+ weeks out",
    responseTime: "Replies within 3 hours",
    experienceYears: 10,
    verified: true,
    href: "/artist/vivaan-singh",
    image: saxophonistImage,
    imageAlt: "Saxophonist Vivaan Singh performing under warm amber light",
  },
];
