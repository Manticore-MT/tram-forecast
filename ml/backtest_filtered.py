"""Historical 61-day evaluation for labels filtered at 05:30."""

import argparse
import csv
import subprocess
import sys
from datetime import date, timedelta
from pathlib import Path

import pandas as pd

from app.engine import Engine, ROUTES


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--labels", type=Path, required=True)
    parser.add_argument("--origin", type=date.fromisoformat, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    artifact = args.output.with_suffix(".model.json")
    subprocess.run([sys.executable, "train.py", "--labels", str(args.labels),
                    "--origin", str(args.origin), "--output", str(artifact)], check=True)
    engine = Engine(artifact)
    days = [args.origin + timedelta(days=i) for i in range(61)]
    if days[-1] > date(2025, 10, 31):
        raise ValueError("Backtest target must be observed")
    labels = pd.read_csv(args.labels, sep=";")
    observed = {(int(r.route), r.date, int(r.hour)): int(r.boardings) for r in labels.itertuples()}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    absolute_error = actual_sum = 0
    with args.output.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.writer(stream)
        writer.writerow(["route", "date", "hour", "boardings", "selected"])
        for route in ROUTES:
            prediction, _ = engine.hourly(route, days)
            for i, day in enumerate(days):
                for hour in range(24):
                    actual = observed.get((route, str(day), hour), 0)
                    estimated = int(prediction[i, hour])
                    absolute_error += abs(actual - estimated)
                    actual_sum += actual
                    writer.writerow([route, day, hour, actual, estimated])
    wape = absolute_error / actual_sum
    print(f"origin={args.origin} score={1-wape:.9f} wape={wape:.9f} actual_sum={actual_sum} absolute_error={absolute_error}")


if __name__ == "__main__":
    main()
