"use client";

import { CheckCircle2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatDuration, formatMoney } from "../format";
import type { ExperiencePackage } from "../types";

interface ExperienceBookingCtaProps {
  experience: ExperiencePackage;
  venueName: string;
  primaryArtistName: string;
}

export function ExperienceBookingCta({
  experience,
  venueName,
  primaryArtistName,
}: ExperienceBookingCtaProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  function handleBook() {
    const id = `pkg-${experience.slug}-${Date.now().toString(36)}`;
    setReference(id);
    setConfirmed(true);
  }

  if (confirmed && reference) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="text-success-500 size-5" aria-hidden />
            Experience request received
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Your mock booking for <strong>{experience.title}</strong> is queued. Reference{" "}
            <strong>{reference}</strong>. A coordinator would confirm artist availability
            and venue hold times.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link
                href={
                  `/bookings/new?package=${experience.slug}&performer=${experience.artistIds[0]}&eventType=${experience.eventTypeId}` as Route
                }
              >
                Open booking wizard
              </Link>
            </Button>
            <Button asChild>
              <Link href="/experiences">Browse more experiences</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle>Book entire experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-muted-foreground text-sm">Suggested budget</p>
          <p className="font-display mt-1 text-3xl font-semibold">
            {formatMoney(experience.suggestedBudget)}
          </p>
        </div>
        <dl className="text-muted-foreground space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt>Duration</dt>
            <dd className="text-foreground font-medium">
              {formatDuration(experience.durationMinutes)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Recommended venue</dt>
            <dd className="text-foreground font-medium">{venueName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Lead artist</dt>
            <dd className="text-foreground font-medium">{primaryArtistName}</dd>
          </div>
        </dl>
        <Button size="lg" className="w-full" onClick={handleBook}>
          Book entire experience
        </Button>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Demo only: this creates a typed mock confirmation without payment or auth.
        </p>
      </CardContent>
    </Card>
  );
}
