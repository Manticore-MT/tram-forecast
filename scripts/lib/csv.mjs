// Shared parser for the data.mos.ru exports: `;`-delimited, `"`-quoted, no embedded
// quotes/delimiters inside fields, two header rows (English, then Russian).
export function parseLine(line) {
  return line
    .replace(/;$/, "")
    .split('";"')
    .map((cell) => cell.replace(/^"|"$/g, ""));
}

export function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = parseLine(lines[1] ?? lines[0]);
  const rows = lines.slice(2).map(parseLine);
  return { header, rows };
}

export function col(header, name) {
  const i = header.indexOf(name);
  if (i === -1) throw new Error(`column not found: ${name} (have: ${header.join(", ")})`);
  return i;
}
