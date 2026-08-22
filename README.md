# Language Learning App

Монорепозиторий бесплатной платформы для изучения языков. Первый курс — русский → финский.

Описание продукта находится в [docs/language-learning-app-summary.md](docs/language-learning-app-summary.md), рабочий план — в [docs/development-plan.md](docs/development-plan.md).

## Требования

- Node.js 24+
- pnpm 11+
- Docker или Podman

## Быстрый старт

```bash
pnpm install
cp .env.example .env
pnpm dev:full
```

`dev:full` поднимает PostgreSQL, применяет миграции, выполняет seed и запускает API с frontend. При последующих запусках существующая база и пользовательский прогресс сохраняются.

Если PostgreSQL уже запущена отдельно, можно использовать обычный `pnpm dev`.

После запуска:

- web: http://localhost:5173
- API: http://localhost:3000/api/v1
- OpenAPI: http://localhost:3000/docs

## Команды

```bash
pnpm dev
pnpm dev:full
pnpm dev:setup
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format:check
pnpm db:validate
pnpm db:start
pnpm db:stop
pnpm db:migrate:dev
pnpm db:seed
```

## Структура

```text
apps/api          NestJS API
apps/web          Vite + React + TanStack Router
packages/contracts  общие API-контракты
packages/domain     чистая предметная логика
packages/database   Prisma-схема и клиент PostgreSQL
content             версионируемый контент курсов
docs                продуктовая и техническая документация
```

Frontend использует shadcn/ui и Tailwind CSS 4. Настройки генератора находятся в `apps/web/components.json`.

Первый вертикальный срез включает 6 экранов объяснения, 11 словарных единиц и банк из 60 подготовленных упражнений на формы `olla`, отрицание, вопросы и разговорный регистр.

Авторизация реализована через BetterAuth с Prisma adapter. Регистрация и вход доступны на `/sign-up` и `/sign-in`, а endpoint `/me` и упражнения принимают только действующую серверную сессию. Для production обязательно задайте собственный случайный `BETTER_AUTH_SECRET`, а также публичные `BETTER_AUTH_URL` и `WEB_ORIGIN`.
