import type { FaqItem } from "@/components/shared/faq-accordion";

export interface ContentSection {
  id: string;
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
}

export interface InfoPageData {
  title: string;
  eyebrow: string;
  description: string;
  sections: readonly ContentSection[];
  faqs?: readonly FaqItem[];
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  notice?: string;
}

const bookingFaqs: readonly FaqItem[] = [
  {
    id: "pricing",
    question: "Are listed prices final?",
    answer:
      "No. Starting prices are representative estimates. The final quote depends on date, location, duration, travel, production, and the requested lineup.",
  },
  {
    id: "contact",
    question: "What happens after I send an enquiry?",
    answer:
      "This demo stores nothing and sends no message. In the production service, a performer or support specialist would respond with availability and next steps.",
  },
  {
    id: "payment",
    question: "Can I pay through BandVerse today?",
    answer:
      "Not in this frontend demo. No payment or booking is created by the forms on this site.",
  },
];

export const informationalPages = {
  about: {
    eyebrow: "About",
    title: "Live performance should be easier to discover",
    description:
      "BandVerse is a product concept for connecting audiences and event hosts with independent artists, bands, and traditional performance groups across India.",
    sections: [
      {
        id: "purpose",
        title: "Why BandVerse",
        paragraphs: [
          "Finding the right live performer often depends on scattered social profiles, referrals, and unclear pricing. BandVerse brings discovery information into one consistent, accessible experience.",
          "The profiles currently shown are representative demo content, not active marketplace listings or endorsements.",
        ],
      },
      {
        id: "principles",
        title: "What guides the product",
        paragraphs: [
          "The experience is designed around practical decisions, cultural breadth, and honest product states.",
        ],
        bullets: [
          "Clear starting prices and performance context",
          "Respectful representation of regional traditions",
          "Accessible paths for both bookers and performers",
          "No claim of a booking until a real backend confirms it",
        ],
      },
    ],
    primaryAction: { label: "Discover performers", href: "/search" },
    secondaryAction: { label: "Contact us", href: "/contact" },
  },
  faq: {
    eyebrow: "Help",
    title: "Frequently asked questions",
    description:
      "Straight answers about this demo experience, performer discovery, and booking intent.",
    sections: [],
    faqs: bookingFaqs,
    primaryAction: { label: "Ask another question", href: "/contact" },
  },
  "how-it-works": {
    eyebrow: "How it works",
    title: "From first search to a clear enquiry",
    description:
      "Explore representative profiles, compare the essentials, then share your event needs through a transparent contact path.",
    sections: [
      {
        id: "discover",
        title: "1. Discover",
        paragraphs: [
          "Search by performer type, style, or location and open a profile for more context.",
        ],
      },
      {
        id: "compare",
        title: "2. Compare",
        paragraphs: [
          "Review starting price, tags, location, trust status, and representative profile information.",
        ],
      },
      {
        id: "enquire",
        title: "3. Enquire",
        paragraphs: [
          "Send booking intent through the contact form. In this demo, submission is confirmed only in your browser and is not delivered.",
        ],
      },
    ],
    primaryAction: { label: "Start discovering", href: "/search" },
    secondaryAction: { label: "Read the FAQ", href: "/faq" },
  },
  traditions: {
    eyebrow: "Traditions",
    title: "Regional performance traditions, presented with context",
    description:
      "Discover representative Dhol Tasha, Nashik Dhol, Lezim, folk, and cultural ensembles in the current catalog.",
    sections: [
      {
        id: "context",
        title: "A discovery starting point",
        paragraphs: [
          "Traditions are living practices, not interchangeable categories. A profile should explain the ensemble, region, performance format, and event requirements before any enquiry.",
          "Current names, imagery, ratings, and availability are illustrative demo data.",
        ],
      },
    ],
    primaryAction: {
      label: "Browse traditional groups",
      href: "/search?kind=traditional",
    },
    secondaryAction: { label: "How it works", href: "/how-it-works" },
  },
  "trust-safety": {
    eyebrow: "Trust & safety",
    title: "Clear signals, careful decisions",
    description:
      "Trust labels help orient a decision, but they are not a substitute for written scope, verified details, and secure payment practices.",
    sections: [
      {
        id: "status",
        title: "About profile status",
        paragraphs: [
          "Verified and unverified labels on this site belong to representative demo records. They do not describe real identity checks completed by BandVerse.",
        ],
      },
      {
        id: "safer-booking",
        title: "Safer booking habits",
        paragraphs: [
          "Before committing to a performance, confirm the complete arrangement in writing.",
        ],
        bullets: [
          "Confirm performer identity, lineup, date, venue, and duration",
          "Document travel, equipment, cancellation, and refund terms",
          "Do not send payment because of a demo form confirmation",
          "Report suspicious requests through the contact page",
        ],
      },
    ],
    primaryAction: { label: "Contact support", href: "/contact?topic=safety" },
    secondaryAction: { label: "Read terms", href: "/terms" },
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy policy",
    description:
      "How this frontend demo handles information. Last updated 6 August 2026.",
    notice:
      "This policy describes the current demonstration website, which has no account or form-processing backend.",
    sections: [
      {
        id: "collection",
        title: "Information collection",
        paragraphs: [
          "Contact, onboarding, and login form values remain in the browser interface for demonstration. This implementation does not transmit or persist those values.",
          "Hosting providers may process routine technical logs under their own configurations and policies.",
        ],
      },
      {
        id: "choices",
        title: "Your choices",
        paragraphs: [
          "Do not enter sensitive personal, payment, government ID, or confidential event information into demo forms.",
        ],
      },
      {
        id: "contact",
        title: "Privacy questions",
        paragraphs: [
          "Use the contact page and select Privacy. The current demo will show a local confirmation but will not send the message.",
        ],
      },
    ],
    primaryAction: { label: "Privacy contact", href: "/contact?topic=privacy" },
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms of service",
    description:
      "Terms for using the current BandVerse demonstration. Last updated 6 August 2026.",
    notice: "This is a frontend product demo, not an operational booking marketplace.",
    sections: [
      {
        id: "demo",
        title: "Demonstration content",
        paragraphs: [
          "Performer names, imagery, ratings, reviews, prices, availability, and trust labels are illustrative unless explicitly stated otherwise. They do not constitute offers, endorsements, or confirmed availability.",
        ],
      },
      {
        id: "conduct",
        title: "Acceptable use",
        paragraphs: [
          "Use the site lawfully and do not attempt to disrupt it, misrepresent demo content, or submit sensitive information.",
        ],
      },
      {
        id: "liability",
        title: "No booking relationship",
        paragraphs: [
          "Submitting a form does not create an account, contract, reservation, payment, or message to a performer.",
        ],
      },
    ],
    primaryAction: { label: "Contact us", href: "/contact?topic=legal" },
  },
  refunds: {
    eyebrow: "Legal",
    title: "Refund & cancellation policy",
    description: "What refunds mean in the current demonstration experience.",
    notice:
      "No payments are accepted and no bookings are created by this frontend demo, so there are currently no transactions to refund.",
    sections: [
      {
        id: "future",
        title: "For a future live service",
        paragraphs: [
          "Any live booking flow should show performer-specific cancellation terms before payment and provide a durable booking record.",
          "Where a separate performer or payment provider is involved, its disclosed terms may also apply.",
        ],
      },
      {
        id: "problem",
        title: "Have a concern?",
        paragraphs: [
          "Use the contact form to describe it without including payment credentials or other sensitive data.",
        ],
      },
    ],
    primaryAction: { label: "Contact support", href: "/contact?topic=refund" },
    secondaryAction: { label: "Read terms", href: "/terms" },
  },
} satisfies Record<string, InfoPageData>;

export type InformationalPageKey = keyof typeof informationalPages;

export const informationalAliases: Readonly<Record<string, InformationalPageKey>> = {
  about: "about",
  faq: "faq",
  "how-it-works": "how-it-works",
  traditions: "traditions",
  "trust-safety": "trust-safety",
  privacy: "privacy",
  terms: "terms",
};

export const legalAliases: Readonly<Record<string, InformationalPageKey>> = {
  privacy: "privacy",
  terms: "terms",
  refunds: "refunds",
};
