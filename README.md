# tram-forecast

ИИ-прогноз загрузки трамвайных маршрутов (Хакатон Московского транспорта). Команда **Manticore**.

**Стенд:** <https://24manticore.ru>

## Быстрый старт

Нужен Docker.

```bash
docker compose up --build
```

Бэкенд отвечает на <http://localhost:8080>:

```bash
curl http://localhost:8080/actuator/health
curl "http://localhost:8080/api/meta"
curl "http://localhost:8080/api/routes?horizon=day"
```

## 1. ML-модель

## 2. Внешние данные

## 3. Запускаемый веб-сервис

## 4. Архитектура и модули

Полная схема: [Яндекс.Диск](https://disk.yandex.ru/d/vw3235fPyogFXQ)

![Архитектура](docs/images/architecture.png)

### ML ↔ Backend

| Что | Эндпоинт |
|---|---|
| Прогноз по всем маршрутам | `POST /predict/routes` |
| Метрики качества | `GET /metrics?origin=2025-09-01` |
| Историческое сравнение | `GET /history/comparison?date=2025-11-01&routeId=all` |

### Backend ↔ Frontend

| Что | Эндпоинт |
|---|---|
| Карта сети / полоса времени | `GET /api/routes?horizon=day` |
| Панель деталей | `GET /api/routes/{routeId}/forecast?horizon=day` |
| Зоны внимания | `GET /api/attention?horizon=day` |
| Типичная неделя маршрута | `GET /api/routes/{routeId}/load-matrix` |
| Качество модели | `GET /api/model/stats?days=30` |
| Метаданные (даты, горизонты) | `GET /api/meta` |
| Выгрузка в CSV | `GET /api/export?format=csv&horizon=day` |
| История для дня | `GET /api/history/comparison?date=2025-11-01&routeId=all` |

## 5. Производительность

## 6. Ограничения и план развития

## Лицензия

[MIT](LICENSE)
