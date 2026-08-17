"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";

import { PerformerCard } from "@/components/shared/performer-card";
import { EmptyState } from "@/components/shared/result-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { marketplaceDiscoveryConfig } from "../config/discovery";
import { eventTypes } from "../config/event-types";
import { genres, instruments, languages, taxonomyLabel } from "../config/taxonomy";
import { toDiscoveryPerformer } from "../discovery-adapter";
import { formatMoney } from "../format";
import { getRecommendations } from "../recommendations";
import type { RecommendationInput, RecommendationResult } from "../types";
import { CompatibilityScoreCard } from "./compatibility-score-card";

const defaultInput: RecommendationInput = {
  eventTypeId: "wedding",
  budget: 120_000,
  guests: 250,
  city: "Mumbai",
  languageIds: ["hindi", "english"],
  genreIds: ["bollywood"],
};

function toggleValue(values: readonly string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function RecommendationsPanel() {
  const [input, setInput] = useState<RecommendationInput>(defaultInput);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function runRecommendations() {
    setLoading(true);
    setSubmitted(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setResult(getRecommendations(input));
    setLoading(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runRecommendations();
  }

  const allResults = result
    ? [...result.performers, ...result.bands, ...result.traditionalGroups]
    : [];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary size-5" aria-hidden />
            Event brief
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2 text-sm">
              <span className="font-medium">Event type</span>
              <Select
                value={input.eventTypeId}
                onValueChange={(eventTypeId) =>
                  setInput((current) => ({ ...current, eventTypeId }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((eventType) => (
                    <SelectItem key={eventType.id} value={eventType.id}>
                      {eventType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium">City</span>
              <Select
                value={input.city}
                onValueChange={(city) => setInput((current) => ({ ...current, city }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {marketplaceDiscoveryConfig.cities.map((city) => (
                    <SelectItem key={city.id} value={city.label}>
                      {city.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2 text-sm">
                <span className="font-medium">Budget (INR)</span>
                <Input
                  type="number"
                  min={10_000}
                  step={5_000}
                  value={input.budget}
                  onChange={(event) =>
                    setInput((current) => ({
                      ...current,
                      budget: Number(event.target.value),
                    }))
                  }
                  required
                />
              </label>
              <label className="block space-y-2 text-sm">
                <span className="font-medium">Guest count</span>
                <Input
                  type="number"
                  min={10}
                  step={10}
                  value={input.guests}
                  onChange={(event) =>
                    setInput((current) => ({
                      ...current,
                      guests: Number(event.target.value),
                    }))
                  }
                  required
                />
              </label>
            </div>

            <label className="block space-y-2 text-sm">
              <span className="font-medium">Event date (optional)</span>
              <Input
                type="date"
                value={input.eventDate ?? ""}
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    eventDate: event.target.value || undefined,
                  }))
                }
              />
            </label>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Languages</legend>
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => {
                  const active = input.languageIds.includes(language.id);
                  return (
                    <Button
                      key={language.id}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      onClick={() =>
                        setInput((current) => ({
                          ...current,
                          languageIds: toggleValue(current.languageIds, language.id),
                        }))
                      }
                    >
                      {language.label}
                    </Button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Genres</legend>
              <div className="flex flex-wrap gap-2">
                {genres.slice(0, 12).map((genre) => {
                  const active = input.genreIds.includes(genre.id);
                  return (
                    <Button
                      key={genre.id}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      onClick={() =>
                        setInput((current) => ({
                          ...current,
                          genreIds: toggleValue(current.genreIds, genre.id),
                        }))
                      }
                    >
                      {genre.label}
                    </Button>
                  );
                })}
              </div>
            </fieldset>

            <Button
              type="button"
              className="w-full"
              disabled={loading}
              onClick={() => void runRecommendations()}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Scoring performers…
                </>
              ) : (
                "Get recommendations"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {!submitted ? (
          <EmptyState
            title="Share your event brief"
            description="Fill in the form to receive rule-based performer, band, and traditional group recommendations."
          />
        ) : loading ? (
          <div className="border-border bg-card flex min-h-64 items-center justify-center rounded-lg border border-dashed">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Matching performers to your brief…
            </div>
          </div>
        ) : result && allResults.length ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Recommendation summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {result.compatibilityScore}% avg match
                  </Badge>
                  <Badge variant="outline">
                    Est. {formatMoney(result.estimatedBudget)}
                  </Badge>
                </div>
                <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm leading-relaxed">
                  {result.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
                {result.suggestedInstrumentIds.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {[...new Set(result.suggestedInstrumentIds)].map((instrumentId) => (
                      <Badge key={instrumentId} variant="outline">
                        {taxonomyLabel(instrumentId, instruments)}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {allResults.map((item) => (
              <div
                key={item.performer.id}
                className="grid gap-4 xl:grid-cols-[1fr_0.85fr]"
              >
                <PerformerCard performer={toDiscoveryPerformer(item.performer)} />
                <CompatibilityScoreCard
                  breakdown={item.breakdown}
                  performerName={item.performer.displayName}
                  compact
                />
              </div>
            ))}
          </>
        ) : (
          <EmptyState
            title="No strong matches yet"
            description="Try widening your budget, selecting fewer language filters, or choosing a nearby city."
            clearHref="/search"
          />
        )}
      </div>
    </div>
  );
}
