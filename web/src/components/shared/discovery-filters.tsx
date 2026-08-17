"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import type { FormEventHandler } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FilterOption } from "@/data/discovery-types";
import { cn } from "@/lib/utils";

export interface DiscoveryFilter {
  id: string;
  label: string;
  options: readonly FilterOption[];
  value?: string;
}

interface DiscoveryFiltersProps {
  filters?: readonly DiscoveryFilter[];
  query?: string;
  queryName?: string;
  queryPlaceholder?: string;
  action?: string;
  resultCount?: number;
  clearHref?: string;
  className?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}

export function DiscoveryFilters({
  filters = [],
  query,
  queryName = "q",
  queryPlaceholder = "Search performers, genres, or cities",
  action,
  resultCount,
  clearHref,
  className,
  onSubmit,
}: DiscoveryFiltersProps) {
  return (
    <form
      action={action}
      onSubmit={onSubmit}
      role="search"
      className={cn("border-border bg-card rounded-lg border p-4 shadow-sm", className)}
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_repeat(2,minmax(10rem,0.4fr))_auto]">
        <div>
          <label htmlFor="discovery-query" className="sr-only">
            Search
          </label>
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="discovery-query"
              name={queryName}
              type="search"
              defaultValue={query}
              placeholder={queryPlaceholder}
              className="pl-10"
            />
          </div>
        </div>
        {filters.map((filter) => (
          <div key={filter.id}>
            <label htmlFor={filter.id} className="sr-only">
              {filter.label}
            </label>
            <select
              id={filter.id}
              name={filter.id}
              defaultValue={filter.value ?? ""}
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        <Button type="submit">
          <SlidersHorizontal data-icon="inline-start" aria-hidden="true" />
          Apply filters
        </Button>
      </div>
      {resultCount !== undefined || clearHref ? (
        <div className="mt-3 flex min-h-6 items-center justify-between gap-3">
          {resultCount !== undefined ? (
            <p className="text-muted-foreground text-sm" aria-live="polite">
              {resultCount.toLocaleString("en-IN")}{" "}
              {resultCount === 1 ? "result" : "results"}
            </p>
          ) : (
            <span />
          )}
          {clearHref ? (
            <Button asChild variant="ghost" size="sm">
              <a href={clearHref}>
                <X data-icon="inline-start" aria-hidden="true" />
                Clear filters
              </a>
            </Button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
