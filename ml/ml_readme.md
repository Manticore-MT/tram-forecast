# ML-сервис трамвайного прогноза

FastAPI-сервис прогноза пассажиропотока (маршрут × час) для backend и фронтенда.
Контракт: [`docs/ml-contract.md`](../docs/ml-contract.md). Ridge по дневному логарифму валидаций, часовые профили и поправка по остаткам используются при подготовке модели и для сценарных дат. Для ноября–декабря 2025 основной API берёт часы 06:00–23:59 из сохранённого конкурсного CSV; ночь 00:00–04:59 обнуляется, а 05:00 оценивается по очищенной модели.

- Обучение: [`train.py`](train.py), [`build_artifact.py`](build_artifact.py)
- Инференс (HTTP-сервис): [`app/`](app/)
- Артефакт модели: [`artifacts/route_model.json`](artifacts/route_model.json)

## Что работает

- Backend шлёт `POST /predict` с `{"horizon":"day","date":"2025-11-01"}` и сохраняет
  ответ в свою PostgreSQL. Прогнозирование офлайн: **без переобучения, чтения сырых
  транзакций и внешних HTTP-запросов**; ONNX не используется.
- Рабочий артефакт — `ml/artifacts/route_model.json` (коэффициенты, intercept,
  поправки, часовые профили, baseline). Архив: `ml/reference/original_final.joblib`,
  `ml/reference/unfiltered_route_model.json`.
- Ночь: 00:00–04:59 = 0; час 05:00 — по валидациям 05:30–05:59.

## Запуск

```powershell
python -m venv ml/.venv
ml/.venv/Scripts/python -m pip install -r ml/requirements.txt
Set-Location ml
.venv/Scripts/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## API

`python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`.
Интерактивный API: http://localhost:8000/docs.

`POST /predict` совместим с backend и возвращает равномерное **демонстрационное**
распределение маршрутного прогноза по остановкам. `POST /predict/routes` возвращает
исходный маршрутный прогноз. Остановочная загрузка и пассажиры в салоне не измерены.


## Конкурсный файл и внешние факторы

Итоговая загруженная версия: [`reference/submission_calendar_service_candidate.csv`](reference/submission_calendar_service_candidate.csv), score **0.89212**. Это score конкурсного файла, а не всего ответа HTTP после фильтрации ночи и не оценка отдельной CatBoost модели.

Источники внешних данных и их точная роль перечислены в [`FACTORS.md`](FACTORS.md). Область применимости и измеренный эффект четырёх категорий — в [`CRITERION_2.md`](CRITERION_2.md). Экспериментальный профиль доступен через `GET /factors/evidence` и `GET /factors/predict`; он не подставлен в основной `POST /predict`. Ручные коэффициенты погоды, события и сезона в backend умножают исходный прогноз, не переобучая модель и не меняя baseline.

