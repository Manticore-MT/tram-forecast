"""Compare route-level residual correction windows on historical 61-day blocks.

This is a diagnostic experiment. It does not update the serving artifact or
competition submission. Each forecast uses only labels before its origin.
"""

import argparse
import json
from pathlib import Path
from types import SimpleNamespace

import numpy as np
import pandas as pd

from app.engine import ROUTES, calendar_fields, feature_names
from build_artifact import export_bundle
from external_factor_experiment import load_history, matrix, ridge


def evaluate(labels, origin, windows):
    history, train = load_history(labels, origin)
    x = matrix(train, None, None, "base", True)
    y = np.log1p(train.boardings.to_numpy())
    beta, intercept = ridge(x, y, 1.)
    train["residual"] = y - (x @ beta + intercept)
    config = dict(alpha=1., annual=0, trend=False, weather=False,
                  route_season=True, events=False, correction_window=28,
                  correction_stat="median", correction_decay=None,
                  shape_blend=.8, exclude_before_local_time="05:30:00")
    dummy = SimpleNamespace(coef_=np.zeros(len(feature_names())), intercept_=0.)
    shape = export_bundle(dict(history=history, origin=origin, config=config,
                               regression=dummy, correction=pd.Series(dtype=float),
                               training_daily_rows=len(train)), "window-experiment")
    days = pd.date_range(origin, periods=61)
    future = pd.MultiIndex.from_product([ROUTES, days], names=["route", "date"]).to_frame(index=False)
    xf = matrix(future, None, None, "base", True)
    base_log = xf @ beta + intercept
    actual = labels.set_index(["route", "date", "hour"]).boardings
    results = {}
    for window in windows:
        recent = train[train.date >= origin - pd.Timedelta(days=window)]
        for statistic in ("median", "mean"):
            correction = recent.groupby("route").residual.agg(statistic)
            totals = np.maximum(0, np.expm1(base_log + future.route.map(correction).fillna(0).to_numpy()))
            error = denominator = 0.
            for row, total in zip(future.itertuples(), totals):
                d = row.date.date()
                c = calendar_fields(d)
                key = f"{row.route}:{c['summer']}:{c['effective_dow']}"
                values = total * np.asarray(shape["hourlyShares"][key])
                if row.route == 50 and origin >= pd.Timestamp("2025-09-06") and d.weekday() >= 5:
                    values = np.asarray(shape["route50ClosureProfile"])
                prediction = np.rint(np.maximum(0, values))
                prediction[:5] = 0
                observed = np.asarray([actual.get((row.route, row.date, h), 0) for h in range(24)])
                error += np.abs(observed - prediction).sum()
                denominator += observed.sum()
            results[f"{statistic}_{window}d"] = float(1 - error / denominator)
    return results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--labels", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    labels = pd.read_csv(args.labels, sep=";")
    labels.date = pd.to_datetime(labels.date)
    results = {str(origin.date()): evaluate(labels, origin, (7, 14, 28, 56))
               for origin in map(pd.Timestamp, ("2025-07-01", "2025-09-01"))}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
