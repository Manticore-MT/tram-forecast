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

## 5. Производительность

## 6. Ограничения и план развития

## Лицензия

[MIT](LICENSE)
