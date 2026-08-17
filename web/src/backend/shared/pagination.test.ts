import { describe, expect, it } from "vitest";

import { emptyPage, paginate } from "./pagination";

describe("pagination", () => {
  it("paginates items and reports meta", () => {
    const items = Array.from({ length: 25 }, (_, index) => index + 1);
    const page1 = paginate(items, { page: 1, pageSize: 10 });
    expect(page1.items).toHaveLength(10);
    expect(page1.meta.totalPages).toBe(3);
    expect(page1.meta.hasNextPage).toBe(true);

    const page3 = paginate(items, { page: 3, pageSize: 10 });
    expect(page3.items).toHaveLength(5);
    expect(page3.meta.hasNextPage).toBe(false);
  });

  it("returns empty page metadata", () => {
    const page = emptyPage({ page: 1, pageSize: 20 });
    expect(page.items).toEqual([]);
    expect(page.meta.totalItems).toBe(0);
  });
});
