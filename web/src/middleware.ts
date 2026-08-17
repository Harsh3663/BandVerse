import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { securityHeaders } from "@/backend/infrastructure/security/headers";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // Correlation ID for request tracing across edge → app.
  const incoming = request.headers.get("x-request-id") ?? request.headers.get("x-correlation-id");
  const requestId =
    incoming && incoming.trim().length > 0
      ? incoming
      : `corr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  response.headers.set("x-request-id", requestId);
  response.headers.set("x-correlation-id", requestId);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
