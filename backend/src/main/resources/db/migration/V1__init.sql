-- Forecast snapshots are append-only: every recompute inserts new rows tagged with generated_at,
-- never updates old ones. "Initial" forecast of a day = the earliest snapshot for that date.
CREATE TABLE forecast_snapshot (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    route_id      VARCHAR(64)      NOT NULL,
    stop_id       VARCHAR(64)      NOT NULL,
    horizon       VARCHAR(16)      NOT NULL,
    anchor_date   DATE             NOT NULL,
    period_start  TIMESTAMPTZ      NOT NULL,
    baseline      DOUBLE PRECISION NOT NULL,
    forecast      DOUBLE PRECISION NOT NULL,
    generated_at  TIMESTAMPTZ      NOT NULL,
    model_version VARCHAR(64)      NOT NULL,
    factors       TEXT[]           NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_forecast_snapshot_lookup
    ON forecast_snapshot (horizon, anchor_date, generated_at);
CREATE INDEX idx_forecast_snapshot_stop
    ON forecast_snapshot (route_id, stop_id, horizon, anchor_date);

-- Actual (fact) values: one row per stop and period once it is known. Hourly grain, coarser
-- horizons are aggregated on read. Loaded from the organizers' dataset, not accumulated live.
CREATE TABLE actual_value (
    route_id     VARCHAR(64)      NOT NULL,
    stop_id      VARCHAR(64)      NOT NULL,
    period_start TIMESTAMPTZ      NOT NULL,
    value        DOUBLE PRECISION NOT NULL,
    PRIMARY KEY (route_id, stop_id, period_start)
);

CREATE INDEX idx_actual_value_period ON actual_value (period_start);
