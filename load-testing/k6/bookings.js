import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "2m",
  thresholds: {
    http_req_failed: ["rate<0.15"],
    http_req_duration: ["p(95)<1500"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const EMAIL = __ENV.LOAD_EMAIL || `load_${__VU}@bandverse.test`;
const PASSWORD = __ENV.LOAD_PASSWORD || "LoadTestPass123!";

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "x-correlation-id": `booking-${__VU}-${__ITER}`,
  };
}

export function setup() {
  // Prefer pre-provisioned users in staging; register is best-effort for mock mode.
  return {};
}

export default function () {
  const register = http.post(
    `${BASE_URL}/api/v1/auth/register`,
    JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
      displayName: `Load User ${__VU}`,
      role: "organizer",
    }),
    { headers: { "Content-Type": "application/json" } },
  );

  let token;
  if (register.status === 201 || register.status === 200) {
    token = register.json("data.accessToken");
  } else {
    const login = http.post(
      `${BASE_URL}/api/v1/auth/login`,
      JSON.stringify({ email: EMAIL, password: PASSWORD }),
      { headers: { "Content-Type": "application/json" } },
    );
    check(login, { "login ok": (r) => r.status === 200 });
    token = login.json("data.accessToken");
  }

  if (!token) {
    sleep(1);
    return;
  }

  const list = http.get(`${BASE_URL}/api/v1/bookings?page=1&pageSize=10`, {
    headers: authHeaders(token),
  });
  check(list, {
    "bookings list": (r) => r.status === 200 || r.status === 403,
  });

  sleep(1);
}
