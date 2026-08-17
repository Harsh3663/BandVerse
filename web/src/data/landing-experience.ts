import {
  CalendarCheck,
  CreditCard,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface LandingStep {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const landingSteps: readonly LandingStep[] = [
  {
    number: "01",
    title: "Discover",
    description:
      "Browse verified performers, compare styles, and watch real performance videos.",
    icon: Search,
  },
  {
    number: "02",
    title: "Book and pay securely",
    description: "Discuss the details, confirm your date, and complete payment online.",
    icon: CreditCard,
  },
  {
    number: "03",
    title: "Enjoy the show",
    description:
      "Welcome your performer, celebrate the moment, and share a review afterward.",
    icon: Sparkles,
  },
] as const;

export interface LandingTestimonial {
  quote: string;
  name: string;
  event: string;
  initials: string;
}

/**
 * Representative scenarios for the pre-launch experience, not attributed
 * customer reviews. The UI labels them accordingly until verified reviews exist.
 */
export const landingTestimonials: readonly LandingTestimonial[] = [
  {
    quote:
      "We could compare the sound, pricing, and availability in one place instead of coordinating through five different contacts.",
    name: "Priya N.",
    event: "Wedding planning scenario",
    initials: "PN",
  },
  {
    quote:
      "The clear booking steps made it much easier to align our venue, performer, and event team before confirming.",
    name: "Arjun M.",
    event: "Corporate event scenario",
    initials: "AM",
  },
  {
    quote:
      "Finding a traditional ensemble that matched the celebration felt thoughtful, not like filtering through a generic directory.",
    name: "Meera S.",
    event: "Festival planning scenario",
    initials: "MS",
  },
] as const;

export const landingFaqs = [
  {
    id: "landing-pricing",
    question: "Does it cost anything to browse performers?",
    answer:
      "No. You can explore performers and events without a browsing fee. Any price shown for a booking is presented before you confirm.",
  },
  {
    id: "landing-verification",
    question: "How are performers verified?",
    answer:
      "BandVerse plans to review performer identity and profile details. Verification is not a guarantee, so you should still review the profile, agreement, and event requirements before booking.",
  },
  {
    id: "landing-payment",
    question: "How will online payment work?",
    answer:
      "The booking flow is planned to show the amount and terms before payment. Payment processing is not claimed as live on this preview landing page.",
  },
  {
    id: "landing-cancellation",
    question: "What happens if plans change?",
    answer:
      "Cancellation terms can vary by booking. The applicable policy should be displayed before confirmation so both sides know the timeline and any fees.",
  },
] as const;

export const bookingAssurances = [
  { label: "Clear availability", icon: CalendarCheck },
  { label: "Upfront booking details", icon: CreditCard },
] as const;
