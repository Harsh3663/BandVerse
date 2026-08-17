import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { getBackendContainer } from "@/backend/infrastructure/container";
import {
  mockMarketplaceRepositories,
  mockPerformerProfiles,
  PerformerShowcase,
} from "@/modules/marketplace";

export const dynamic = "force-dynamic";

interface ShowcasePageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata(
  props: ShowcasePageProps,
): Promise<Metadata> {
  const handle = (await props.params).handle;
  const profile = mockPerformerProfiles.find((p) => p.handle === handle);
  return profile
    ? {
        title: `${profile.displayName} showcase | BandVerse`,
        description: profile.headline,
      }
    : { title: "Showcase not found" };
}

async function ensureShowcaseMedia(performerId: string) {
  const portfolio = getBackendContainer().portfolio;
  const existing = await portfolio.listMedia(performerId);
  if (existing.length > 0) return;

  const profile = mockPerformerProfiles.find((p) => p.id === performerId);
  if (!profile) return;

  const cover =
    typeof profile.coverImage.source === "string"
      ? profile.coverImage.source
      : profile.coverImage.source.src;

  await portfolio.createMedia({
    performerId,
    title: `${profile.displayName} hero`,
    description: profile.headline,
    mediaType: "photo",
    url: cover.startsWith("http") ? cover : `https://bandverse.local${cover}`,
    thumbnail: cover.startsWith("http") ? cover : `https://bandverse.local${cover}`,
    hero: true,
  });

  for (const video of profile.videos.slice(0, 3)) {
    const url =
      typeof video.source === "string" ? video.source : video.source.src;
    const thumb =
      video.thumbnail == null
        ? undefined
        : typeof video.thumbnail === "string"
          ? video.thumbnail
          : video.thumbnail.src;
    await portfolio.createMedia({
      performerId,
      title: video.title,
      description: video.alt ?? "",
      mediaType: video.provider === "youtube" ? "youtube" : "performance_video",
      url: url.startsWith("http") ? url : `https://bandverse.local${url}`,
      thumbnail:
        thumb && !thumb.startsWith("http")
          ? `https://bandverse.local${thumb}`
          : thumb,
      featured: true,
      duration: video.durationSeconds,
    });
  }

  for (const image of profile.mediaGallery.slice(0, 6)) {
    const url =
      typeof image.source === "string" ? image.source : image.source.src;
    await portfolio.createMedia({
      performerId,
      title: image.title,
      description: image.alt ?? "",
      mediaType: "photo",
      url: url.startsWith("http") ? url : `https://bandverse.local${url}`,
    });
  }

  for (const link of profile.socialLinks) {
    const mediaType =
      link.platform === "youtube"
        ? "youtube"
        : link.platform === "instagram"
          ? "instagram_reel"
          : link.platform === "spotify"
            ? "spotify"
            : link.platform === "website"
              ? "website"
              : null;
    if (!mediaType) continue;
    await portfolio.createMedia({
      performerId,
      title: link.label ?? link.platform,
      description: `${link.platform} link`,
      mediaType,
      url: link.url,
    });
  }
}

export default async function PerformerShowcasePage(props: ShowcasePageProps) {
  const handle = (await props.params).handle;
  const profile = mockPerformerProfiles.find((p) => p.handle === handle);
  if (!profile) notFound();

  await ensureShowcaseMedia(profile.id);
  const container = getBackendContainer();
  const showcase = await container.portfolio.getShowcase(profile.id);
  await container.portfolio.trackEvent({
    performerId: profile.id,
    event: "portfolio_view",
  });

  const now = new Date();
  const calendarMonth = await container.portfolio.getMonth({
    performerId: profile.id,
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
  });
  const reviews = await mockMarketplaceRepositories.reviews.listByPerformer(
    profile.id,
  );

  const bookingHref =
    `/bookings/new?performer=${profile.id}&profile=/showcase/${profile.handle}` as Route;

  return (
    <Container className="py-8 sm:py-12">
      <PerformerShowcase
        profile={profile}
        showcase={showcase}
        reviews={reviews}
        calendarMonth={calendarMonth}
        bookingHref={bookingHref}
      />
    </Container>
  );
}
