"""Fixed-protocol, retrained leave-one-category-out ablations for criterion 2.

This is a separate experimental model, not a reproduction of the leaderboard CSV.
Observed future external covariates are retrospective inputs permitted by the team.
No target after the training cutoff enters fitting; test windows do not overlap.
"""
import argparse
import hashlib
import json
from pathlib import Path
import platform
import sys

import catboost
from catboost import CatBoostRegressor
import numpy as np
import pandas as pd

from app.engine import ROUTES, calendar_fields

ROOT = Path(__file__).resolve().parent
GROUPS = {
    "calendar": ["effective_dow", "workday", "holiday", "shortday", "summer", "annual_sin", "annual_cos"],
    "weather": ["temperature_2m", "apparent_temperature", "precipitation", "snowfall", "wind_speed_10m", "rain_3h"],
    "traffic": ["averageSpeedKmh", "congestionPoints", "speed_missing", "congestion_missing", "traffic_age_hours"],
    "events": ["service_restricted"],
}
BASE = ["route", "hour", "route_hour"]
VARIANTS = ["all"] + ["without_" + name for name in GROUPS]
WINDOWS = [("2025-07-01", "2025-08-31"), ("2025-09-01", "2025-09-30"), ("2025-10-01", "2025-10-31")]
SOURCES = {
    "calendar": {"label": "Календарь и сезонность", "urls": ["https://government.ru/docs/all/155500/"],
        "method": "Календарь РФ: тип дня, праздники, рабочая суббота, сокращённые дни; сезонные признаки из даты.",
        "availability": "Известен заранее. День недели и сезон не считаются отдельными внешними источниками."},
    "weather": {"label": "Погода", "urls": ["https://open-meteo.com/en/docs/historical-weather-api",
        "https://archive-api.open-meteo.com/v1/archive?latitude=55.782074&longitude=37.576374&start_date=2025-01-01&end_date=2025-12-31&hourly=temperature_2m,apparent_temperature,precipitation,snowfall,wind_speed_10m&timezone=Europe%2FMoscow"],
        "method": "Почасовые температура, ощущаемая температура, осадки, снег, ветер; сумма осадков за 3 часа.",
        "availability": "Реанализ фактической погоды, ретроспективная проверка; для будущего нужен прогноз погоды."},
    "traffic": {"label": "Дорожный трафик", "urls": ["https://t.me/s/DtOperativno", "https://t.me/DtOperativno/20376"],
        "method": "Последняя опубликованная сводка ЦОДД не старше 3 часов: скорость, баллы, давность, индикаторы пропусков.",
        "availability": "Нерегулярные общегородские сообщения. Нет непрерывных измерений на трассе каждого маршрута. Пропуск не означает свободную дорогу."},
    "events": {"label": "Изменения движения", "urls": ["https://t.me/DtOperativno/22627", "https://t.me/DtOperativno/23565"],
        "method": "Вручную структурированные сообщения: ограничения маршрутов 7/50 по выходным с 06.09 и восстановление с 15.11.2025.",
        "availability": "Ретроспективные даты. Работа именно в рабочую субботу 01.11 отдельно не подтверждена; применяется календарная субботняя маска. Летние неподтверждённые границы не используются."},
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False), encoding="utf-8")


def make_features(weather_mode="raw"):
    frame = pd.MultiIndex.from_product([ROUTES, pd.date_range("2025-01-01", "2025-12-31"), range(24)],
                                       names=["route", "date", "hour"]).to_frame(index=False)
    frame["route_hour"] = frame.route.astype(str) + ":" + frame.hour.astype(str)
    calendar = pd.DataFrame([calendar_fields(day.date()) for day in frame.date])
    for column in calendar:
        frame[column] = calendar[column].to_numpy()
    frame["annual_sin"] = np.sin(2 * np.pi * frame.date.dt.dayofyear / 365.25)
    frame["annual_cos"] = np.cos(2 * np.pi * frame.date.dt.dayofyear / 365.25)
    restricted = frame.date.between("2025-09-06", "2025-11-14") & frame.dow.ge(5) & frame.route.isin([7, 50])
    frame["service_restricted"] = restricted.astype(int)
    weather = pd.DataFrame(json.loads((ROOT / "data/weather_hourly_2025_open_meteo.json").read_text(encoding="utf-8"))["hourly"])
    stamp = pd.to_datetime(weather.pop("time"))
    weather["date"], weather["hour"] = stamp.dt.normalize(), stamp.dt.hour
    weather["rain_3h"] = weather.precipitation.rolling(3, min_periods=1).sum()
    if weather_mode == "anomaly":
        climate = pd.DataFrame(json.loads((ROOT / "data/weather_climate_2015_2024.json").read_text(encoding="utf-8"))["daily"])
        normals = climate.groupby(climate.time.str[5:]).temperature_2m_mean.mean()
        weather["temperature_anomaly"] = (weather.temperature_2m - weather.date.dt.strftime("%m-%d").map(normals)).clip(-15, 15)
        weather["rain_log"] = np.log1p(weather.precipitation)
        weather["wind_excess"] = (weather.wind_speed_10m - 25).clip(lower=0)
    frame = frame.merge(weather, on=["date", "hour"], how="left", validate="many_to_one")
    if frame[GROUPS["weather"]].isna().any().any():
        raise ValueError("Weather must cover every requested hour")
    reports = pd.DataFrame(json.loads((ROOT / "data/traffic_reports_2025_deptrans.json").read_text(encoding="utf-8"))["observations"])
    reports["published"] = pd.to_datetime(reports.publishedAt, utc=True).dt.tz_convert("Europe/Moscow").dt.tz_localize(None)
    frame["stamp"] = frame.date + pd.to_timedelta(frame.hour, unit="h")
    frame["order"] = np.arange(len(frame))
    frame = pd.merge_asof(frame.sort_values("stamp"), reports.sort_values("published")[["published", "averageSpeedKmh", "congestionPoints"]],
                          left_on="stamp", right_on="published", direction="backward", tolerance=pd.Timedelta(hours=3)).sort_values("order").reset_index(drop=True)
    frame["traffic_observed"] = frame.averageSpeedKmh.notna() | frame.congestionPoints.notna()
    frame["speed_missing"] = frame.averageSpeedKmh.isna().astype(int)
    frame["congestion_missing"] = frame.congestionPoints.isna().astype(int)
    frame["traffic_age_hours"] = ((frame.stamp - frame.published).dt.total_seconds() / 3600).fillna(-1)
    frame[["averageSpeedKmh", "congestionPoints"]] = frame[["averageSpeedKmh", "congestionPoints"]].fillna(-1)
    for column in ("route", "route_hour", "effective_dow"):
        frame[column] = frame[column].astype(str)
    return frame


def load_targets(frame):
    labels = pd.read_csv(ROOT / "data/labels_day_filtered_all.csv", sep=";", dtype={"route": str})
    labels.date = pd.to_datetime(labels.date)
    if labels.duplicated(["route", "date", "hour"]).any() or labels.boardings.lt(0).any():
        raise ValueError("Invalid target keys or negative labels")
    values = frame.merge(labels[["route", "date", "hour", "boardings"]], on=["route", "date", "hour"], how="left", validate="one_to_one")
    values["boardings"] = values.boardings.fillna(0)
    return values


def score(actual, predicted):
    error = float(np.abs(np.asarray(actual) - np.asarray(predicted)).sum())
    denominator = float(np.asarray(actual).sum())
    return {"absoluteError": error, "actualSum": denominator, "observations": len(actual),
            "wape": error / denominator if denominator else None,
            "score": max(0., 1 - error / denominator) if denominator else None}


def fit_predict(train, test, variant, iterations, model_path=None):
    omitted = variant.removeprefix("without_") if variant != "all" else None
    columns = BASE + [column for group, names in GROUPS.items() if group != omitted for column in names]
    cats = [name for name in ("route", "route_hour", "effective_dow") if name in columns]
    # Scale only by route: no calendar/event information hidden in the denominator.
    scale = train.groupby("route").boardings.mean().clip(lower=1)
    weights = train.route.map(scale).to_numpy()
    model = CatBoostRegressor(iterations=iterations, depth=6, learning_rate=.055, loss_function="MAE",
        l2_leaf_reg=15, random_seed=42, thread_count=4, verbose=False, allow_writing_files=False, one_hot_max_size=255)
    model.fit(train[columns], train.boardings.to_numpy() / weights,
              sample_weight=weights / weights.mean(), cat_features=cats)
    prediction = np.maximum(0, np.rint(model.predict(test[columns]) * test.route.map(scale).to_numpy()))
    prediction[test.hour.lt(5).to_numpy()] = 0
    if model_path:
        model_path.parent.mkdir(parents=True, exist_ok=True)
        model.save_model(str(model_path))
        write_json(model_path.with_suffix(".json"), {"columns": columns, "categories": cats,
            "routeScale": scale.to_dict(), "trainedThrough": "2025-10-31"})
    return prediction


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=ROOT / "artifacts/factors")
    parser.add_argument("--iterations", type=int, default=450)
    parser.add_argument("--weather-mode", choices=["raw", "anomaly"], default="raw")
    parser.add_argument("--publish-web", action="store_true")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    if args.weather_mode == "anomaly":
        GROUPS["weather"] = ["temperature_anomaly", "rain_log", "snowfall", "wind_excess", "rain_3h"]
        SOURCES["weather"]["method"] = "Отклонение температуры от нормы 2015–2024, log(1+осадки), снег, ветер свыше 25 км/ч, осадки за 3 часа. Температурная аномалия ограничена ±15°C."
    all_rows = load_targets(make_features(args.weather_mode))
    report = {"schemaVersion": 1, "modelVersion": "external-catboost-v1-" + args.weather_mode, "platformScore": None,
        "target": "successful_validations_excluding_0000_0529", "protocol": {
            "type": "retrained_leave_one_category_out", "nonOverlappingWindows": True,
            "historicalDevelopmentEvaluation": True, "independentFinalTest": False,
            "futureExternalData": "observed retrospective, allowed by team; not available in operational forecasts",
            "targetLeakageGuard": "train.date < origin; identical training rows, hyperparameters and seed across all variants",
            "missingTargets": "missing route-hour groups filled with zero, same organizer-grid convention; may conflate outages with zero demand",
            "iterations": args.iterations, "weatherMode": args.weather_mode, "seed": 42, "effectDefinition": "WAPE(without source) minus WAPE(all); positive means source helps in this model",
            "limitations": "Ablations measure predictive contribution, not causal passenger behavior; interactions and correlated features remain."},
        "runtime": {"python": platform.python_version(), "catboost": catboost.__version__, "pandas": pd.__version__, "numpy": np.__version__},
        "sources": SOURCES, "featureGroups": GROUPS, "windows": [],
        "inputs": {str(p.relative_to(ROOT)): digest(p) for p in [ROOT / "data/labels_day_filtered_all.csv",
            ROOT / "data/weather_hourly_2025_open_meteo.json", ROOT / "data/weather_climate_2015_2024.json", ROOT / "data/traffic_reports_2025_deptrans.json", ROOT / "app/engine.py", Path(__file__)]}}
    pooled = {variant: {"absoluteError": 0., "actualSum": 0., "observations": 0} for variant in VARIANTS}
    for start, end in WINDOWS:
        train = all_rows[all_rows.date.lt(start) & all_rows.hour.ge(5)].copy()
        test = all_rows[all_rows.date.between(start, end)].copy()
        assert train.date.max() < test.date.min()
        window = {"start": start, "end": end, "trainingRows": len(train), "trainedThrough": str(train.date.max().date()),
                  "trafficCoverage": float(test[test.hour.ge(5)].traffic_observed.mean()), "metrics": {}}
        predictions = test[["route", "date", "hour", "boardings", "traffic_observed", "service_restricted"]].copy()
        for variant in VARIANTS:
            pred = fit_predict(train, test, variant, args.iterations)
            predictions[variant] = pred
            metric = score(test.boardings, pred)
            window["metrics"][variant] = metric
            for key in pooled[variant]:
                pooled[variant][key] += metric[key]
            print(start, variant, round(metric["wape"], 6), flush=True)
        window["effects"] = {name: {"wapeGain": window["metrics"]["without_" + name]["wape"] - window["metrics"]["all"]["wape"],
            "changedHours": int((predictions["all"] != predictions["without_" + name]).sum())} for name in GROUPS}
        for name, mask in [("traffic", test.traffic_observed), ("events", test.service_restricted.eq(1)),
                           ("weather", test.precipitation.ge(.5))]:
            if mask.any():
                window["effects"][name]["activeSubset"] = {variant: score(test.loc[mask, "boardings"], predictions.loc[mask, variant])
                    for variant in ["all", "without_" + name]}
                if name == "weather":
                    window["effects"][name]["subsetDefinition"] = "hourly precipitation >= 0.5 mm; exploratory analysis added after overall weather result was known"
        predictions.to_csv(args.output / f"backtest_{start}.csv", index=False)
        report["windows"].append(window)
        write_json(args.output / "evidence.json", report)
    for metric in pooled.values():
        metric["wape"] = metric["absoluteError"] / metric["actualSum"]
        metric["score"] = max(0., 1 - metric["wape"])
    report["aggregate"] = pooled
    report["effects"] = {name: {"wapeGain": pooled["without_" + name]["wape"] - pooled["all"]["wape"],
        "improvedWindows": sum(w["effects"][name]["wapeGain"] > 0 for w in report["windows"]), "totalWindows": len(WINDOWS)} for name in GROUPS}
    train = all_rows[all_rows.date.lt("2025-11-01") & all_rows.hour.ge(5)].copy()
    future = all_rows[all_rows.date.ge("2025-11-01")].copy()
    forecasts = {"schemaVersion": 1, "modelVersion": report["modelVersion"], "dates": ["2025-11-01", "2025-12-31"],
                 "routeIds": [str(r) for r in ROUTES], "variants": {}}
    for variant in VARIANTS:
        predicted = fit_predict(train, future, variant, args.iterations, args.output / "models" / f"{variant}.cbm")
        frame = future.assign(prediction=predicted)
        forecasts["variants"][variant] = {f"{route}:{str(day.date())}": group.sort_values("hour").prediction.astype(int).tolist()
            for (route, day), group in frame.groupby(["route", "date"])}
        print("final model", variant, flush=True)
    write_json(args.output / "forecasts.json", forecasts)
    report["forecastSha256"] = digest(args.output / "forecasts.json")
    report["models"] = {p.name: digest(p) for p in sorted((args.output / "models").glob("*.cbm"))}
    write_json(args.output / "evidence.json", report)
    if args.publish_web:
        public = ROOT.parent / "frontend/public/factors"
        write_json(public / "evidence.json", report)
        write_json(public / "forecasts.json", forecasts)
    print(json.dumps(report["effects"], indent=2), flush=True)


if __name__ == "__main__":
    main()
