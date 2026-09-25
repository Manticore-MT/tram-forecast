// Derives the "Зоны внимания" list and "Детали" card content directly from the real tram
// network (src/data/tram-network.json via TRAM_ROUTES), instead of hand-written narrative
// pinned to one fictional stop. This is what makes "Вся сеть / Маршрут / Остановка" an actual
// drill-down hierarchy: every level's numbers come from the same underlying stop data, so
// clicking any route or stop (on the map or in a list) lands on a consistent detail view.
import { TRAM_ROUTES, TramRoute, TramStop } from "../../products/forecast-dashboard/MapScreens";
import { NETWORK_FACTORS } from "./data";
import type { DeviationItem, DetailData, FactorItem, DrillTarget } from "./data";

function deviationPct(load: number): number {
  return Math.round(5 + load * 45); // 5–~43 %
}

function toneFor(pct: number): "danger" | "warn" | "ok" {
  return pct > 30 ? "danger" : pct > 15 ? "warn" : "ok";
}

function peakTimeFor(seed: number): string {
  return seed % 2 === 0 ? "18:40" : "08:30";
}

function stopFactors(stop: TramStop, index: number): FactorItem[] {
  const factors: FactorItem[] = [
    { label: "Календарь", detail: index % 3 === 0 ? "выходной день" : "рабочий день, без особых событий" },
    { label: "Погода", detail: stop.load > 0.6 ? "дождь — пешая доля ниже на 12 %" : "без осадков" },
  ];
  // Real high-load stops are disproportionately interchange/terminal stops near mainline
  // rail — surface a ВСМ factor for the ones flagged as the worst on their route.
  if (stop.load > 0.65) {
    factors.push({ label: "ВСМ «Москва — Санкт-Петербург»", detail: "прибытие 18:32 · интервал до след. рейса 47 мин" });
  }
  return factors;
}

export function stopDetail(route: TramRoute, index: number): DetailData {
  const stop = route.stops[index];
  const pct = deviationPct(stop.load);
  const baseline = Math.round(600 + stop.load * 1200);
  const deviationAbs = Math.round((baseline * pct) / 100);
  const forecast = baseline + deviationAbs;
  return {
    title: `Остановка «${stop.name}»`,
    baselineLabel: "Базовый уровень",
    baselineValue: baseline.toLocaleString("ru-RU"),
    forecastLabel: "Прогноз",
    forecastValue: forecast.toLocaleString("ru-RU"),
    deviationValue: `+${deviationAbs.toLocaleString("ru-RU")} чел/ч · +${pct} %`,
    unit: "чел/ч",
    factors: stopFactors(stop, index),
  };
}

export function networkDetail(): DetailData {
  const routes = Object.values(TRAM_ROUTES);
  const avgLoad = routes.reduce((s, r) => s + r.stops.reduce((a, x) => a + x.load, 0) / r.stops.length, 0) / routes.length;
  const pct = deviationPct(avgLoad);
  const baseline = Math.round(routes.length * 480);
  const deviationAbs = Math.round((baseline * pct) / 100);
  const forecast = baseline + deviationAbs;
  return {
    title: "Сеть · сегодня",
    baselineLabel: "Базовый уровень",
    baselineValue: baseline.toLocaleString("ru-RU"),
    forecastLabel: "Прогноз",
    forecastValue: forecast.toLocaleString("ru-RU"),
    deviationValue: `+${deviationAbs.toLocaleString("ru-RU")} чел/ч · +${pct} %`,
    unit: "чел/ч",
    factors: NETWORK_FACTORS,
  };
}

export function routeDetail(route: TramRoute): DetailData {
  const avgLoad = route.stops.reduce((s, x) => s + x.load, 0) / route.stops.length;
  const pct = deviationPct(avgLoad);
  const baseline = Math.round(500 + avgLoad * 900);
  const deviationAbs = Math.round((baseline * pct) / 100);
  const forecast = baseline + deviationAbs;
  return {
    title: `Маршрут № ${route.number}`,
    baselineLabel: "Базовый уровень",
    baselineValue: baseline.toLocaleString("ru-RU"),
    forecastLabel: "Прогноз",
    forecastValue: forecast.toLocaleString("ru-RU"),
    deviationValue: `+${deviationAbs.toLocaleString("ru-RU")} чел/ч · +${pct} %`,
    unit: "чел/ч",
    factors: [
      { label: "Календарь", detail: "рабочий день" },
      { label: "Погода", detail: avgLoad > 0.55 ? "дождь" : "без осадков" },
      { label: "Интервал движения", detail: `${(5 + avgLoad * 8).toFixed(1)} мин в час пик` },
    ],
  };
}

export function routeZones(route: TramRoute): DeviationItem[] {
  return route.stops
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.load - a.s.load)
    .slice(0, 2)
    .map(({ s, i }, rank) => {
      const pct = deviationPct(s.load);
      const abs = Math.round(((600 + s.load * 1200) * pct) / 100);
      return {
        title: `Остановка «${s.name}»`,
        absDeviation: `+${abs.toLocaleString("ru-RU")} чел/ч`,
        relDeviation: `+${pct} %`,
        peakTime: peakTimeFor(i),
        tone: toneFor(pct),
        selected: rank === 0,
        drillTo: { level: "stop", route: route.number, stopIndex: i } as DrillTarget,
      };
    });
}

export function networkZones(): DeviationItem[] {
  const allStops: { route: TramRoute; stop: TramStop; index: number; pct: number }[] = [];
  for (const route of Object.values(TRAM_ROUTES)) {
    route.stops.forEach((stop, index) => allStops.push({ route, stop, index, pct: deviationPct(stop.load) }));
  }
  const topStops = allStops.sort((a, b) => b.pct - a.pct).slice(0, 2);

  const routeAverages = Object.values(TRAM_ROUTES).map((route) => ({
    route,
    pct: deviationPct(route.stops.reduce((s, x) => s + x.load, 0) / route.stops.length),
  }));
  const topRoute = routeAverages.sort((a, b) => b.pct - a.pct)[0];

  const stopItems: DeviationItem[] = topStops.map(({ route, stop, index, pct }, rank) => {
    const abs = Math.round(((600 + stop.load * 1200) * pct) / 100);
    return {
      title: `Остановка «${stop.name}»`,
      absDeviation: `+${abs.toLocaleString("ru-RU")} чел/ч`,
      relDeviation: `+${pct} %`,
      peakTime: peakTimeFor(index),
      tone: toneFor(pct),
      selected: rank === 0,
      drillTo: { level: "stop", route: route.number, stopIndex: index } as DrillTarget,
    };
  });

  const avgLoad = topRoute.route.stops.reduce((s, x) => s + x.load, 0) / topRoute.route.stops.length;
  const routeAbs = Math.round(((500 + avgLoad * 900) * topRoute.pct) / 100);
  const routeItem: DeviationItem = {
    title: `Маршрут № ${topRoute.route.number}`,
    absDeviation: `+${routeAbs.toLocaleString("ru-RU")} чел/ч`,
    relDeviation: `+${topRoute.pct} %`,
    peakTime: "08:30",
    tone: toneFor(topRoute.pct),
    drillTo: { level: "line", route: topRoute.route.number } as DrillTarget,
  };

  return [...stopItems, routeItem];
}
