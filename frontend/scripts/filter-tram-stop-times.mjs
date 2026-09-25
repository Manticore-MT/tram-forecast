// Streams the huge "Расписание рейсов" export (data-60661, ~470 MB — too big to commit or
// load into memory) and writes out only the rows for the trip codes picked in
// data/processed/tram-trips.json. Never touches data/raw/ with the full file.
//
// Run with: node scripts/filter-tram-stop-times.mjs <path-to-full-data-60661-*.csv>
import { createReadStream, writeFileSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseLine, col } from "./lib/csv.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const srcPath = process.argv[2];
if (!srcPath) {
  console.error("usage: node scripts/filter-tram-stop-times.mjs <path-to-data-60661-*.csv>");
  process.exit(1);
}

const trips = JSON.parse(readFileSync(join(root, "data/processed/tram-trips.json"), "utf8"));
const wantedTrips = new Set(trips.map((t) => t.tripCode));

const rl = createInterface({ input: createReadStream(srcPath, "utf8"), crlfDelay: Infinity });

let headerLines = [];
let iTripCode = -1;
const matched = [];
let lineNo = 0;

for await (const line of rl) {
  lineNo++;
  if (lineNo <= 2) {
    headerLines.push(line);
    if (lineNo === 2) iTripCode = col(parseLine(line), "Код рейса");
    continue;
  }
  if (!line) continue;
  const tripCode = parseLine(line)[iTripCode];
  if (wantedTrips.has(tripCode)) matched.push(line);
}

const out = [...headerLines, ...matched].join("\n") + "\n";

writeFileSync(join(root, "data/raw/stop-times-trams-60661-filtered.csv"), out);
console.log(`scanned ${lineNo} lines, matched ${matched.length} tram stop-time rows`);
