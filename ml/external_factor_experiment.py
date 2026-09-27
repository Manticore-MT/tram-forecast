"""Compare external weather factors on two 61-day historical blocks.

Observed target-period weather is retrospective information, not a forecast
available at the origin. Climate normals provide an origin-safe comparison.
"""
import argparse
import json
from pathlib import Path
from types import SimpleNamespace

import numpy as np
import pandas as pd

from app.engine import ROUTES, calendar_fields, feature_names, feature_row
from build_artifact import add_calendar, disrupted, export_bundle


def ridge(x, y, alpha):
    """Dense Ridge with an unpenalized intercept."""
    xm, ym = x.mean(axis=0), y.mean()
    xc, yc = x - xm, y - ym
    beta = np.linalg.solve(xc.T @ xc + alpha * np.eye(x.shape[1]), xc.T @ yc)
    return beta, float(ym - xm @ beta)


def weather_table(path):
    table = pd.DataFrame(json.loads(path.read_text(encoding="utf-8"))["daily"]).set_index("time")
    required = ["temperature_2m_mean", "precipitation_sum", "snowfall_sum", "wind_speed_10m_max"]
    if not set(required) <= set(table) or table[required].isna().any().any():
        raise ValueError("Missing weather values or columns")
    return table


def climate_table(path):
    table = pd.DataFrame(json.loads(path.read_text(encoding="utf-8"))["daily"])
    table["key"] = table.time.str[5:]
    return table.groupby("key").mean(numeric_only=True)


def weather_row(day, weather, climate, mode, observed):
    if mode == "base":
        return []
    w = weather.loc[day.isoformat()] if observed else climate.loc[day.strftime("%m-%d")]
    t = float(w.temperature_2m_mean)
    rain = float(w.precipitation_sum)
    snow = float(w.snowfall_sum) if "snowfall_sum" in w else 0.
    wind = float(w.wind_speed_10m_max) if "wind_speed_10m_max" in w else 0.
    if mode in ("basic", "route_basic"):
        return [t / 10, np.log1p(rain)]
    if mode == "extreme":
        return [t / 10, max(0, -t) / 10, np.log1p(rain), float(rain >= 5),
                float(rain >= 15), np.log1p(max(0, snow)), max(0, wind - 35) / 10]
    raise ValueError(mode)


def matrix(rows, weather, climate, mode, observed):
    values = []
    for r in rows.itertuples():
        route = int(r.route)
        base = feature_row(route, r.date.date())
        w = weather_row(r.date.date(), weather, climate, mode, observed)
        if mode == "route_basic":
            w += [feature if route == candidate else 0.
                  for candidate in ROUTES for feature in w[:2]]
        values.append(base + w)
    return np.asarray(values, dtype=float)


def load_history(labels, origin):
    raw = labels[labels.route.isin(ROUTES) & (labels.date < origin)]
    index = pd.MultiIndex.from_product(
        [ROUTES, pd.date_range("2025-01-01", origin - pd.Timedelta(days=1)), range(24)],
        names=["route", "date", "hour"])
    h = raw.set_index(["route", "date", "hour"]).reindex(index)
    h.boardings = h.boardings.fillna(0)
    h = add_calendar(h.reset_index())
    daily = add_calendar(h.groupby(["route", "date"], as_index=False).boardings.sum())
    normal = daily.groupby(["route", "daytype"]).boardings.transform("median")
    train = daily[(daily.boardings > np.maximum(500, .35 * normal)) & ~disrupted(daily)].copy()
    return h, train


def evaluate(labels, weather, climate, origin, mode, alpha, observed):
    history, train = load_history(labels, origin)
    x = matrix(train, weather, climate, mode, True)
    y = np.log1p(train.boardings.to_numpy())
    beta, intercept = ridge(x, y, alpha)
    train["residual"] = y - (x @ beta + intercept)
    correction = train[train.date >= origin - pd.Timedelta(days=28)].groupby("route").residual.median()
    config = dict(alpha=1., annual=0, trend=False, weather=False, route_season=True,
                  events=False, correction_window=28, correction_stat="median",
                  correction_decay=None, shape_blend=.8, exclude_before_local_time="05:30:00")
    dummy = SimpleNamespace(coef_=np.zeros(len(feature_names())), intercept_=0.)
    bundle = dict(history=history, origin=origin, config=config, regression=dummy,
                  correction=correction, training_daily_rows=len(train))
    shape = export_bundle(bundle, "experiment")
    days = pd.date_range(origin, periods=61)
    future = pd.MultiIndex.from_product([ROUTES, days], names=["route", "date"]).to_frame(index=False)
    xf = matrix(future, weather, climate, mode, observed)
    totals = np.maximum(0, np.expm1(xf @ beta + intercept + future.route.map(correction).fillna(0).to_numpy()))
    actual = labels.set_index(["route", "date", "hour"]).boardings
    err = denom = 0.
    for row, total in zip(future.itertuples(), totals):
        d = row.date.date()
        c = calendar_fields(d)
        key = f"{row.route}:{c['summer']}:{c['effective_dow']}"
        values = total * np.asarray(shape["hourlyShares"][key])
        if row.route == 50 and origin >= pd.Timestamp("2025-09-06") and d.weekday() >= 5:
            values = np.asarray(shape["route50ClosureProfile"])
        prediction = np.rint(np.maximum(0, values))
        prediction[:5] = 0
        observed_hours = np.asarray([actual.get((row.route, row.date, h), 0) for h in range(24)])
        err += np.abs(observed_hours - prediction).sum()
        denom += observed_hours.sum()
    return dict(score=float(1 - err / denom), wape=float(err / denom), trainingDays=int(len(train)))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--labels", type=Path, required=True)
    parser.add_argument("--weather", type=Path, required=True)
    parser.add_argument("--climate", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    labels = pd.read_csv(args.labels, sep=";")
    labels.date = pd.to_datetime(labels.date)
    weather, climate = weather_table(args.weather), climate_table(args.climate)
    result = {"source": "https://open-meteo.com/en/docs/historical-weather-api",
              "targetWeatherAvailableAtOrigin": False, "results": {}}
    for origin in ("2025-07-01", "2025-09-01"):
        scores = {}
        for mode in ("base", "basic", "extreme", "route_basic"):
            for alpha in ((1.,) if mode == "base" else (1., 10., 100.)):
                # The archived climate file has temperature and precipitation,
                # but no snow/wind normals required by the extreme variant.
                for observed in ((True, False) if mode in ("basic", "route_basic") else (True,)):
                    name = f"{mode}_a{alpha:g}_{'observed' if observed else 'climate'}"
                    scores[name] = evaluate(labels, weather, climate, pd.Timestamp(origin), mode, alpha, observed)
        result["results"][origin] = scores
        print(origin, json.dumps({k: round(v["score"], 6) for k, v in scores.items()}))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
