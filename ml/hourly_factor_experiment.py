"""Fixed-origin comparison of Ridge and normalized hourly CatBoost.

All demand labels used for fitting precede origin. Observed future weather is
an explicitly retrospective competition scenario, permitted by the team.
The production artifact and champion submission are not changed.
"""
import argparse
import json
from pathlib import Path
from types import SimpleNamespace

import numpy as np
import pandas as pd
from catboost import CatBoostRegressor

from app.engine import ROUTES, calendar_fields, feature_names
from build_artifact import add_calendar, disrupted, export_bundle
from external_factor_experiment import load_history, matrix, ridge

ROOT = Path(__file__).resolve().parent


def dense_labels(filtered=False):
    paths = [ROOT / "data/labels_day_filtered_all.csv"] if filtered else [
        ROOT / "data/labels_day_train.csv", ROOT / "data/labels_day_test.csv"]
    labels = pd.concat([pd.read_csv(p, sep=";") for p in paths], ignore_index=True)
    labels.date = pd.to_datetime(labels.date)
    if labels.duplicated(["route", "date", "hour"]).any():
        raise ValueError("duplicate demand labels")
    return labels


def fit_base(labels, origin, days=61):
    history, train = load_history(labels, origin)
    x = matrix(train, None, None, "base", True)
    y = np.log1p(train.boardings.to_numpy())
    beta, intercept = ridge(x, y, 1.)
    train["daily_base"] = np.maximum(1, np.expm1(x @ beta + intercept))
    train["residual"] = y - (x @ beta + intercept)
    correction = train[train.date >= origin - pd.Timedelta(days=28)].groupby("route").residual.median()
    config = dict(alpha=1., annual=0, trend=False, weather=False, route_season=True,
                  events=False, correction_window=28, correction_stat="median",
                  correction_decay=None, shape_blend=.8)
    model = SimpleNamespace(coef_=beta, intercept_=intercept)
    bundle = export_bundle(dict(history=history, origin=origin, config=config,
                                regression=model, correction=correction,
                                training_daily_rows=len(train)), "experiment")
    future = pd.MultiIndex.from_product([ROUTES, pd.date_range(origin, periods=days), range(24)],
                                        names=["route", "date", "hour"]).to_frame(index=False)
    future = add_calendar(future)
    daily = future.drop_duplicates(["route", "date"]).copy()
    daily["daily_base"] = np.maximum(0, np.expm1(matrix(daily, None, None, "base", True) @ beta
        + intercept + daily.route.map(correction).fillna(0).to_numpy()))
    future = future.merge(daily[["route", "date", "daily_base"]], on=["route", "date"], validate="many_to_one")
    shares = np.asarray([bundle["hourlyShares"][f"{r.route}:{r.summer}:{r.effective_dow}"][r.hour]
                         for r in future.itertuples()])
    future["ridge"] = future.daily_base * shares
    future["closed50"] = (future.route.eq(50) & future.dow.ge(5) & (origin >= pd.Timestamp("2025-09-06")))
    future.loc[future.closed50, "ridge"] = future.loc[future.closed50, "hour"].map(
        dict(enumerate(bundle["route50ClosureProfile"])))
    # The hourly learner sees all observed operating regimes. Daily Ridge is
    # still fitted to normal service only, exactly as in the reference model.
    all_daily = history.groupby(["route", "date"], as_index=False).boardings.sum()
    all_daily = add_calendar(all_daily)
    all_daily["daily_base"] = np.maximum(1, np.expm1(matrix(all_daily, None, None, "base", True) @ beta + intercept))
    all_daily["keep"] = all_daily.boardings.gt(500) | disrupted(all_daily)
    history = history.merge(all_daily[["route", "date", "daily_base", "keep"]], on=["route", "date"], validate="many_to_one")
    return history, future


def weather_frame():
    raw = json.loads((ROOT / "data/weather_hourly_2025_open_meteo.json").read_text(encoding="utf-8"))
    weather = pd.DataFrame(raw["hourly"])
    weather["datetime"] = pd.to_datetime(weather.pop("time"))
    weather["date"] = weather.datetime.dt.normalize()
    weather["hour"] = weather.datetime.dt.hour
    if weather.isna().any().any():
        raise ValueError("Missing hourly weather")
    climate = pd.DataFrame(json.loads((ROOT / "data/weather_climate_2015_2024.json").read_text(encoding="utf-8"))["daily"])
    normal = climate.groupby(climate.time.str[5:]).temperature_2m_mean.mean()
    weather["temperature_anomaly"] = weather.temperature_2m - weather.date.dt.strftime("%m-%d").map(normal)
    weather["rain_3h"] = weather.precipitation.rolling(3, min_periods=1).sum()
    weather["rain_6h"] = weather.precipitation.rolling(6, min_periods=1).sum()
    return weather.drop(columns="datetime")


def features(frame, weather, origin, mode):
    f = frame.copy()
    f["route_hour"] = f.route.astype(str) + ":" + f.hour.astype(str)
    columns = ["route", "hour", "effective_dow", "summer", "holiday", "shortday", "newyear", "route_hour"]
    cats = ["route", "effective_dow", "route_hour"]
    if "events" in mode:
        known_july = origin > pd.Timestamp("2025-07-09")
        known_sept = origin > pd.Timestamp("2025-09-05")
        past = f.date < origin
        july_active = f.date.between("2025-07-10", "2025-08-06") & past
        if known_july and origin <= pd.Timestamp("2025-08-06"):
            july_active |= ~past  # no invented advance knowledge of reopening
        f["service_july"] = (july_active & f.route.isin([7, 50])).astype(int)
        f["service_weekend"] = (f.date.ge("2025-09-06") & f.dow.ge(5) & f.route.isin([7, 50])
                                  & (past | known_sept)).astype(int)
        columns += ["service_july", "service_weekend"]
    if "weather" in mode:
        f = f.merge(weather, on=["date", "hour"], how="left", validate="many_to_one")
        columns += ["temperature_anomaly", "precipitation", "snowfall", "wind_speed_10m", "rain_3h", "rain_6h"]
    for c in cats:
        f[c] = f[c].astype(str)
    if f[columns].isna().any().any():
        raise ValueError("missing experiment features")
    return f[columns], cats


def metrics(frame, prediction):
    predicted = np.maximum(0, np.rint(prediction))
    error = float(np.abs(frame.boardings.to_numpy() - predicted).sum())
    total = float(frame.boardings.sum())
    return dict(score=max(0., 1-error/total), wape=error/total,
                absoluteError=error, actualSum=total, biasPct=float(100*(predicted.sum()/total-1)))


def run_origin(raw, filtered, weather, origin, days, iterations, depth):
    hist, future = fit_base(filtered, origin, days)
    _, original = fit_base(raw, origin, days)
    actual = raw.set_index(["route", "date", "hour"]).boardings
    keys = pd.MultiIndex.from_frame(future[["route", "date", "hour"]])
    future["boardings"] = actual.reindex(keys).fillna(0).to_numpy()
    night = future.hour.lt(6).to_numpy()
    future["champion"] = np.where(night, original.ridge, future.ridge)
    results = {"ridge_hybrid": metrics(future, future.champion)}
    # A fixed 20% blend is evaluated as well as the pure replacement, to avoid
    # selecting arbitrary weights from the hidden leaderboard.
    for mode in ("calendar", "calendar_weather", "calendar_events", "calendar_weather_events"):
        train = hist[hist.hour.ge(6) & hist.keep].copy()
        # Exclude known disruptions when event indicators are ablated. Otherwise
        # the calendar-only learner would treat altered service as normal demand.
        if "events" not in mode:
            train = train[~disrupted(train)].copy()
        xt, cats = features(train, weather, origin, mode)
        xf, _ = features(future, weather, origin, mode)
        y = 1000 * train.boardings.to_numpy() / train.daily_base.to_numpy()
        weights = train.daily_base.to_numpy() / train.daily_base.mean()
        model = CatBoostRegressor(iterations=iterations, depth=depth, learning_rate=.045,
                                 loss_function="MAE", l2_leaf_reg=15, random_seed=42,
                                 thread_count=4, verbose=False, allow_writing_files=False,
                                 one_hot_max_size=255)
        model.fit(xt, y, cat_features=cats, sample_weight=weights)
        prediction = np.maximum(0, model.predict(xf)) * future.daily_base.to_numpy()/1000
        prediction[night] = original.ridge.to_numpy()[night]
        # Keep the champion's separately audited route-50 service assumption.
        prediction[future.closed50.to_numpy()] = future.champion.to_numpy()[future.closed50.to_numpy()]
        future[mode] = prediction
        future[mode+"_blend20"] = .8*future.champion + .2*prediction
        results[mode] = metrics(future, prediction)
        results[mode+"_blend20"] = metrics(future, future[mode+"_blend20"])
        print(str(origin.date()), mode, results[mode], flush=True)
    return future, results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--origins", nargs="+", default=["2025-05-01", "2025-07-01", "2025-08-01", "2025-09-01"])
    parser.add_argument("--iterations", type=int, default=550)
    parser.add_argument("--depth", type=int, default=6)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    raw, filtered, weather = dense_labels(), dense_labels(True), weather_frame()
    report = dict(protocol="61-day fixed origins, original organizer targets with champion night handling",
                  targetWeather="observed retrospective; allowed per team, not an operational weather forecast",
                  iterations=args.iterations, depth=args.depth, results={})
    for text in args.origins:
        origin = pd.Timestamp(text)
        future, results = run_origin(raw, filtered, weather, origin, 61, args.iterations, args.depth)
        future.to_csv(args.output/f"predictions_{text}.csv", index=False)
        report["results"][text] = results
        (args.output/"metrics.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
