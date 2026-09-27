import React from "react";
import { Button, Dialog, Icon, Tabs } from "../../components";
import { downloadExport, type ExportParams } from "../../api/client";
import { isDefaultCorrections } from "../../api/hooks";
import { notifyError } from "../../shared/errors";
import { useDispatcher, type Place } from "./store";
import { useCurrentSeries } from "./forecast";
import { SCALE_LABELS, rangeBounds, rangeLabel, windowLabel } from "./time";

function placeLabel(place: Place): string {
  if (place.level === "network") return "Вся сеть";
  return `Маршрут № ${place.routeId}`;
}

function saveFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** «Выгрузить» in the app header: downloads exactly what the dispatcher screen shows — object,
 *  window, interval and scenario — after a summary of what goes into the file. */
const FORMAT_ITEMS = [
  { value: "csv" as const, label: "CSV" },
  { value: "xlsx" as const, label: "XLSX" },
];

export function ExportButton() {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [format, setFormat] = React.useState<"csv" | "xlsx">("csv");
  const place = useDispatcher((s) => s.place);
  const scale = useDispatcher((s) => s.scale);
  const cursor = useDispatcher((s) => s.cursor);
  const range = useDispatcher((s) => s.range);
  const corrections = useDispatcher((s) => s.corrections);
  const series = useCurrentSeries();
  const starts = series.points.map((p) => p.periodStart);
  const bounds = cursor && range ? rangeBounds(scale, cursor, starts, range) : null;
  const scenario = !isDefaultCorrections(corrections);
  const ready = !!cursor;

  async function download() {
    if (!cursor) return;
    const params: ExportParams = {
      format,
      horizon: scale,
      date: cursor,
      ...(place.level !== "network" && { routeId: place.routeId }),
      ...(scenario && corrections),
      ...(bounds && { from: bounds.from, to: bounds.to }),
    };
    setPending(true);
    try {
      const { blob, filename } = await downloadExport(params);
      saveFile(blob, filename);
      setOpen(false);
    } catch (e) {
      notifyError(e);
    } finally {
      setPending(false);
    }
  }

  const rows: [string, string][] = cursor ? [
    ["Объект", placeLabel(place)],
    ["Период", `${SCALE_LABELS[scale]} · ${windowLabel(scale, cursor)}`],
    ["Интервал", range && range[0] !== range[1] ? rangeLabel(scale, starts, range) : "весь период"],
    ["Сценарий", scenario ? `погода ×${corrections.weather} · событие ×${corrections.event} · сезон ×${corrections.season}` : "без поправок"],
  ] : [];

  return (
    <>
      <Button variant="secondary" size="sm" iconLeft={<Icon name="download" size={16} />} onClick={() => setOpen(true)}>
        Выгрузить
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Выгрузка прогноза"
        description="В файл попадёт то, что сейчас выбрано на экране."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Отмена</Button>
            <Button size="sm" disabled={!ready || pending} onClick={download}>
              {pending ? "Готовим файл…" : `Скачать ${format.toUpperCase()}`}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-body-s text-text-muted">Формат</span>
            <Tabs items={FORMAT_ITEMS} value={format} onChange={(v) => setFormat(v as "csv" | "xlsx")} />
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-body-s">
            {rows.map(([k, v]) => (
              <React.Fragment key={k}>
                <dt className="text-text-muted">{k}</dt>
                <dd className="text-text-primary">{v}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
      </Dialog>
    </>
  );
}
