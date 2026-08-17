import type { NavItem } from "@/types/nav";

export const siteConfig = {
  name: "BandVerse",
  tagline: "Discover. Perform. Connect.",
  description:
    "Discover, compare, and book verified musicians, bands, and traditional performers near you.",
  url: "https://bandverse.app",
  locale: "en_IN",
  social: {
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
    linkedin: "https://www.linkedin.com/",
  },
} as const;

export const primaryNav: NavItem[] = [
  { label: "Discover", href: "/discover" },
  { label: "Artists", href: "/artists" },
  { label: "Bands", href: "/bands" },
  { label: "Events", href: "/events" },
  { label: "How It Works", href: "/how-it-works" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Discover",
    items: [
      { label: "Search", href: "/search" },
      { label: "Artists", href: "/artists" },
      { label: "Bands", href: "/bands" },
      { label: "Events", href: "/events" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "How it works", href: "/how-it-works" },
      { label: "For performers", href: "/for-performers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Terms of service", href: "/legal/terms" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Refunds & cancellations", href: "/legal/refunds" },
      { label: "Trust & safety", href: "/trust-safety" },
    ],
  },
  {
    title: "Cities",
    items: [
      { label: "Mumbai", href: "/search?location=Mumbai" },
      { label: "Pune", href: "/search?location=Pune" },
      { label: "Delhi", href: "/search?location=Delhi" },
      { label: "Bengaluru", href: "/search?location=Bengaluru" },
    ],
  },
  {
    title: "Categories",
    items: [
      { label: "Solo artists", href: "/categories/solo-artists" },
      { label: "Bands", href: "/categories/bands" },
      { label: "Dhol Tasha", href: "/categories/dhol-tasha" },
      { label: "Wedding bands", href: "/categories/wedding-bands" },
    ],
  },
  {
    title: "Connect",
    items: [
      { label: "Instagram", href: siteConfig.social.instagram, external: true },
      { label: "YouTube", href: siteConfig.social.youtube, external: true },
      { label: "LinkedIn", href: siteConfig.social.linkedin, external: true },
    ],
  },
];
