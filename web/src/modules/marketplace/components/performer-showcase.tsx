"use client";

import type { Route } from "next";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AudioShowcase, GalleryGrid, VideoShowcase } from "@/modules/media";
import type { PortfolioMediaItem as UiPortfolioMedia } from "@/modules/media";
import type { PortfolioShowcase } from "@/backend/infrastructure/portfolio/portfolio-service";
import type {
  AvailabilityDayStatus,
  PortfolioMediaItem as ApiMedia,
} from "@/backend/domain/portfolio";

import { genres, instruments, languages, taxonomyLabel } from "../config/taxonomy";
import { formatMoney } from "../format";
import type { PerformerProfile, Review } from "../types";
import { PortfolioReviews } from "./portfolio-sections";
import { MarketplaceBookingCta } from "./profile-modules";

function mapApiMedia(item: ApiMedia): UiPortfolioMedia {
  const type =
    item.mediaType === "photo"
      ? ("image" as const)
      : item.mediaType === "audio_sample" || item.mediaType === "spotify"
        ? ("audio" as const)
        : item.mediaType === "website"
          ? ("pdf" as const)
          : item.mediaType === "instagram_reel"
            ? ("short" as const)
            : ("video" as const);

  return {
    id: item.id,
    title: item.title,
    type,
    category:
      type === "audio"
        ? "live-recording"
        : type === "image"
          ? "stage-photos"
          : "performance",
    thumbnail: item.thumbnail,
    source: item.url,
    duration: item.duration,
    uploadedAt: item.createdAt.slice(0, 10),
    featured: Boolean(item.featured),
    views: 0,
    likes: 0,
    description: item.description,
    provider:
      item.mediaType === "youtube"
        ? "youtube"
        : item.mediaType === "instagram_reel"
          ? "instagram-reel"
          : item.mediaType === "spotify"
            ? "spotify"
            : "external",
  };
}

function statusLabel(status: AvailabilityDayStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function PerformerShowcase({
  profile,
  showcase,
  reviews,
  calendarMonth,
  bookingHref,
}: {
  profile: PerformerProfile;
  showcase: PortfolioShowcase;
  reviews: readonly Review[];
  calendarMonth: {
    year: number;
    month: number;
    days: readonly { date: string; status: AvailabilityDayStatus }[];
  };
  bookingHref: Route;
}) {
  const startingPackage = profile.pricingPackages.reduce(
    (lowest, item) =>
      !lowest || item.price.amount < lowest.price.amount ? item : lowest,
    profile.pricingPackages[0],
  );
  const hero = showcase.hero;
  const featured = showcase.featuredVideo;
  const galleryMedia = showcase.gallery.map(mapApiMedia);
  const performanceMedia = [
    ...(featured ? [mapApiMedia(featured)] : []),
    ...showcase.topPerformances
      .filter((m) => m.id !== featured?.id)
      .map(mapApiMedia),
  ];
  const audioMedia = showcase.media
    .filter((m) => m.mediaType === "audio_sample" || m.mediaType === "spotify")
    .map(mapApiMedia);
  const verified = showcase.verifiedPerformances.filter(
    (v) => v.verificationStatus === "verified",
  );

  return (
    <div className="space-y-12">
      <section className="space-y-4" aria-labelledby="showcase-hero">
        <div className="flex flex-wrap items-center gap-3">
          <h1 id="showcase-hero" className="font-display text-4xl font-semibold">
            {profile.displayName}
          </h1>
          {verified.length > 0 ? (
            <Badge className="gap-1">
              <BadgeCheck className="size-3.5" aria-hidden />
              Verified Event Performance
            </Badge>
          ) : null}
        </div>
        <p className="text-muted-foreground max-w-2xl text-lg">{profile.headline}</p>
        {hero ? (
          <div className="bg-muted relative aspect-[21/9] w-full overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.thumbnail ?? hero.url}
              alt={hero.title}
              className="size-full object-cover"
            />
          </div>
        ) : null}
      </section>

      {performanceMedia.length > 0 ? (
        <VideoShowcase media={performanceMedia} />
      ) : null}

      {galleryMedia.length > 0 ? <GalleryGrid media={galleryMedia} /> : null}

      {audioMedia.length > 0 ? <AudioShowcase media={audioMedia} /> : null}

      <section className="space-y-3" aria-label="Genres, languages, and instruments">
        <h2 className="font-display text-2xl font-semibold">Skills & style</h2>
        <div className="flex flex-wrap gap-2">
          {showcase.genres.map((id) => (
            <Badge key={`genre-${id}`} variant="secondary">
              {taxonomyLabel(id, genres)}
            </Badge>
          ))}
          {showcase.languages.map((id) => (
            <Badge key={`lang-${id}`} variant="outline">
              {taxonomyLabel(id, languages)}
            </Badge>
          ))}
          {showcase.instruments.map((id) => (
            <Badge key={`instrument-${id}`}>{taxonomyLabel(id, instruments)}</Badge>
          ))}
        </div>
      </section>

      {showcase.setlists.length > 0 ? (
        <section className="space-y-3" aria-labelledby="setlists">
          <h2 id="setlists" className="font-display text-2xl font-semibold">
            Setlists
          </h2>
          <ul className="space-y-3">
            {showcase.setlists.map((setlist) => (
              <li key={setlist.id} className="border-border rounded-lg border p-4">
                <p className="font-medium">{setlist.title}</p>
                <p className="text-muted-foreground text-sm">
                  {setlist.eventType.replaceAll("_", " ")} · {setlist.duration} min
                </p>
                <p className="mt-2 text-sm">{setlist.songs.join(" · ")}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3" aria-labelledby="availability-calendar">
        <h2 id="availability-calendar" className="font-display text-2xl font-semibold">
          Availability · {calendarMonth.year}-
          {String(calendarMonth.month).padStart(2, "0")}
        </h2>
        <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm">
          {calendarMonth.days.map((day) => (
            <div
              key={day.date}
              className="border-border rounded-md border px-1 py-2"
              title={statusLabel(day.status)}
            >
              <div className="font-medium">{Number(day.date.slice(-2))}</div>
              <div className="text-muted-foreground truncate">
                {statusLabel(day.status).slice(0, 3)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <PortfolioReviews summary={profile.rating} reviews={reviews} />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Discovery score {showcase.discovery.total.toFixed(1)}
          </p>
          <Button asChild>
            <Link href={bookingHref}>Book {profile.displayName}</Link>
          </Button>
        </div>
        <MarketplaceBookingCta
          title="Booking"
          price={startingPackage ? formatMoney(startingPackage.price) : undefined}
          primaryHref={bookingHref}
          primaryLabel="Request booking"
        />
      </div>
    </div>
  );
}
