// Joins tram-trips + the filtered stop-times slice + tram-stops into one ordered
// per-route stop sequence with real coordinates, consumed directly by the app from
// src/data/tram-network.json (see src/products/forecast-dashboard/MapScreens.tsx).
// Run with: node scripts/build-tram-network.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseCsv, col } from "./lib/csv.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const trips = JSON.parse(readFileSync(join(root, "data/processed/tram-trips.json"), "utf8"));
const tramStops = JSON.parse(readFileSync(join(root, "data/processed/tram-stops.json"), "utf8"));
const stopByCode = new Map(tramStops.map((s) => [s.stopCode, s]));

const stCsv = readFileSync(join(root, "data/raw/stop-times-trams-60661-filtered.csv"), "utf8");
const { header, rows } = parseCsv(stCsv);
const iTripCode = col(header, "Код рейса");
const iStopCode = col(header, "Код остановки");
const iSeq = col(header, "Номер остановки по пути следования");

const stopTimesByTrip = new Map();
for (const r of rows) {
  const tripCode = r[iTripCode];
  if (!stopTimesByTrip.has(tripCode)) stopTimesByTrip.set(tripCode, []);
  stopTimesByTrip.get(tripCode).push({ stopCode: r[iStopCode], seq: Number(r[iSeq]) });
}

// One direction per route — whichever trip has more resolvable stops (some trips
// reference stop codes outside the tram-only stop set we extracted, e.g. shared
// bus/tram stops filtered out upstream).
const byRoute = new Map();
for (const trip of trips) {
  const times = (stopTimesByTrip.get(trip.tripCode) || [])
    .slice()
    .sort((a, b) => a.seq - b.seq)
    .map((t) => stopByCode.get(t.stopCode))
    .filter(Boolean)
    .map((s) => ({ name: s.name, ll: s.ll, stopCode: s.stopCode }));
  if (times.length < 2) continue;
  const existing = byRoute.get(trip.routeCode);
  if (!existing || times.length > existing.stops.length) {
    byRoute.set(trip.routeCode, { number: trip.number, name: trip.name, stops: times });
  }
}

const network = [...byRoute.values()].sort((a, b) => a.number.localeCompare(b.number, "ru", { numeric: true }));
writeFileSync(join(root, "src/data/tram-network.json"), JSON.stringify(network, null, 2) + "\n");
console.log(`built ${network.length} routes (of ${trips.length / 2} tram routes with trip data)`);
console.log(`stops per route: min ${Math.min(...network.map((r) => r.stops.length))}, max ${Math.max(...network.map((r) => r.stops.length))}`);
