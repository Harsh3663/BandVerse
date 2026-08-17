import type { Metadata } from "next";

import {
  culturalSoundSlugs,
  getCulturalSoundCategory,
} from "@/modules/marketplace/config/cultural-sounds";
import { CulturalSoundPage } from "@/modules/marketplace/components/cultural-sounds-pages";

interface CulturalSoundRouteProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return culturalSoundSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CulturalSoundRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCulturalSoundCategory(slug);
  return category
    ? {
        title: `${category.label} | Discover India's Sounds`,
        description: category.description,
        alternates: { canonical: `/sounds/${slug}` },
      }
    : { title: "Sound not found" };
}

export default async function SoundCategoryRoute({ params }: CulturalSoundRouteProps) {
  const { slug } = await params;
  return <CulturalSoundPage slug={slug} />;
}
