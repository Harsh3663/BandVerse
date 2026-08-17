import { emptyPage, paginate } from "@/backend/shared/pagination";

/**
 * Lightweight executable assertions for CI once Vitest is added.
 * Currently importable for manual verification and future unit tests.
 */
export function assertPaginationHelpers(): void {
  const items = Array.from({ length: 25 }, (_, index) => index + 1);
  const page1 = paginate(items, { page: 1, pageSize: 10 });
  if (page1.items.length !== 10) throw new Error("page1 size");
  if (page1.meta.totalPages !== 3) throw new Error("total pages");
  if (!page1.meta.hasNextPage) throw new Error("has next");

  const page3 = paginate(items, { page: 3, pageSize: 10 });
  if (page3.items.length !== 5) throw new Error("page3 size");
  if (page3.meta.hasNextPage) throw new Error("no next on last");

  const empty = emptyPage({ page: 1, pageSize: 20 });
  if (empty.items.length !== 0) throw new Error("empty items");
}
