# Полоса времени: как показать «факт/прогноз vs типичный уровень» на баре — обзор источников

Контекст: часовой бар (24 бара/сутки) кодирует высоту (прогноз/факт пассажиропотока), заливку
(5-ступенчатая шкала загрузки), текстуру (штриховка = ещё прогноз, сплошная = факт) и опционально
пунктирный контур (что показал бы прогноз без ручной корректировки диспетчера). Значение `baseline`
(типичный уровень для этого часа) сейчас нигде не отображается. Рассматриваем 3 варианта:
(1) расходящиеся бары от нуля-как-baseline, (2) обычный бар + тонкая горизонтальная риска-маркер на
высоте baseline, (3) обычный бар (без изменений) + отдельная тонкая (~4px) полоса-индикатор под
барами, кодирующая только отклонение. Ниже — только проверенные источники (открыты через поиск +
fetch страниц).

## Источники

1. **Grafana — Configure thresholds**
   https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/configure-thresholds/
   Опция **«Show thresholds»** поддерживает режимы **«As lines»**, **«As lines (dashed)»**,
   **«As filled regions»**, **«As filled regions and lines»**, **«As filled regions and lines
   (dashed)»** — и документация прямо говорит: «This option is supported for the bar chart,
   candlestick, time series, and trend visualizations». То есть на Bar chart-панели Grafana
   threshold рисуется как горизонтальная линия через весь график (опционально с заливкой зоны) —
   не как риска на каждом отдельном баре и не как отдельная полоса под барами. Также подтверждено:
   бары могут раскрашиваться по попаданию в порог threshold (сам бар меняет цвет).
   Релевантность: ближе всего к варианту **(2)**, но в ослабленном виде — линия одна на весь
   график (единый порог), а не индивидуальный маркер на каждом баре под свой baseline; варианта
   «риска per-bar на разной высоте» Grafana не поддерживает нативно.

2. **Datawrapper Blog — «Show confidence intervals and value markers in Datawrapper bar charts»**
   https://www.datawrapper.de/blog/confidence-intervals-value-markers-bar-charts
   Описывает функцию **value/line overlay**: «choose one of your uploaded columns for a value
   ( = line) overlay» — второй загруженный столбец данных рисуется как **линия/риска поверх
   каждого бара** (например, план/таргет), и «Value overlays can also be labeled directly over the
   first bar». Это именно наш вариант (2) — как первоисточник BI-инструмента, ориентированного на
   деловую/журналистскую визуализацию, а не мониторинг.
   Релевантность: прямое подтверждение варианта **(2)** — «маркер поверх бара, значение из отдельной
   колонки» — используется как стандартный способ показать «план/норма vs факт» именно на баре, а
   не только на линии.

3. **Datadog — Anomaly Monitor**
   https://docs.datadoghq.com/monitors/types/anomaly/
   «A metric is considered to be anomalous if it is outside of the gray anomaly band» — Datadog
   рисует серую полосу допустимого диапазона вокруг линии метрики на timeseries-графике; ширина
   полосы регулируется параметром «Deviations» (bounds). Документация описывает это для
   line/timeseries виджетов; явного применения к bar-виджетам в открытых разделах не найдено.
   Релевантность: это паттерн **band-вокруг-линии**, четвёртый отдельный паттерн (не совпадает ни с
   одним из трёх кандидатов один-в-один) — полоса допустимых значений вокруг тренда, а не
   риска/страйп на дискретном баре. Прямого прецедента на bar-виджете не подтверждено — отмечаю как
   недоказанное для баров.

4. **New Relic — Anomaly detection**
   https://docs.newrelic.com/docs/alerts/create-alert/set-thresholds/anomaly-detection/
   «The baseline is the line New Relic draws showing expected values, like a weather forecast» +
   серая «prediction band» вокруг неё — концептуально идентично Datadog: линия-факт, линия-baseline,
   band допустимого отклонения. Документация не раскрывает применение к bar chart виджетам явно;
   ограничено line-графиками алертов.
   Релевантность: усиливает то же наблюдение, что и Datadog — «baseline-линия + band» — устоявшийся
   паттерн для *линейных* графиков в APM/observability, но не задокументированный аналог для
   bar-виджетов. Не давать как прецедент для баров.

5. **PagerDuty — Analytics Dashboard / Outlier Incident**
   https://support.pagerduty.com/main/docs/analytics-dashboard ,
   https://support.pagerduty.com/main/docs/outlier-incident
   Явной first-party документации о визуализации baseline/anomaly *на графике* (типа графика,
   расположения маркера) не найдено — «Outlier Incident» описан текстово (типы инцидентов, которых
   не было 30 дней), без описания chart-виджета. Явно фиксирую: **не найдено достаточно детальной
   первоисточниковой документации** по визуальному паттерну — не додумываю по маркетинговым
   скриншотам.

6. **Financial Times — Visual Vocabulary (chart-doctor, GitHub)**
   https://github.com/ft-interactive/chart-doctor/tree/master/visual-vocabulary
   Категория **Deviation**: «Emphasise variations (+/-) from a fixed reference point. Typically the
   reference point is zero but it can also be a target or a long-term average». Внутри категории:
   **Diverging bar** — «A simple standard bar chart that can handle both negative and positive
   magnitude values»; Diverging stacked bar — для survey/sentiment; Spine chart — «splits a single
   value into 2 contrasting components»; Surplus/deficit filled line — заливка баланса против
   baseline или между двумя рядами (для line-графиков, не баров).
   Релевантность: прямое подтверждение варианта **(1)** как классического, официально названного
   паттерна («Diverging bar») именно для «отклонение от точки отсчёта, которая может быть target
   или long-term average» — это ровно наш кейс (baseline = типичный уровень часа).

7. **Observable / D3 — «Diverging bar chart»**
   https://observablehq.com/@d3/diverging-bar-chart/2
   Официальный пример из галереи D3 (Observable), канонический для паттерна «bars from a zero
   baseline, positive vs negative» (по данным о правдивости высказываний политиков — PolitiFact).
   Соответствует поисковому индексу страницы, прямой fetch содержимого блокировался лимитом запросов
   Observable (HTTP 429) в момент проверки — привожу как источник по метаданным/описанию из
   официальной галереи `@d3` (owner-аккаунт D3, не community-notebook), но полный текст ноутбука не
   вычитан построчно — отмечаю частичную проверку.
   Релевантность: канонический пример варианта **(1)** — расходящиеся бары от нуля, ровно то же
   визуальное решение, что описано в FT Visual Vocabulary.

8. **ERCOT — System-Wide Demand dashboard**
   https://www.ercot.com/gridmktinfo/dashboards/systemwidedemand
   Публично документированный (по описанию из результатов поиска/страницы дашборда) паттерн «Current
   Forecast — сплошная фиолетовая линия, Actual Hourly Average — сплошная бирюзовая линия» на одном
   графике по часам суток. Это ближайший найденный операционный (грид/энергетика) аналог «факт vs
   типичный/прогнозный уровень по часовым бакетам», но реализован как **две наложенные линии**, не
   бары.
   Релевантность: подтверждает, что в соседнем домене (диспетчеризация энергосистемы) для «факт vs
   ожидание по часам» индустрия чаще выбирает наложенные линии, а не бары с второй кодировкой —
   ни один из трёх кандидатов впрямую не подтверждается этим источником, но он свидетельствует, что
   «две линии» — конкурентный 4-й паттерн, если отказаться от бар-формата вовсе (не рассматривается
   нами, так как ТЗ фиксирует бар-формат).

9. **Транзитные операционные дашборды (общий поиск: Metra, CTA, Phoenix Public Transit, MIT
   Transit Lab)**
   https://metra.com/dashboard (403 при прямом fetch — не вычитано),
   https://cmpr-dashboard-phoenix.hub.arcgis.com/pages/ptd ,
   https://www.transitlab.mit.edu/system-analysis
   Специфического публично задокументированного design case study именно «факт vs типичный уровень
   на часовом баре» в транзитной диспетчерской практике **не найдено**. Общие описания (из вторичных
   агрегаторов) говорят про «line charts with confidence bands» и «actual miles vs scheduled miles»
   как метрику, но без деталей chart-энкодинга на уровне баров. Явно фиксирую отсутствие
   первоисточника с нужной специфичностью — не подставляю Uber/Lyft blog (целевой поиск по инженерным
   блогам Uber про dispatch/demand dashboard не дал статьи с этим конкретным паттерном).

## Сравнительная таблица

| Источник | Паттерн | Ближе всего к кандидату |
|---|---|---|
| Grafana thresholds | горизонтальная линия/зона через весь график, опц. заливка бара | (2), ослабленно — не per-bar риска |
| Datawrapper value overlay | линия-маркер поверх каждого бара из отдельной колонки данных | (2), точное совпадение |
| Datadog anomaly band | серая band допустимого диапазона вокруг line-графика | 4-й паттерн (band-вокруг-тренда), не для баров |
| New Relic anomaly detection | baseline-линия + prediction band, line chart | тот же 4-й паттерн, тоже не для баров |
| PagerDuty | нет достаточной документации | не применимо |
| FT Visual Vocabulary — Diverging bar | бары от нуля/target/long-term average, +/- | (1), прямое совпадение и есть официальное название |
| Observable/D3 diverging bar chart | канонический пример варианта (1) | (1) |
| ERCOT System-Wide Demand | две наложенные линии (forecast vs actual) | ни один — «две линии», вне области кандидатов |
| Транзитные дашборды (Metra/CTA/Phoenix/MIT) | не найдено специфики per-bar | не применимо |

## Синтез

- **Какой из 3 кандидатов ближе всего к устоявшейся практике.** Оба полюса нашего выбора
  задокументированы отдельно у разных типов инструментов: **(1) расходящиеся бары от baseline** —
  единственный вариант с официальным именем и явным определением в устоявшейся классификации (FT
  Visual Vocabulary: «Diverging bar» — «variations from a fixed reference point... can also be a
  target or a long-term average», плюс канонический пример в галерее D3/Observable). **(2) риска
  поверх бара** — тоже подтверждён первоисточником, но только для «одна линия/риска на бар из второй
  колонки значений» (Datawrapper value overlay) или «один порог на весь график» (Grafana thresholds);
  ни один найденный источник не показывает риску индивидуально на каждом баре на *разной* высоте
  (наш случай — у каждого часа свой baseline). **(3) отдельная полоса-индикатор под барами** — не
  нашла ни одного прямого прецедента ни в BI-инструментах (Grafana/Datadog/Datadog SLO), ни в
  журналистской визуализации (FT/Datawrapper), ни в D3-галерее. Ближайшее концептуально похожее —
  band Datadog/New Relic, но это band **вокруг линии тренда**, а не отдельная тонкая полоса под
  дискретными барами. Итог: **(1) — самый документированный и «именованный» паттерн для задачи
  «отклонение от нормы/таргета» как таковой; (2) — документированный, но как маркер, а не риска на
  переменной высоте per-bar; (3) — не подтверждён ни одним найденным первоисточником.**

- **Есть ли 4-й паттерн, который мы не называли.** Да: **band (полоса допустимого диапазона) вокруг
  линии тренда**, задокументированный и у Datadog («gray anomaly band»,
  https://docs.datadoghq.com/monitors/types/anomaly/), и у New Relic («prediction band» вокруг
  baseline-линии, https://docs.newrelic.com/docs/alerts/create-alert/set-thresholds/anomaly-detection/).
  Он не бар-специфичен (в обоих источниках — line chart), и в найденных источниках не адаптирован к
  дискретным барам — то есть прямо в наш формат «бар на час» он не переносится без интерпретации, но
  показывает, что индустрия мониторинга для «норма vs факт» чаще тянется к **band вокруг тренда**,
  а не к диверджентным барам или рискам на баре — это паттерн из observability-мира, отличный от
  паттерна из data-journalism мира (diverging bar).

- **Рекомендация.** Раз baseline у нас — это отдельное значение per-hour (не единый порог на весь
  график, как в Grafana, и не band вокруг тренда, как в Datadog/New Relic), наиболее подкреплённый
  источниками вариант — **(1) diverging bars от baseline**, поскольку это единственный из трёх
  кандидатов, явно определённый и названный именно для случая «per-item отклонение от точки отсчёта,
  которая может быть target или long-term average» (FT Visual Vocabulary); вариант (2) в
  задокументированном виде (Datawrapper, Grafana) не рассчитан на per-bar переменный baseline и
  ближе к «один threshold на весь график» или «один маркер на бар без слоя высоты, кодирующего саму
  величину отклонения», поэтому хуже покрыт источниками для нашего конкретного случая.
