"""Reproduce the selected Ridge from the provided hourly labels, offline."""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge

from app.engine import ROUTES, feature_row
from build_artifact import add_calendar, disrupted, export_bundle


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=Path("data"))
    parser.add_argument("--output", type=Path, default=Path("artifacts/retrained_model.json"))
    args = parser.parse_args()
    paths = [args.data / f"labels_day_{split}.csv" for split in ("train", "test")]
    raw = pd.concat([pd.read_csv(p, sep=";") for p in paths], ignore_index=True)
    raw.date = pd.to_datetime(raw.date)
    raw = raw[raw.route.isin(ROUTES) & raw.date.between("2025-01-01", "2025-10-31")]
    if raw.duplicated(["route", "date", "hour"]).any() or (raw.boardings < 0).any():
        raise ValueError("Duplicate keys or negative targets")
    index = pd.MultiIndex.from_product([ROUTES, pd.date_range("2025-01-01", "2025-10-31"), range(24)], names=["route", "date", "hour"])
    history = raw.set_index(["route", "date", "hour"]).reindex(index)
    history["missing_group"] = history.boardings.isna()
    history.boardings = history.boardings.fillna(0)
    history = add_calendar(history.reset_index())
    daily = history.groupby(["route", "date"], as_index=False).boardings.sum()
    daily = add_calendar(daily)
    normal = daily.groupby(["route", "daytype"]).boardings.transform("median")
    train = daily[(daily.boardings > np.maximum(500, .35*normal)) & ~disrupted(daily)].copy()
    x = np.asarray([feature_row(int(r.route), r.date.date()) for r in train.itertuples()])
    ridge = Ridge(alpha=1., fit_intercept=True).fit(x, np.log1p(train.boardings))
    train["residual"] = np.log1p(train.boardings) - ridge.predict(x)
    origin = pd.Timestamp("2025-11-01")
    correction = train[train.date >= origin-pd.Timedelta(days=28)].groupby("route").residual.median()
    config = dict(alpha=1., annual=0, trend=False, weather=False, route_season=True,
                  events=False, correction_window=28, correction_stat="median",
                  correction_decay=None, shape_blend=.8)
    bundle = dict(history=history, origin=origin, config=config, regression=ridge,
                  correction=correction, training_daily_rows=len(train))
    sha = hashlib.sha256(b"".join(p.read_bytes() for p in paths)).hexdigest()
    artifact = export_bundle(bundle, sha)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(artifact, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")
    print(f"Saved {args.output}; training rows={len(train)}")


if __name__ == "__main__":
    main()
