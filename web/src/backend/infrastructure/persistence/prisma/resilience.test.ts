import { describe, expect, it } from "vitest";

import { createCircuitBreaker, withRetry } from "./resilience";

describe("DB resiliency helpers", () => {
  it("retries retryable failures then succeeds", async () => {
    let attempts = 0;
    const result = await withRetry(
      async () => {
        attempts += 1;
        if (attempts < 3) throw new Error("deadlock detected");
        return "ok";
      },
      { retries: 3, baseDelayMs: 1 },
    );
    expect(result).toBe("ok");
    expect(attempts).toBe(3);
  });

  it("opens circuit after threshold failures", async () => {
    const breaker = createCircuitBreaker({ failureThreshold: 2, coolDownMs: 60_000 });
    await expect(
      breaker.exec(async () => {
        throw new Error("connection reset");
      }),
    ).rejects.toThrow("connection reset");
    await expect(
      breaker.exec(async () => {
        throw new Error("connection reset");
      }),
    ).rejects.toThrow("connection reset");
    expect(breaker.state()).toBe("open");
    await expect(breaker.exec(async () => "never")).rejects.toThrow(
      "Database circuit breaker is open",
    );
  });
});
