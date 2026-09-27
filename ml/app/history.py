"""Observed route-hour comparisons; missing days are not fabricated as zeros."""
import csv
from calendar import monthrange
from datetime import date, timedelta
from functools import lru_cache
import statistics

FIRST = date(2025, 1, 1)
LAST = date(2025, 10, 31)


class History:
    def __init__(self, path):
        self.days = {}
        with path.open(encoding="utf-8", newline="") as stream:
            for row in csv.DictReader(stream, delimiter=";"):
                key = (row["route"], date.fromisoformat(row["date"]))
                self.days.setdefault(key, [0.] * 24)[int(row["hour"])] = float(row["boardings"])

    def values(self, routes, day):
        if not FIRST <= day <= LAST or any((r, day) not in self.days for r in routes):
            return None
        return [sum(self.days[(r, day)][h] for r in routes) for h in range(24)]

    @lru_cache(maxsize=128)
    def compare(self, routes, anchor):
        month_end = anchor.replace(day=1) - timedelta(days=1)
        month = month_end.replace(day=min(anchor.day, monthrange(month_end.year, month_end.month)[1]))
        def observed(day):
            values = self.values(routes, day)
            return dict(date=str(day), available=values is not None,
                        points=[dict(hour=h, value=None if values is None else values[h]) for h in range(24)])
        end = min(anchor - timedelta(days=1), LAST)
        start = max(FIRST, end - timedelta(days=55))
        profiles = []
        for dow in range(7):
            samples = []
            for offset in range(max(0, (end - start).days + 1)):
                day = start + timedelta(days=offset)
                values = self.values(routes, day)
                if day.weekday() == dow and values is not None:
                    samples.append(values)
            profiles.append(dict(weekday=dow, observations=len(samples), points=[
                dict(hour=h, value=statistics.median(v[h] for v in samples) if samples else None)
                for h in range(24)]))
        return dict(date=str(anchor), routeIds=list(routes), historyThrough=str(LAST),
                    lastWeek=observed(anchor - timedelta(days=7)), lastMonth=observed(month),
                    typicalWeek=dict(start=str(start), end=str(end), days=profiles),
                    note="Факты: успешные валидации с 05:30. Неделя назад: −7 дней; месяц: та же дата предыдущего месяца с ограничением последним днём. Типичная неделя: почасовые медианы по календарным дням недели за 56 дней до выбранной даты, не позже 31.10.2025; ремонты и праздники сохранены. Отсутствующий целиком день — нет данных; отсутствующий час внутри наблюдаемого дня — 0.")
