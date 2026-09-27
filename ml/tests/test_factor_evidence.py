"""Check evidence arithmetic, API provenance, and the absence of target leakage."""
import csv
import hashlib
import json
from pathlib import Path

from fastapi.testclient import TestClient
import pytest

from app.main import app

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "artifacts/factors"


def test_evidence_recomputes_from_saved_hourly_predictions():
    report = json.loads((OUTPUT / "evidence.json").read_text(encoding="utf-8"))
    totals = {variant: [0., 0., 0] for variant in report["aggregate"]}
    seen = set()
    for window in report["windows"]:
        assert window["trainedThrough"] < window["start"]
        with (OUTPUT / f"backtest_{window['start']}.csv").open(encoding="utf-8", newline="") as stream:
            rows = list(csv.DictReader(stream))
        for row in rows:
            key = row["route"], row["date"], row["hour"]
            assert key not in seen
            seen.add(key)
            for variant in totals:
                totals[variant][0] += abs(float(row["boardings"]) - float(row[variant]))
                totals[variant][1] += float(row["boardings"])
                totals[variant][2] += 1
                if int(row["hour"]) < 5:
                    assert float(row[variant]) == 0
    for variant, (error, actual, count) in totals.items():
        metric = report["aggregate"][variant]
        assert metric["absoluteError"] == error
        assert metric["actualSum"] == actual
        assert metric["observations"] == count
        assert metric["wape"] == pytest.approx(error / actual)
    for group, effect in report["effects"].items():
        assert effect["wapeGain"] == pytest.approx(report["aggregate"]["without_" + group]["wape"] - report["aggregate"]["all"]["wape"])
    for name, digest in report["models"].items():
        assert hashlib.sha256((OUTPUT / "models" / name).read_bytes()).hexdigest() == digest


def test_factor_api_exposes_measured_effects_and_not_platform_score():
    with TestClient(app) as client:
        report = client.get("/factors/evidence").json()
        assert report["platformScore"] is None
        assert set(report["sources"]) == {"calendar", "weather", "traffic", "events"}
        for source in report["sources"].values():
            assert source["urls"] and source["method"] and source["availability"]
        for group in report["sources"]:
            result = client.get("/factors/predict", params={"date": "2025-11-15", "routeId": "50", "without": group})
            assert result.status_code == 200
            data = result.json()
            assert data["experimental"] and data["platformScore"] is None
            assert len(data["points"]) == 24
            for point in data["points"]:
                assert point["difference"] == point["forecast"] - point["withoutSource"]
                if point["hour"] < 5:
                    assert point["forecast"] == point["withoutSource"] == 0
        for day, route in [("2026-01-01", "50"), ("2025-10-31", "17"), ("2025-11-01", "5")]:
            assert client.get("/factors/predict", params={"date": day, "routeId": route}).status_code == 422


def test_web_evidence_is_identical_to_ml_artifact():
    for filename in ("evidence.json", "forecasts.json"):
        assert (OUTPUT / filename).read_bytes() == (ROOT.parent / "frontend/public/factors" / filename).read_bytes()
