ALTER TABLE "UserMemory"
  ADD COLUMN "manuallyKnown" BOOLEAN NOT NULL DEFAULT false;

-- Preserve manual "known" selections made before the flag existed. The old
-- implementation represented them as a fresh 60-day review interval.
UPDATE "UserMemory"
SET "manuallyKnown" = true
WHERE "state" = 'REVIEW'
  AND "elapsedDays" = 0
  AND "scheduledDays" = 60
  AND "stability" >= 60
  AND "lastReviewAt" IS NOT NULL
  AND "dueAt" = "lastReviewAt" + INTERVAL '60 days';
