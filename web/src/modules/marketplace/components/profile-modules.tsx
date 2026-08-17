import {
  BadgeCheck,
  CalendarCheck,
  Check,
  Clock3,
  ExternalLink,
  MapPin,
  Music2,
  Play,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { FaqAccordion } from "@/components/shared/faq-accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  galleryCategories,
  genres,
  instruments,
  languages,
  performerCategories,
  performerSkills,
  performerSubcategories,
  taxonomyLabel,
} from "../config/taxonomy";
import { formatDuration, formatMoney, titleCase } from "../format";
import type {
  AudioSample,
  AvailabilityCalendar,
  CalendarEntry,
  Certificate,
  EquipmentItem,
  MediaAsset,
  PerformerProfile,
  PricingPackage,
  RatingSummary,
  Review,
  SocialLink,
  TravelPolicy,
  TrustSignals,
} from "../types";
import { MarketplaceAvailabilityCalendar } from "./availability-calendar";
import { TrustBadges } from "./trust";

export function MarketplaceMediaGallery({
  media,
  videos = [],
  audio = [],
  socialLinks = [],
  priority = false,
}: {
  media: readonly MediaAsset[];
  videos?: readonly MediaAsset[];
  audio?: readonly AudioSample[];
  socialLinks?: readonly SocialLink[];
  priority?: boolean;
}) {
  const images = media.filter((item) => item.kind === "image");
  const playableMedia = [...media.filter((item) => item.kind !== "image"), ...videos];

  return (
    <section className="space-y-5" aria-label="Media and links">
      {images.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((item, index) => (
            <figure
              key={item.id}
              className={
                index === 0
                  ? "bg-muted relative aspect-[4/3] overflow-hidden rounded-lg sm:col-span-2 sm:aspect-video"
                  : "bg-muted relative aspect-[4/3] overflow-hidden rounded-lg"
              }
            >
              <Image
                src={item.source}
                alt={item.alt ?? item.title}
                fill
                priority={priority && index === 0}
                sizes={
                  index === 0
                    ? "(min-width: 1024px) 720px, 100vw"
                    : "(min-width: 640px) 360px, 100vw"
                }
                className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-[1.02]"
              />
              {item.galleryCategory ? (
                <Badge className="absolute bottom-3 left-3">
                  {taxonomyLabel(item.galleryCategory, galleryCategories)}
                </Badge>
              ) : null}
            </figure>
          ))}
        </div>
      ) : (
        <div className="bg-muted flex aspect-video items-center justify-center rounded-lg">
          <Music2 className="text-muted-foreground size-10" aria-hidden />
          <span className="sr-only">No profile images available</span>
        </div>
      )}

      {playableMedia.length ? (
        <div className="grid gap-3 sm:grid-cols-2" aria-label="Videos and media">
          {playableMedia.map((item) => (
            <Card key={item.id} size="sm">
              <CardContent className="space-y-3">
                {item.provider === "local-mp4" && typeof item.source === "string" ? (
                  <video
                    controls
                    preload="metadata"
                    poster={
                      typeof item.thumbnail === "string"
                        ? item.thumbnail
                        : item.thumbnail?.src
                    }
                    className="bg-muted aspect-video w-full rounded-md object-cover"
                  >
                    <source src={item.source} type="video/mp4" />
                    Your browser does not support video playback.
                  </video>
                ) : item.thumbnail ? (
                  <div className="bg-muted relative aspect-video overflow-hidden rounded-md">
                    <Image
                      src={item.thumbnail}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 360px, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Play className="text-primary size-5 shrink-0" aria-hidden />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {item.provider ? titleCase(item.provider) : titleCase(item.kind)}
                        {item.durationSeconds
                          ? ` · ${formatMediaDuration(item.durationSeconds)}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  {item.provider !== "local-mp4" ? (
                    <SafeExternalLink
                      href={String(item.source)}
                      label={`Open ${item.title}`}
                    />
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {audio.length ? (
        <div className="space-y-3" aria-label="Audio samples">
          <h2 className="font-display text-xl font-semibold">Audio samples</h2>
          {audio.map((sample) => (
            <Card key={sample.id} size="sm">
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{sample.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {titleCase(sample.provider)}
                  </p>
                </div>
                {sample.provider === "uploaded" ? (
                  <audio
                    controls
                    preload="none"
                    src={sample.url}
                    aria-label={sample.title}
                  >
                    Your browser does not support audio playback.
                  </audio>
                ) : (
                  <SafeExternalLink
                    href={sample.url}
                    label={`Listen to ${sample.title}`}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {socialLinks.length ? (
        <nav className="flex flex-wrap gap-2" aria-label="External profile links">
          {socialLinks
            .filter((link) => isSafeExternalUrl(link.url))
            .map((link) => (
              <Button
                key={`${link.platform}-${link.url}`}
                asChild
                variant="outline"
                size="sm"
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label ?? titleCase(link.platform)}
                  <ExternalLink aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </Button>
            ))}
        </nav>
      ) : null}
    </section>
  );
}

function SafeExternalLink({ href, label }: { href: string; label: string }) {
  if (!isSafeExternalUrl(href)) return null;
  return (
    <Button asChild variant="outline" size="sm">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} (new tab)`}
      >
        Open <ExternalLink aria-hidden />
      </a>
    </Button>
  );
}

function isSafeExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function formatMediaDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export function MarketplaceLocationSummary({ travel }: { travel: TravelPolicy }) {
  return (
    <ProfileSection title="Location and travel" icon={<MapPin />}>
      <p className="font-medium">
        {travel.baseLocation.city}, {travel.baseLocation.state}
      </p>
      <p className="text-muted-foreground mt-2">
        {travel.nationwide
          ? "Available for events across India"
          : `Travels within ${travel.radiusKm} km of the base location`}
        {travel.travelFee
          ? `; indicative travel fee ${formatMoney(travel.travelFee)}`
          : "."}
      </p>
    </ProfileSection>
  );
}

export function MarketplaceAvailabilitySummary({
  availability,
  entries = [],
}: {
  availability: AvailabilityCalendar;
  entries?: readonly CalendarEntry[];
}) {
  return (
    <MarketplaceAvailabilityCalendar
      availability={availability}
      entries={entries}
      initialMonth={entries[0]?.startsAt.slice(0, 10)}
      title="Availability"
    />
  );
}

export function MarketplacePricingPackages({
  packages,
}: {
  packages: readonly PricingPackage[];
}) {
  if (!packages.length) return null;
  return (
    <section className="space-y-5" aria-labelledby="pricing-heading">
      <h2 id="pricing-heading" className="font-display text-3xl font-semibold">
        Pricing packages
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {packages.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-display text-2xl font-semibold">
                  {formatMoney(item.price)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatDuration(item.durationMinutes)}
                  {item.negotiable ? " · Quote can be tailored" : ""}
                </p>
              </div>
              <p className="text-muted-foreground">{item.description}</p>
              {item.travelIncluded != null || item.equipmentIncluded != null ? (
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
                  {item.artistsIncluded ? (
                    <Badge variant="secondary">{item.artistsIncluded} artists</Badge>
                  ) : null}
                </div>
              ) : null}
              <ul className="space-y-2">
                {item.inclusions.map((inclusion) => (
                  <li key={inclusion} className="flex gap-2">
                    <Check className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                    {inclusion}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function MarketplaceReviews({
  summary,
  reviews,
}: {
  summary: RatingSummary;
  reviews: readonly Review[];
}) {
  return (
    <section className="space-y-5" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-end gap-3">
        <h2 id="reviews-heading" className="font-display text-3xl font-semibold">
          Reviews
        </h2>
        <p className="text-muted-foreground">
          <Star className="mr-1 inline size-4 fill-current" aria-hidden />
          {summary.average.toFixed(1)} from {summary.count} reviews
        </p>
      </div>
      {reviews.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle>{review.title ?? `${review.rating}-star review`}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  “{review.comment}”
                </p>
                <p className="mt-4 text-xs font-medium">
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
          The rating summary is illustrative; no published written reviews are available.
        </p>
      )}
    </section>
  );
}

export function MarketplaceCredentials({
  profile,
}: {
  profile: Pick<PerformerProfile, "experience" | "awards" | "certificates" | "equipment">;
}) {
  return (
    <section
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      aria-label="Experience and credentials"
    >
      <CredentialCard
        title="Experience"
        items={[
          `${profile.experience.years} years performing`,
          ...(profile.experience.completedEvents
            ? [`${profile.experience.completedEvents}+ completed events`]
            : []),
          ...profile.experience.highlights,
        ]}
      />
      <CredentialCard
        title="Awards"
        items={
          profile.awards.length
            ? profile.awards.map((award) => `${award.name} · ${award.issuer}`)
            : ["No awards published"]
        }
      />
      <CredentialCard
        title="Certifications"
        items={
          profile.certificates.length
            ? profile.certificates.map(certificateLabel)
            : ["No certificates published"]
        }
      />
      <CredentialCard title="Equipment" items={profile.equipment.map(equipmentLabel)} />
    </section>
  );
}

function certificateLabel(item: Certificate) {
  return `${item.name} · ${item.issuer}`;
}

function equipmentLabel(item: EquipmentItem) {
  const brand = item.brand ? `${item.brand} ` : "";
  return `${brand}${item.name}${item.quantity > 1 ? ` × ${item.quantity}` : ""} · ${
    item.providedByPerformer ? "included" : "venue supplied"
  }`;
}

function CredentialCard({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-muted-foreground space-y-2">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function MarketplaceProfileHero({
  name,
  headline,
  description,
  location,
  verified,
  tags,
  coverImage,
  profilePhoto,
  trustSignals,
  actions,
}: {
  name: string;
  headline: string;
  description: string;
  location: string;
  verified: boolean;
  tags: readonly string[];
  coverImage?: MediaAsset;
  profilePhoto?: MediaAsset;
  trustSignals?: TrustSignals;
  actions?: ReactNode;
}) {
  return (
    <header className="space-y-4">
      {coverImage && profilePhoto ? (
        <div className="relative mb-20">
          <div className="bg-muted relative aspect-[16/7] overflow-hidden rounded-xl">
            <Image
              src={coverImage.source}
              alt={coverImage.alt ?? coverImage.title}
              fill
              priority
              sizes="(min-width: 1024px) 780px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="bg-background absolute -bottom-16 left-5 size-32 overflow-hidden rounded-full border-4 shadow-md sm:left-8 sm:size-36">
            <Image
              src={profilePhoto.source}
              alt={profilePhoto.alt ?? profilePhoto.title}
              fill
              priority
              sizes="144px"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{headline}</Badge>
        {verified ? (
          <Badge variant="secondary">
            <BadgeCheck aria-hidden /> Verified profile
          </Badge>
        ) : null}
      </div>
      {trustSignals ? <TrustBadges signals={trustSignals} compact limit={4} /> : null}
      <div>
        <h1 className="font-display text-4xl font-semibold text-balance sm:text-5xl">
          {name}
        </h1>
        <p className="text-muted-foreground mt-2 flex items-center gap-2">
          <MapPin className="size-4" aria-hidden />
          {location}
        </p>
      </div>
      <section aria-labelledby="profile-about-heading" className="space-y-2">
        <h2 id="profile-about-heading" className="font-display text-2xl font-semibold">
          About
        </h2>
        <p className="text-muted-foreground max-w-3xl text-lg leading-relaxed">
          {description}
        </p>
      </section>
      <div className="flex flex-wrap gap-2" aria-label="Profile tags">
        {[...new Set(tags)].map((tag) => (
          <Badge key={tag} variant="outline">
            {titleCase(tag)}
          </Badge>
        ))}
      </div>
      {actions}
    </header>
  );
}

export function MarketplacePerformerDetails({ profile }: { profile: PerformerProfile }) {
  const groups = [
    {
      label: "Category",
      values: profile.categoryIds.map((id) => taxonomyLabel(id, performerCategories)),
    },
    {
      label: "Subcategory",
      values: profile.subcategoryIds.map((id) =>
        taxonomyLabel(id, performerSubcategories),
      ),
    },
    {
      label: "Skills",
      values: profile.skillIds.map((id) => taxonomyLabel(id, performerSkills)),
    },
    {
      label: "Genres",
      values: profile.genreIds.map((id) => taxonomyLabel(id, genres)),
    },
    {
      label: "Instruments",
      values: profile.instrumentIds.map((id) => taxonomyLabel(id, instruments)),
    },
    {
      label: "Languages",
      values: profile.languageIds.map((id) => taxonomyLabel(id, languages)),
    },
  ].filter((group) => group.values.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance profile</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        {groups.map((group) => (
          <div key={group.label} className="space-y-2">
            <h3 className="text-muted-foreground text-sm font-medium">{group.label}</h3>
            <div className="flex flex-wrap gap-2">
              {[...new Set(group.values)].map((value) => (
                <Badge key={value} variant="outline">
                  {value}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function MarketplaceProfileFacts({
  facts,
}: {
  facts: readonly { label: string; value: string; icon?: ReactNode }[];
}) {
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-label="Profile facts"
    >
      {facts.map((fact) => (
        <Card key={fact.label}>
          <CardContent className="flex gap-3">
            <div className="text-primary mt-0.5 [&_svg]:size-5" aria-hidden>
              {fact.icon}
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{fact.label}</p>
              <p className="mt-1 font-medium">{fact.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function MarketplaceBookingCta({
  title,
  price,
  primaryHref,
  primaryLabel,
  secondaryHref = "/search",
  intent,
}: {
  title: string;
  price?: string;
  primaryHref: Route;
  primaryLabel: string;
  secondaryHref?: Route;
  intent?: { eventType?: string; date?: string };
}) {
  return (
    <Card className="lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {price ? (
          <div>
            <p className="text-muted-foreground text-sm">Representative starting price</p>
            <p className="font-display mt-1 text-3xl font-semibold">{price}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Final quotes depend on event requirements.
            </p>
          </div>
        ) : null}
        {intent?.eventType || intent?.date ? (
          <div className="bg-muted rounded-lg p-3 text-sm">
            <p className="font-medium">Your booking intent</p>
            {intent.eventType ? (
              <p className="text-muted-foreground">Event: {intent.eventType}</p>
            ) : null}
            {intent.date ? (
              <p className="text-muted-foreground">Date: {intent.date}</p>
            ) : null}
          </div>
        ) : null}
        <Button asChild size="lg" className="w-full">
          <Link href={primaryHref}>{primaryLabel}</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={secondaryHref}>Compare options</Link>
        </Button>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Demo only: this opens the structured booking request flow and does not take
          payment.
        </p>
      </CardContent>
    </Card>
  );
}

export function MarketplaceTrustCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="text-primary size-5" aria-hidden />
          Trust context
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground space-y-3 leading-relaxed">
        <p>
          Profile details, ratings, pricing, availability, and event counts are
          illustrative.
        </p>
        <Link
          className="text-primary font-medium underline-offset-4 hover:underline"
          href="/trust-safety"
        >
          Read trust and safety guidance
        </Link>
      </CardContent>
    </Card>
  );
}

export function MarketplacePerformerFacts({ profile }: { profile: PerformerProfile }) {
  return (
    <MarketplaceProfileFacts
      facts={[
        {
          icon: <Star />,
          label: "Rating",
          value: `${profile.rating.average.toFixed(1)} · ${profile.rating.count} reviews`,
        },
        {
          icon: <Clock3 />,
          label: "Typical duration",
          value: formatDuration(profile.typicalPerformanceDurationMinutes),
        },
        {
          icon: <CalendarCheck />,
          label: "Events performed",
          value: profile.experience.completedEvents
            ? `${profile.experience.completedEvents}+ events`
            : "Available on enquiry",
        },
        {
          icon: <Users />,
          label: "Experience",
          value: `${profile.experience.years} years`,
        },
        {
          icon: <Users />,
          label: "Lineup",
          value: profile.memberCount
            ? `${profile.memberCount} members`
            : "Solo performer",
        },
        {
          icon: <Clock3 />,
          label: "Response",
          value: profile.responseTimeMinutes
            ? `Usually within ${formatDuration(profile.responseTimeMinutes)}`
            : "Confirmed after enquiry",
        },
      ]}
    />
  );
}

export function MarketplaceFaq({
  items,
  heading = "Frequently asked questions",
}: {
  items: PerformerProfile["faqs"];
  heading?: string;
}) {
  return <FaqAccordion items={items} heading={heading} />;
}

function ProfileSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-primary [&_svg]:size-5" aria-hidden>
            {icon}
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
