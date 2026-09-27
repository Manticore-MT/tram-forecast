"""Replay serialized CatBoost models against published predictions, no training."""
import json
from pathlib import Path

import numpy as np
from catboost import CatBoostRegressor

from factor_evidence import make_features

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "artifacts/factors"


def main():
    report = json.loads((OUTPUT / "evidence.json").read_text(encoding="utf-8"))
    forecasts = json.loads((OUTPUT / "forecasts.json").read_text(encoding="utf-8"))
    frame = make_features(report["protocol"]["weatherMode"])
    frame = frame[frame.date.ge("2025-11-01")].copy()
    for variant in forecasts["variants"]:
        metadata = json.loads((OUTPUT / "models" / f"{variant}.json").read_text(encoding="utf-8"))
        model = CatBoostRegressor()
        model.load_model(str(OUTPUT / "models" / f"{variant}.cbm"))
        prediction = np.maximum(0, np.rint(model.predict(frame[metadata["columns"]]) * frame.route.map(metadata["routeScale"]).to_numpy()))
        prediction[frame.hour.lt(5).to_numpy()] = 0
        expected = np.asarray([forecasts["variants"][variant][f"{r.route}:{r.date.date()}"][r.hour] for r in frame.itertuples()])
        np.testing.assert_array_equal(prediction, expected)
        print(variant, len(expected), "exact matches", flush=True)


if __name__ == "__main__":
    main()
