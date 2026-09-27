"""Export the currently selected artifact to the organizer's 61-day CSV format."""

import argparse
import csv
from datetime import date, timedelta
from pathlib import Path

from app.engine import Engine, ROUTES


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--artifact", type=Path, default=Path("artifacts/route_model.json"))
    parser.add_argument("--output", type=Path, default=Path("reference/submission_filtered.csv"))
    args = parser.parse_args()
    engine = Engine(args.artifact)
    days = [date(2025, 11, 1) + timedelta(days=i) for i in range(61)]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.writer(stream, delimiter=";", lineterminator="\n")
        writer.writerow(["route", "date", "hour", "prediction"])
        for route in sorted((*ROUTES, 5)):
            prediction = engine.hourly(route, days)[0] if route in ROUTES else None
            for i, day in enumerate(days):
                for hour in range(24):
                    writer.writerow([route, day, hour, int(prediction[i, hour]) if prediction is not None else 0])
    print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
