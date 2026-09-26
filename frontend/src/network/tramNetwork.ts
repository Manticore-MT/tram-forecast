import tramNetworkRaw from "../data/tram-network.json";

export interface TramStop {
  name: string;
  ll: [number, number];
  /** Organizers' "Код остановки"; the id to match the backend's stopId once it serves real data
   *  (see docs/open-questions.md). Until then stops are matched to the API by position on the route. */
  stopCode?: string;
}

export interface TramRoute {
  /** Route number, which is also the API's routeId ("1", "17"). */
  number: string;
  name: string;
  stops: TramStop[];
}

/** Routes covered by the hackathon dataset. tram-network.json (data.mos.ru) has the whole city. */
export const DATASET_ROUTE_NUMBERS = ["1", "7", "11", "12", "17", "25", "26", "28", "50"];

/** Real stop positions and order from data.mos.ru, built by scripts/build-tram-network.mjs.
 *  The line between consecutive stops is straight, not surveyed track geometry. */
export const TRAM_ROUTES: Record<string, TramRoute> = Object.fromEntries(
  (tramNetworkRaw as TramRoute[])
    .filter((r) => DATASET_ROUTE_NUMBERS.includes(r.number))
    .map((r) => [r.number, { number: r.number, name: r.name, stops: r.stops }]),
);

export function routeStops(routeId: string): TramStop[] {
  return TRAM_ROUTES[routeId]?.stops ?? [];
}
