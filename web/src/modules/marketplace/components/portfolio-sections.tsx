import {
  Award,
  BadgeCheck,
  Building2,
  ExternalLink,
  Guitar,
  MapPin,
  Mic2,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactCount } from "@/modules/media";

import { genres, instruments, languages, taxonomyLabel } from "../config/taxonomy";
import { formatDuration, formatMoney } from "../format";
import type {
  Award as AwardRecord,
  EquipmentItem,
  PerformanceHistoryItem,
  PerformerProfile,
  PerformerVerification,
  PricingPackage,
  RatingSummary,
  Review,
  SocialProofMetrics,
} from "../types";

export function PortfolioSocialProof({ proof }: { proof: SocialProofMetrics }) {
  const metrics = [
    { label: "Followers", value: formatCompactCount(proof.followers) },
    { label: "Repeat bookings", value: String(proof.repeatBookings) },
    { label: "Response rate", value: `${proof.responseRatePercent}%` },
    { label: "Booking success", value: `${proof.bookingSuccessPercent}%` },
    { label: "Completion rate", value: `${proof.completionRatePercent}%` },
    { label: "Years experience", value: String(proof.yearsOfExperience) },
  ];

  return (
    <section className="space-y-4" aria-labelledby="social-proof-heading">
      <h2 id="social-proof-heading" className="font-display text-3xl font-semibold">
        Social proof
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} size="sm">
            <CardContent className="space-y-1 py-4">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {metric.label}
              </p>
              <p className="font-display text-2xl font-semibold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function PortfolioVerification({
  verification,
}: {
  verification: PerformerVerification;
}) {
  const labels: Record<PerformerVerification["channels"][number], string> = {
    "government-id": "Government ID",
    phone: "Phone",
    email: "Email",
    gst: "GST",
    business: "Business",
    social: "Social",
    bank: "Bank",
    "verified-performer": "Verified performer",
  };

  return (
    <section className="space-y-4" aria-labelledby="verification-heading">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="verification-heading" className="font-display text-3xl font-semibold">
          Verification
        </h2>
        {verification.verifiedPerformer ? (
          <Badge>
            <BadgeCheck data-icon="inline-start" aria-hidden />
            Verified performer
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {verification.channels.map((channel) => (
          <Badge key={channel} variant="secondary">
            <ShieldCheck data-icon="inline-start" aria-hidden />
            {labels[channel]}
          </Badge>
        ))}
      </div>
    </section>
  );
}

export function PortfolioEquipment({
  equipment,
}: {
  equipment: readonly EquipmentItem[];
}) {
  const groups = ["instrument", "sound", "lighting", "stage", "other"] as const;
  const grouped = groups
    .map((category) => ({
      category,
      items: equipment.filter((item) => item.category === category),
    }))
    .filter((group) => group.items.length);

  return (
    <section className="space-y-5" aria-labelledby="equipment-heading">
      <div className="space-y-2">
        <h2 id="equipment-heading" className="font-display text-3xl font-semibold">
          Equipment
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Instruments, sound setup, and lighting the artist can bring — or that the venue
          should supply.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {grouped.map((group) => (
          <Card key={group.category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 capitalize">
                {group.category === "instrument" ? (
                  <Guitar className="size-4" aria-hidden />
                ) : (
                  <Mic2 className="size-4" aria-hidden />
                )}
                {group.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      {item.brand ? `${item.brand} · ` : ""}
                      {item.name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Qty {item.quantity}
                      {item.providedByPerformer
                        ? " · Artist provides"
                        : " · Venue supplied"}
                    </p>
                  </div>
                  <Badge variant={item.providedByPerformer ? "default" : "outline"}>
                    {item.providedByPerformer ? "Included" : "Request"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function PortfolioPerformanceHistory({
  history,
  mediaById,
}: {
  history: readonly PerformanceHistoryItem[];
  mediaById: Map<string, { title: string; thumbnail?: string; source: string }>;
}) {
  return (
    <section className="space-y-5" aria-labelledby="history-heading">
      <div className="space-y-2">
        <h2 id="history-heading" className="font-display text-3xl font-semibold">
          Performance history
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Past events with venue, audience, city, media, and organizer feedback.
        </p>
      </div>
      <div className="grid gap-4">
        {history.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="size-3.5" aria-hidden />
                  {item.venue}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden />
                  {item.city}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" aria-hidden />
                  {item.audienceSize} guests
                </span>
                <span>
                  {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                    new Date(item.performedOn),
                  )}
                </span>
                {item.rating ? (
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3.5 fill-current" aria-hidden />
                    {item.rating}.0
                  </span>
                ) : null}
              </div>
              {item.organizerReview ? (
                <p className="text-muted-foreground leading-relaxed">
                  “{item.organizerReview}”
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {[...item.photoIds, ...item.videoIds].map((mediaId) => {
                  const media = mediaById.get(mediaId);
                  if (!media) return null;
                  return (
                    <Badge key={mediaId} variant="outline">
                      {media.title}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function PortfolioAchievements({
  awards,
  certificates,
}: {
  awards: readonly AwardRecord[];
  certificates: PerformerProfile["certificates"];
}) {
  return (
    <section className="space-y-5" aria-labelledby="achievements-heading">
      <div className="space-y-2">
        <h2 id="achievements-heading" className="font-display text-3xl font-semibold">
          Achievements
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Competitions, certificates, TV and radio features, albums, and collaborations.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {awards.map((award) => (
          <Card key={award.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="size-4" aria-hidden />
                {award.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {award.kind ? (
                  <Badge variant="secondary" className="capitalize">
                    {award.kind.replace("-", " ")}
                  </Badge>
                ) : null}
                <Badge variant="outline">{award.issuer}</Badge>
              </div>
              {award.description ? (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {award.description}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
        {certificates.map((certificate) => (
          <Card key={certificate.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="size-4" aria-hidden />
                {certificate.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="secondary">Certificate</Badge>
              <p className="text-muted-foreground text-sm">{certificate.issuer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function PortfolioPackages({ packages }: { packages: readonly PricingPackage[] }) {
  return (
    <section className="space-y-5" aria-labelledby="artist-packages-heading">
      <div className="space-y-2">
        <h2 id="artist-packages-heading" className="font-display text-3xl font-semibold">
          Artist packages
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Wedding, corporate, luxury, temple, cafe, festival, and private party packages
          with price, duration, travel, and equipment clarity.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {packages.map((item) => (
          <Card key={item.id} className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div>
                <p className="font-display text-2xl font-semibold">
                  {formatMoney(item.price)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatDuration(item.durationMinutes)}
                  {item.artistsIncluded ? ` · ${item.artistsIncluded} artists` : ""}
                </p>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.travelIncluded != null ? (
                  <Badge variant="outline">
                    Travel {item.travelIncluded ? "included" : "extra"}
                  </Badge>
                ) : null}
                {item.equipmentIncluded != null ? (
                  <Badge variant="outline">
                    Equipment {item.equipmentIncluded ? "included" : "venue"}
                  </Badge>
                ) : null}
              </div>
              <ul className="text-muted-foreground mt-auto space-y-1.5 text-sm">
                {item.inclusions.map((inclusion) => (
                  <li key={inclusion}>• {inclusion}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function PortfolioReviews({
  summary,
  reviews,
}: {
  summary: RatingSummary;
  reviews: readonly Review[];
}) {
  const breakdown = summary.breakdown;
  const stars = [5, 4, 3, 2, 1] as const;

  return (
    <section className="space-y-5" aria-labelledby="portfolio-reviews-heading">
      <div className="flex flex-wrap items-end gap-3">
        <h2
          id="portfolio-reviews-heading"
          className="font-display text-3xl font-semibold"
        >
          Reviews
        </h2>
        <p className="text-muted-foreground">
          <Star className="mr-1 inline size-4 fill-current" aria-hidden />
          {summary.average.toFixed(1)} from {summary.count} reviews
        </p>
      </div>

      {breakdown ? (
        <Card>
          <CardHeader>
            <CardTitle>Rating breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stars.map((star) => {
              const count = breakdown[star] ?? 0;
              const percent = summary.count
                ? Math.round((count / summary.count) * 100)
                : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-10">{star}★</span>
                  <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground w-12 text-right">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      {reviews.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  {review.title ?? `${review.rating}-star review`}
                  {review.kind ? (
                    <Badge variant="secondary" className="capitalize">
                      {review.kind} review
                    </Badge>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  “{review.comment}”
                </p>
                {review.mediaUrl ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={review.mediaUrl} target="_blank" rel="noreferrer">
                      View {review.mediaKind ?? "media"} review
                      <ExternalLink data-icon="inline-end" aria-hidden />
                    </a>
                  </Button>
                ) : null}
                {review.response ? (
                  <div className="bg-muted/50 rounded-md p-3 text-sm">
                    <p className="font-medium">Performer response</p>
                    <p className="text-muted-foreground mt-1">
                      {review.response.comment}
                    </p>
                  </div>
                ) : null}
                <p className="text-xs font-medium">
                  {review.verifiedBooking ? "Verified booking" : "Marketplace review"} ·{" "}
                  {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                    new Date(review.createdAt),
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          The rating summary is available; written reviews will appear here as organizers
          publish them.
        </p>
      )}
    </section>
  );
}

export function PortfolioOverviewMedia({
  profile,
}: {
  profile: Pick<PerformerProfile, "portfolioMedia" | "coverImage" | "displayName">;
}) {
  const featured = profile.portfolioMedia.filter((item) => item.featured).slice(0, 3);
  return (
    <section className="space-y-4" aria-labelledby="overview-media-heading">
      <h2 id="overview-media-heading" className="font-display text-2xl font-semibold">
        Featured media
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {featured.map((item) => (
          <figure
            key={item.id}
            className="bg-muted relative aspect-video overflow-hidden rounded-lg"
          >
            <Image
              src={item.thumbnail ?? profile.coverImage.source}
              alt={item.title}
              fill
              sizes="(min-width: 768px) 240px, 100vw"
              className="object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm text-white">
              {item.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function PortfolioTaxonomyStrip({ profile }: { profile: PerformerProfile }) {
  return (
    <section className="space-y-3" aria-label="Languages, genres, and instruments">
      <div className="flex flex-wrap gap-2">
        {profile.languageIds.map((id) => (
          <Badge key={`lang-${id}`} variant="outline">
            {taxonomyLabel(id, languages)}
          </Badge>
        ))}
        {profile.genreIds.map((id) => (
          <Badge key={`genre-${id}`} variant="secondary">
            {taxonomyLabel(id, genres)}
          </Badge>
        ))}
        {profile.instrumentIds.map((id) => (
          <Badge key={`instrument-${id}`}>{taxonomyLabel(id, instruments)}</Badge>
        ))}
      </div>
    </section>
  );
}
