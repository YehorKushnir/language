-- Preserve existing audio links while enriching assets with deterministic TTS metadata.
ALTER TABLE "AudioAsset"
  ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'legacy',
  ADD COLUMN "language" TEXT NOT NULL DEFAULT 'fi-FI',
  ADD COLUMN "voice" TEXT NOT NULL DEFAULT 'legacy',
  ADD COLUMN "textHash" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "sourceText" TEXT,
  ADD COLUMN "speakingRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
  ADD COLUMN "generationVersion" TEXT NOT NULL DEFAULT 'legacy-v1',
  ADD COLUMN "cacheKey" TEXT,
  ADD COLUMN "url" TEXT,
  ADD COLUMN "contentType" TEXT;

UPDATE "AudioAsset"
SET
  "textHash" = "checksum",
  "cacheKey" = 'legacy:' || "id",
  "url" = "storageKey",
  "contentType" = "mimeType";

ALTER TABLE "AudioAsset"
  ALTER COLUMN "cacheKey" SET NOT NULL,
  ALTER COLUMN "url" SET NOT NULL,
  ALTER COLUMN "contentType" SET NOT NULL;

CREATE UNIQUE INDEX "AudioAsset_cacheKey_key" ON "AudioAsset"("cacheKey");
CREATE INDEX "AudioAsset_provider_language_voice_idx" ON "AudioAsset"("provider", "language", "voice");
CREATE INDEX "AudioAsset_textHash_idx" ON "AudioAsset"("textHash");

CREATE TABLE "LexicalFormAudioAsset" (
  "lexicalFormId" TEXT NOT NULL,
  "audioAssetId" TEXT NOT NULL,
  "variant" TEXT NOT NULL DEFAULT 'standard',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LexicalFormAudioAsset_pkey" PRIMARY KEY ("lexicalFormId", "audioAssetId")
);

CREATE TABLE "TextAudioAsset" (
  "textId" TEXT NOT NULL,
  "audioAssetId" TEXT NOT NULL,
  "variant" TEXT NOT NULL DEFAULT 'normal',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TextAudioAsset_pkey" PRIMARY KEY ("textId", "audioAssetId")
);

CREATE TABLE "ExerciseAudioAsset" (
  "exerciseId" TEXT NOT NULL,
  "audioAssetId" TEXT NOT NULL,
  "variant" TEXT NOT NULL DEFAULT 'standard',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ExerciseAudioAsset_pkey" PRIMARY KEY ("exerciseId", "audioAssetId")
);

INSERT INTO "LexicalFormAudioAsset" ("lexicalFormId", "audioAssetId")
SELECT "id", "audioAssetId" FROM "LexicalForm" WHERE "audioAssetId" IS NOT NULL;

INSERT INTO "TextAudioAsset" ("textId", "audioAssetId")
SELECT "id", "audioAssetId" FROM "Text" WHERE "audioAssetId" IS NOT NULL;

CREATE UNIQUE INDEX "LexicalFormAudioAsset_lexicalFormId_variant_key" ON "LexicalFormAudioAsset"("lexicalFormId", "variant");
CREATE INDEX "LexicalFormAudioAsset_audioAssetId_idx" ON "LexicalFormAudioAsset"("audioAssetId");
CREATE UNIQUE INDEX "TextAudioAsset_textId_variant_key" ON "TextAudioAsset"("textId", "variant");
CREATE INDEX "TextAudioAsset_audioAssetId_idx" ON "TextAudioAsset"("audioAssetId");
CREATE UNIQUE INDEX "ExerciseAudioAsset_exerciseId_variant_key" ON "ExerciseAudioAsset"("exerciseId", "variant");
CREATE INDEX "ExerciseAudioAsset_audioAssetId_idx" ON "ExerciseAudioAsset"("audioAssetId");

ALTER TABLE "LexicalFormAudioAsset"
  ADD CONSTRAINT "LexicalFormAudioAsset_lexicalFormId_fkey" FOREIGN KEY ("lexicalFormId") REFERENCES "LexicalForm"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "LexicalFormAudioAsset_audioAssetId_fkey" FOREIGN KEY ("audioAssetId") REFERENCES "AudioAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TextAudioAsset"
  ADD CONSTRAINT "TextAudioAsset_textId_fkey" FOREIGN KEY ("textId") REFERENCES "Text"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "TextAudioAsset_audioAssetId_fkey" FOREIGN KEY ("audioAssetId") REFERENCES "AudioAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExerciseAudioAsset"
  ADD CONSTRAINT "ExerciseAudioAsset_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ExerciseAudioAsset_audioAssetId_fkey" FOREIGN KEY ("audioAssetId") REFERENCES "AudioAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LexicalForm" DROP CONSTRAINT "LexicalForm_audioAssetId_fkey";
ALTER TABLE "Text" DROP CONSTRAINT "Text_audioAssetId_fkey";
DROP INDEX "LexicalForm_audioAssetId_idx";
DROP INDEX "Text_audioAssetId_idx";
ALTER TABLE "LexicalForm" DROP COLUMN "audioAssetId";
ALTER TABLE "Text" DROP COLUMN "audioAssetId";
ALTER TABLE "AudioAsset" DROP COLUMN "kind", DROP COLUMN "mimeType", DROP COLUMN "status";
DROP TYPE "AudioAssetKind";
