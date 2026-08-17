export interface CounterMap {
  [key: string]: number;
}

const counters: CounterMap = {
  http_requests_total: 0,
  http_errors_total: 0,
  auth_logins_total: 0,
  auth_failures_total: 0,
  cache_hit_total: 0,
  cache_miss_total: 0,
  cache_eviction_total: 0,
  jobs_enqueued_total: 0,
  jobs_processed_total: 0,
  jobs_failed_total: 0,
  payments_intents_created_total: 0,
  payments_webhooks_processed_total: 0,
  payments_webhook_duplicates_total: 0,
  payments_reconcile_total: 0,
  realtime_messages_published_total: 0,
  notifications_sent_total: 0,
  auth_bruteforce_blocked_total: 0,
  auth_bruteforce_lockouts_total: 0,
  security_suspicious_total: 0,
  business_bookings_processed_total: 0,
  business_recommendations_warmed_total: 0,
  business_analytics_aggregated_total: 0,
  business_emails_queued_total: 0,
  business_payments_reconciled_total: 0,
};

/** Simple latency buckets in milliseconds. */
const latencyBuckets = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
const latencyCounts: Record<string, number[]> = {};
const latencySums: Record<string, number> = {};

export function incrementMetric(name: keyof typeof counters | string, by = 1): void {
  counters[name] = (counters[name] ?? 0) + by;
}

export function observeLatencyMs(name: string, durationMs: number): void {
  if (!latencyCounts[name]) {
    latencyCounts[name] = latencyBuckets.map(() => 0);
    latencySums[name] = 0;
  }
  latencySums[name] += durationMs;
  const buckets = latencyCounts[name];
  for (let i = 0; i < latencyBuckets.length; i += 1) {
    if (durationMs <= latencyBuckets[i]) {
      buckets[i] += 1;
      return;
    }
  }
  buckets[buckets.length - 1] += 1;
}

export function getMetricsSnapshot(): Readonly<CounterMap> {
  return { ...counters };
}

export function captureErrorHook(
  error: unknown,
  context: Record<string, unknown> = {},
): void {
  incrementMetric("errors_captured_total");
  // Hook point for Sentry/Datadog/etc.
  const sink = (globalThis as { __BANDVERSE_ERROR_SINK__?: (payload: unknown) => void })
    .__BANDVERSE_ERROR_SINK__;
  sink?.({
    error:
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error,
    context,
    timestamp: new Date().toISOString(),
  });
}

export function renderPrometheusMetrics(): string {
  const lines: string[] = [];

  for (const [name, value] of Object.entries(getMetricsSnapshot())) {
    lines.push(`# TYPE ${name} counter`);
    lines.push(`${name} ${value}`);
  }

  for (const [name, buckets] of Object.entries(latencyCounts)) {
    const metric = `${name}_ms`;
    lines.push(`# TYPE ${metric} histogram`);
    let cumulative = 0;
    for (let i = 0; i < latencyBuckets.length; i += 1) {
      cumulative += buckets[i] ?? 0;
      lines.push(`${metric}_bucket{le="${latencyBuckets[i]}"} ${cumulative}`);
    }
    lines.push(`${metric}_bucket{le="+Inf"} ${cumulative}`);
    lines.push(`${metric}_sum ${latencySums[name] ?? 0}`);
    lines.push(`${metric}_count ${cumulative}`);
  }

  return `${lines.join("\n")}\n`;
}
