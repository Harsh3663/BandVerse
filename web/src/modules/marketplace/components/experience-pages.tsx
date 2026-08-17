import { ArrowRight, Clock3, MapPin, Music2, Users } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PerformerCard } from "@/components/shared/performer-card";
import { PageHero } from "@/components/shared/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { experiencePackages, getExperiencePackage } from "../config/experience-packages";
import { toDiscoveryPerformers } from "../discovery-adapter";
import { formatDuration, formatMoney, titleCase } from "../format";
import { mockPerformerProfiles, mockVenueProfiles } from "../mock-data";
import { ExperienceBookingCta } from "./experience-booking-cta";
import { mergeTrustSignals, TrustPanel } from "./trust";

const gridClass = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";

export function ExperiencesHubPage() {
  return (
    <>
      <PageHero
        eyebrow="Experience Packages"
        title="Curated multi-artist event programmes"
        description="Book entire experiences with timelines, equipment lists, suggested budgets, and venue pairings."
        actions={
          <Button asChild variant="outline">
            <Link href="/recommendations">Build a custom brief</Link>
          </Button>
        }
      />
      <Container className="py-10 sm:py-14">
        <div className={gridClass}>
          {experiencePackages.map((experience) => {
            const venue = mockVenueProfiles.find(
              (item) => item.id === experience.recommendedVenueId,
            );
            return (
              <Card key={experience.slug} className="flex h-full flex-col">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">
                    {titleCase(experience.eventTypeId)}
                  </Badge>
                  <CardTitle className="text-xl">{experience.title}</CardTitle>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {experience.tagline}
                  </p>
                </CardHeader>
                <CardContent className="mt-auto space-y-4">
                  <dl className="text-muted-foreground grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock3 className="size-4" aria-hidden />
                      {formatDuration(experience.durationMinutes)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="size-4" aria-hidden />
                      {experience.artistIds.length} artists
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" aria-hidden />
                      {venue?.name ?? "Venue TBD"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Music2 className="size-4" aria-hidden />
                      From {formatMoney(experience.suggestedBudget)}
                    </div>
                  </dl>
                  <Button asChild className="w-full">
                    <Link href={`/experiences/${experience.slug}` as Route}>
                      View experience
                      <ArrowRight data-icon="inline-end" aria-hidden />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </>
  );
}

export function ExperienceDetailPage({ slug }: { slug: string }) {
  const experience = getExperiencePackage(slug);
  if (!experience) notFound();

  const venue = mockVenueProfiles.find(
    (item) => item.id === experience.recommendedVenueId,
  );
  const artists = experience.artistIds
    .map((id) => mockPerformerProfiles.find((profile) => profile.id === id))
    .filter((profile): profile is NonNullable<typeof profile> => Boolean(profile));
  const performers = toDiscoveryPerformers(artists);
  const experienceTrust = mergeTrustSignals([
    ...artists.map((artist) => artist.trustSignals),
    ...(venue ? [venue.trustSignals] : []),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Experience package"
        title={experience.title}
        description={experience.tagline}
      />
      <Container className="space-y-12 py-10 sm:py-14">
        <article className="grid items-start gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-8">
            <section className="space-y-3">
              <h2 className="font-heading text-2xl font-semibold">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                {experience.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {experience.genreIds.map((genreId) => (
                  <Badge key={genreId} variant="outline">
                    {titleCase(genreId)}
                  </Badge>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold">Timeline</h2>
              <ol className="space-y-4">
                {experience.timeline.map((item) => (
                  <li key={`${item.time}-${item.title}`}>
                    <Card>
                      <CardContent className="flex gap-4 py-5">
                        <div className="text-primary min-w-14 font-mono text-sm font-semibold">
                          {item.time}
                        </div>
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold">Equipment</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {experience.equipment.map((item) => (
                  <li
                    key={item}
                    className="border-border bg-card rounded-lg border px-4 py-3 text-sm"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold">Featured artists</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {performers.map((performer) => (
                  <PerformerCard key={performer.id} performer={performer} />
                ))}
              </div>
            </section>
          </div>

          <ExperienceBookingCta
            experience={experience}
            venueName={venue?.name ?? "Recommended venue"}
            primaryArtistName={artists[0]?.displayName ?? "Curated ensemble"}
          />
          <TrustPanel signals={experienceTrust} heading="Package trust assurance" />
        </article>
      </Container>
    </>
  );
}
