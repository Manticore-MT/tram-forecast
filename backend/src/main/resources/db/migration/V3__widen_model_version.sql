-- The ML service now concatenates several markers into one modelVersion string (which candidate
-- forecast a competition-period date serves, plus the underlying model hash, plus a scenario or
-- stop-demo suffix). A real value already reached 65 characters and the previous VARCHAR(64) limit
-- silently aborted the whole snapshot insert (Postgres rejects the batch, the backend then answers
-- 500 instead of storing anything). modelVersion is an opaque, free-form label from ML's side; the
-- backend has no business capping its length.
ALTER TABLE forecast_snapshot ALTER COLUMN model_version TYPE VARCHAR(255);
