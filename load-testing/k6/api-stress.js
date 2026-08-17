import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 50 },
    { duration: "3m", target: 100 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.1"],
    http_req_duration: ["p(95)<1200"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const routes = [
    "/api/v1/health",
    "/api/v1/performers?page=1&pageSize=20",
    "/api/v1/venues?page=1&pageSize=20",
    "/api/v1/events?page=1&pageSize=20",
    "/api/v1/search?type=performers&page=1&pageSize=10",
  ];

  for (const route of routes) {
    const res = http.get(`${BASE_URL}${route}`, {
      headers: { "x-request-id": `k6-${__VU}-${__ITER}` },
    });
    check(res, {
      "status 2xx/429": (r) =>
        (r.status >= 200 && r.status < 300) || r.status === 429,
    });
  }
  sleep(0.5);
}
