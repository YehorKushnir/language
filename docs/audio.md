# Генерация и хранение аудио

Аудио не создаётся во время пользовательского воспроизведения. `AudioService`
нормализует текст, строит SHA-256 cache key из версии генерации, провайдера,
locale, голоса, поддерживаемых параметров синтеза и текста, проверяет PostgreSQL,
вызывает TTS только при cache miss, загружает MP3 в object storage и сохраняет
метаданные `AudioAsset`. Слова, упражнения и тексты ссылаются на asset через
relation-таблицы.

Для Chirp 3 HD создаётся ровно один canonical-файл без server-side
`speakingRate`. Кнопки обычного и медленного listening используют один URL;
клиент задаёт соответственно `audio.playbackRate = 1` и `0.85`. Capability
TTS-адаптера сохраняет `speakingRate` в синтезе и cache key для других голосов
или будущих провайдеров, которые используют этот параметр.

Одновременные cache miss сериализуются PostgreSQL advisory lock. Уникальный
индекс `AudioAsset.cacheKey` остаётся последней защитой от дублей. Storage key
детерминирован: `audio/<locale>/<voice>/<cache-key>.mp3`. Если запись метаданных
после upload завершается ошибкой, сервис пытается удалить orphan object.

## Локальная разработка

1. В Google Cloud включите Text-to-Speech API, создайте service account с
   правом синтеза и скачайте JSON key (или настройте любой другой ADC-способ).
2. В `.env` задайте как минимум:

```dotenv
TTS_PROVIDER=google
GOOGLE_TTS_PROJECT_ID=my-project
GOOGLE_TTS_VOICE=fi-FI-Chirp3-HD-Aoede
GOOGLE_TTS_LANGUAGE=fi-FI
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
AUDIO_STORAGE_PROVIDER=local
AUDIO_LOCAL_DIRECTORY=.data
```

Основной голос задаётся только конфигурацией; `fi-FI-Chirp3-HD-Aoede` — текущая
рекомендация, которую можно заменить без правки кода. Локальные файлы попадают в
`.data/audio/...` и отдаются API по `/api/v1/media/audio/...`; R2 для разработки
не нужен.

Для разовой локальной генерации можно использовать уже авторизованный Google
Cloud CLI без создания ADC-файла:

```bash
GOOGLE_TTS_AUTH_MODE=gcloud pnpm audio:generate:words -- --limit=2
```

Режим `gcloud` разрешён только вне production. На VPS используется
`GOOGLE_TTS_AUTH_MODE=adc` и service-account JSON.

## Предварительная генерация

После миграции и seed выполните:

```bash
pnpm audio:generate
```

Команда проходит по финским формам слов, всем curated prepared exercises и
подготовленным текстам и создаёт по одному файлу на уникальный TTS input. Только
слова можно сгенерировать командой `pnpm audio:generate:words`, только предложения
для практики — `pnpm audio:generate:sentences`, а тексты —
`pnpm audio:generate:texts`. Любая отдельная scope-команда поддерживает
`-- --limit=2` для безопасной пробы. Cache hit не вызывает Google повторно.
Ошибка отдельного элемента записывается в лог, обработка продолжается, а в конце
печатаются `generated`, `cached` и `failed`. Ненулевое число ошибок даёт exit
code 1.

Внутренние методы `generateWordAudio(formId)`,
`generateSentenceAudio(exerciseId)` и `generateTextAudio(textId)` находятся в
`AudioGenerationService` и используют ту же cache-логику; их можно подключить к
будущему admin UI.

## Production: локальный volume VPS

По умолчанию Production Compose хранит MP3 в Docker volume
`morpho-learning-audio-data`, смонтированном в `/app/.data`. API отдаёт файлы по
`/api/v1/media/audio/...` с immutable cache headers. Volume живёт на самом VPS и
не удаляется при замене checkout или контейнера. Его нужно включить в резервное
копирование VPS и контролировать свободное место.

```dotenv
AUDIO_STORAGE_PROVIDER=local
AUDIO_LOCAL_DIRECTORY=/app/.data
```

После деплоя полный прогон слов запускается внутри API-контейнера, чтобы файлы
попали в тот же volume:

```bash
docker compose --env-file .env.production -f compose.production.yaml \
  exec api pnpm audio:generate:words
```

Предложения для автоматического озвучивания после проверки в практике
генерируются отдельно, без повторного обхода слов:

```bash
docker compose --env-file .env.production -f compose.production.yaml \
  exec api pnpm audio:generate:sentences
```

## Опционально: Cloudflare R2 или S3

Для R2 создайте bucket, S3 API token и публичный custom domain. Конфигурация:

```dotenv
AUDIO_STORAGE_PROVIDER=r2
AUDIO_STORAGE_BUCKET=language-audio
AUDIO_STORAGE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
AUDIO_STORAGE_REGION=auto
AUDIO_STORAGE_ACCESS_KEY=<secret>
AUDIO_STORAGE_SECRET_KEY=<secret>
AUDIO_PUBLIC_URL=https://media.example.com
```

Для AWS S3 используйте `AUDIO_STORAGE_PROVIDER=s3`, нужный region и при
необходимости оставьте endpoint пустым. `AUDIO_PUBLIC_URL` — публичный HTTPS
origin bucket/CDN, а не S3 API endpoint.

Production Compose монтирует Google JSON как Docker secret. На host задайте
`GOOGLE_TTS_CREDENTIALS_FILE=/secure/path/key.json`; внутри API он доступен как
`GOOGLE_APPLICATION_CREDENTIALS=/run/secrets/google-tts`.

## Переменные

- `TTS_PROVIDER` — сейчас `google`;
- `GOOGLE_TTS_AUTH_MODE` — `adc` (production) или `gcloud` (локальный CLI);
- `GOOGLE_TTS_CHIRP3_MIN_INTERVAL_MS` — пауза между Chirp 3 запросами
  (`310` мс соответствует стандартной квоте 200 запросов в минуту);
- `GOOGLE_TTS_PROJECT_ID`, `GOOGLE_TTS_VOICE`, `GOOGLE_TTS_LANGUAGE`;
- `GOOGLE_APPLICATION_CREDENTIALS` — ADC JSON в локальной разработке;
- `AUDIO_NORMAL_SPEAKING_RATE` (по умолчанию `1`; Chirp 3 HD его не применяет);
- `AUDIO_GENERATION_VERSION` — меняйте, чтобы инвалидировать весь TTS cache;
- `AUDIO_GENERATION_CONCURRENCY` — параллелизм batch, по умолчанию `4`;
- `AUDIO_STORAGE_PROVIDER` — `local`, `r2` или `s3`;
- `AUDIO_LOCAL_DIRECTORY` — корень локального storage;
- `AUDIO_STORAGE_BUCKET`, `AUDIO_STORAGE_ENDPOINT`, `AUDIO_STORAGE_REGION`,
  `AUDIO_STORAGE_ACCESS_KEY`, `AUDIO_STORAGE_SECRET_KEY`, `AUDIO_PUBLIC_URL`.

Google credentials и storage secrets принадлежат только backend и не должны
иметь префикс `VITE_` или попадать во frontend bundle.

Unit-тесты не обращаются к Google или R2. После запуска и миграции локального
PostgreSQL полный mock-TTS → test storage → `AudioAsset` flow проверяется командой
`pnpm test:integration`.
