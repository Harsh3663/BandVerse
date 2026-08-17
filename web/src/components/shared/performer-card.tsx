import { BadgeCheck, CalendarCheck, MapPin } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { DiscoveryPerformer } from "@/data/discovery-types";
import { formatCurrency, formatCompactNumber } from "@/lib/discovery";
import { cn } from "@/lib/utils";

interface PerformerCardProps {
  performer: DiscoveryPerformer;
  className?: string;
  priority?: boolean;
}

export function PerformerCard({
  performer,
  className,
  priority = false,
}: PerformerCardProps) {
  return (
    <Card
      className={cn(
        "group/card h-full gap-0 py-0 transition-shadow hover:shadow-md",
        className,
      )}
    >
      <Link
        href={performer.href as Route}
        className="focus-visible:ring-ring block outline-none focus-visible:ring-3"
        aria-label={`View ${performer.name}`}
      >
        <div className="bg-muted relative aspect-[4/3] overflow-hidden">
          <Image
            src={performer.image}
            alt={performer.imageAlt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover/card:scale-[1.02] motion-reduce:transition-none"
          />
          <Badge className="absolute top-3 left-3" variant="secondary">
            {performer.category}
          </Badge>
        </div>
      </Link>
      <CardContent className="flex flex-1 flex-col gap-3 py-4">
        <div>
          <div className="flex items-start gap-2">
            <h2 className="font-heading flex-1 text-lg leading-snug font-semibold">
              <Link
                className="hover:text-primary focus-visible:underline"
                href={performer.href as Route}
              >
                {performer.name}
              </Link>
            </h2>
            {performer.verified ? (
              <BadgeCheck
                className="text-success-500 mt-0.5 size-4 shrink-0"
                aria-label="Verified performer"
              />
            ) : null}
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
            <MapPin className="size-3.5" aria-hidden="true" />
            {performer.location}
          </p>
        </div>
        {performer.description ? (
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {performer.description}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-1.5" aria-label="Specialties">
          {[...new Set(performer.tags)].slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        {performer.trustBadges?.length ? (
          <div className="flex flex-wrap gap-1" aria-label="Trust badges">
            {performer.trustBadges.slice(0, 2).map((badge) => (
              <Badge key={badge} variant="secondary" className="text-[11px]">
                {badge}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <div className="text-sm">
          <span className="font-semibold">{performer.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">
            {performer.reviewCount
              ? ` · ${formatCompactNumber(performer.reviewCount)} reviews`
              : ""}
          </span>
        </div>
        <div className="text-right text-sm">
          <span className="font-semibold">{formatCurrency(performer.startingPrice)}</span>
          <span className="text-muted-foreground block text-xs">starting price</span>
        </div>
        {performer.completedEvents ? (
          <span className="sr-only">
            <CalendarCheck aria-hidden="true" />
            {performer.completedEvents} events completed
          </span>
        ) : null}
      </CardFooter>
    </Card>
  );
}
