"""Export a separate hybrid submission with a 14-day mean route correction.

The existing hybrid submission is the template and is never overwritten.
This candidate is experimental until its platform score is reported.
"""

import argparse
import csv
from pathlib import Path
from types import SimpleNamespace

import numpy as np
import pandas as pd

from app.engine import ROUTES, calendar_fields, feature_names
from build_artifact import export_bundle
from external_factor_experiment import load_history, matrix, ridge


def predict(labels, correction_window=14, correction_stat="mean", reopening=None):
    origin = pd.Timestamp("2025-11-01")
    history, train = load_history(labels, origin)
    x = matrix(train, None, None, "base", True)
    y = np.log1p(train.boardings.to_numpy())
    beta, intercept = ridge(x, y, 1.)
    train["residual"] = y - (x @ beta + intercept)
    correction = train[train.date >= origin - pd.Timedelta(days=correction_window)].groupby("route").residual.agg(correction_stat)
    config = dict(alpha=1., annual=0, trend=False, weather=False, route_season=True,
                  events=False, correction_window=correction_window, correction_stat=correction_stat,
                  correction_decay=None, shape_blend=.8,
                  exclude_before_local_time="05:30:00")
    dummy = SimpleNamespace(coef_=np.zeros(len(feature_names())), intercept_=0.)
    shape = export_bundle(dict(history=history, origin=origin, config=config,
                               regression=dummy, correction=correction,
                               training_daily_rows=len(train)), "correction-candidate")
    days = pd.date_range(origin, periods=61)
    future = pd.MultiIndex.from_product([ROUTES, days], names=["route", "date"]).to_frame(index=False)
    xf = matrix(future, None, None, "base", True)
    totals = np.maximum(0, np.expm1(xf @ beta + intercept + future.route.map(correction).fillna(0).to_numpy()))
    result = {}
    for row, total in zip(future.itertuples(), totals):
        d = row.date.date()
        c = calendar_fields(d)
        values = total * np.asarray(shape["hourlyShares"][f"{row.route}:{c['summer']}:{c['effective_dow']}"])
        if row.route == 50 and d.weekday() >= 5 and (reopening is None or d < reopening):
            values = np.asarray(shape["route50ClosureProfile"])
        for hour, value in enumerate(np.rint(np.maximum(0, values)).astype(int)):
            result[(row.route, d.isoformat(), hour)] = int(value)
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--labels", type=Path, required=True)
    parser.add_argument("--template", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if args.template.resolve() == args.output.resolve():
        raise ValueError("Refusing to overwrite the champion submission")
    labels = pd.read_csv(args.labels, sep=";")
    labels.date = pd.to_datetime(labels.date)
    predictions = predict(labels)
    with args.template.open(encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream, delimiter=";"))
    keys = [(int(r["route"]), r["date"], int(r["hour"])) for r in rows]
    if len(keys) != 10 * 61 * 24 or len(set(keys)) != len(keys):
        raise ValueError("Template must contain the unique 10-route competition grid")
    for row, key in zip(rows, keys):
        if key[0] in ROUTES and key[2] >= 6:
            row["prediction"] = str(predictions[key])
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=["route", "date", "hour", "prediction"], delimiter=";")
        writer.writeheader()
        writer.writerows(rows)
    print(f"Saved {args.output}: {len(rows)} rows")


if __name__ == "__main__":
    main()
