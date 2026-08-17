import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 5,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<800"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const health = http.get(`${BASE_URL}/api/v1/health`);
  check(health, { "health 200": (r) => r.status === 200 });

  const ready = http.get(`${BASE_URL}/api/v1/ready`);
  check(ready, { "ready ok": (r) => r.status === 200 || r.status === 503 });

  const performers = http.get(`${BASE_URL}/api/v1/performers?page=1&pageSize=10`);
  check(performers, { "performers 200": (r) => r.status === 200 });

  sleep(1);
}
