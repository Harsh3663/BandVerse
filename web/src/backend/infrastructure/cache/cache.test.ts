import { beforeEach, describe, expect, it } from "vitest";

import { createMemoryCache } from "./memory-cache";
import { createCacheServiceSync } from "./cache-service";

describe("cache layer", () => {
  beforeEach(async () => {
    await createCacheServiceSync().port.clear();
  });

  it("returns miss then hit", async () => {
    const cache = createMemoryCache();
    expect(await cache.get("k")).toBeUndefined();
    await cache.set("k", { ok: true }, { ttlSeconds: 30 });
    expect(await cache.get("k")).toEqual({ ok: true });
  });

  it("invalidates by tag", async () => {
    const service = createCacheServiceSync();
    await service.port.set("performers:1", [1], { tags: ["performers"] });
    await service.port.set("venues:1", [2], { tags: ["venues"] });
    await service.invalidateTags(["performers"]);
    expect(await service.port.get("performers:1")).toBeUndefined();
    expect(await service.port.get("venues:1")).toEqual([2]);
  });

  it("getOrSet loads once", async () => {
    const service = createCacheServiceSync();
    let loads = 0;
    const first = await service.getOrSet("x", async () => {
      loads += 1;
      return 42;
    });
    const second = await service.getOrSet("x", async () => {
      loads += 1;
      return 99;
    });
    expect(first).toBe(42);
    expect(second).toBe(42);
    expect(loads).toBe(1);
  });
});
