"use client";

/**
 * Additive analytics widgets for performer media portfolio.
 * Intended for optional composition — does not modify existing dashboard layouts.
 */

export interface PortfolioAnalyticsWidget {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly format: "count" | "percent";
}

export function PortfolioAnalyticsWidgets({
  widgets,
}: {
  widgets: readonly PortfolioAnalyticsWidget[];
}) {
  return (
    <section
      aria-label="Portfolio media analytics"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
    >
      {widgets.map((widget) => (
        <div key={widget.id} className="border-border rounded-lg border p-4">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {widget.label}
          </p>
          <p className="font-display mt-1 text-2xl font-semibold">
            {widget.format === "percent"
              ? `${(widget.value * 100).toFixed(1)}%`
              : widget.value.toLocaleString("en-IN")}
          </p>
        </div>
      ))}
    </section>
  );
}
