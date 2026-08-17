import type { NextResponse } from "next/server";

export const REFRESH_COOKIE_NAME = "bv_refresh";

const isProduction = process.env.NODE_ENV === "production";

export function refreshCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/api/v1/auth",
    maxAge: maxAgeSeconds,
  };
}

export function setRefreshCookie(
  response: NextResponse,
  refreshToken: string,
  maxAgeSeconds: number,
): void {
  response.cookies.set(
    REFRESH_COOKIE_NAME,
    refreshToken,
    refreshCookieOptions(maxAgeSeconds),
  );
}

export function clearRefreshCookie(response: NextResponse): void {
  response.cookies.set(REFRESH_COOKIE_NAME, "", {
    ...refreshCookieOptions(0),
    maxAge: 0,
  });
}

export function readRefreshCookie(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(";").map((part) => part.trim());
  for (const part of parts) {
    const [name, ...rest] = part.split("=");
    if (name === REFRESH_COOKIE_NAME) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return undefined;
}
