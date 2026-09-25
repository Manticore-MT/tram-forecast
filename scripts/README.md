# Scripts

## Loading facts (observed values)

Facts feed three things: the "was" side of "was / will be", the load matrix, and the accuracy
(WAPE) numbers. They live in one table, `actual_value`, at **hourly grain per stop**:

| column | type | meaning |
|---|---|---|
| `route_id` | text | route ID (same as everywhere else) |
| `stop_id` | text | stop ID |
| `period_start` | timestamptz | start of the hour, ISO 8601 with an offset |
| `value` | double | observed value, in the same unit as the forecast |

The organizers' dataset is far too large to load raw and the backend does not want it: aggregate it
to this grain first (that aggregation is the "ingest, normalize, geo-link" pipeline of the brief),
write a CSV with the header `route_id,stop_id,period_start,value` and load it:

```bash
docker compose exec -T postgres psql -U tram_forecast -d tram_forecast \
  -c "\copy actual_value (route_id, stop_id, period_start, value) FROM STDIN WITH (FORMAT csv, HEADER true)" \
  < facts.csv
```

A duplicate `(route_id, stop_id, period_start)` is rejected by the primary key, so load once or
truncate first (`TRUNCATE actual_value;`).

## Demo facts

`seed-demo-actuals.sql` fills `actual_value` for the synthetic network of the stub and of the ML
skeleton (routes `R1`-`R3`, stops `R<r>-S1`..`S5`), so the history-based screens are not empty
before real data exists:

```bash
docker compose exec -T postgres psql -U tram_forecast -d tram_forecast < scripts/seed-demo-actuals.sql
```

Do not load it next to real data: the IDs are synthetic.
