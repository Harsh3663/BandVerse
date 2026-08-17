import { getMetricsSnapshot, renderPrometheusMetrics } from "./metrics";
import { logger } from "./logger";
import { getTraceContext } from "./tracing";

export interface TelemetryExporter {
  readonly name: "opentelemetry" | "grafana" | "datadog" | "newrelic" | "prometheus";
  exportMetrics(): Promise<void> | void;
  exportTrace?(span: {
    name: string;
    durationMs: number;
    attributes?: Record<string, string | number | boolean>;
  }): Promise<void> | void;
}

/** Prometheus scrape is already served at /api/v1/metrics. */
export function createPrometheusExporter(): TelemetryExporter {
  return {
    name: "prometheus",
    exportMetrics() {
      // Pull model — scrape endpoint renders on demand.
      void renderPrometheusMetrics();
    },
  };
}

/**
 * OpenTelemetry-ready stub. Wire @opentelemetry/sdk-node in production images.
 * Does not hard-require OTEL packages.
 */
export function createOpenTelemetryExporter(): TelemetryExporter {
  return {
    name: "opentelemetry",
    exportMetrics() {
      const sink = (
        globalThis as { __BANDVERSE_OTEL_METRICS__?: (payload: unknown) => void }
      ).__BANDVERSE_OTEL_METRICS__;
      sink?.(getMetricsSnapshot());
    },
    exportTrace(span) {
      const sink = (
        globalThis as { __BANDVERSE_OTEL_TRACE__?: (payload: unknown) => void }
      ).__BANDVERSE_OTEL_TRACE__;
      const trace = getTraceContext();
      sink?.({
        ...span,
        traceId: trace?.correlationId,
        requestId: trace?.requestId,
      });
    },
  };
}

export function createDatadogExporter(): TelemetryExporter {
  return {
    name: "datadog",
    exportMetrics() {
      const sink = (
        globalThis as { __BANDVERSE_DATADOG__?: (payload: unknown) => void }
      ).__BANDVERSE_DATADOG__;
      sink?.({ type: "metrics", values: getMetricsSnapshot() });
    },
  };
}

export function createNewRelicExporter(): TelemetryExporter {
  return {
    name: "newrelic",
    exportMetrics() {
      const sink = (
        globalThis as { __BANDVERSE_NEWRELIC__?: (payload: unknown) => void }
      ).__BANDVERSE_NEWRELIC__;
      sink?.({ type: "metrics", values: getMetricsSnapshot() });
    },
  };
}

export function createGrafanaExporter(): TelemetryExporter {
  return {
    name: "grafana",
    exportMetrics() {
      // Grafana scrapes Prometheus endpoint; also support remote-write hook.
      const sink = (
        globalThis as { __BANDVERSE_GRAFANA__?: (payload: unknown) => void }
      ).__BANDVERSE_GRAFANA__;
      sink?.({ type: "prometheus", body: renderPrometheusMetrics() });
    },
  };
}

export function bootstrapTelemetryExporters(): readonly TelemetryExporter[] {
  const exporters = [
    createPrometheusExporter(),
    createOpenTelemetryExporter(),
    createGrafanaExporter(),
    createDatadogExporter(),
    createNewRelicExporter(),
  ];
  logger.info("Telemetry exporters prepared", {
    exporters: exporters.map((exporter) => exporter.name),
  });
  return exporters;
}
