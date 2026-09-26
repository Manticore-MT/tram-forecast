"""Export the trusted research bundle to portable JSON; also used by train.py."""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
import pandas as pd

from app.engine import ROUTES, calendar_fields, feature_names


def add_calendar(frame):
    frame = frame.copy()
    fields = pd.DataFrame([calendar_fields(d.date()) for d in frame.date], index=frame.index)
    for column in fields:
        frame[column] = fields[column]
    return frame


def disrupted(frame):
    july = frame.date.between("2025-07-10", "2025-08-06") & frame.route.isin([7, 50])
    autumn = (frame.date >= "2025-09-06") & (frame.dow >= 5) & frame.route.isin([7, 50])
    return july | autumn


def export_bundle(bundle, source_sha):
    config = bundle["config"]
    assert config["annual"] == 0 and not config["trend"] and not config["weather"]
    assert config["route_season"] and not config["events"] and config["correction_decay"] is None
    h = add_calendar(bundle["history"])
    origin = pd.Timestamp(bundle["origin"])
    assert h.date.max() < origin
    recent_all = h[h.date >= origin - pd.Timedelta(days=56)]
    baseline = recent_all.groupby(["route", "effective_dow", "hour"]).boardings.median()
    baseline_fallback = recent_all.groupby(["route", "hour"]).boardings.median()
    total = h.groupby(["route", "date"]).boardings.transform("sum")
    good = (total > 500) & ~disrupted(h)
    h["share"] = h.boardings / total.replace(0, np.nan)
    shape_h = h[good]
    seasonal = shape_h.groupby(["route", "summer", "effective_dow", "hour"]).share.median()
    fallback = shape_h.groupby(["route", "effective_dow", "hour"]).share.median()
    recent = shape_h[shape_h.date >= origin - pd.Timedelta(days=56)]
    recent_shape = recent.groupby(["route", "effective_dow", "hour"]).share.median()
    shares, bases = {}, {}
    for route in ROUTES:
        for dow in range(7):
            bases[f"{route}:{dow}"] = [float(baseline.get((route, dow, hour), baseline_fallback.get((route, hour), 0))) for hour in range(24)]
            for summer in (0, 1):
                raw = []
                for hour in range(24):
                    key = (route, dow, hour)
                    p = seasonal.get((route, summer, dow, hour), fallback.get(key, 0))
                    raw.append(config["shape_blend"] * p + (1-config["shape_blend"]) * recent_shape.get(key, p))
                raw = np.asarray(raw, dtype=float)
                shares[f"{route}:{summer}:{dow}"] = (raw / raw.sum() if raw.sum() else raw).tolist()
    closed = h[(h.route == 50) & (h.date >= "2025-09-06") & (h.dow >= 5)].groupby("hour").boardings.median()
    return dict(schemaVersion=1, sourceSha256=source_sha, forecastOrigin=origin.date().isoformat(),
                historyThrough=h.date.max().date().isoformat(), target="successful_validations",
                featureOrder=feature_names(), coefficients=bundle["regression"].coef_.tolist(),
                intercept=float(bundle["regression"].intercept_),
                correction={str(r): float(bundle["correction"].get(r, 0)) for r in ROUTES},
                hourlyShares=shares, baseline56=bases,
                route50ClosureProfile=[float(closed.get(hour, 0)) for hour in range(24)],
                trainingDailyRows=bundle["training_daily_rows"], config=config)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-joblib", type=Path, required=True, help="Trusted research artifact only")
    parser.add_argument("--output", type=Path, default=Path("artifacts/route_model.json"))
    args = parser.parse_args()
    import joblib
    bundle = joblib.load(args.source_joblib)
    artifact = export_bundle(bundle, hashlib.sha256(args.source_joblib.read_bytes()).hexdigest())
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(artifact, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")
    print(args.output)


if __name__ == "__main__":
    main()
