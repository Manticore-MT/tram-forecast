export type Level = "all" | "line" | "stop";
export type Variant = "columns" | "overlay" | "panel-table";

export interface ZoneItem {
  title: string;
  meta: string;
  tone: "danger" | "warn" | "ok";
  selected?: boolean;
}

export interface LevelData {
  levelLabel: string;
  zones: ZoneItem[];
  panelTitle: string;
  metricLabel: string;
  metricValue: string;
  metricUnit?: string;
  deviationValue: string;
  deviationTone: "danger" | "warn" | "ok";
  factors: string[];
  mapCaption: string;
  /** index of the schematic dot to emphasise; -1 = no single dot (line/network level) */
  activeIndex: number;
}

export const LEVELS: { value: Level; label: string }[] = [
  { value: "all", label: "Всё" },
  { value: "line", label: "Линия" },
  { value: "stop", label: "Остановка" },
];

export const VARIANTS: { value: Variant; label: string }[] = [
  { value: "columns", label: "А · Колонки" },
  { value: "overlay", label: "Б · Оверлей" },
  { value: "panel-table", label: "В · Панель + таблица" },
];

export const LEVEL_DATA: Record<Level, LevelData> = {
  all: {
    levelLabel: "Уровень: вся сеть",
    zones: [
      { title: "Маршрут №17", meta: "+18.4 % · по сети", tone: "warn", selected: true },
      { title: "Остановка №Электрозаводская", meta: "+22.6 % · пик 18:40", tone: "danger" },
    ],
    panelTitle: "Сеть · сегодня",
    metricLabel: "пассажиров/час",
    metricValue: "18 420",
    deviationValue: "+6.2 %",
    deviationTone: "warn",
    factors: ["календарь · погода", "168 маршрутов в модели", "MAPE 7.4 %"],
    mapCaption: "вся сеть · 168 маршрутов",
    activeIndex: -1,
  },
  line: {
    levelLabel: "Уровень: линия",
    zones: [
      { title: "Маршрут №YY", meta: "+22.1 % · пик 08:30", tone: "warn", selected: true },
      { title: "Остановка №ZZ", meta: "+37.8 %", tone: "danger" },
    ],
    panelTitle: "Маршрут №YY",
    metricLabel: "вагонов на линии",
    metricValue: "24",
    deviationValue: "+22.1 %",
    deviationTone: "warn",
    factors: ["интервал 6.5 мин", "7 остановок", "2 критических участка"],
    mapCaption: "маршрут YY выделен",
    activeIndex: -1,
  },
  stop: {
    levelLabel: "Уровень: остановка",
    zones: [
      { title: "Остановка №ZZ", meta: "+37.8 % · выбрано", tone: "danger", selected: true },
      { title: "Маршрут №YY", meta: "+22.1 % · пик 08:30", tone: "warn" },
    ],
    panelTitle: "Остановка №ZZ",
    metricLabel: "прогноз",
    metricValue: "1240",
    deviationValue: "+37.8 %",
    deviationTone: "danger",
    factors: ["календарь · погода", "ВСМ: приб. 18:05", "интервал 15 мин"],
    mapCaption: "остановка ZZ выделена",
    activeIndex: 3,
  },
};

export const VARIANT_NOTES: Record<Variant, { pro: string; con: string }> = {
  columns: { pro: "ничего не перекрывает", con: "карта постоянно уже" },
  overlay: { pro: "карта на всю площадь", con: "риск перекрытия на узком экране" },
  "panel-table": { pro: "таблица шире, удобнее сканировать список", con: "карта не на всю высоту" },
};
