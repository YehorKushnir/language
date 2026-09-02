-- Keep the lesson-list percentage independent from explanation and vocabulary.
-- Existing completed practices used the previous all-corrections rule and
-- therefore represent a full 100% result.
ALTER TABLE "UserLessonProgress"
ADD COLUMN "practiceProgressPercent" INTEGER NOT NULL DEFAULT 0;

UPDATE "UserLessonProgress"
SET "practiceProgressPercent" = 100
WHERE "practiceCompletedAt" IS NOT NULL;

ALTER TABLE "UserLessonProgress"
ADD CONSTRAINT "UserLessonProgress_practiceProgressPercent_check"
CHECK ("practiceProgressPercent" BETWEEN 0 AND 100);
