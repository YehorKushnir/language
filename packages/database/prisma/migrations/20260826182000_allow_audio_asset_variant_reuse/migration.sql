-- One cached asset may intentionally back multiple named variants (for example,
-- when normal and slow rates are configured to the same value).
ALTER TABLE "LexicalFormAudioAsset"
  DROP CONSTRAINT "LexicalFormAudioAsset_pkey",
  ADD CONSTRAINT "LexicalFormAudioAsset_pkey" PRIMARY KEY ("lexicalFormId", "audioAssetId", "variant");

ALTER TABLE "TextAudioAsset"
  DROP CONSTRAINT "TextAudioAsset_pkey",
  ADD CONSTRAINT "TextAudioAsset_pkey" PRIMARY KEY ("textId", "audioAssetId", "variant");

ALTER TABLE "ExerciseAudioAsset"
  DROP CONSTRAINT "ExerciseAudioAsset_pkey",
  ADD CONSTRAINT "ExerciseAudioAsset_pkey" PRIMARY KEY ("exerciseId", "audioAssetId", "variant");
