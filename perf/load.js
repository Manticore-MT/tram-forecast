// Load test used for the numbers in README.md and docs/performance.md.
//
//   docker run --rm -i --network tram-forecast-local_default -e BASE_URL=http://backend:8080 \
//       -e VUS=50 -e AUTH=jury:jury-local-demo -v "$PWD/perf:/perf" grafana/k6 run /perf/load.js
//
// AUTH is "user:password" (plain, not base64) when the target has TRAM_AUTH_ENABLED=true, which
// the local compose stack does by default; leave it unset to skip the header (auth disabled).
//
// The mix mirrors what the dispatcher screen does on a normal visit: the network map, a route's
// details, the attention table, and the history comparison panel (no server-side cache — ML is
// asked fresh every time, unlike the other three). The first request for each (horizon, date)
// fills storage from ML, so setup() warms it up and the measured run reads stored aggregates for
// those three, which is the steady state; history is never warm since it has nothing to warm.
import http from 'k6/http';
import { check } from 'k6';
import encoding from 'k6/encoding';

const BASE = __ENV.BASE_URL || 'http://localhost:8080';
// The local compose stack freezes "now" at 2025-11-01T09:00 MSK — real data (not scenario), and
// exactly the date the history panel already has −7d/−1m/typical-week facts for.
const DATE = __ENV.DATE || '2025-11-01';
const AUTH_HEADER = __ENV.AUTH ? { Authorization: `Basic ${encoding.b64encode(__ENV.AUTH)}` } : {};

export const options = {
  vus: Number(__ENV.VUS || 50),
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300'],
  },
};

// The real nine routes of the dataset (see ml/app/engine.py ROUTES) — route 5 is submission-only
// and does not exist in this service, never send it here.
const ROUTE_IDS = ['1', '7', '11', '12', '17', '25', '26', '28', '50'];
// `year` must be a whole calendar year inside 2025-11-01..2026-12-31 — 2025-11-01 (DATE) covers
// only 2025, which is not entirely in range, so `year` needs its own anchor inside 2026.
const HORIZON_DATES = { day: DATE, week: DATE, month: DATE, year: '2026-06-15' };
const HORIZONS = Object.keys(HORIZON_DATES);

export function setup() {
  for (const h of HORIZONS) {
    http.get(`${BASE}/api/routes?horizon=${h}&date=${HORIZON_DATES[h]}`, { headers: AUTH_HEADER });
  }
}

export default function () {
  const h = HORIZONS[Math.floor(Math.random() * HORIZONS.length)];
  const date = HORIZON_DATES[h];
  const route = ROUTE_IDS[Math.floor(Math.random() * ROUTE_IDS.length)];
  const responses = http.batch([
    ['GET', `${BASE}/api/routes?horizon=${h}&date=${date}`, null, { headers: AUTH_HEADER }],
    ['GET', `${BASE}/api/routes/${route}/forecast?horizon=${h}&date=${date}`, null, { headers: AUTH_HEADER }],
    ['GET', `${BASE}/api/attention?horizon=${h}&date=${date}`, null, { headers: AUTH_HEADER }],
    ['GET', `${BASE}/api/history/comparison?date=${DATE}&routeId=${route}`, null, { headers: AUTH_HEADER }],
  ]);
  for (const r of responses) {
    check(r, { 'status is 200': (x) => x.status === 200 });
  }
}
