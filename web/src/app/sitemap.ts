import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { discoveryCategories, discoveryEvents } from "@/data/discovery";
import { informationalAliases, legalAliases } from "@/data/informational";
import { performerProfiles } from "@/data/performer-profiles";
import { specialInfoSlugs } from "@/features/information/information-pages";
import { mockEvents, mockVenueProfiles } from "@/modules/marketplace";
import { culturalSoundSlugs } from "@/modules/marketplace/config/cultural-sounds";
import { experienceSlugs } from "@/modules/marketplace/config/experience-packages";

const staticRoutes = [
  "",
  "/discover",
  "/search",
  "/artists",
  "/bands",
  "/categories",
  "/events",
  "/venues",
  "/opportunities",
  "/recommendations",
  "/sounds",
  "/experiences",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const infoRoutes = [...Object.keys(informationalAliases), ...specialInfoSlugs].map(
    (slug) => `/${slug}`,
  );
  const legalRoutes = Object.keys(legalAliases).map((document) => `/legal/${document}`);
  const categoryRoutes = discoveryCategories.flatMap(({ id }) => [
    `/categories/${id}`,
    `/category/${id}`,
  ]);
  const profileRoutes = performerProfiles.map(
    ({ routeKind, handle }) => `/${routeKind}/${handle}`,
  );
  const eventRoutes = discoveryEvents.flatMap((event) => {
    const slug = event.href.split("/").at(-1)!;
    return [`/events/${slug}`, `/event/${slug}`];
  });
  const venueRoutes = mockVenueProfiles.map(({ handle }) => `/venue/${handle}`);
  const opportunityRoutes = mockEvents
    .filter(({ status }) => status === "published")
    .map(({ id }) => `/opportunities/${id}`);
  const soundRoutes = culturalSoundSlugs.map((slug) => `/sounds/${slug}`);
  const experienceRoutes = experienceSlugs.map((slug) => `/experiences/${slug}`);

  return [
    ...new Set([
      ...staticRoutes,
      ...infoRoutes,
      ...legalRoutes,
      ...categoryRoutes,
      ...profileRoutes,
      ...eventRoutes,
      ...venueRoutes,
      ...opportunityRoutes,
      ...soundRoutes,
      ...experienceRoutes,
    ]),
  ].map((path) => ({
    url: new URL(path || "/", siteConfig.url).toString(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/search") ? 0.9 : 0.7,
  }));
}
