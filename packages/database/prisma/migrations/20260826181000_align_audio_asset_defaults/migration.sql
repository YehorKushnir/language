-- Defaults were only needed to backfill pre-existing AudioAsset rows.
ALTER TABLE "AudioAsset"
  ALTER COLUMN "provider" DROP DEFAULT,
  ALTER COLUMN "language" DROP DEFAULT,
  ALTER COLUMN "voice" DROP DEFAULT,
  ALTER COLUMN "textHash" DROP DEFAULT,
  ALTER COLUMN "speakingRate" DROP DEFAULT,
  ALTER COLUMN "generationVersion" DROP DEFAULT;
