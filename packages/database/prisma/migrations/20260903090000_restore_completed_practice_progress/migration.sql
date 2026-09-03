-- A completed practice is permanently shown as complete. Re-entering it starts
-- a free-practice session and must not reduce the saved lesson percentage.
UPDATE "UserLessonProgress"
SET "practiceProgressPercent" = 100
WHERE "practiceCompletedAt" IS NOT NULL
  AND "practiceProgressPercent" <> 100;
