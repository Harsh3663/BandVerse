import { Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatTime, titleCase } from "../format";
import { timelineKindLabel } from "../event-helpers";
import type { MarketplaceEventTimelineItem } from "../types";

function timelineStatusVariant(
  status: MarketplaceEventTimelineItem["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "completed":
      return "secondary";
    case "delayed":
      return "destructive";
    default:
      return "outline";
  }
}

export function MarketplaceEventTimeline({
  items,
  title = "Event timeline",
  compact = false,
}: {
  items: readonly MarketplaceEventTimelineItem[];
  title?: string;
  compact?: boolean;
}) {
  if (!items.length) return null;

  return (
    <Card>
      <CardHeader className={compact ? "pb-3" : undefined}>
        <CardTitle className={compact ? "text-lg" : undefined}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-0" aria-label={title} role="list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li
                key={item.id}
                className="relative flex gap-4 pb-6 last:pb-0"
                aria-labelledby={`${item.id}-label`}
                aria-describedby={`${item.id}-time ${item.id}-status`}
              >
                {!isLast ? (
                  <span
                    className="bg-border absolute top-6 left-[11px] h-[calc(100%-0.5rem)] w-px"
                    aria-hidden="true"
                  />
                ) : null}
                <span
                  className="bg-primary/10 text-primary relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full"
                  aria-hidden="true"
                >
                  <Clock3 className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p id={`${item.id}-label`} className="font-medium">
                        {item.label}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {timelineKindLabel(item.kind)}
                      </p>
                    </div>
                    <Badge
                      id={`${item.id}-status`}
                      variant={timelineStatusVariant(item.status)}
                    >
                      {titleCase(item.status)}
                    </Badge>
                  </div>
                  <p id={`${item.id}-time`} className="text-muted-foreground text-sm">
                    {formatTime(item.startTime)}
                    {item.endTime ? ` – ${formatTime(item.endTime)}` : null}
                  </p>
                  {item.notes ? (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.notes}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
