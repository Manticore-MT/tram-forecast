"""Isolate the official 15 November route-50 weekend reopening.

Retrospective external events are allowed by the organizers per the team.
No competition target labels are used. Champion and production are untouched.
"""
import csv
import json
from datetime import date
from pathlib import Path

import numpy as np
import pandas as pd

from export_correction_candidate import predict

ROOT = Path(__file__).resolve().parent


def main():
    template = ROOT / "reference/submission_hybrid_candidate.csv"
    output = ROOT / "reference/submission_service_dates_candidate.csv"
    labels = pd.read_csv(ROOT / "data/labels_day_filtered_all.csv", sep=";")
    labels.date = pd.to_datetime(labels.date)
    before = predict(labels, 28, "median")
    after = predict(labels, 28, "median", date(2025, 11, 15))
    with template.open(encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream, delimiter=";"))
    changed = []
    keys = set()
    for row in rows:
        key = (int(row["route"]), row["date"], int(row["hour"]))
        assert key not in keys, "duplicate key"
        keys.add(key)
        # Ensure the reconstructed day model really is the champion, not a
        # different candidate accidentally mixed into this controlled change.
        if key in before and key[2] >= 6:
            assert int(row["prediction"]) == before[key], (key, row, before[key])
        d = date.fromisoformat(key[1])
        if key[0] == 50 and d >= date(2025, 11, 15) and d.weekday() >= 5 and key[2] >= 6:
            old = int(row["prediction"])
            row["prediction"] = str(after[key])
            changed.append(dict(date=key[1], hour=key[2], before=old, after=after[key]))
        assert np.isfinite(float(row["prediction"])) and int(row["prediction"]) >= 0
    assert len(rows) == 14640 and len(changed) == 14 * 18
    with output.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]), delimiter=";")
        writer.writeheader()
        writer.writerows(rows)
    report = dict(sourceUrl="https://t.me/DtOperativno/23565",
                  closureSourceUrl="https://t.me/DtOperativno/22627",
                  reopeningDate="2025-11-15", scenario="retrospective external events allowed by team",
                  template=template.name, output=output.name, platformScore=0.89174,
                  scoreProvenance="reported_by_team_2026-09-27_for_this_exact_configuration",
                  changedPoints=len(changed), additionalBoardings=sum(r["after"]-r["before"] for r in changed),
                  limits="Only route 50 weekend hours 06-23 corrected; route 7 and night handling unchanged. No claim of verified score gain.",
                  changes=changed)
    output.with_suffix(".json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k:v for k,v in report.items() if k != "changes"}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
