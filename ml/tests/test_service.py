from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path
import csv
import subprocess
import sys

import numpy as np
import pytest
from fastapi.testclient import TestClient

from app.engine import Engine, ROUTES, calendar_fields
from app.main import app, ROOT


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_all_competition_predictions_match_original_submission():
    engine = Engine(ROOT / "artifacts/route_model.json")
    days = [date(2025, 11, 1) + timedelta(days=i) for i in range(61)]
    with (ROOT / "reference/submission.csv").open(encoding="utf-8", newline="") as stream:
        expected = {(int(r["route"]), r["date"], int(r["hour"])): int(r["prediction"]) for r in csv.DictReader(stream, delimiter=";")}
    compared = 0
    for route in ROUTES:
        forecast, _ = engine.hourly(route, days)
        for i, day in enumerate(days):
            for hour in range(24):
                assert forecast[i, hour] == expected[route, str(day), hour], (route, day, hour)
                compared += 1
    assert compared == 13176
    assert all(v == 0 for (r, _, _), v in expected.items() if r == 5)


def test_backend_contract_and_conservation(client):
    query = {"horizon": "day", "date": "2025-11-01"}
    response = client.post("/predict", json=query)
    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"generatedAt", "modelVersion", "forecasts"}
    assert "uniform-stops-demo" in body["modelVersion"]
    assert body["generatedAt"].endswith("+03:00")
    assert len(body["forecasts"]) == 297
    totals = defaultdict(lambda: np.zeros((24, 2)))
    for stop in body["forecasts"]:
        assert set(stop) == {"routeId", "stopId", "points", "factors"}
        assert stop["stopId"] in app.state.service.stops[stop["routeId"]]
        assert any("ДЕМО ОСТАНОВОК" in factor for factor in stop["factors"])
        assert len(stop["points"]) == 24
        for i, p in enumerate(stop["points"]):
            assert p["periodStart"] == f"2025-11-01T{i:02}:00:00+03:00"
            assert p["forecast"] >= 0 and p["baseline"] >= 0
            totals[stop["routeId"]][i] += [p["forecast"], p["baseline"]]
    routes = client.post("/predict/routes", json=query).json()["forecasts"]
    for route in routes:
        np.testing.assert_allclose(totals[route["routeId"]], [[p["forecast"], p["baseline"]] for p in route["points"]], atol=1e-8, rtol=0)


def test_aggregations_slice_invariance_and_baseline(client):
    month = client.post("/predict/routes", json={"horizon": "month", "date": "2025-11-20", "routeIds": ["17"]}).json()["forecasts"][0]["points"]
    week = client.post("/predict/routes", json={"horizon": "week", "date": "2025-11-12", "routeIds": ["17"]}).json()["forecasts"][0]["points"]
    assert week == month[11:18]
    day = client.post("/predict/routes", json={"horizon": "day", "date": "2025-11-12", "routeIds": ["17"]}).json()["forecasts"][0]["points"]
    assert sum(p["forecast"] for p in day) == month[11]["forecast"]
    assert sum(p["baseline"] for p in day) == month[11]["baseline"]
    # Verify baseline independently against labels; Wed at 08:00, all eight observations.
    values = []
    with (ROOT / "data/labels_day_test.csv").open(encoding="utf-8", newline="") as stream:
        facts = {(r["date"], int(r["hour"])): float(r["boardings"]) for r in csv.DictReader(stream, delimiter=";") if r["route"] == "17"}
    for offset in range(56):
        d = date(2025, 9, 6) + timedelta(days=offset)
        if d.weekday() == 2:
            values.append(facts.get((str(d), 8), 0))
    assert len(values) == 8
    assert day[8]["baseline"] == np.median(values)


def test_scenario_year_and_bounds(client):
    response = client.post("/predict", json={"horizon": "year", "date": "2026-09-26"})
    assert response.status_code == 200
    body = response.json()
    assert body["modelVersion"].endswith("-scenario")
    for stop in body["forecasts"]:
        assert len(stop["points"]) == 12
        assert stop["points"][0]["periodStart"] == "2026-01-01T00:00:00+03:00"
        assert any("СЦЕНАРИЙ" in f for f in stop["factors"])
    for horizon, day in [("year", "2025-11-01"), ("day", "2025-10-31"), ("day", "2027-01-01"), ("week", "2026-12-30")]:
        result = client.post("/predict", json={"horizon": horizon, "date": day})
        assert result.status_code == 422
        assert result.json()["detail"]["code"] == "UNSUPPORTED_PERIOD"


@pytest.mark.parametrize("payload", [
    {"horizon": "bad", "date": "2025-11-01"},
    {"horizon": "day", "date": "bad"},
    {"horizon": "day", "date": "2025-11-01", "routeIds": ["5"]},
    {"horizon": "day", "date": "2025-11-01", "routeIds": ["1", "1"]},
    {"horizon": "day", "date": "2025-11-01", "weather": 1.2},
])
def test_invalid_requests(client, payload):
    assert client.post("/predict", json=payload).status_code == 422


def test_quality_is_backtest_only(client):
    body = client.get("/metrics").json()
    assert body["scope"] == "historical_route_hour_backtest"
    assert body["overall"]["score"] == pytest.approx(.8885761796187551)
    assert len(body["byDay"]) == 61 and len(body["byRoute"]) == 9
    assert sum(r["absoluteError"] for r in body["byDay"]) == body["overall"]["absoluteError"]
    assert not body["platform"]["hiddenActualsAvailable"]
    assert client.get("/metrics?origin=2025-11-01").status_code == 422


def test_calendar_exceptions():
    assert calendar_fields(date(2025, 11, 1))["workday"] == 1
    assert calendar_fields(date(2025, 11, 1))["shortday"] == 1
    assert calendar_fields(date(2025, 11, 3))["holiday"] == 1
    assert calendar_fields(date(2025, 12, 31))["workday"] == 0


def test_training_reproduces_competition_predictions(tmp_path):
    output = tmp_path / "retrained.json"
    subprocess.run([sys.executable, str(ROOT / "train.py"), "--data", str(ROOT / "data"), "--output", str(output)], check=True)
    original, retrained = Engine(ROOT / "artifacts/route_model.json"), Engine(output)
    days = [date(2025, 11, 1) + timedelta(days=i) for i in range(61)]
    for route in ROUTES:
        np.testing.assert_array_equal(original.hourly(route, days)[0], retrained.hourly(route, days)[0])
