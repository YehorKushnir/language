-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'GENERATED', 'VERIFIED', 'CURATED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "KnowledgeItemKind" AS ENUM ('LEXICAL_SENSE', 'GRAMMAR', 'SPECIFIC_SKILL', 'REGISTER');

-- CreateEnum
CREATE TYPE "LessonItemRole" AS ENUM ('INTRODUCED', 'PRACTICED', 'RECOGNITION');

-- CreateEnum
CREATE TYPE "ExerciseKind" AS ENUM ('PREPARED', 'GENERATED');

-- CreateEnum
CREATE TYPE "ExerciseItemRole" AS ENUM ('PRIMARY', 'SECONDARY', 'CONTEXT');

-- CreateEnum
CREATE TYPE "LexicalFormSource" AS ENUM ('GENERATED', 'OVERRIDE', 'CURATED');

-- CreateEnum
CREATE TYPE "AudioAssetKind" AS ENUM ('WORD', 'TEXT', 'EXERCISE');

-- CreateEnum
CREATE TYPE "MemoryState" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'RELEARNING');

-- CreateEnum
CREATE TYPE "AttemptOutcome" AS ENUM ('CORRECT', 'PARTIAL', 'INCORRECT');

-- CreateEnum
CREATE TYPE "EvidenceResult" AS ENUM ('SUCCESS', 'FAILURE', 'IGNORED');

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "sourceLanguage" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseRouteVersion" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseRouteVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseRouteEntry" (
    "id" TEXT NOT NULL,
    "routeVersionId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "modulePosition" INTEGER NOT NULL,
    "lessonPosition" INTEGER NOT NULL,

    CONSTRAINT "CourseRouteEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseRouteDependency" (
    "routeVersionId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "prerequisiteLessonId" TEXT NOT NULL,

    CONSTRAINT "CourseRouteDependency_pkey" PRIMARY KEY ("routeVersionId","lessonId","prerequisiteLessonId")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "summary" JSONB,
    "content" JSONB NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeItem" (
    "id" TEXT NOT NULL,
    "kind" "KnowledgeItemKind" NOT NULL,
    "languageCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "metadata" JSONB,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillDependency" (
    "skillId" TEXT NOT NULL,
    "prerequisiteSkillId" TEXT NOT NULL,

    CONSTRAINT "SkillDependency_pkey" PRIMARY KEY ("skillId","prerequisiteSkillId")
);

-- CreateTable
CREATE TABLE "Concept" (
    "id" TEXT NOT NULL,
    "semanticTypes" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Concept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LexicalEntry" (
    "id" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "lemma" TEXT NOT NULL,
    "partOfSpeech" TEXT NOT NULL,
    "register" TEXT,
    "metadata" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LexicalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LexicalSense" (
    "id" TEXT NOT NULL,
    "lexicalEntryId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "gloss" JSONB NOT NULL,
    "metadata" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "LexicalSense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LexicalForm" (
    "id" TEXT NOT NULL,
    "lexicalEntryId" TEXT NOT NULL,
    "surface" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "source" "LexicalFormSource" NOT NULL DEFAULT 'GENERATED',
    "audioAssetId" TEXT,

    CONSTRAINT "LexicalForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonKnowledgeItem" (
    "lessonId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "role" "LessonItemRole" NOT NULL,
    "position" INTEGER,

    CONSTRAINT "LessonKnowledgeItem_pkey" PRIMARY KEY ("lessonId","itemId")
);

-- CreateTable
CREATE TABLE "ExerciseTemplate" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "frame" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "definition" JSONB NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT,
    "kind" "ExerciseKind" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "targetLanguage" TEXT NOT NULL,
    "targetText" TEXT NOT NULL,
    "answerSpec" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExercisePrompt" (
    "exerciseId" TEXT NOT NULL,
    "sourceLanguage" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "ExercisePrompt_pkey" PRIMARY KEY ("exerciseId","sourceLanguage")
);

-- CreateTable
CREATE TABLE "ExerciseItem" (
    "exerciseId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "role" "ExerciseItemRole" NOT NULL,
    "testedFeatures" JSONB,

    CONSTRAINT "ExerciseItem_pkey" PRIMARY KEY ("exerciseId","itemId")
);

-- CreateTable
CREATE TABLE "GeneratedExercise" (
    "exerciseId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "routeVersionId" TEXT NOT NULL,
    "parametersHash" TEXT NOT NULL,
    "generatorVersion" TEXT NOT NULL,

    CONSTRAINT "GeneratedExercise_pkey" PRIMARY KEY ("exerciseId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCourseProgress" (
    "userId" TEXT NOT NULL,
    "routeVersionId" TEXT NOT NULL,
    "currentLessonId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserCourseProgress_pkey" PRIMARY KEY ("userId","routeVersionId")
);

-- CreateTable
CREATE TABLE "UserLessonProgress" (
    "userId" TEXT NOT NULL,
    "routeVersionId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "explanationCompletedAt" TIMESTAMP(3),
    "vocabularyCompletedAt" TIMESTAMP(3),
    "practiceCompletedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLessonProgress_pkey" PRIMARY KEY ("userId","routeVersionId","lessonId")
);

-- CreateTable
CREATE TABLE "UserMemory" (
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL,
    "state" "MemoryState" NOT NULL DEFAULT 'NEW',
    "dueAt" TIMESTAMP(3) NOT NULL,
    "lastReviewAt" TIMESTAMP(3),
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMemory_pkey" PRIMARY KEY ("userId","itemId")
);

-- CreateTable
CREATE TABLE "UserAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "routeVersionId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "normalizedAnswerText" TEXT NOT NULL,
    "outcome" "AttemptOutcome" NOT NULL,
    "diagnostics" JSONB,
    "checkerVersion" TEXT NOT NULL,
    "generatorVersion" TEXT,
    "durationMs" INTEGER,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAttemptEvidence" (
    "attemptId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "role" "ExerciseItemRole" NOT NULL,
    "result" "EvidenceResult" NOT NULL,
    "score" DOUBLE PRECISION,

    CONSTRAINT "UserAttemptEvidence_pkey" PRIMARY KEY ("attemptId","itemId")
);

-- CreateTable
CREATE TABLE "UserExerciseHistory" (
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "timesSeen" INTEGER NOT NULL DEFAULT 1,
    "lastOutcome" "AttemptOutcome",

    CONSTRAINT "UserExerciseHistory_pkey" PRIMARY KEY ("userId","exerciseId")
);

-- CreateTable
CREATE TABLE "Text" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "level" TEXT NOT NULL,
    "topics" TEXT[],
    "body" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "audioAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Text_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextToken" (
    "id" TEXT NOT NULL,
    "textId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "surface" TEXT NOT NULL,
    "lemma" TEXT,
    "lexicalSenseId" TEXT,
    "analysis" JSONB,
    "charStart" INTEGER NOT NULL,
    "charEnd" INTEGER NOT NULL,
    "audioStartMs" INTEGER,
    "audioEndMs" INTEGER,

    CONSTRAINT "TextToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextKnowledgeItem" (
    "textId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "TextKnowledgeItem_pkey" PRIMARY KEY ("textId","itemId")
);

-- CreateTable
CREATE TABLE "AudioAsset" (
    "id" TEXT NOT NULL,
    "kind" "AudioAssetKind" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "durationMs" INTEGER,
    "checksum" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudioAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Course_sourceLanguage_targetLanguage_status_idx" ON "Course"("sourceLanguage", "targetLanguage", "status");

-- CreateIndex
CREATE INDEX "CourseRouteVersion_courseId_status_idx" ON "CourseRouteVersion"("courseId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CourseRouteVersion_courseId_version_key" ON "CourseRouteVersion"("courseId", "version");

-- CreateIndex
CREATE INDEX "CourseRouteEntry_lessonId_idx" ON "CourseRouteEntry"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseRouteEntry_routeVersionId_lessonId_key" ON "CourseRouteEntry"("routeVersionId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseRouteEntry_routeVersionId_modulePosition_lessonPositi_key" ON "CourseRouteEntry"("routeVersionId", "modulePosition", "lessonPosition");

-- CreateIndex
CREATE INDEX "CourseRouteDependency_prerequisiteLessonId_idx" ON "CourseRouteDependency"("prerequisiteLessonId");

-- CreateIndex
CREATE INDEX "Lesson_courseId_status_idx" ON "Lesson"("courseId", "status");

-- CreateIndex
CREATE INDEX "KnowledgeItem_languageCode_kind_idx" ON "KnowledgeItem"("languageCode", "kind");

-- CreateIndex
CREATE INDEX "SkillDependency_prerequisiteSkillId_idx" ON "SkillDependency"("prerequisiteSkillId");

-- CreateIndex
CREATE INDEX "LexicalEntry_languageCode_lemma_idx" ON "LexicalEntry"("languageCode", "lemma");

-- CreateIndex
CREATE INDEX "LexicalEntry_languageCode_partOfSpeech_idx" ON "LexicalEntry"("languageCode", "partOfSpeech");

-- CreateIndex
CREATE INDEX "LexicalSense_lexicalEntryId_idx" ON "LexicalSense"("lexicalEntryId");

-- CreateIndex
CREATE INDEX "LexicalSense_conceptId_idx" ON "LexicalSense"("conceptId");

-- CreateIndex
CREATE INDEX "LexicalForm_lexicalEntryId_surface_idx" ON "LexicalForm"("lexicalEntryId", "surface");

-- CreateIndex
CREATE INDEX "LexicalForm_audioAssetId_idx" ON "LexicalForm"("audioAssetId");

-- CreateIndex
CREATE INDEX "LessonKnowledgeItem_itemId_idx" ON "LessonKnowledgeItem"("itemId");

-- CreateIndex
CREATE INDEX "ExerciseTemplate_courseId_frame_status_idx" ON "ExerciseTemplate"("courseId", "frame", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseTemplate_id_version_key" ON "ExerciseTemplate"("id", "version");

-- CreateIndex
CREATE INDEX "Exercise_courseId_kind_status_idx" ON "Exercise"("courseId", "kind", "status");

-- CreateIndex
CREATE INDEX "Exercise_lessonId_idx" ON "Exercise"("lessonId");

-- CreateIndex
CREATE INDEX "ExerciseItem_itemId_role_idx" ON "ExerciseItem"("itemId", "role");

-- CreateIndex
CREATE INDEX "GeneratedExercise_routeVersionId_idx" ON "GeneratedExercise"("routeVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedExercise_templateId_routeVersionId_parametersHash__key" ON "GeneratedExercise"("templateId", "routeVersionId", "parametersHash", "generatorVersion");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserCourseProgress_routeVersionId_idx" ON "UserCourseProgress"("routeVersionId");

-- CreateIndex
CREATE INDEX "UserCourseProgress_currentLessonId_idx" ON "UserCourseProgress"("currentLessonId");

-- CreateIndex
CREATE INDEX "UserLessonProgress_routeVersionId_lessonId_idx" ON "UserLessonProgress"("routeVersionId", "lessonId");

-- CreateIndex
CREATE INDEX "UserLessonProgress_lessonId_idx" ON "UserLessonProgress"("lessonId");

-- CreateIndex
CREATE INDEX "UserMemory_userId_dueAt_idx" ON "UserMemory"("userId", "dueAt");

-- CreateIndex
CREATE INDEX "UserMemory_itemId_idx" ON "UserMemory"("itemId");

-- CreateIndex
CREATE INDEX "UserAttempt_userId_answeredAt_idx" ON "UserAttempt"("userId", "answeredAt");

-- CreateIndex
CREATE INDEX "UserAttempt_exerciseId_idx" ON "UserAttempt"("exerciseId");

-- CreateIndex
CREATE INDEX "UserAttempt_routeVersionId_idx" ON "UserAttempt"("routeVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAttempt_userId_idempotencyKey_key" ON "UserAttempt"("userId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "UserAttemptEvidence_itemId_result_idx" ON "UserAttemptEvidence"("itemId", "result");

-- CreateIndex
CREATE INDEX "UserExerciseHistory_exerciseId_idx" ON "UserExerciseHistory"("exerciseId");

-- CreateIndex
CREATE INDEX "UserExerciseHistory_userId_lastSeenAt_idx" ON "UserExerciseHistory"("userId", "lastSeenAt");

-- CreateIndex
CREATE INDEX "Text_courseId_level_status_idx" ON "Text"("courseId", "level", "status");

-- CreateIndex
CREATE INDEX "Text_audioAssetId_idx" ON "Text"("audioAssetId");

-- CreateIndex
CREATE INDEX "TextToken_lexicalSenseId_idx" ON "TextToken"("lexicalSenseId");

-- CreateIndex
CREATE UNIQUE INDEX "TextToken_textId_position_key" ON "TextToken"("textId", "position");

-- CreateIndex
CREATE INDEX "TextKnowledgeItem_itemId_idx" ON "TextKnowledgeItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "AudioAsset_storageKey_key" ON "AudioAsset"("storageKey");

-- AddForeignKey
ALTER TABLE "CourseRouteVersion" ADD CONSTRAINT "CourseRouteVersion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRouteEntry" ADD CONSTRAINT "CourseRouteEntry_routeVersionId_fkey" FOREIGN KEY ("routeVersionId") REFERENCES "CourseRouteVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRouteEntry" ADD CONSTRAINT "CourseRouteEntry_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRouteDependency" ADD CONSTRAINT "CourseRouteDependency_routeVersionId_fkey" FOREIGN KEY ("routeVersionId") REFERENCES "CourseRouteVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRouteDependency" ADD CONSTRAINT "CourseRouteDependency_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRouteDependency" ADD CONSTRAINT "CourseRouteDependency_prerequisiteLessonId_fkey" FOREIGN KEY ("prerequisiteLessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_id_fkey" FOREIGN KEY ("id") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillDependency" ADD CONSTRAINT "SkillDependency_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillDependency" ADD CONSTRAINT "SkillDependency_prerequisiteSkillId_fkey" FOREIGN KEY ("prerequisiteSkillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LexicalSense" ADD CONSTRAINT "LexicalSense_id_fkey" FOREIGN KEY ("id") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LexicalSense" ADD CONSTRAINT "LexicalSense_lexicalEntryId_fkey" FOREIGN KEY ("lexicalEntryId") REFERENCES "LexicalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LexicalSense" ADD CONSTRAINT "LexicalSense_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LexicalForm" ADD CONSTRAINT "LexicalForm_lexicalEntryId_fkey" FOREIGN KEY ("lexicalEntryId") REFERENCES "LexicalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LexicalForm" ADD CONSTRAINT "LexicalForm_audioAssetId_fkey" FOREIGN KEY ("audioAssetId") REFERENCES "AudioAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonKnowledgeItem" ADD CONSTRAINT "LessonKnowledgeItem_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonKnowledgeItem" ADD CONSTRAINT "LessonKnowledgeItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseTemplate" ADD CONSTRAINT "ExerciseTemplate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExercisePrompt" ADD CONSTRAINT "ExercisePrompt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseItem" ADD CONSTRAINT "ExerciseItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseItem" ADD CONSTRAINT "ExerciseItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "KnowledgeItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedExercise" ADD CONSTRAINT "GeneratedExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedExercise" ADD CONSTRAINT "GeneratedExercise_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ExerciseTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedExercise" ADD CONSTRAINT "GeneratedExercise_routeVersionId_fkey" FOREIGN KEY ("routeVersionId") REFERENCES "CourseRouteVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourseProgress" ADD CONSTRAINT "UserCourseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourseProgress" ADD CONSTRAINT "UserCourseProgress_routeVersionId_fkey" FOREIGN KEY ("routeVersionId") REFERENCES "CourseRouteVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourseProgress" ADD CONSTRAINT "UserCourseProgress_currentLessonId_fkey" FOREIGN KEY ("currentLessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLessonProgress" ADD CONSTRAINT "UserLessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLessonProgress" ADD CONSTRAINT "UserLessonProgress_routeVersionId_fkey" FOREIGN KEY ("routeVersionId") REFERENCES "CourseRouteVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLessonProgress" ADD CONSTRAINT "UserLessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMemory" ADD CONSTRAINT "UserMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMemory" ADD CONSTRAINT "UserMemory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttempt" ADD CONSTRAINT "UserAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttempt" ADD CONSTRAINT "UserAttempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttempt" ADD CONSTRAINT "UserAttempt_routeVersionId_fkey" FOREIGN KEY ("routeVersionId") REFERENCES "CourseRouteVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttemptEvidence" ADD CONSTRAINT "UserAttemptEvidence_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "UserAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttemptEvidence" ADD CONSTRAINT "UserAttemptEvidence_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "KnowledgeItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExerciseHistory" ADD CONSTRAINT "UserExerciseHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExerciseHistory" ADD CONSTRAINT "UserExerciseHistory_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Text" ADD CONSTRAINT "Text_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Text" ADD CONSTRAINT "Text_audioAssetId_fkey" FOREIGN KEY ("audioAssetId") REFERENCES "AudioAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextToken" ADD CONSTRAINT "TextToken_textId_fkey" FOREIGN KEY ("textId") REFERENCES "Text"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextToken" ADD CONSTRAINT "TextToken_lexicalSenseId_fkey" FOREIGN KEY ("lexicalSenseId") REFERENCES "LexicalSense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextKnowledgeItem" ADD CONSTRAINT "TextKnowledgeItem_textId_fkey" FOREIGN KEY ("textId") REFERENCES "Text"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextKnowledgeItem" ADD CONSTRAINT "TextKnowledgeItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "KnowledgeItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
