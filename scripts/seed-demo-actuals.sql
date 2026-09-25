-- Demo facts for the synthetic network the stub serves (routes R1..R<routes>, stops R<r>-S1..S<stops>).
-- Hourly values from 2025-08-01 to 2026-09-25, Moscow time: two daily rush-hour peaks, lower
-- weekends, a little noise. It exists only so the dashboards that need history (load matrix,
-- "was / will be", accuracy) and the load tests have something to read before real data exists.
--
--   docker compose exec -T postgres psql -U tram_forecast -d tram_forecast < scripts/seed-demo-actuals.sql
--   ... psql -v routes=40 -v stops=15 ...   # a realistic size (~6 million rows)
--
-- The network size must match the backend's TRAM_ML_STUB_ROUTES / TRAM_ML_STUB_STOPS_PER_ROUTE
-- (defaults 3 and 5). Idempotent: existing rows are kept.
\if :{?routes}
\else
  \set routes 3
\endif
\if :{?stops}
\else
  \set stops 5
\endif

WITH hours AS (
    SELECT h AS hr,
           0.15 + 0.85 * exp(-power(h - 8.5, 2) / 6.0) + 0.75 * exp(-power(h - 18.0, 2) / 8.0) AS profile
    FROM generate_series(0, 23) AS h
),
times AS (
    SELECT ts,
           extract(hour FROM ts AT TIME ZONE 'Europe/Moscow')::int AS hr,
           CASE WHEN extract(isodow FROM ts AT TIME ZONE 'Europe/Moscow') >= 6 THEN 0.7 ELSE 1.0 END AS weekend
    FROM generate_series('2025-08-01 00:00:00+03'::timestamptz,
                         '2026-09-25 23:00:00+03'::timestamptz,
                         interval '1 hour') AS ts
),
network AS (
    SELECT 'R' || r AS route_id,
           'R' || r || '-S' || s AS stop_id,
           300.0 + 80.0 * (1 + (r - 1) % 3) + 25.0 * (1 + (s - 1) % 5) AS base
    FROM generate_series(1, :routes) AS r, generate_series(1, :stops) AS s
)
INSERT INTO actual_value (route_id, stop_id, period_start, value)
SELECT n.route_id,
       n.stop_id,
       t.ts,
       round((n.base * h.profile * t.weekend * (0.95 + 0.10 * random()))::numeric, 1)
FROM times t
JOIN hours h ON h.hr = t.hr
CROSS JOIN network n
ON CONFLICT DO NOTHING;
