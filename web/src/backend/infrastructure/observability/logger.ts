export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  readonly requestId?: string;
  readonly userId?: string;
  readonly route?: string;
  readonly method?: string;
  readonly status?: number;
  readonly durationMs?: number;
  readonly errorCode?: string;
  readonly [key: string]: unknown;
}

function write(level: LogLevel, message: string, fields: LogFields = {}): void {
  const entry = {
    level,
    message,
    service: "bandverse-api",
    timestamp: new Date().toISOString(),
    ...fields,
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}

export const logger = {
  debug: (message: string, fields?: LogFields) => write("debug", message, fields),
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  error: (message: string, fields?: LogFields) => write("error", message, fields),
};

export function captureError(
  error: unknown,
  fields: LogFields = {},
): void {
  const message =
    error instanceof Error ? error.message : "Unknown error captured";
  logger.error(message, {
    ...fields,
    stack: error instanceof Error ? error.stack : undefined,
    name: error instanceof Error ? error.name : undefined,
  });
}
