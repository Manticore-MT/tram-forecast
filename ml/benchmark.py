"""Small local HTTP-adapter benchmark; not a production load/RPS test."""
import json
import platform
import time
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app


def main():
    results = []
    with TestClient(app) as client:
        for horizon, date in [("day", "2025-11-01"), ("week", "2025-11-01"),
                              ("month", "2025-11-01"), ("year", "2026-01-01")]:
            samples = []
            for _ in range(10):
                start = time.perf_counter()
                response = client.post("/predict", json={"horizon": horizon, "date": date})
                samples.append(1000*(time.perf_counter()-start))
                response.raise_for_status()
            results.append(dict(horizon=horizon, coldMs=round(samples[0], 2),
                                warmMedianMs=round(sorted(samples[1:])[4], 2),
                                maxMs=round(max(samples), 2), responseBytes=len(response.content)))
    result = dict(environment=platform.platform(), python=platform.python_version(),
                  method="FastAPI TestClient, sequential, one cold + nine cached requests per horizon; includes response serialization; no TCP, Docker or concurrent-load measurement",
                  benchmarks=results)
    path = Path(__file__).resolve().parent / "reference/local_benchmark.json"
    path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
