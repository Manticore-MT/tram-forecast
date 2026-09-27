"""Remove successful validations before 05:30 from organizer hourly labels.

Scan raw transactions to split hour 05 precisely; verify its nocturnal counts
against the provided labels before writing filtered labels.
"""

import argparse
import json
from collections import Counter
from pathlib import Path

import pandas as pd

from app.engine import ROUTES


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw", type=Path, nargs="+", required=True)
    parser.add_argument("--labels", type=Path, nargs="+", required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--chunk-size", type=int, default=500_000)
    args = parser.parse_args()

    labels = pd.concat([pd.read_csv(path, sep=";") for path in args.labels], ignore_index=True)
    labels["date"] = labels.date.astype(str)
    original = {(int(r.route), r.date, int(r.hour)): int(r.boardings) for r in labels.itertuples()}
    if len(original) != len(labels):
        raise ValueError("Duplicate label keys")
    label_dates = set(labels.date)

    night = Counter()
    excluded = Counter()
    audit = Counter()
    for raw_path in args.raw:
        for chunk in pd.read_csv(raw_path, sep=";", usecols=["tran_date_time", "validation_result", "ngpt_route"],
                                 dtype=str, na_filter=False, chunksize=args.chunk_size):
            audit["raw_rows"] += len(chunk)
            time = chunk.tran_date_time
            valid = time.str.match(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$")
            route = pd.to_numeric(chunk.ngpt_route.str.extract(r"^\s*(\d+)(?:\s|$)", expand=False), errors="coerce")
            include = valid & chunk.validation_result.eq("1") & route.isin(ROUTES)
            audit["invalid_timestamp"] += int((~valid).sum())
            audit["successful_supported"] += int(include.sum())
            nocturnal = include & time.str.slice(0, 10).isin(label_dates) & time.str.slice(11, 13).lt("06")
            if not nocturnal.any():
                continue
            frame = pd.DataFrame({
                "route": route[nocturnal].astype(int),
                "date": time[nocturnal].str.slice(0, 10),
                "hour": time[nocturnal].str.slice(11, 13).astype(int),
                "clock": time[nocturnal].str.slice(11, 19),
            })
            for key, count in frame.groupby(["route", "date", "hour"]).size().items():
                night[key] += int(count)
            early = frame[frame.clock < "05:30:00"]
            for key, count in early.groupby(["route", "date", "hour"]).size().items():
                excluded[key] += int(count)

    mismatches = [(key, value, original.get(key, 0)) for key, value in night.items()
                  if value != original.get(key, 0)]
    missing = [(key, value) for key, value in original.items() if key[2] < 6 and key not in night and value != 0]
    if mismatches or missing:
        raise ValueError(f"Night raw/label mismatch: {mismatches[:5]} / missing: {missing[:5]}; "
                         f"totals {sum(night.values())} vs {sum(v for k, v in original.items() if k[2] < 6)}")

    keep = labels.hour >= 5
    result = labels[keep].copy()
    subtract = pd.Series([excluded.get((int(r.route), r.date, int(r.hour)), 0) for r in result.itertuples()], index=result.index)
    result["boardings"] = result.boardings - subtract
    if (result.boardings < 0).any():
        raise ValueError("Negative count after night subtraction")
    result = result[result.boardings > 0]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    result.to_csv(args.output, sep=";", index=False)
    summary = {
        **audit,
        "night_successful_00_0559": sum(night.values()),
        "excluded_successful_00_0529": sum(excluded.values()),
        "kept_hour_05_successful": int(result[result.hour == 5].boardings.sum()),
        "filtered_label_rows": len(result),
    }
    args.output.with_suffix(args.output.suffix + ".audit.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
