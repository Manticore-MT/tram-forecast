"""HTTP adapter for the existing backend contract (docs/ml-contract.md)."""
from contextlib import asynccontextmanager
from datetime import date as Date, datetime, time
from functools import lru_cache
from pathlib import Path
from typing import Literal
from zoneinfo import ZoneInfo
import csv
import hashlib
import json
import os

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, ConfigDict, Field

from .engine import Engine, ROUTES, calendar_fields, period_days

ROOT = Path(__file__).resolve().parents[1]
ZONE = ZoneInfo("Europe/Moscow")


class PredictRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    horizon: Literal["day", "week", "month", "year"]
    date: Date
    routeIds: list[str] | None = Field(default=None, min_length=1, max_length=9)


def timestamp(day: Date, hour: int = 0) -> str:
    return datetime.combine(day, time(hour), tzinfo=ZONE).isoformat()


class ForecastService:
    def __init__(self):
        self.engine = Engine(Path(os.getenv("ML_ARTIFACT_PATH", ROOT / "artifacts/route_model.json")))
        network_path = Path(os.getenv("ML_NETWORK_PATH", ROOT / "network/tram-stops.json"))
        self.network = json.loads(network_path.read_text(encoding="utf-8"))
        self.network_sha = hashlib.sha256(network_path.read_bytes()).hexdigest()[:8]
        self.stops = {r["routeId"]: [s["stopId"] for s in r["stops"]] for r in self.network}
        if set(self.stops) != {str(r) for r in ROUTES}:
            raise ValueError("Network routes must match the trained nine routes")
        if any(not s or len(s) != len(set(s)) for s in self.stops.values()):
            raise ValueError("Empty or duplicate stop IDs")
        self.allow_scenario = os.getenv("ML_ALLOW_SCENARIO", "true").lower() == "true"

    def validate(self, request):
        days = period_days(request.horizon, request.date)
        e = self.engine
        if days[0] < e.origin or days[-1] > e.last:
            raise HTTPException(422, detail={"code": "UNSUPPORTED_PERIOD",
                "message": "Весь запрошенный период должен входить в 2025-11-01 … 2026-12-31. Год — полный календарный год; доступен только 2026 (сценарий).",
                "requestedStart": str(days[0]), "requestedEnd": str(days[-1])})
        scenario = days[-1] > e.validated_last
        if scenario and not self.allow_scenario:
            raise HTTPException(422, detail={"code": "SCENARIO_DISABLED", "message": "Данные актуальны до 2025-10-31. Экстраполяция за пределы декабря 2025 отключена."})
        routes = request.routeIds or [str(r) for r in ROUTES]
        if len(routes) != len(set(routes)) or any(r not in self.stops for r in routes):
            raise HTTPException(422, detail={"code": "UNSUPPORTED_ROUTE", "supportedRoutes": [str(r) for r in ROUTES]})
        return days, routes, scenario

    @lru_cache(maxsize=32)
    def routes(self, horizon, anchor, routes):
        days = period_days(horizon, anchor)
        result = []
        for route in routes:
            forecast, baseline = self.engine.hourly(int(route), days)
            points = []
            if horizon == "day":
                points = [dict(periodStart=timestamp(days[0], h), baseline=float(baseline[0, h]), forecast=float(forecast[0, h])) for h in range(24)]
            elif horizon in ("week", "month"):
                points = [dict(periodStart=timestamp(day), baseline=float(b.sum()), forecast=float(f.sum())) for day, f, b in zip(days, forecast, baseline)]
            else:
                for month in range(1, 13):
                    indices = [i for i, day in enumerate(days) if day.month == month]
                    points.append(dict(periodStart=timestamp(Date(anchor.year, month, 1)),
                                       baseline=float(baseline[indices].sum()), forecast=float(forecast[indices].sum())))
            factors = ["Календарь: дни недели, праздники, сокращённые дни", "Летняя сезонность",
                       "Исторический часовой профиль", "Поправка уровня по последним 28 дням истории"]
            if any(calendar_fields(d)["holiday"] for d in days):
                factors.append("В периоде есть праздничные или перенесённые выходные")
            if route == "50" and any(d.weekday() >= 5 and d <= self.engine.validated_last for d in days):
                factors.append("Маршрут 50: допущение продолжения ограничений по выходным до конца 2025")
            result.append(dict(routeId=route, points=points, factors=factors))
        return result

    def response(self, request, stops):
        days, routes, scenario = self.validate(request)
        base = self.routes(request.horizon, request.date, tuple(routes))
        items = []
        for entry in base:
            factors = list(entry["factors"])
            if scenario:
                factors.append("СЦЕНАРИЙ: экстраполяция истории до 31.10.2025; качество на этих датах не проверено")
            if stops:
                factors.append("ДЕМО ОСТАНОВОК: равномерное распределение суммы маршрута; реальные посадки по остановкам неизвестны")
                stop_ids = self.stops[entry["routeId"]]
                n = len(stop_ids)
                for stop in stop_ids:
                    points = [dict(periodStart=p["periodStart"], baseline=p["baseline"]/n, forecast=p["forecast"]/n) for p in entry["points"]]
                    items.append(dict(routeId=entry["routeId"], stopId=stop, points=points, factors=factors))
            else:
                items.append(dict(routeId=entry["routeId"], points=entry["points"], factors=factors))
        version = self.engine.version
        if stops:
            version += f"-uniform-stops-demo-{self.network_sha}"
        if scenario:
            version += "-scenario"
        return dict(generatedAt=datetime.now(ZONE).isoformat(), modelVersion=version, forecasts=items)


@asynccontextmanager
async def lifespan(app):
    app.state.service = ForecastService()
    yield


app = FastAPI(title="Tram ML service", version="1.0.0", lifespan=lifespan,
              description="Ridge-прогноз маршрутных валидаций. /predict — совместимый демонстрационный адаптер остановок; /predict/routes — исходные маршрутные значения. Данные заканчиваются 31.10.2025.")


@app.get("/", include_in_schema=False)
def home():
    return RedirectResponse("/docs")


@app.get("/health")
def health():
    return {"status": "ok", "modelVersion": app.state.service.engine.version}


@app.get("/metadata")
def metadata():
    service = app.state.service
    return dict(modelVersion=service.engine.version, target="successful_validations", timezone="Europe/Moscow",
                historyThrough="2025-10-31", forecastOrigin="2025-11-01",
                competitionPeriod={"start": "2025-11-01", "end": "2025-12-31"},
                scenarioPeriod={"start": "2026-01-01", "end": "2026-12-31"}, scenarioEnabled=service.allow_scenario,
                supportedRoutes=[str(r) for r in ROUTES], stopCount=sum(map(len, service.stops.values())),
                stopAllocation="uniform_demo_not_measured", segmentOccupancyAvailable=False,
                baselineMethod="Медиана за 56 дней перед 01.11.2025: маршрут × эффективный день недели × час; праздники как воскресенье, рабочая суббота как пятница. Нули и ограничения в истории сохранены.",
                corrections="Погода, событие и сезон — сценарные множители backend; в ML повторно не применяются.",
                limitations=["Нет фактов по остановкам, высадок и измерений заполненности салона.",
                             "Московское время — соглашение API; timezone сырого tran_date_time документально не подтверждён.",
                             "В сценарии 2026 предполагается нормальная работа маршрута 50.",
                             "Год 2025 отклоняется: нельзя выдать честный полный год прогнозом с отсечкой 01.11.2025."],
                sources={"labels": "https://disk.yandex.ru/d/DiFwlfMOauxjBg",
                         "calendar": "https://government.ru/docs/all/155500/"})


@app.post("/predict")
def predict(request: PredictRequest):
    """Backend contract: one entry per route-stop; stop values are demo allocations."""
    return app.state.service.response(request, stops=True)


@app.post("/predict/routes")
def predict_routes(request: PredictRequest):
    """Unallocated route totals, including baseline, for research and real metrics."""
    return app.state.service.response(request, stops=False)


@lru_cache(maxsize=2)
def backtest_metrics(origin):
    groups = {"all": [0., 0., 0]}
    with (ROOT / "reference" / f"final_backtest_{origin}.csv").open(encoding="utf-8", newline="") as stream:
        for row in csv.DictReader(stream):
            actual, predicted = float(row["boardings"]), round(float(row["selected"]))
            error = abs(actual-predicted)
            for key in ("all", "route:"+row["route"], "day:"+row["date"]):
                acc = groups.setdefault(key, [0., 0., 0])
                acc[0] += error
                acc[1] += actual
                acc[2] += 1
    def value(acc):
        wape = acc[0]/acc[1] if acc[1] else None
        return dict(wape=wape, score=max(0., 1-wape) if wape is not None else None,
                    absoluteError=acc[0], actualSum=acc[1], observations=acc[2])
    return dict(origin=origin, overall=value(groups["all"]),
                byRoute=[dict(routeId=k[6:], **value(v)) for k,v in groups.items() if k.startswith("route:")],
                byDay=[dict(date=k[4:], **value(v)) for k,v in sorted(groups.items()) if k.startswith("day:")])


@app.get("/metrics")
def metrics(origin: Literal["2025-07-01", "2025-09-01"] = Query(default="2025-09-01")):
    return dict(scope="historical_route_hour_backtest", **backtest_metrics(origin),
                platform={"score": .88220, "provenance": "reported_by_team", "hiddenActualsAvailable": False},
                limitations=["Блоки использовались при подборе модели; это не независимый финальный тест.",
                             "Остановочных метрик и фактов нет. В actual_value не следует импортировать искусственно распределённые факты.",
                             "Доступны два отдельных 61-дневных блока; непрерывной 90-дневной проверки нет."])
