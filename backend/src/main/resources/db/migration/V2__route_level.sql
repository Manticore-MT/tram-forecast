-- The forecast is per route and hour: the dataset has no stop link, and the stop values of the
-- earlier ML answers were an equal split of the route total, not a measurement.

-- The stored snapshots are those demo stop rows. Forecasts are computed again from the ML service
-- on the first read (snapshots are only a cache and a history of what was predicted).
DELETE FROM forecast_snapshot;
DROP INDEX idx_forecast_snapshot_stop;
ALTER TABLE forecast_snapshot DROP COLUMN stop_id;
CREATE INDEX idx_forecast_snapshot_route
    ON forecast_snapshot (route_id, horizon, anchor_date);

-- Observed values keep their meaning: what was stored per stop is summed to the route.
CREATE TABLE actual_value_route AS
    SELECT route_id, period_start, SUM(value) AS value
    FROM actual_value
    GROUP BY route_id, period_start;
DROP TABLE actual_value;
ALTER TABLE actual_value_route RENAME TO actual_value;
ALTER TABLE actual_value ALTER COLUMN route_id SET NOT NULL;
ALTER TABLE actual_value ALTER COLUMN period_start SET NOT NULL;
ALTER TABLE actual_value ALTER COLUMN value SET NOT NULL;
ALTER TABLE actual_value ADD PRIMARY KEY (route_id, period_start);
CREATE INDEX idx_actual_value_period ON actual_value (period_start);
