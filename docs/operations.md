# Эксплуатация backend

Этот runbook описывает production-процесс для NestJS API и PostgreSQL. Приложение запускается как один stateless-процесс; состояние хранится в PostgreSQL, а морфологический движок и финский словарь поставляются вместе с backend. Готовая конфигурация общего VPS, интеграция с центральным Caddy, GitHub Actions, systemd-бэкапы и перенос между серверами описаны в [инструкции по VPS-деплою](vps-deployment.md).

## Обязательная конфигурация

В production API завершится с ошибкой до открытия порта, если отсутствует или некорректна одна из переменных:

- `NODE_ENV=production`;
- `DATABASE_URL` с протоколом `postgresql://` или `postgres://`;
- `WEB_ORIGIN` — HTTPS-origin frontend без пути;
- `BETTER_AUTH_URL` — HTTPS-origin API без пути;
- `BETTER_AUTH_SECRET` — отдельный случайный секрет длиной не менее 32 символов;
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` и `MAIL_FROM` — SMTP-доставка писем восстановления пароля; `SMTP_USER` и `SMTP_PASSWORD` указываются вместе, если relay требует авторизацию;
- `API_PORT` и `API_HOST`;
- `TRUST_PROXY_HOPS` — число доверенных reverse-proxy между клиентом и API, обычно `1`; оставлять `0`, если API доступен напрямую;
- `GOOGLE_TTS_PROJECT_ID`, `GOOGLE_TTS_VOICE` и доступный через
  `GOOGLE_TTS_CREDENTIALS_FILE` service-account JSON для одноразовых запусков
  `scripts/deploy/generate-audio.sh`;
- `AUDIO_STORAGE_PROVIDER=local`; Compose монтирует постоянный VPS volume
  `morpho-learning-audio-data` в `/app/.data`;
- `MEDIA_BASE_URL` — необязательный HTTPS-адрес для прочих media assets.

Секреты нельзя хранить в `.env` внутри образа или репозитория. Их нужно передавать через secret manager платформы.

## Порядок выпуска

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm content:validate
pnpm content:audit:mvp
pnpm build
pnpm db:migrate:deploy
NODE_ENV=production pnpm db:seed
pnpm publication:validate
pnpm audio:generate:words
pnpm e2e
pnpm api:smoke:production
```

Перед первым локальным E2E-запуском установите Chromium командой
`pnpm exec playwright install chromium`. Команда `pnpm e2e` запускает собранные
API и web preview на изолированных портах, создаёт отдельного пользователя,
проверяет входной барьер, урок, flashcards, практику, тексты, управление с
клавиатуры и WCAG через axe, после чего удаляет тестовый аккаунт. Полный
локальный shortcut с подготовкой базы и сборкой — `pnpm e2e:local`.

`db:seed` в production публикует только версионированный контент и не создаёт локального пользователя. Устаревшие упражнения и шаблоны переводятся в `DRAFT`, чтобы сохранить связанную пользовательскую историю и исключить их из новых сессий. `publication:validate` проверяет уже сохранённое состояние PostgreSQL: маршрут, статусы, зависимости, порядок введения знаний, ровно 60 подготовленных упражнений и один активный шаблон на урок, русские prompts, `AnswerSpec`, покрытие знаний и подготовленные тексты.

Первого администратора назначают после регистрации аккаунта. Команда изменяет
роль существующего пользователя; передавать пароль или создавать отдельный
служебный аккаунт не нужно:

```bash
pnpm user:set-role -- owner@example.com ADMIN
```

Для отзыва доступа используется та же команда с ролью `USER`. После изменения
роли пользователь должен обновить страницу, чтобы навигация перечитала сессию.

Миграции выполняются до переключения трафика. Удаляющие или несовместимые изменения схемы делаются отдельным expand/migrate/contract-релизом. Опубликованный маршрут нельзя менять задним числом: новая редакция курса должна получить новый `CourseRouteVersion`.

## Readiness и остановка

- `GET /api/v1/health` возвращает `200` только при доступных PostgreSQL и Voikko.
- Балансировщик должен убрать instance из трафика после неуспешной readiness-проверки.
- Процесс обрабатывает `SIGTERM`, перестаёт принимать новые запросы и закрывает Prisma-соединения через Nest shutdown hooks.
- Swagger в production не публикуется.

Каждый ответ получает `x-request-id`. Этот же ID, путь, статус и длительность присутствуют в JSON HTTP-логе, включая ошибки guards и `401`. Ошибки браузера без query-параметров и пользовательских ответов отправляются на `POST /api/v1/telemetry/client-errors` и также записываются структурированным JSON. Поэтому stdout/stderr можно направить в любой совместимый сборщик логов без SDK конкретной hosting-платформы. Для production задайте хранение не менее 14 дней и алерты на `event=client_error`, рост `5xx` и неуспешную readiness.

## Резервное копирование и восстановление

Для managed PostgreSQL нужно включить ежедневные snapshots и point-in-time recovery. В VPS-конфигурации логическую копию создаёт скрипт с checksum и metadata:

```bash
./scripts/deploy/backup.sh
./scripts/deploy/restore.sh /secure/path/language.dump --confirm-replace-database
```

Ежедневный timer хранит локальные копии 14 дней, но минимум одна зашифрованная копия должна автоматически уходить за пределы VPS. Восстановление сначала проверяется на отдельном сервере: restore-скрипт сам применяет миграции, seed и `publication:validate`. Никогда не проверяйте restore поверх рабочей production-базы.

## Откат и диагностика

При ошибке выпуска сначала возвращается предыдущий образ приложения. Prisma-миграции не откатываются автоматически; поэтому они должны быть обратно совместимыми. Для диагностики используются `x-request-id`, HTTP-лог и коды `DATABASE_UNAVAILABLE`, `DATABASE_NOT_READY` и `MORPHOLOGY_UNAVAILABLE`.

Сбор логов и метрик подключается на уровне hosting-платформы или независимым OpenTelemetry/лог-агентом. Минимальные алерты: неуспешная readiness, `event=client_error`, рост `5xx`, p95 latency, исчерпание соединений PostgreSQL и свободное место базы.
