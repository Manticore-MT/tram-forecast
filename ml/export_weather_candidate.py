"""Export an experimental weather-aware competition file.

The target-period weather is retrospective (not available at 2025-11-01).
Use only if the competition explicitly permits it. Never overwrite the
reported 0.88226 hybrid submission; pass that file as --template instead.
"""
import argparse
import csv
from pathlib import Path
from types import SimpleNamespace

import numpy as np
import pandas as pd

from app.engine import ROUTES, calendar_fields, feature_names
from build_artifact import export_bundle
from external_factor_experiment import climate_table, load_history, matrix, ridge, weather_table


def predict(labels, weather, climate):
    origin = pd.Timestamp("2025-11-01")
    history, train = load_history(labels, origin)
    x = matrix(train, weather, climate, "basic", True)
    y = np.log1p(train.boardings.to_numpy())
    beta, intercept = ridge(x, y, 1.)
    train["residual"] = y - (x @ beta + intercept)
    correction = train[train.date >= origin - pd.Timedelta(days=28)].groupby("route").residual.median()
    config = dict(alpha=1., annual=0, trend=False, weather=False, route_season=True,
                  events=False, correction_window=28, correction_stat="median",
                  correction_decay=None, shape_blend=.8, exclude_before_local_time="05:30:00")
    dummy = SimpleNamespace(coef_=np.zeros(len(feature_names())), intercept_=0.)
    shape = export_bundle(dict(history=history, origin=origin, config=config,
                               regression=dummy, correction=correction,
                               training_daily_rows=len(train)), "weather-candidate")
    days = pd.date_range(origin, periods=61)
    future = pd.MultiIndex.from_product([ROUTES, days], names=["route", "date"]).to_frame(index=False)
    xf = matrix(future, weather, climate, "basic", True)
    totals = np.maximum(0, np.expm1(xf @ beta + intercept + future.route.map(correction).fillna(0).to_numpy()))
    result = {}
    for row, total in zip(future.itertuples(), totals):
        d = row.date.date()
        c = calendar_fields(d)
        shares = shape["hourlyShares"][f"{row.route}:{c['summer']}:{c['effective_dow']}"]
        values = total * np.asarray(shares)
        if row.route == 50 and d.weekday() >= 5:
            values = np.asarray(shape["route50ClosureProfile"])
        forecast = np.rint(np.maximum(0, values)).astype(int)
        forecast[:5] = 0
        for hour, value in enumerate(forecast):
            result[(row.route, d.isoformat(), hour)] = int(value)
    assert len(result) == len(ROUTES) * 61 * 24
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--labels", type=Path, required=True)
    parser.add_argument("--weather", type=Path, required=True)
    parser.add_argument("--climate", type=Path, required=True)
    parser.add_argument("--template", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if args.template.resolve() == args.output.resolve():
        raise ValueError("Refusing to overwrite the champion template")
    labels = pd.read_csv(args.labels, sep=";")
    labels.date = pd.to_datetime(labels.date)
    predictions = predict(labels, weather_table(args.weather), climate_table(args.climate))
    with args.template.open(encoding="utf-8-sig", newline="") as stream:
        original = list(csv.DictReader(stream, delimiter=";"))
    if len(original) != 10 * 61 * 24 or len({(r["route"], r["date"], r["hour"]) for r in original}) != len(original):
        raise ValueError("Template must contain the unique 10-route competition grid")
    changed = 0
    for row in original:
        key = (int(row["route"]), row["date"], int(row["hour"]))
        if key[0] in ROUTES and key[2] >= 6:
            row["prediction"] = str(predictions[key])
            changed += 1
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=["route", "date", "hour", "prediction"], delimiter=";")
        writer.writeheader()
        writer.writerows(original)
    print(f"Saved {args.output}: {len(original)} rows, {changed} daytime values replaced")


if __name__ == "__main__":
    main()
