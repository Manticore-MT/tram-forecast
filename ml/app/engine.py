"""Portable inference for the existing Ridge + hourly-profile model.

Only trusted JSON is loaded at runtime. Historical data and sklearn are needed
for artifact preparation, not for requests. Calendar matches the research model.
"""
from calendar import monthrange
from datetime import date, timedelta
from pathlib import Path
import json

import numpy as np

ROUTES = (1, 7, 11, 12, 17, 25, 26, 28, 50)
OFF = {date(2025, 1, d) for d in range(1, 9)} | {date(2026, 1, d) for d in range(1, 10)}
OFF |= {date.fromisoformat(d) for d in (
    "2025-02-23", "2025-03-08", "2025-05-01", "2025-05-02", "2025-05-08",
    "2025-05-09", "2025-06-12", "2025-06-13", "2025-11-03", "2025-11-04", "2025-12-31",
    "2026-02-23", "2026-03-08", "2026-03-09", "2026-05-01", "2026-05-09",
    "2026-05-11", "2026-06-12", "2026-11-04", "2026-12-31",
)}
SHORT = {date.fromisoformat(d) for d in (
    "2025-03-07", "2025-04-30", "2025-06-11", "2025-11-01",
    "2026-04-30", "2026-05-08", "2026-06-11", "2026-11-03",
)}


def calendar_fields(day: date) -> dict:
    dow = day.weekday()
    holiday = day in OFF
    workday = (dow < 5 and not holiday) or day == date(2025, 11, 1)
    daytype = 0 if workday else (1 if dow == 5 and not holiday else 2)
    return dict(dow=dow, holiday=int(holiday), workday=int(workday), daytype=daytype,
                shortday=int(day in SHORT), summer=int(day.month in (6, 7, 8)),
                newyear=int(day.month == 1 and day.day <= 8),
                effective_dow=min(dow, 4) if workday else (5 if daytype == 1 else 6))


def feature_names() -> list[str]:
    return ([f"route_{r}" for r in ROUTES]
            + [f"route_{r}_daytype_{t}" for r in ROUTES for t in (1, 2)]
            + [f"dow_{d}" for d in range(1, 7)]
            + ["summer", "holiday", "shortday", "newyear"]
            + [f"route_{r}_summer" for r in ROUTES])


def feature_row(route: int, day: date) -> list[float]:
    c = calendar_fields(day)
    return ([float(route == r) for r in ROUTES]
            + [float(route == r and c["daytype"] == t) for r in ROUTES for t in (1, 2)]
            + [float(c["dow"] == d) for d in range(1, 7)]
            + [float(c[k]) for k in ("summer", "holiday", "shortday", "newyear")]
            + [float(route == r) * c["summer"] for r in ROUTES])


def period_days(horizon: str, anchor: date) -> list[date]:
    if horizon == "day":
        first, count = anchor, 1
    elif horizon == "week":
        first, count = anchor, 7
    elif horizon == "month":
        first, count = anchor.replace(day=1), monthrange(anchor.year, anchor.month)[1]
    elif horizon == "year":
        first = date(anchor.year, 1, 1)
        count = (date(anchor.year + 1, 1, 1) - first).days
    else:
        raise ValueError("Unknown horizon")
    return [first + timedelta(days=i) for i in range(count)]


class Engine:
    def __init__(self, path: Path):
        self.artifact = json.loads(path.read_text(encoding="utf-8"))
        a = self.artifact
        if a["schemaVersion"] != 1 or a["featureOrder"] != feature_names():
            raise ValueError("Unsupported artifact schema or feature order")
        self.origin = date.fromisoformat(a["forecastOrigin"])
        self.last = date(2026, 12, 31)
        self.validated_last = date(2025, 12, 31)
        self.coefficients = np.asarray(a["coefficients"], dtype=float)
        if self.coefficients.shape != (len(feature_names()),) or not np.isfinite(self.coefficients).all():
            raise ValueError("Invalid coefficients")
        self.version = "ridge-v1-" + a["sourceSha256"][:12]

    def hourly(self, route: int, days: list[date]) -> tuple[np.ndarray, np.ndarray]:
        if route not in ROUTES or not days or min(days) < self.origin or max(days) > self.last:
            raise ValueError("Unsupported route or date range")
        design = np.asarray([feature_row(route, d) for d in days], dtype=float)
        correction = self.artifact["correction"][str(route)]
        totals = np.maximum(0, np.expm1(design @ self.coefficients + self.artifact["intercept"] + correction))
        forecasts, baselines = [], []
        for day, total in zip(days, totals):
            c = calendar_fields(day)
            key = f"{route}:{c['summer']}:{c['effective_dow']}"
            values = total * np.asarray(self.artifact["hourlyShares"][key])
            # Preserve competition behavior through Dec 2025. Beyond that the
            # scenario assumes normal service; no indefinitely extended closure.
            if route == 50 and day.weekday() >= 5 and day <= self.validated_last:
                values = np.asarray(self.artifact["route50ClosureProfile"])
            forecasts.append(np.rint(np.maximum(0, values)))
            baselines.append(self.artifact["baseline56"][f"{route}:{c['effective_dow']}"])
        return np.asarray(forecasts), np.asarray(baselines)
