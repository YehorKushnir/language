# Деплой на общий VPS

Production работает на Ubuntu 24.04 по адресу
`morpho-learning.duckdns.org`. На VPS уже есть центральный Caddy из стека
Framed, поэтому Morpho не публикует собственные `80/443` и не может занять
порты других сайтов.

## Архитектура

- GitHub Actions проверяет проект, собирает targets `api` и `web` из корневого
  `Dockerfile` и публикует immutable-образы в GHCR с тегом Git commit SHA.
- Одноразовый `migrate` применяет Prisma-миграции, выполняет production seed и
  `publication:validate` до переключения API.
- `api` и `postgres` не публикуют портов на хосте.
- Контейнер `web` раздаёт SPA и проксирует `/api` на уникальный alias
  `morpho-api`. В общей сети `framed_default` сам web имеет alias `morpho-web`;
  уникальные имена исключают DNS-конфликты с другими Compose-проектами.
- Центральный `framed-caddy-1` импортирует
  `/home/deploy/caddy-sites/*.caddy` и проксирует домен на `morpho-web:80`.
- PostgreSQL хранится в именованном volume
  `morpho-learning-postgres-data`, а готовые MP3 — в
  `morpho-learning-audio-data`; checkout и образы можно заменить без потери
  пользовательских данных и сгенерированного аудио.

Изменение общего Caddy версионируется в репозитории Framed: его `Caddyfile`
импортирует отдельный каталог сайтов, а Compose монтирует каталог read-only.
Поэтому следующий деплой Framed не удалит Morpho-конфигурацию.

## Файлы на VPS

```text
/home/deploy/morpho-learning/
  .env.production              # 600, не попадает в Git
  compose.production.yaml
  scripts/deploy/
/home/deploy/caddy-sites/
  morpho-learning.caddy
/var/backups/morpho-learning/  # 700, владелец deploy
```

Production env:

```dotenv
APP_DOMAIN=morpho-learning.duckdns.org
IMAGE_REPO=ghcr.io/yehorkushnir/language
IMAGE_TAG=<последний успешно развернутый commit SHA>
EDGE_NETWORK=framed_default
POSTGRES_PASSWORD=<openssl rand -hex 32>
BETTER_AUTH_SECRET=<другой openssl rand -hex 32>
SMTP_HOST=<smtp relay>
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<smtp user>
SMTP_PASSWORD=<smtp password>
MAIL_FROM=Morpho Learning <sender@example.com>
MEDIA_BASE_URL=
TTS_PROVIDER=google
GOOGLE_TTS_PROJECT_ID=<Google Cloud project>
GOOGLE_TTS_VOICE=fi-FI-Chirp3-HD-Aoede
GOOGLE_TTS_CREDENTIALS_FILE=/secure/path/google-tts-service-account.json
AUDIO_STORAGE_PROVIDER=local
AUDIO_LOCAL_DIRECTORY=/app/.data
```

Проверка env и Compose не раскрывает значения:

```bash
cd /home/deploy/morpho-learning
./scripts/deploy/check-env.sh .env.production
docker compose --env-file .env.production -f compose.production.yaml config --quiet
```

Для реальных пользователей SMTP обязателен: после первого деплоя нужно
запросить сброс пароля и проверить фактическую доставку. Успешное TCP-соединение
с relay не заменяет эту проверку.

## CI/CD

Workflow `.github/workflows/deploy.yml` запускается на push в `main`:

1. переиспользует полный CI workflow;
2. параллельно собирает `api` и `web` и публикует теги `latest` и точный SHA;
3. копирует только версионируемую deployment-конфигурацию на VPS;
4. запускает `ci-deploy.sh <sha>`.

В GitHub environment `production` хранится единственный repository secret
`VPS_SSH_KEY`. Это отдельный SSH-ключ пользователя `deploy`; host key VPS
зафиксирован в `deploy/known_hosts`, поэтому workflow не доверяет результату
непроверенного `ssh-keyscan` во время релиза.

`ci-deploy.sh` сериализует релизы через `flock`, делает pre-deploy dump уже
существующей базы, заранее скачивает новые образы, применяет миграции, ждёт
healthcheck API и web, безопасно reload-ит общий Caddy и только после успеха
записывает новый `IMAGE_TAG`. При ошибке контейнеры возвращаются на предыдущий
immutable tag; Prisma-миграции назад автоматически не откатываются и поэтому
должны оставаться обратно совместимыми. После успешного rollout сохраняются
текущий и предыдущий immutable-образы; более старые теги удаляются, чтобы диск
не заполнялся, а быстрый rollback оставался доступен.

Ручной повтор уже опубликованного релиза:

```bash
cd /home/deploy/morpho-learning
./scripts/deploy/ci-deploy.sh <40-character-git-sha>
```

## Общий Caddy

Site-файл Morpho:

```caddyfile
morpho-learning.duckdns.org {
	encode zstd gzip
	reverse_proxy morpho-web:80
}
```

Обновление выполняется без остановки существующих сайтов:

```bash
./scripts/deploy/reload-edge-caddy.sh
```

Скрипт сохраняет предыдущий site-файл, запускает `caddy validate`, выполняет
graceful reload и восстанавливает старую версию при ошибке. Контейнеры Framed
API/web/LiveKit при этом не пересоздаются.

После любого изменения общего прокси проверяются все домены:

```bash
curl --fail https://framed-the-game.duckdns.org/
curl --fail https://framed-the-game-lk.duckdns.org/
curl --fail https://morpho-learning.duckdns.org/api/v1/health
```

## DNS

DuckDNS A-запись должна указывать на публичный IPv4 `95.169.192.201`. У VPS
статический адрес, поэтому постоянный DDNS timer не обязателен. Для ручного или
периодического обновления есть `scripts/deploy/update-duckdns.sh`; токен
хранится только в `/etc/morpho-learning/duckdns.env` и никогда не попадает в
GitHub Actions или образы.

До переключения DNS новый сайт можно проверять через временное локальное
разрешение имени. Caddy сможет получить публичный сертификат только после того,
как домен начнёт разрешаться в этот VPS.

## Бэкапы

Ручной dump:

```bash
cd /home/deploy/morpho-learning
./scripts/deploy/backup.sh
```

Systemd timer `morpho-backup.timer` ежедневно создаёт в
`/var/backups/morpho-learning`:

- custom-format PostgreSQL dump;
- SHA-256 checksum;
- metadata с UTC-временем, PostgreSQL version и Git revision.

Локальные копии хранятся 14 дней. Копия на том же VPS защищает от ошибочной
миграции, но не от потери VPS или аккаунта провайдера. Минимум одна
зашифрованная копия должна автоматически уходить в независимое хранилище.
Dump содержит email, password hashes, сессии и учебную историю.

Проверка timer:

```bash
sudo systemctl status morpho-backup.timer
sudo systemctl start morpho-backup.service
sudo journalctl -u morpho-backup.service --since today
```

## Восстановление и перенос

Для переноса на новый сервер:

1. Остановите старые `web` и `api`, оставив PostgreSQL запущенной.
2. Создайте финальный dump и скопируйте `.dump` вместе с `.sha256` по
   зашифрованному каналу.
3. Подготовьте новый `.env.production`. Сохранение старого
   `BETTER_AUTH_SECRET` не инвалидирует действующие сессии; пароль новой
   PostgreSQL может отличаться.
4. Восстановите базу явной destructive-командой:

   ```bash
   ./scripts/deploy/restore.sh /secure/path/language.dump --confirm-replace-database
   ```

5. Проверьте health, вход существующего пользователя, его прогресс и экспорт
   данных, после чего переключайте DNS.

Restore-скрипт проверяет checksum, создаёт страховочный dump целевой базы,
останавливает приложение, пересоздаёт только базу `language`, запускает
`pg_restore`, накатывает более новые миграции/seed и возвращает сервисы в
работу. Старый VPS нельзя включать для записи параллельно: автоматического
слияния двух баз нет.

Никогда не запускайте `docker compose down -v`: `-v` удалит
`morpho-learning-postgres-data`. Для PostgreSQL major upgrade используется
отдельный проверенный dump/restore, а не замена image tag поверх старого volume.
