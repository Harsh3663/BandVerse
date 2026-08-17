"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  featuredPerformance,
  filterVideos,
  latestPerformances,
  mostWatchedVideos,
  trendingVideos,
} from "../selectors";
import {
  videoEventFilters,
  type PortfolioMediaItem,
  type VideoEventFilter,
} from "../types";
import { MediaCard } from "./media-card";

type VideoSort = "latest" | "trending" | "most-watched";

export function VideoShowcase({ media }: { media: readonly PortfolioMediaItem[] }) {
  const [filter, setFilter] = useState<VideoEventFilter | "all">("all");
  const [sort, setSort] = useState<VideoSort>("latest");
  const featured = featuredPerformance(media);

  const filtered = useMemo(() => {
    const pool = filterVideos(media, filter);
    if (sort === "trending") return trendingVideos(pool, 12);
    if (sort === "most-watched") return mostWatchedVideos(pool, 12);
    return latestPerformances(pool, 12);
  }, [filter, media, sort]);

  return (
    <section className="space-y-6" aria-labelledby="video-showcase-heading">
      <div className="space-y-2">
        <h2 id="video-showcase-heading" className="font-display text-3xl font-semibold">
          Video showcase
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Featured performances, latest sets, trending clips, and most-watched videos for
          organizers evaluating stage chemistry.
        </p>
      </div>

      {featured ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-xl font-semibold">Featured performance</h3>
            <Badge>Featured</Badge>
          </div>
          <div className="max-w-3xl">
            <MediaCard item={featured} />
          </div>
        </div>
      ) : null}

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter videos by event"
      >
        <Button
          type="button"
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        {videoEventFilters.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={filter === item.id ? "default" : "outline"}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Sort videos">
        {(
          [
            ["latest", "Latest performances"],
            ["trending", "Trending videos"],
            ["most-watched", "Most watched"],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={sort === value ? "secondary" : "ghost"}
            onClick={() => setSort(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <MediaCard key={item.id} item={item} compact />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No videos match this filter yet.</p>
      )}
    </section>
  );
}
