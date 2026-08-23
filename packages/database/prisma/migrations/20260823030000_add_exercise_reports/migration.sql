CREATE TYPE "ExerciseReportReason" AS ENUM (
  'WRONG_PROMPT',
  'WRONG_ANSWER',
  'UNNATURAL_LANGUAGE',
  'TECHNICAL_PROBLEM',
  'OTHER'
);

CREATE TYPE "ExerciseReportStatus" AS ENUM (
  'OPEN',
  'RESOLVED',
  'DISMISSED'
);

CREATE TABLE "ExerciseReport" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "exerciseId" TEXT NOT NULL,
  "attemptId" TEXT NOT NULL,
  "reason" "ExerciseReportReason" NOT NULL,
  "comment" TEXT,
  "status" "ExerciseReportStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ExerciseReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExerciseReport_attemptId_key" ON "ExerciseReport"("attemptId");
CREATE INDEX "ExerciseReport_exerciseId_status_createdAt_idx" ON "ExerciseReport"("exerciseId", "status", "createdAt");
CREATE INDEX "ExerciseReport_userId_createdAt_idx" ON "ExerciseReport"("userId", "createdAt");

ALTER TABLE "ExerciseReport"
  ADD CONSTRAINT "ExerciseReport_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExerciseReport"
  ADD CONSTRAINT "ExerciseReport_exerciseId_fkey"
  FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExerciseReport"
  ADD CONSTRAINT "ExerciseReport_attemptId_fkey"
  FOREIGN KEY ("attemptId") REFERENCES "UserAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
