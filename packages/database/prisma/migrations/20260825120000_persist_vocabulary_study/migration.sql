-- Persist active-recall vocabulary progress independently from spaced review.
CREATE TABLE "UserLessonVocabularyProgress" (
    "userId" TEXT NOT NULL,
    "routeVersionId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "lastAnsweredAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLessonVocabularyProgress_pkey"
      PRIMARY KEY ("userId", "routeVersionId", "lessonId", "itemId"),
    CONSTRAINT "UserLessonVocabularyProgress_correctAnswers_check"
      CHECK ("correctAnswers" BETWEEN 0 AND 3),
    CONSTRAINT "UserLessonVocabularyProgress_attempts_check"
      CHECK ("attempts" >= "correctAnswers")
);

CREATE TABLE "UserLessonVocabularyAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routeVersionId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "correctAnswersAfter" INTEGER NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLessonVocabularyAttempt_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserLessonVocabularyAttempt_correctAnswersAfter_check"
      CHECK ("correctAnswersAfter" BETWEEN 0 AND 3)
);

CREATE INDEX "UserLessonVocabularyProgress_routeVersionId_lessonId_idx"
  ON "UserLessonVocabularyProgress"("routeVersionId", "lessonId");
CREATE INDEX "UserLessonVocabularyProgress_itemId_idx"
  ON "UserLessonVocabularyProgress"("itemId");
CREATE UNIQUE INDEX "UserLessonVocabularyAttempt_userId_idempotencyKey_key"
  ON "UserLessonVocabularyAttempt"("userId", "idempotencyKey");
CREATE INDEX "UserLessonVocabularyAttempt_routeVersionId_lessonId_answeredAt_idx"
  ON "UserLessonVocabularyAttempt"("routeVersionId", "lessonId", "answeredAt");
CREATE INDEX "UserLessonVocabularyAttempt_itemId_idx"
  ON "UserLessonVocabularyAttempt"("itemId");

ALTER TABLE "UserLessonVocabularyProgress"
  ADD CONSTRAINT "UserLessonVocabularyProgress_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserLessonVocabularyProgress"
  ADD CONSTRAINT "UserLessonVocabularyProgress_routeVersionId_fkey"
  FOREIGN KEY ("routeVersionId") REFERENCES "CourseRouteVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserLessonVocabularyProgress"
  ADD CONSTRAINT "UserLessonVocabularyProgress_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserLessonVocabularyProgress"
  ADD CONSTRAINT "UserLessonVocabularyProgress_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "KnowledgeItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "UserLessonVocabularyAttempt"
  ADD CONSTRAINT "UserLessonVocabularyAttempt_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserLessonVocabularyAttempt"
  ADD CONSTRAINT "UserLessonVocabularyAttempt_routeVersionId_fkey"
  FOREIGN KEY ("routeVersionId") REFERENCES "CourseRouteVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserLessonVocabularyAttempt"
  ADD CONSTRAINT "UserLessonVocabularyAttempt_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserLessonVocabularyAttempt"
  ADD CONSTRAINT "UserLessonVocabularyAttempt_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "KnowledgeItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Preserve vocabulary parts completed before active recall was introduced.
INSERT INTO "UserLessonVocabularyProgress" (
  "userId",
  "routeVersionId",
  "lessonId",
  "itemId",
  "correctAnswers",
  "attempts",
  "completedAt",
  "lastAnsweredAt",
  "updatedAt"
)
SELECT
  progress."userId",
  progress."routeVersionId",
  progress."lessonId",
  lesson_item."itemId",
  3,
  3,
  progress."vocabularyCompletedAt",
  progress."vocabularyCompletedAt",
  CURRENT_TIMESTAMP
FROM "UserLessonProgress" AS progress
INNER JOIN "LessonKnowledgeItem" AS lesson_item
  ON lesson_item."lessonId" = progress."lessonId"
INNER JOIN "KnowledgeItem" AS item
  ON item."id" = lesson_item."itemId"
  AND item."kind" = 'LEXICAL_SENSE'
WHERE progress."vocabularyCompletedAt" IS NOT NULL
ON CONFLICT DO NOTHING;
