# Language Learning App

Монорепозиторий бесплатной платформы для изучения языков. Первый курс — русский → финский.

Описание продукта находится в [docs/language-learning-app-summary.md](docs/language-learning-app-summary.md), рабочий план — в [docs/development-plan.md](docs/development-plan.md).

## Требования

- Node.js 24+
- pnpm 11+
- Docker с Compose

## Быстрый старт

```bash
pnpm install
cp .env.example .env
docker compose up -d postgres
pnpm dev
```

После запуска:

- web: http://localhost:5173
- API: http://localhost:3000/api/v1
- OpenAPI: http://localhost:3000/docs

## Команды

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format:check
```

## Структура

```text
apps/api          NestJS API
apps/web          Vite + React + TanStack Router
packages/contracts  общие API-контракты
packages/domain     чистая предметная логика
content             версионируемый контент курсов
docs                продуктовая и техническая документация
```
