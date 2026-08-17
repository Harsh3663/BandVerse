import { Drama, Drum, LockKeyhole, Music2, Star, type LucideIcon } from "lucide-react";

export interface TrustMetric {
  label: string;
  icon: LucideIcon;
  value?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  text?: string;
}

export const trustMetrics: TrustMetric[] = [
  {
    label: "Average Rating",
    icon: Star,
    value: 4.9,
    decimals: 1,
  },
  {
    label: "Verified Artists",
    icon: Music2,
    value: 12_000,
    suffix: "+",
  },
  {
    label: "Bands",
    icon: Drum,
    value: 1_500,
    suffix: "+",
  },
  {
    label: "Traditional Groups",
    icon: Drama,
    value: 250,
    suffix: "+",
  },
  {
    label: "Online Payments",
    icon: LockKeyhole,
    text: "Secure",
  },
];
