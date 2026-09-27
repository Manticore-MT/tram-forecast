"""Immutable, team-scored competition forecast; never extrapolate this table."""
import csv
import hashlib
from datetime import date, timedelta

SHA256 = "83aaeb4269699d10a53024b3d43f5b8dcbf43ee55e86caac080d0bc4b32be20b"


def load_champion(path):
    # Normalize transport line endings, but reject any changed forecast values.
    content = path.read_bytes().replace(b"\r\n", b"\n")
    if hashlib.sha256(content).hexdigest() != SHA256:
        raise ValueError("Champion submission checksum mismatch")
    result = {}
    for row in csv.DictReader(content.decode("utf-8").splitlines(), delimiter=";"):
        key = (row["route"], date.fromisoformat(row["date"]), int(row["hour"]))
        value = int(row["prediction"])
        if key in result or value < 0:
            raise ValueError("Invalid champion prediction")
        result[key] = value
    expected = {(str(r), date(2025, 11, 1) + timedelta(days=d), h)
                for r in (1, 5, 7, 11, 12, 17, 25, 26, 28, 50)
                for d in range(61) for h in range(24)}
    if set(result) != expected:
        raise ValueError("Incomplete champion forecast")
    return result
