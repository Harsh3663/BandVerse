/**
 * Discriminated result type for application and presentation layers.
 * Prefer Result over thrown exceptions for expected domain failures.
 */
export type Result<T, E = AppError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly details?: readonly unknown[];
  readonly status: number;
  readonly cause?: unknown;
}

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E extends AppError>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}

export function mapResult<T, U, E>(
  result: Result<T, E>,
  map: (value: T) => U,
): Result<U, E> {
  return result.ok ? ok(map(result.value)) : result;
}

export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}
