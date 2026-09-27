"""Serve the auditable four-category experimental model's precomputed inference.

Artifacts contain forecasts from serialized CatBoost models, never observations.
This profile is deliberately separate from the champion's API contract and score.
"""
from datetime import date
from functools import lru_cache
import hashlib
import json
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/factors", tags=["External-factor evidence"])
ARTIFACTS = Path(__file__).resolve().parents[1] / "artifacts/factors"
Category = Literal["calendar", "weather", "traffic", "events"]


@lru_cache(maxsize=1)
def artifacts():
    try:
        report = json.loads((ARTIFACTS / "evidence.json").read_text(encoding="utf-8"))
        raw = (ARTIFACTS / "forecasts.json").read_bytes()
        if hashlib.sha256(raw).hexdigest() != report["forecastSha256"]:
            raise ValueError("Factor forecast checksum mismatch")
        forecasts = json.loads(raw)
        if forecasts["modelVersion"] != report["modelVersion"]:
            raise ValueError("Factor model version mismatch")
        return report, forecasts
    except (OSError, ValueError, KeyError) as exc:
        raise HTTPException(503, "Factor evidence artifacts unavailable or invalid") from exc


@router.get("/evidence")
def evidence():
    """Development WAPE and retrained ablations; not the platform score."""
    return artifacts()[0]


@router.get("/predict")
def predict(date: date, routeId: str, without: Category = "weather"):
    """Compare full and source-ablated models for a route and day, offline inference."""
    report, forecasts = artifacts()
    key = f"{routeId}:{date.isoformat()}"
    if key not in forecasts["variants"]["all"]:
        raise HTTPException(422, "Supported: nine routes, 2025-11-01..2025-12-31")
    full = forecasts["variants"]["all"][key]
    ablated = forecasts["variants"]["without_" + without][key]
    return {"modelVersion": report["modelVersion"], "experimental": True, "platformScore": None,
            "routeId": routeId, "date": str(date), "without": without,
            "source": report["sources"][without],
            "points": [{"hour": h, "forecast": full[h], "withoutSource": ablated[h], "difference": full[h] - ablated[h]}
                       for h in range(24)],
            "note": "Retrained variants; differences are predictive, not causal effects. Future covariates are observed retrospectively."}
