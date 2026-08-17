import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { forbiddenError } from "@/backend/shared/errors";

const CSRF_COOKIE = "bv_csrf";
const CSRF_HEADER = "x-csrf-token";

export function issueCsrfToken(): string {
  return randomBytes(24).toString("base64url");
}

export function csrfCookieName(): string {
  return CSRF_COOKIE;
}

export function hashCsrf(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function setCsrfCookie(
  response: { cookies: { set: (name: string, value: string, options: Record<string, unknown>) => void } },
  token = issueCsrfToken(),
): string {
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return token;
}

export function assertCsrf(request: Request, options?: { enforce?: boolean }): void {
  const enforce =
    options?.enforce ??
    (process.env.CSRF_PROTECTION === "true" || process.env.NODE_ENV === "production");
  if (!enforce) return;
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) return;

  const header = request.headers.get(CSRF_HEADER);
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieToken = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CSRF_COOKIE}=`))
    ?.slice(CSRF_COOKIE.length + 1);

  if (!header || !cookieToken) {
    throw forbiddenError("CSRF token missing.");
  }

  const a = Buffer.from(hashCsrf(header));
  const b = Buffer.from(hashCsrf(decodeURIComponent(cookieToken)));
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    // Compare raw values as well for double-submit cookie pattern.
    const left = Buffer.from(header);
    const right = Buffer.from(decodeURIComponent(cookieToken));
    if (left.length !== right.length || !timingSafeEqual(left, right)) {
      throw forbiddenError("CSRF token mismatch.");
    }
  }
}
