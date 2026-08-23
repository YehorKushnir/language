# Эксплуатация backend

Этот runbook описывает минимальный production-процесс для NestJS API и PostgreSQL. Приложение запускается как один stateless-процесс; состояние хранится в PostgreSQL, а морфологический движок и финский словарь поставляются вместе с backend.

## Обязательная конфигурация

В production API завершится с ошибкой до открытия порта, если отсутствует или некорректна одна из переменных:

- `NODE_ENV=production`;
- `DATABASE_URL` с протоколом `postgresql://` или `postgres://`;
- `WEB_ORIGIN` — HTTPS-origin frontend без пути;
- `BETTER_AUTH_URL` — HTTPS-origin API без пути;
- `BETTER_AUTH_SECRET` — отдельный случайный секрет длиной не менее 32 символов;
- `API_PORT` и `API_HOST`;
- `TRUST_PROXY_HOPS` — число доверенных reverse-proxy между клиентом и API, обычно `1`; оставлять `0`, если API доступен напрямую;
- `MEDIA_BASE_URL` — необязательный HTTPS-адрес CDN/S3.

Секреты нельзя хранить в `.env` внутри образа или репозитория. Их нужно передавать через secret manager платформы.

## Порядок выпуска

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm content:validate
pnpm build
pnpm db:migrate:deploy
NODE_ENV=production pnpm db:seed
pnpm publication:validate
pnpm api:smoke:production
```

`db:seed` в production публикует только версионированный контент и не создаёт локального пользователя. Устаревшие упражнения и шаблоны переводятся в `DRAFT`, чтобы сохранить связанную пользовательскую историю и исключить их из новых сессий. `publication:validate` проверяет уже сохранённое состояние PostgreSQL: маршрут, статусы, зависимости, порядок введения знаний, ровно 60 подготовленных упражнений и один активный шаблон на урок, русские prompts, `AnswerSpec`, покрытие знаний и подготовленные тексты.

Миграции выполняются до переключения трафика. Удаляющие или несовместимые изменения схемы делаются отдельным expand/migrate/contract-релизом. Опубликованный маршрут нельзя менять задним числом: новая редакция курса должна получить новый `CourseRouteVersion`.

## Readiness и остановка

- `GET /api/v1/health` возвращает `200` только при доступных PostgreSQL и Voikko.
- Балансировщик должен убрать instance из трафика после неуспешной readiness-проверки.
- Процесс обрабатывает `SIGTERM`, перестаёт принимать новые запросы и закрывает Prisma-соединения через Nest shutdown hooks.
- Swagger в production не публикуется.

Каждый ответ получает `x-request-id`. Этот же ID, путь, статус и длительность присутствуют в JSON HTTP-логе, включая ошибки guards и `401`.

## Резервное копирование и восстановление

Для managed PostgreSQL нужно включить ежедневные snapshots и point-in-time recovery. Дополнительно перед миграциями рекомендуется логическая копия:

```bash
pg_dump --format=custom --no-owner --file=language.dump "$DATABASE_URL"
pg_restore --clean --if-exists --no-owner --dbname="$RESTORE_DATABASE_URL" language.dump
```

Восстановление сначала проверяется в отдельной базе командами `pnpm db:migrate:deploy`, `pnpm publication:validate` и production smoke-test. Никогда не проверяйте restore поверх рабочей production-базы.

## Откат и диагностика

При ошибке выпуска сначала возвращается предыдущий образ приложения. Prisma-миграции не откатываются автоматически; поэтому они должны быть обратно совместимыми. Для диагностики используются `x-request-id`, HTTP-лог и коды `DATABASE_UNAVAILABLE`, `DATABASE_NOT_READY` и `MORPHOLOGY_UNAVAILABLE`.

Внешний сбор ошибок и метрик подключается на уровне hosting-платформы. Минимальные алерты: неуспешная readiness, рост `5xx`, p95 latency, исчерпание соединений PostgreSQL и свободное место базы.
