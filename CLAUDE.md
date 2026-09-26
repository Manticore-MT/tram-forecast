# tram-forecast

Хакатон Московского транспорта, команда Manticore-MT. Монорепо: `backend/` (Java/Spring), `frontend/` (React/TS), ML — отдельный контур.

Стек-специфичный контекст — в `frontend/CLAUDE.md` и (когда появится) `backend/CLAUDE.md`. Здесь только общее.

## Layout

- `backend/` — Spring Boot API, гексагональная архитектура. Подробности и текущий статус (реальные данные/ML или ещё стаб) — `README.md` в корне.
- `frontend/` — Vite/React dashboard.
- `docs/` — `openapi.json` (генерируется из бэка, источник истины по контракту), `ml-contract.md`, `frontend-integration.md`, `examples/`.
- `docker-compose.yml` — локальная разработка. `docker-compose.prod.yml` + `Caddyfile` — прод (см. `deploy/README.md`).
- `.github/workflows/`: `ci.yml` (тесты + публикация образов в GHCR при пуше в `main`), `deploy.yml` (ручной запуск — pull образов и рестарт на сервере), `backup-db.yml` (ночной дамп Postgres).

## Прод

- Домен: `24manticore.ru`, TLS через Caddy (автовыдача сертификата).
- Деплой — кнопка (`Actions → Deploy`), не автоматический. Триггерится через `gh workflow run deploy.yml --repo Manticore-MT/tram-forecast -f image_tag=latest`.
- SSH-доступ к серверу закрыт (секреты деплоя в GitHub Environment `production`) — за логами контейнеров/рестартом Caddy обращаться к тому, у кого доступ.

## API-контракт

Решённое и нерешённое — см. `docs/frontend-integration.md`, `docs/ml-contract.md`, `README.md` (корень) § «Эндпоинты». Не дублировать здесь — расходится с реальностью быстрее, чем этот файл кто-то обновит.

## Git до дедлайна

Дедлайн хакатона важнее чистой истории коммитов. Форс-мержи, PR без ревью, грязная история — нормально
до 27.09.2026 23:59 МСК. После — по обычным правилам.
