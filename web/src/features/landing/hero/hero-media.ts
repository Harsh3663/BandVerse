import type { StaticImageData } from "next/image";

import heroDholTasha from "@/assets/hero/hero-dhol-tasha.jpg";
import heroGuitarist from "@/assets/hero/hero-guitarist.jpg";
import heroVocalist from "@/assets/hero/hero-vocalist.jpg";
import heroWeddingBand from "@/assets/hero/hero-wedding-band.jpg";

export interface HeroSlide {
  src: StaticImageData;
  alt: string;
}

/**
 * IMPORTANT — PLACEHOLDER IMAGERY:
 * docs/LandingPageExperience.md § Hero > Background calls for a licensed
 * cinematic video montage of real BandVerse performance footage (a guitarist
 * mid-solo, a Dhol Tasha troupe, a wedding band, a solo vocalist —
 * cross-dissolving). That footage doesn't exist yet. These four images are
 * AI-generated stand-ins, graded to match the same brief (warm shadows,
 * filmic, low-key) purely so this milestone isn't blocked on a video shoot.
 *
 * `HeroBackground` cross-dissolves between them exactly like it will
 * cross-dissolve between video clips later — swapping this array for real
 * photography, or `HeroBackground` for a `<video>`-backed version, requires
 * no changes anywhere else.
 */
export const heroSlides: HeroSlide[] = [
  {
    src: heroGuitarist,
    alt: "A guitarist performing live under warm, dramatic stage lighting",
  },
  {
    src: heroDholTasha,
    alt: "A traditional Dhol Tasha percussion group performing with energy at dusk",
  },
  {
    src: heroWeddingBand,
    alt: "A live wedding band performing for a joyful crowd under string lights",
  },
  {
    src: heroVocalist,
    alt: "A solo vocalist singing under a single warm spotlight",
  },
];
