# Развёртывание на сервере

Как устроен стенд и что делать, чтобы обновить его, восстановить или поднять заново.

## Как это работает

```
merge в main ──► CI собирает образ бэкенда ──► GitHub Container Registry
                                                        │
кнопка "Deploy" (Actions) ──► GitHub по SSH заходит на сервер ──► git pull, docker compose pull, up -d
```

- **Кто что может.** Кнопку «Deploy» нажимает любой участник организации с правом write
  (Actions → Deploy → Run workflow). Ключ от сервера лежит в секретах окружения `production` и людям
  не виден. На сам сервер по SSH заходит только администратор.
- **Что запущено:** Postgres 17, бэкенд (готовый образ), Caddy (HTTPS). Наружу открыты только порты 80 и 443,
  база и бэкенд снаружи недоступны.
- **Данные и секреты.** Пароль базы и домен лежат в файле `.env` на сервере, в git их нет
  (образец: [`.env.example`](../.env.example)).

## Сервер (сделано один раз вручную)

Ubuntu 26.04 LTS, 2 vCPU, 4 ГБ памяти, 50 ГБ диска.

| Что | Как настроено |
|---|---|
| Пользователи | `kirill` (администратор, sudo) и `deploy` (только для кнопки деплоя, в группе `docker`). Вход под root закрыт |
| SSH | только по ключам, пароли отключены (`/etc/ssh/sshd_config.d/00-hardening.conf`) |
| Файрвол (ufw) | открыты 22, 80, 443 |
| Docker | пакеты `docker.io` и `docker-compose-v2` из репозитория Ubuntu |
| Папка приложения | `/opt/tram-forecast` (клон этого репозитория, владелец `deploy`) |

Пользователь из группы `docker` фактически равен root на этом сервере, поэтому туда не добавляем людей
и ключей сверх необходимого.

## Первый запуск (один раз)

Под пользователем `kirill` на сервере:

```bash
# 1. клонируем репозиторий (он публичный, ключ не нужен)
sudo -u deploy git clone https://github.com/Manticore-MT/tram-forecast.git /opt/tram-forecast

# 2. создаём .env: пароль базы генерируется внутри оболочки пользователя deploy и нигде не выводится
cd /opt/tram-forecast
sudo -u deploy cp .env.example .env
sudo -u deploy sh -c "sed -i \"s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=\$(openssl rand -base64 24 | tr -d '/+=')|\" .env"
sudo -u deploy nano .env     # впишите DOMAIN=...   (см. раздел про домен ниже)
```

Затем в GitHub добавьте секреты и запустите Deploy (см. следующий раздел).

## Секреты GitHub (один раз)

Репозиторий → Settings → Environments → создайте окружение **`production`** и ограничьте его веткой `main`
(Deployment branches → Selected branches → `main`). В окружении добавьте секреты:

| Секрет | Значение |
|---|---|
| `DEPLOY_HOST` | IP сервера |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_SSH_KEY` | **приватный** ключ деплоя (файл `tram_deploy` целиком, вместе со строками `BEGIN`/`END`) |
| `DEPLOY_PATH` | `/opt/tram-forecast` |

Необязательно: переменная (Variables, не Secrets) `DEPLOY_URL`, например `https://tram.example.com`.
Если она задана, после деплоя проверяется `/actuator/health` и деплой считается неуспешным, если сервис
не поднялся.

## Обновить

Actions → **Deploy** → Run workflow → `image_tag = latest` (последняя сборка `main`).

**Откатить:** тот же запуск, в `image_tag` укажите SHA коммита нужной сборки.

## Домен и HTTPS

Caddy сам получает и продлевает сертификат для домена из `.env` (`DOMAIN`). Для этого домен должен указывать
на IP сервера, а порты 80 и 443 быть открыты. Варианты:

- **Свой поддомен** (например, `tram.example.com`): в DNS домена добавить запись `A` с именем поддомена и
  IP сервера. Стабильное имя, при смене сервера меняется одна запись.
- **Бесплатное имя `IP-через-дефисы.sslip.io`** (например, `186-246-27-2.sslip.io`): само указывает на этот IP,
  настраивать DNS не нужно. Годится для проверки, но имя привязано к IP.

Сменить домен: поправить `DOMAIN` в `.env` на сервере и выполнить
`docker compose -f docker-compose.prod.yml up -d`.

## Полезные команды на сервере

```bash
cd /opt/tram-forecast
docker compose -f docker-compose.prod.yml ps                 # что запущено
docker compose -f docker-compose.prod.yml logs -f backend    # логи бэкенда
docker compose -f docker-compose.prod.yml logs -f caddy      # логи Caddy (выпуск сертификата)
```

## Резервные копии

Workflow `Backup DB` каждую ночь (03:00 UTC) делает дамп базы в `/opt/tram-forecast/backups/`, хранит две недели.
Копия лежит на том же сервере: она защищает от неудачного деплоя или миграции, но не от потери сервера.

Восстановить:

```bash
gunzip -c backups/tram-forecast-ГГГГ-ММ-ДД.sql.gz | docker exec -i tram-postgres psql -U tram_forecast -d tram_forecast
```

## Если образ не скачивается

Образ публикуется в GitHub Container Registry. Если `docker compose pull` пишет `unauthorized`, пакет
приватный: на странице пакета (организация → Packages → `tram-forecast/backend` → Package settings)
поменяйте видимость на Public.
