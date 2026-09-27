"""Collect numeric traffic observations from public official Telegram posts.

These are irregular citywide reports, not a continuous road-sensor feed.
Missing hours must not be interpreted as zero congestion. Raw HTML is cached
outside the repository; published outputs contain numeric facts and source URLs.
"""
import argparse
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup


def parse(html):
    result = []
    soup = BeautifulSoup(html, "html.parser")
    for node in soup.select("div.tgme_widget_message[data-post]"):
        stamp = node.select_one("time[datetime]")
        text = node.select_one("div.tgme_widget_message_text")
        if not stamp or not text:
            continue
        content = text.get_text(" ", strip=True).replace("\xa0", " ")
        speed = re.search(r"средняя\s+скорость(?:\s+потока)?\s*[-—:–]?\s*(\d{1,3})\s*км\s*/?\s*ч", content, re.I)
        score = re.search(r"(?:движение|загруженность(?:\s+дорог)?)(?:\s+в\s+городе)?\s+(?:сейчас\s+)?оценива[ею]тся\s+(?:в|на)\s*(\d{1,2})\s*бал", content, re.I)
        if speed or score:
            result.append(dict(sourceUrl="https://t.me/"+node["data-post"],
                               publishedAt=stamp["datetime"],
                               averageSpeedKmh=int(speed[1]) if speed else None,
                               congestionPoints=int(score[1]) if score else None))
    ids = [int(n["data-post"].split("/")[-1]) for n in soup.select("div.tgme_widget_message[data-post]")]
    dates = [n["datetime"] for n in soup.select("time[datetime]")]
    return result, ids, dates


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cache", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--before", type=int, default=25000)
    parser.add_argument("--max-pages", type=int, default=350)
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    found = {}
    cached_oldest = []
    cached_newest = []
    for cached_page in args.cache.glob("before_*.html"):
        rows, _, dates = parse(cached_page.read_text(encoding="utf-8"))
        if dates:
            cached_oldest.append(min(dates))
            cached_newest.append(max(dates))
        for row in rows:
            if "2025-01-01" <= row["publishedAt"][:10] <= "2025-12-31":
                found[row["sourceUrl"]] = row
    cursor = args.before
    oldest = None
    for i in range(args.max_pages):
        cached = args.cache/f"before_{cursor}.html"
        if cached.exists():
            html = cached.read_text(encoding="utf-8")
        else:
            url = f"https://t.me/s/DtOperativno?before={cursor}"
            request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
            for attempt in range(3):
                try:
                    with urlopen(request, timeout=30) as response:
                        html = response.read().decode("utf-8")
                    break
                except Exception:
                    if attempt == 2:
                        raise
                    time.sleep(2)
            cached.write_text(html, encoding="utf-8")
            time.sleep(.35)
        rows, ids, dates = parse(html)
        if not ids or min(ids) >= cursor:
            raise ValueError(f"Pagination stopped at {cursor}")
        for row in rows:
            if "2025-01-01" <= row["publishedAt"][:10] <= "2025-12-31":
                found[row["sourceUrl"]] = row
        cursor = min(ids)
        oldest = min(dates) if dates else oldest
        if i % 10 == 0:
            print(f"pages={i+1} oldest={oldest} trafficReports={len(found)}", flush=True)
        if oldest and oldest < "2025-01-01":
            break
        if cached_oldest and min(cached_oldest) < "2025-01-01" and oldest <= max(cached_newest):
            oldest = min(cached_oldest)
            break
    output = dict(source="https://t.me/s/DtOperativno",
                  fetchedAt=datetime.now(timezone.utc).isoformat(),
                  oldestPageTimestamp=oldest, completeThroughStart=bool(oldest and oldest < "2025-01-01"),
                  scope="irregular citywide observations extracted from official public posts",
                  warning="Archive traversal does not imply a complete hourly series; unparsed or unpublished observations are missing, not zero.",
                  observations=sorted(found.values(), key=lambda r:r["publishedAt"]))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved {len(found)} traffic reports to {args.output}", flush=True)


if __name__ == "__main__":
    main()
