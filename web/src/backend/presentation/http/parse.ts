import type { ZodType } from "zod";

import { createAppError, validationError } from "@/backend/shared/errors";
import { err, ok, type AppError, type Result } from "@/backend/shared/result";
import { payloadLimits } from "./api-governance";

export function parseWithSchema<T>(
  schema: ZodType<T>,
  input: unknown,
): Result<T, AppError> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return err(
      validationError("Request validation failed.", parsed.error.issues),
    );
  }
  return ok(parsed.data);
}

export function searchParamsToObject(
  searchParams: URLSearchParams,
): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key);
    result[key] = values.length <= 1 ? (values[0] ?? "") : values;
  }
  return result;
}

export async function parseJsonBody(
  request: Request,
  maxBytes = payloadLimits.jsonBytes,
): Promise<Result<unknown, AppError>> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return err(
      createAppError("PAYLOAD_TOO_LARGE", `Payload exceeds ${maxBytes} bytes.`),
    );
  }
  try {
    return ok(await request.json());
  } catch {
    return err(validationError("Request body must be valid JSON."));
  }
}
