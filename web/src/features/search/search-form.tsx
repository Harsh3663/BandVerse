import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  eventTypes,
  genres,
  instruments,
  languages,
  marketplaceCities,
  maximumDistanceOptions,
  minimumRatingOptions,
  performerCategories,
  performerKinds,
} from "@/modules/marketplace";

import {
  activeSearchFilters,
  hasActiveSearch,
  searchSortOptions,
  type SearchQuery,
} from "./search";

interface SearchFormProps {
  query: SearchQuery;
  action: "/search" | "/search/results";
  resultCount?: number;
}

export function SearchForm({ query, action, resultCount }: SearchFormProps) {
  const activeFilters = activeSearchFilters(query);

  return (
    <form
      action={action}
      method="get"
      role="search"
      aria-label="Filter performers"
      className="border-border bg-card rounded-lg border p-4 shadow-sm sm:p-5"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FormField label="Search performers" className="md:col-span-2">
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              name="q"
              type="search"
              defaultValue={query.q}
              placeholder="Artist, band, style, or instrument"
              className="pl-10"
            />
          </div>
        </FormField>
        <FilterSelect name="city" label="City" emptyLabel="Any city" value={query.city}>
          {marketplaceCities.map((city) => (
            <option key={city.id} value={city.label}>
              {city.label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          name="category"
          label="Category"
          emptyLabel="Any category"
          value={query.category}
        >
          {performerCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </FilterSelect>
      </div>

      <fieldset className="border-border mt-5 border-t pt-5">
        <legend className="text-sm font-semibold">More filters</legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <FilterSelect
            name="kind"
            label="Performer type"
            emptyLabel="Any performer"
            value={query.kind}
          >
            {performerKinds.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            name="instrument"
            label="Instrument"
            emptyLabel="Any instrument"
            value={query.instrument}
          >
            {instruments.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            name="genre"
            label="Genre"
            emptyLabel="Any genre"
            value={query.genre}
          >
            {genres.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            name="language"
            label="Language"
            emptyLabel="Any language"
            value={query.language}
          >
            {languages.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            name="eventType"
            label="Event type"
            emptyLabel="Any event"
            value={query.eventType}
          >
            {eventTypes.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
          <FormField label="Minimum budget (₹)">
            <Input
              name="minimumBudget"
              type="number"
              min={0}
              step={1000}
              defaultValue={query.minimumBudget}
              placeholder="No minimum"
            />
          </FormField>
          <FormField label="Maximum budget (₹)">
            <Input
              name="maximumBudget"
              type="number"
              min={0}
              step={1000}
              defaultValue={query.maximumBudget}
              placeholder="No maximum"
            />
          </FormField>
          <FormField label="Available on">
            <Input name="availableOn" type="date" defaultValue={query.availableOn} />
          </FormField>
          <FilterSelect
            name="minimumRating"
            label="Minimum rating"
            emptyLabel="Any rating"
            value={query.minimumRating?.toString() ?? ""}
          >
            {minimumRatingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            name="maximumDistanceKm"
            label="Maximum distance"
            emptyLabel="Any distance"
            value={query.maximumDistanceKm?.toString() ?? ""}
          >
            {maximumDistanceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          A maximum distance uses the selected city as the search origin.
        </p>
      </fieldset>

      <div className="mt-5 grid items-end gap-4 sm:grid-cols-[minmax(12rem,18rem)_auto]">
        <FilterSelect
          name="sort"
          label="Sort results"
          emptyLabel="Best match"
          value={query.sort === "relevance" ? "" : query.sort}
        >
          {searchSortOptions
            .filter((option) => option.value !== "relevance")
            .map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </FilterSelect>
        <Button type="submit" className="sm:justify-self-start">
          <SlidersHorizontal data-icon="inline-start" aria-hidden="true" />
          Apply filters
        </Button>
      </div>
      <div className="mt-4 flex min-h-6 flex-wrap items-center justify-between gap-3">
        {resultCount !== undefined ? (
          <p className="text-muted-foreground text-sm" aria-live="polite">
            {resultCount.toLocaleString("en-IN")}{" "}
            {resultCount === 1 ? "performer" : "performers"}
          </p>
        ) : (
          <span />
        )}
        {hasActiveSearch(query) ? (
          <Button asChild variant="ghost" size="sm">
            <Link href={action as Route}>
              <X data-icon="inline-start" aria-hidden="true" />
              Clear filters
            </Link>
          </Button>
        ) : null}
      </div>
      {activeFilters.length ? (
        <div className="border-border mt-3 border-t pt-3" aria-label="Active filters">
          <p className="text-sm font-medium">Active filters</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <li
                key={filter}
                className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs"
              >
                {filter}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}

interface FilterSelectProps {
  name: string;
  label: string;
  emptyLabel: string;
  value: string;
  children: React.ReactNode;
}

function FilterSelect({ name, label, emptyLabel, value, children }: FilterSelectProps) {
  return (
    <label className="space-y-1.5">
      <span className="block text-sm font-medium">{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
      >
        <option value="">{emptyLabel}</option>
        {children}
      </select>
    </label>
  );
}

function FormField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`space-y-1.5 ${className ?? ""}`}>
      <span className="block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
