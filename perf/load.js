// Load test used for the numbers in README.md and docs/performance.md.
//
//   docker run --rm -i --network tram-forecast_default -e BASE_URL=http://backend:8080 -e VUS=50 \
//       -e ROUTES=40 -e STOPS=15 -v "$PWD/perf:/perf" grafana/k6 run /perf/load.js
//
// The mix mirrors what the dashboard does: the network map, a route, a stop panel, the attention
// table. The first request for each (horizon, date) fills storage from ML, so setup() warms it up
// and the measured run reads stored aggregates only, which is the steady state.
import http from 'k6/http';
import { check } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:8080';
const DATE = __ENV.DATE || '2026-09-25';
const ROUTES = Number(__ENV.ROUTES || 3);
const STOPS = Number(__ENV.STOPS || 5);

export const options = {
  vus: Number(__ENV.VUS || 50),
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300'],
  },
};

const HORIZONS = ['day', 'month', 'year'];

export function setup() {
  for (const h of HORIZONS) {
    http.get(`${BASE}/api/routes?horizon=${h}&date=${DATE}`);
  }
}

export default function () {
  const h = HORIZONS[Math.floor(Math.random() * HORIZONS.length)];
  const route = `R${1 + Math.floor(Math.random() * ROUTES)}`;
  const stop = `${route}-S${1 + Math.floor(Math.random() * STOPS)}`;
  const responses = http.batch([
    ['GET', `${BASE}/api/routes?horizon=${h}&date=${DATE}`],
    ['GET', `${BASE}/api/routes/${route}/forecast?horizon=${h}&date=${DATE}`],
    ['GET', `${BASE}/api/routes/${route}/stops/${stop}/forecast?horizon=${h}&date=${DATE}`],
    ['GET', `${BASE}/api/attention?horizon=${h}&date=${DATE}`],
  ]);
  for (const r of responses) {
    check(r, { 'status is 200': (x) => x.status === 200 });
  }
}
