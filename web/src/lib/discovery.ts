const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatCompactNumber(value: number): string {
  return compactNumberFormatter.format(value);
}

export function formatEventDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(date);
}

export function normalizeSearchTerm(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLocaleLowerCase("en-IN");
}

export function slugify(value: string): string {
  return normalizeSearchTerm(value)
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function matchesSearch(
  query: string,
  fields: readonly (string | readonly string[] | undefined)[],
): boolean {
  const normalizedQuery = normalizeSearchTerm(query);

  if (!normalizedQuery) {
    return true;
  }

  const tokens = normalizedQuery.split(/\s+/);
  const haystack = normalizeSearchTerm(
    fields
      .flatMap((field) => (Array.isArray(field) ? field : [field]))
      .filter((field): field is string => Boolean(field))
      .join(" "),
  );

  return tokens.every((token) => haystack.includes(token));
}
