import { ArrowRight, ExternalLink, Play } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PerformerCard } from "@/components/shared/performer-card";
import { EmptyState } from "@/components/shared/result-state";
import { PageHero } from "@/components/shared/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  culturalSoundCategories,
  culturalSoundDimensions,
  getCulturalSoundCategory,
} from "../config/cultural-sounds";
import { resolveCategoryGallery, resolveFeaturedArtists } from "../cultural-sounds";
import { toDiscoveryPerformers } from "../discovery-adapter";
import { titleCase } from "../format";

const gridClass = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export function SoundsHubPage() {
  return (
    <>
      <PageHero
        eyebrow="Discover India's Sounds"
        title="Browse cultural performance traditions"
        description="Explore regions, instruments, festivals, and moods that shape live bookings across India."
        actions={
          <Button asChild variant="outline">
            <Link href="/recommendations">Get AI recommendations</Link>
          </Button>
        }
      />
      <Container className="space-y-12 py-10 sm:py-14">
        {culturalSoundDimensions.map((dimension) => {
          const categories = culturalSoundCategories.filter(
            (category) => category.dimension === dimension.id,
          );
          return (
            <section key={dimension.id} className="space-y-5">
              <div>
                <h2 className="font-heading text-2xl font-semibold">{dimension.label}</h2>
                <p className="text-muted-foreground mt-1">{dimension.description}</p>
              </div>
              <div className={gridClass}>
                {categories.map((category) => (
                  <Card key={category.slug} className="group overflow-hidden py-0">
                    <Link
                      href={`/sounds/${category.slug}` as Route}
                      className="focus-visible:ring-ring block h-full outline-none focus-visible:ring-3"
                    >
                      <CardContent className="space-y-3 py-5">
                        <Badge variant="secondary">{titleCase(dimension.id)}</Badge>
                        <h3 className="font-heading text-lg font-semibold">
                          {category.label}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                          {category.tagline}
                        </p>
                        <span className="text-primary inline-flex items-center gap-1 text-sm font-medium">
                          Explore
                          <ArrowRight className="size-4" aria-hidden />
                        </span>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </Container>
    </>
  );
}

export function CulturalSoundPage({ slug }: { slug: string }) {
  const category = getCulturalSoundCategory(slug);
  if (!category) notFound();

  const featuredArtists = resolveFeaturedArtists(category);
  const gallery = resolveCategoryGallery(category);
  const performers = toDiscoveryPerformers(featuredArtists);

  return (
    <>
      <PageHero
        eyebrow={titleCase(category.dimension)}
        title={category.label}
        description={category.tagline}
        actions={
          <Button asChild>
            <Link
              href={
                `/bookings/new?eventType=${category.matchCriteria?.eventTypeIds?.[0] ?? "concert"}` as Route
              }
            >
              Book Now
            </Link>
          </Button>
        }
      />
      <Container className="space-y-12 py-10 sm:py-14">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">About this tradition</h2>
            <p className="text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{category.history}</p>
            </CardContent>
          </Card>
        </section>

        {gallery.length ? (
          <section className="space-y-5">
            <h2 className="font-heading text-2xl font-semibold">Gallery</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {gallery.map((item) => (
                <figure
                  key={item.id}
                  className="bg-muted relative aspect-[4/3] overflow-hidden rounded-lg"
                >
                  <Image
                    src={item.source}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 280px, 50vw"
                    className="object-cover"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm text-white">
                    {item.performerName}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {category.videos.length ? (
          <section className="space-y-5">
            <h2 className="font-heading text-2xl font-semibold">Videos</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {category.videos.map((video) => (
                <Card key={video.title}>
                  <CardContent className="flex items-center justify-between gap-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted flex size-10 items-center justify-center rounded-full">
                        <Play className="size-4" aria-hidden />
                      </div>
                      <p className="font-medium">{video.title}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <a href={video.url} target="_blank" rel="noreferrer">
                        Watch
                        <ExternalLink data-icon="inline-end" aria-hidden />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-semibold">Featured artists</h2>
              <p className="text-muted-foreground mt-1">
                Performers aligned with {category.label.toLowerCase()} bookings.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/search?category=${category.slug}` as Route}>Search all</Link>
            </Button>
          </div>
          {performers.length ? (
            <div className={gridClass}>
              {performers.map((performer) => (
                <PerformerCard key={performer.id} performer={performer} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Featured artists coming soon"
              description="Try the recommendation engine or full search to discover related performers."
              clearHref="/recommendations"
            />
          )}
        </section>
      </Container>
    </>
  );
}
