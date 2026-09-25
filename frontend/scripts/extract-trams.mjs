// One-off extraction: filter the raw data.mos.ru exports in data/raw/ down to trams only,
// and emit tidy JSON in data/processed/. Run with: node scripts/extract-trams.mjs
//
// data/raw/stops-60662.csv  -> data/processed/tram-stops.json
// data/raw/routes-60664.csv -> data/processed/tram-routes.json
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseCsv, col } from "./lib/csv.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// --- stops -----------------------------------------------------------------
const stopsCsv = readFileSync(join(root, "data/raw/stops-60662.csv"), "utf8");
const { header: stopsHeader, rows: stopsRows } = parseCsv(stopsCsv);
const iStopCode = col(stopsHeader, "Код остановки");
const iStopName = col(stopsHeader, "Наименование остановки");
const iStreet = col(stopsHeader, "Наименование улицы, на которой находится остановка");
const iTransport = col(stopsHeader, "Вид транспорта");
const iCentroid = col(stopsHeader, "Центроид");
const iGlobalId = col(stopsHeader, "global_id");

const tramStops = stopsRows
  .filter((r) => r[iTransport] && r[iTransport].includes("Трамвай"))
  .map((r) => {
    const m = r[iCentroid].match(/coordinates=\[([-\d.]+),\s*([-\d.]+)\]/);
    return {
      id: r[iGlobalId],
      stopCode: r[iStopCode],
      name: r[iStopName] || null,
      street: r[iStreet] || null,
      ll: m ? [Number(m[2]), Number(m[1])] : null, // [lat, lon], Leaflet order
    };
  })
  .filter((s) => s.ll);

// --- routes ------------------------------------------------------------------
const routesCsv = readFileSync(join(root, "data/raw/routes-60664.csv"), "utf8");
const { header: routesHeader, rows: routesRows } = parseCsv(routesCsv);
const iRouteCode = col(routesHeader, "Код маршрута");
const iRouteNumber = col(routesHeader, "Номер маршрута");
const iRouteName = col(routesHeader, "Полное наименование маршрута");
const iRouteType = col(routesHeader, "Вид транспорта");
const iRouteGlobalId = col(routesHeader, "global_id");

// type "0" = tram in this export (36 rows, matches Moscow's real tram route count;
// "3" = bus (902 rows), "5" = the single trolleybus row present).
const tramRoutes = routesRows
  .filter((r) => r[iRouteType] === "0")
  .map((r) => ({ id: r[iRouteGlobalId], routeCode: r[iRouteCode], number: r[iRouteNumber], name: r[iRouteName] }));

writeFileSync(join(root, "data/processed/tram-stops.json"), JSON.stringify(tramStops, null, 2) + "\n");
writeFileSync(join(root, "data/processed/tram-routes.json"), JSON.stringify(tramRoutes, null, 2) + "\n");

console.log(`tram stops:  ${tramStops.length} (of ${stopsRows.length} total)`);
console.log(`tram routes: ${tramRoutes.length} (of ${routesRows.length} total)`);
