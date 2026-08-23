-- Persist an unfinished 60-question practice session so it can be resumed
-- after navigation, a reload, or signing in on another device.
ALTER TABLE "UserLessonProgress"
ADD COLUMN "practiceStartedAt" TIMESTAMP(3);

-- Recover existing unfinished sessions when they contain fewer than the
-- required 60 unique prepared exercises. Completed and ambiguous historical
-- runs intentionally remain closed.
UPDATE "UserLessonProgress" AS progress
SET "practiceStartedAt" = sessions."startedAt"
FROM (
    SELECT
        progress."userId",
        progress."routeVersionId",
        progress."lessonId",
        MIN(attempt."answeredAt") AS "startedAt"
    FROM "UserLessonProgress" AS progress
    INNER JOIN "UserAttempt" AS attempt
        ON attempt."userId" = progress."userId"
        AND attempt."routeVersionId" = progress."routeVersionId"
    INNER JOIN "Exercise" AS exercise
        ON exercise."id" = attempt."exerciseId"
        AND exercise."lessonId" = progress."lessonId"
        AND exercise."kind" = 'PREPARED'
    WHERE progress."practiceCompletedAt" IS NULL
    GROUP BY
        progress."userId",
        progress."routeVersionId",
        progress."lessonId"
    HAVING COUNT(DISTINCT attempt."exerciseId") BETWEEN 1 AND 59
) AS sessions
WHERE progress."userId" = sessions."userId"
  AND progress."routeVersionId" = sessions."routeVersionId"
  AND progress."lessonId" = sessions."lessonId";
