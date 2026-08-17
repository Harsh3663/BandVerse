import {
  BadgeCheck,
  Flame,
  IdCard,
  Medal,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getCancellationPolicy, getTrustBadgeDefinition } from "../config/trust";
import type { CancellationPolicyId, TrustBadgeKind, TrustSignals } from "../types";

const trustBadgeIcons: Record<TrustBadgeKind, LucideIcon> = {
  "verified-artist": BadgeCheck,
  "government-id-verified": IdCard,
  "professional-badge": Medal,
  "top-rated": Star,
  trending: TrendingUp,
  featured: Sparkles,
  "emergency-replacement": UserCheck,
  "trusted-venue": ShieldCheck,
};

interface TrustBadgesProps {
  signals: TrustSignals;
  limit?: number;
  compact?: boolean;
  className?: string;
}

export function TrustBadges({
  signals,
  limit,
  compact = false,
  className,
}: TrustBadgesProps) {
  const badges = limit ? signals.badges.slice(0, limit) : signals.badges;
  if (!badges.length) return null;

  return (
    <div className={className} role="list" aria-label="Trust badges" data-trust-badges="">
      <ul className={`flex flex-wrap gap-1.5 ${compact ? "" : "gap-2"}`}>
        {badges.map((kind) => {
          const definition = getTrustBadgeDefinition(kind);
          const Icon = trustBadgeIcons[kind];
          return (
            <li key={kind} role="listitem">
              <Badge
                variant={definition.variant}
                title={definition.description}
                className={compact ? "text-[11px]" : undefined}
              >
                <Icon aria-hidden="true" />
                {definition.label}
              </Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface TrustPanelProps {
  signals: TrustSignals;
  heading?: string;
  footer?: ReactNode;
}

export function TrustPanel({
  signals,
  heading = "Trust and booking assurance",
  footer,
}: TrustPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="text-primary size-5" aria-hidden="true" />
          {heading}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {signals.badges.length ? (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">Trust signals</p>
            <TrustBadges signals={signals} />
            <ul className="text-muted-foreground space-y-2 text-sm leading-relaxed">
              {signals.badges.map((kind) => {
                const definition = getTrustBadgeDefinition(kind);
                const Icon = trustBadgeIcons[kind];
                return (
                  <li key={kind} className="flex gap-2">
                    <Icon
                      className="text-primary mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="text-foreground font-medium">
                        {definition.label}:
                      </span>{" "}
                      {definition.description}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        <CancellationPolicySummary policyId={signals.cancellationPolicyId} />
        {footer}
      </CardContent>
    </Card>
  );
}

export function CancellationPolicySummary({
  policyId,
}: {
  policyId: CancellationPolicyId;
}) {
  const policy = getCancellationPolicy(policyId);
  return (
    <div className="bg-muted/60 rounded-lg p-4">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Flame className="text-primary size-4" aria-hidden="true" />
        {policy.label}
      </p>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        {policy.summary}
      </p>
    </div>
  );
}

export function mergeTrustSignals(signalSets: readonly TrustSignals[]): TrustSignals {
  const badges = [...new Set(signalSets.flatMap((signals) => signals.badges))];
  const cancellationPolicyId =
    signalSets.find((signals) => signals.cancellationPolicyId)?.cancellationPolicyId ??
    "standard";
  return { badges, cancellationPolicyId };
}
