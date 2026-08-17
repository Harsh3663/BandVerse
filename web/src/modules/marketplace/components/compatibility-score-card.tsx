import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { CompatibilityBreakdown } from "../types";

const dimensionLabels: Record<
  Exclude<keyof CompatibilityBreakdown, "overallMatch">,
  string
> = {
  availabilityScore: "Availability",
  budgetMatch: "Budget match",
  distanceMatch: "Distance",
  genreMatch: "Genre match",
  languageMatch: "Language match",
  experienceMatch: "Experience",
};

interface CompatibilityScoreCardProps {
  breakdown: CompatibilityBreakdown;
  performerName?: string;
  className?: string;
  compact?: boolean;
}

function scoreTone(score: number): string {
  if (score >= 80) return "text-success-600";
  if (score >= 60) return "text-primary";
  if (score >= 40) return "text-amber-600";
  return "text-muted-foreground";
}

function ScoreBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="bg-muted h-2 overflow-hidden rounded-full"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={label}
    >
      <div
        className="bg-primary h-full rounded-full transition-[width] duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function CompatibilityScoreCard({
  breakdown,
  performerName,
  className,
  compact = false,
}: CompatibilityScoreCardProps) {
  const dimensions = (
    Object.entries(dimensionLabels) as Array<
      [Exclude<keyof CompatibilityBreakdown, "overallMatch">, string]
    >
  ).map(([key, label]) => ({
    key,
    label,
    score: breakdown[key],
  }));

  return (
    <Card className={cn(className)}>
      <CardHeader className={compact ? "pb-3" : undefined}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">
              {performerName ? `${performerName} match` : "Compatibility breakdown"}
            </CardTitle>
            {!compact ? (
              <p className="text-muted-foreground mt-1 text-sm">
                Rule-based scoring across availability, budget, distance, and fit.
              </p>
            ) : null}
          </div>
          <Badge
            variant="secondary"
            className={cn("text-base", scoreTone(breakdown.overallMatch))}
          >
            {breakdown.overallMatch}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Overall match</span>
            <span className={scoreTone(breakdown.overallMatch)}>
              {breakdown.overallMatch}%
            </span>
          </div>
          <ScoreBar value={breakdown.overallMatch} label="Overall compatibility match" />
        </div>
        <dl className={cn("grid gap-3", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
          {dimensions.map(({ key, label, score }) => (
            <div key={key}>
              <dt className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                <span>{label}</span>
                <span className={scoreTone(score)}>{score}%</span>
              </dt>
              <dd>
                <ScoreBar value={score} label={`${label}: ${score}%`} />
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
