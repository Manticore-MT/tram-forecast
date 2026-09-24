// Picks one representative trip per (tram route, direction) from data/raw/trips-60665.csv,
// using the tram route codes from data/processed/tram-routes.json.
// Writes data/processed/tram-trips.json: [{ routeCode, number, direction, tripCode }]
//
// Run with: node scripts/select-tram-trips.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseCsv, col } from "./lib/csv.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const tramRoutes = JSON.parse(readFileSync(join(root, "data/processed/tram-routes.json"), "utf8"));
const routeByCode = new Map(tramRoutes.map((r) => [r.routeCode, r]));

const tripsCsv = readFileSync(join(root, "data/raw/trips-60665.csv"), "utf8");
const { header, rows } = parseCsv(tripsCsv);
const iRouteCode = col(header, "Код маршрута");
const iTripCode = col(header, "Код рейса");
const iDirection = col(header, "Направление движения рейса");

// First trip seen per (route, direction) — the trips list has no timetable info we care
// about here, any trip on a route shares the same physical stop-time sequence.
const seen = new Set();
const picked = [];
for (const r of rows) {
  const routeCode = r[iRouteCode];
  const route = routeByCode.get(routeCode);
  if (!route) continue;
  const direction = r[iDirection];
  const key = `${routeCode}:${direction}`;
  if (seen.has(key)) continue;
  seen.add(key);
  picked.push({ routeCode, number: route.number, name: route.name, direction, tripCode: r[iTripCode] });
}

writeFileSync(join(root, "data/processed/tram-trips.json"), JSON.stringify(picked, null, 2) + "\n");
console.log(`picked ${picked.length} trips for ${routeByCode.size} tram routes`);
