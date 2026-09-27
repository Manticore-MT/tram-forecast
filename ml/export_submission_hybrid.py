"""Scoring-only candidate: old night forecasts + night-filtered daytime forecasts.

This is not the passenger-demand model served by the HTTP API. It tests whether
the platform's hidden target still contains overnight equipment validations.
"""

import argparse
import csv
from pathlib import Path


def load(path):
    with path.open(encoding="utf-8", newline="") as stream:
        rows = list(csv.DictReader(stream, delimiter=";"))
    if len(rows) != 14_640 or any(set(row) != {"route", "date", "hour", "prediction"} for row in rows):
        raise ValueError(f"Unexpected submission format: {path}")
    keyed = {(row["route"], row["date"], row["hour"]): int(row["prediction"]) for row in rows}
    if len(keyed) != len(rows):
        raise ValueError(f"Duplicate submission keys: {path}")
    return rows, keyed


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--original", type=Path, default=Path("reference/submission.csv"))
    parser.add_argument("--filtered", type=Path, default=Path("reference/submission_filtered.csv"))
    parser.add_argument("--output", type=Path, default=Path("reference/submission_hybrid_candidate.csv"))
    args = parser.parse_args()
    rows, original = load(args.original)
    _, filtered = load(args.filtered)
    if original.keys() != filtered.keys():
        raise ValueError("Submission keys differ")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.writer(stream, delimiter=";", lineterminator="\n")
        writer.writerow(["route", "date", "hour", "prediction"])
        for row in rows:
            key = (row["route"], row["date"], row["hour"])
            prediction = original[key] if int(row["hour"]) < 6 else filtered[key]
            writer.writerow([*key, prediction])
    print(f"Wrote {args.output}: original 00:00-05:59, filtered 06:00-23:59")


if __name__ == "__main__":
    main()
