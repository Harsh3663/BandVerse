import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/config/site";

import { formatMoney } from "../format";
import type { CalendarEntry, EventContext, PerformerProfile, Review } from "../types";
import { computeCompatibility } from "../compatibility";
import { CompatibilityScoreCard } from "./compatibility-score-card";
import { MarketplaceProfileActions } from "./profile-actions";
import { PerformerPortfolio } from "./performer-portfolio";
import {
  MarketplaceBookingCta,
  MarketplaceMediaGallery,
  MarketplaceProfileHero,
} from "./profile-modules";

export interface MarketplacePerformerProfileProps {
  profile: PerformerProfile;
  reviews?: readonly Review[];
  calendarEntries?: readonly CalendarEntry[];
  canonicalPath: string;
  bookingHref: Route;
  bookingIntent?: { eventType?: string; date?: string };
  eventContext?: EventContext;
}

export function MarketplacePerformerProfile({
  profile,
  reviews = [],
  calendarEntries = [],
  canonicalPath,
  bookingHref,
  bookingIntent,
  eventContext,
}: MarketplacePerformerProfileProps) {
  const structuredImage =
    typeof profile.coverImage.source === "string"
      ? profile.coverImage.source
      : profile.coverImage.source.src;
  const startingPackage = profile.pricingPackages.reduce(
    (lowest, item) =>
      !lowest || item.price.amount < lowest.price.amount ? item : lowest,
    profile.pricingPackages[0],
  );
  const reportQuery = new URLSearchParams({
    intent: "report",
    performer: profile.displayName,
    profile: canonicalPath,
    topic: "safety",
  });
  const reportHref = `/contact?${reportQuery.toString()}` as Route;
  const compatibility = eventContext
    ? computeCompatibility(profile, eventContext)
    : undefined;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": profile.kind === "solo" ? "Person" : "MusicGroup",
          name: profile.displayName,
          description: profile.biography,
          url: `${siteConfig.url}${canonicalPath}`,
          image: new URL(structuredImage, siteConfig.url).toString(),
          genre: profile.genreIds,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: profile.rating.average,
            reviewCount: profile.rating.count,
          },
          homeLocation: {
            "@type": "Place",
            name: `${profile.travel.baseLocation.city}, ${profile.travel.baseLocation.state}`,
          },
        }}
      />
      <Container className="py-8 sm:py-12">
        <article className="space-y-12">
          <div className="grid items-start gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-6">
              <MarketplaceProfileHero
                name={profile.displayName}
                headline={profile.headline}
                description={profile.biography}
                location={`${profile.travel.baseLocation.city}, ${profile.travel.baseLocation.state}`}
                verified={profile.verified}
                tags={[
                  ...profile.categoryIds,
                  ...profile.genreIds,
                  ...profile.languageIds,
                ]}
                coverImage={profile.coverImage}
                profilePhoto={profile.profilePhoto}
                trustSignals={profile.trustSignals}
                actions={
                  <MarketplaceProfileActions
                    name={profile.displayName}
                    canonicalPath={canonicalPath}
                    reportHref={reportHref}
                  />
                }
              />
              <MarketplaceMediaGallery
                media={profile.mediaGallery}
                videos={profile.videos}
                audio={profile.audioSamples}
                socialLinks={profile.socialLinks}
              />
            </div>
            <div className="space-y-4 lg:sticky lg:top-24">
              <MarketplaceBookingCta
                title="Plan an enquiry"
                price={startingPackage ? formatMoney(startingPackage.price) : undefined}
                primaryHref={bookingHref}
                primaryLabel="Enquire about this performer"
                intent={bookingIntent}
              />
              {compatibility ? (
                <CompatibilityScoreCard
                  breakdown={compatibility}
                  performerName={profile.displayName}
                  compact
                />
              ) : null}
            </div>
          </div>

          <PerformerPortfolio
            profile={profile}
            reviews={reviews}
            calendarEntries={calendarEntries}
            trustFooter={
              <Link
                className="text-primary text-sm font-medium underline-offset-4 hover:underline"
                href="/trust-safety"
              >
                Read trust and safety guidance
              </Link>
            }
          />
        </article>
      </Container>
    </>
  );
}
