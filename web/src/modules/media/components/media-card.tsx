import { ExternalLink, FileText, Heart, Play, Eye } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { formatCompactCount, formatDuration } from "../selectors";
import { mediaCategoryLabels, type PortfolioMediaItem } from "../types";

export function MediaCard({
  item,
  compact = false,
}: {
  item: PortfolioMediaItem;
  compact?: boolean;
}) {
  const duration = formatDuration(item.duration);
  const href = item.source.startsWith("http") ? item.source : undefined;

  return (
    <Card size="sm" className="overflow-hidden">
      <CardContent className="space-y-3">
        <div
          className={
            compact
              ? "bg-muted relative aspect-video overflow-hidden rounded-md"
              : "bg-muted relative aspect-[16/10] overflow-hidden rounded-md"
          }
        >
          {item.thumbnail || item.type === "image" ? (
            <Image
              src={item.thumbnail ?? item.source}
              alt={item.title}
              fill
              sizes="(min-width: 768px) 320px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              {item.type === "pdf" ? (
                <FileText className="size-8" aria-hidden />
              ) : (
                <Play className="size-8" aria-hidden />
              )}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-2 text-xs text-white">
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" aria-hidden />
              {formatCompactCount(item.views)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3.5" aria-hidden />
              {formatCompactCount(item.likes)}
            </span>
            {duration ? <span className="font-mono">{duration}</span> : null}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{mediaCategoryLabels[item.category]}</Badge>
            {item.featured ? <Badge>Featured</Badge> : null}
            {item.eventFilter ? (
              <Badge variant="outline" className="capitalize">
                {item.eventFilter}
              </Badge>
            ) : null}
          </div>
          <h3 className="font-medium text-balance">{item.title}</h3>
          {!compact ? (
            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
              {item.description}
            </p>
          ) : null}
          {href ? (
            <Button asChild variant="outline" size="sm">
              <a href={href} target="_blank" rel="noreferrer">
                {item.type === "audio"
                  ? "Listen"
                  : item.type === "pdf"
                    ? "Open PDF"
                    : "Watch"}
                <ExternalLink data-icon="inline-end" aria-hidden />
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
