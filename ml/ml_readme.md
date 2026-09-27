# ML-сервис трамвайного прогноза

FastAPI-сервис прогноза пассажиропотока (маршрут × час) для backend и фронтенда.
Рабочая модель — Ridge по дневному логарифму валидаций + часовые профили + недавняя
поправка. Контракт: [`docs/ml-contract.md`](../docs/ml-contract.md).

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
python -3.12 -m venv ml/.venv
ml/.venv/Scripts/python -m pip install -r ml/requirements.txt
Set-Location ml
.venv/Scripts/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

# API:

`python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`.
Интерактивный API: http://localhost:8000/docs.

`POST /predict` совместим с backend и возвращает равномерное **демонстрационное**
распределение маршрутного прогноза по остановкам. `POST /predict/routes` возвращает
исходный маршрутный прогноз. Остановочная загрузка и пассажиры в салоне не измерены.


# Загрузка CSV
Итоговая загруженная версия csv на платформу: submission_calendar_service_candidate.csv

