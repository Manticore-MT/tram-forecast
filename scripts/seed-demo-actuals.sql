-- Demo facts for the synthetic network the stub serves (routes R1..R<routes>).
-- Hourly values from 2025-08-01 to 2026-09-25, Moscow time: two daily rush-hour peaks, lower
-- weekends, a little noise. It exists only so the dashboards that need history (load matrix,
-- "was / will be", accuracy) and the load tests have something to read before real data exists.
--
--   docker compose exec -T postgres psql -U tram_forecast -d tram_forecast < scripts/seed-demo-actuals.sql
--   ... psql -v routes=40 ...   # a bigger network
--
-- The network size must match the backend's TRAM_ML_STUB_ROUTES (default 3). Idempotent: existing
-- rows are kept.
\if :{?routes}
\else
  \set routes 3
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
           1900.0 + 400.0 * (1 + (r - 1) % 3) AS base
    FROM generate_series(1, :routes) AS r
)
INSERT INTO actual_value (route_id, period_start, value)
SELECT n.route_id,
       t.ts,
       round((n.base * h.profile * t.weekend * (0.95 + 0.10 * random()))::numeric, 1)
FROM times t
JOIN hours h ON h.hr = t.hr
CROSS JOIN network n
ON CONFLICT DO NOTHING;
