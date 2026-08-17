import { AsyncLocalStorage } from "node:async_hooks";

export interface TraceContext {
  readonly requestId: string;
  readonly correlationId: string;
  readonly route?: string;
  readonly userId?: string;
}

const storage = new AsyncLocalStorage<TraceContext>();

export function runWithTrace<T>(context: TraceContext, fn: () => T): T {
  return storage.run(context, fn);
}

/** Bind trace context for the remainder of the current async request chain. */
export function enterTrace(context: TraceContext): void {
  storage.enterWith(context);
}

export function getTraceContext(): TraceContext | undefined {
  return storage.getStore();
}

export function createCorrelationId(): string {
  return `cor_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function withLatencyMetric<T>(
  metricName: string,
  fn: () => Promise<T>,
  observe: (name: string, durationMs: number) => void,
): Promise<T> {
  const started = Date.now();
  return fn().finally(() => {
    observe(metricName, Date.now() - started);
  });
}
