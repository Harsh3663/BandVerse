import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 30 },
    { duration: "2m", target: 80 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<600"],
    http_req_failed: ["rate<0.05"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const cities = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai"];

export default function () {
  const city = cities[(__VU + __ITER) % cities.length];
  const res = http.get(
    `${BASE_URL}/api/v1/search?type=performers&city=${encodeURIComponent(city)}&page=1&pageSize=20`,
    {
      headers: {
        "x-request-id": `search-${__VU}-${__ITER}`,
        "x-correlation-id": `search-cor-${__VU}`,
      },
    },
  );
  check(res, {
    "search ok": (r) => r.status === 200 || r.status === 429,
  });
  sleep(0.3);
}
