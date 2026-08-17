import type { Metadata } from "next";

import {
  experienceSlugs,
  getExperiencePackage,
} from "@/modules/marketplace/config/experience-packages";
import { ExperienceDetailPage } from "@/modules/marketplace/components/experience-pages";

interface ExperienceRouteProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return experienceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ExperienceRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const experience = getExperiencePackage(slug);
  return experience
    ? {
        title: `${experience.title} | Experience Packages`,
        description: experience.description,
        alternates: { canonical: `/experiences/${slug}` },
      }
    : { title: "Experience not found" };
}

export default async function ExperienceRoute({ params }: ExperienceRouteProps) {
  const { slug } = await params;
  return <ExperienceDetailPage slug={slug} />;
}
