import {
  ContentValidationError,
  type LessonValidationReport,
  type PreparedTextValidationReport,
  validateLessonBundle,
  validatePreparedTexts,
} from '@language/content-schema'
import {
  realizeFinnishIdentity,
  validateFinnishIdentityTemplate,
  VoikkoFinnishMorphologyAnalyzer,
  type FinnishIdentityCategory,
  type FinnishIdentityPerson,
  type FinnishMorphologyAnalyzer,
} from '@language/language-fi'

import {
  assertLessonOneContent,
  lessonIdentityTemplateDefinition,
} from '../../../content/courses/ru-fi/lessons/fi.olla.basics.js'
import {
  moduleOneLessons,
  moduleOneVocabulary,
} from '../../../content/courses/ru-fi/module-one.js'
import { preparedTexts } from '../../../content/courses/ru-fi/texts/fi.olla.introductions.js'

export interface CourseContentValidationReport {
  lessons: LessonValidationReport[]
  texts: PreparedTextValidationReport
  module: {
    lessonCount: number
    vocabularyCount: number
    uniqueLemmaCount: number
    exerciseCount: number
  }
}

export interface FinnishMorphologyContentReport {
  checkedWordCount: number
  generatedCandidateCount: number
  lemmaOverrideCount: number
}

export function validateCourseContent(): CourseContentValidationReport {
  assertLessonOneContent()
  const lessons = moduleOneLessons.map((lesson) =>
    validateLessonBundle(
      {
        lessonId: lesson.id,
        content: lesson.content,
        vocabulary: lesson.vocabulary,
        exercises: lesson.exercises,
      },
      {
        expectedExerciseCount: 60,
        minimumExampleCount: 12,
        minimumVocabularyCount: lesson.lessonPosition === 1 ? 10 : 26,
      },
    ),
  )
  const texts = validatePreparedTexts(preparedTexts)
  const exerciseIds = moduleOneLessons.flatMap((lesson) =>
    lesson.exercises.map((exercise) => exercise.id),
  )
  const skillIds = moduleOneLessons.flatMap((lesson) =>
    lesson.skills.map((skill) => skill.id),
  )
  const vocabularyIds = moduleOneVocabulary.map((item) => item.itemId)
  const normalizedLemmas = moduleOneVocabulary.map((item) =>
    item.lemma.toLocaleLowerCase('fi'),
  )
  const routeItemIds = new Set([...skillIds, ...vocabularyIds])
  const issues: string[] = []

  requireExactCount(moduleOneLessons, 16, 'module-one lessons', issues)
  requireExactCount(moduleOneVocabulary, 401, 'module-one vocabulary', issues)
  requireExactCount(exerciseIds, 960, 'module-one exercises', issues)
  requireExactCount(preparedTexts, 5, 'module-one milestone texts', issues)
  requireUnique(
    moduleOneLessons.map((lesson) => lesson.id),
    'lesson ids',
    issues,
  )
  requireUnique(
    moduleOneLessons.map((lesson) => lesson.lessonPosition),
    'lesson positions',
    issues,
  )
  requireUnique(vocabularyIds, 'vocabulary item ids', issues)
  requireUnique(normalizedLemmas, 'vocabulary lemmas', issues)
  requireUnique(exerciseIds, 'exercise ids', issues)
  requireUnique(skillIds, 'skill ids', issues)

  const positions = moduleOneLessons
    .map((lesson) => lesson.lessonPosition)
    .sort((left, right) => left - right)
  if (!positions.every((position, index) => position === index + 1)) {
    issues.push('lesson positions must be contiguous from 1 through 16')
  }

  const expectedTextIds = [
    'text.fi.module-one.04.study-day',
    'text.fi.module-one.08.home-plan',
    'text.fi.module-one.12.market-day',
    'text.fi.module-one.16.journey',
    'text.fi.module-one.final.new-life',
  ]
  if (preparedTexts.some((text, index) => text.id !== expectedTextIds[index])) {
    issues.push('milestone texts must follow the 4/8/12/16/final sequence')
  }
  for (const text of preparedTexts) {
    for (const itemId of text.knowledgeItemIds) {
      if (!routeItemIds.has(itemId)) {
        issues.push(`${text.id} references item outside module one: ${itemId}`)
      }
    }
  }

  if (issues.length > 0) throw new ContentValidationError(issues)

  return {
    lessons,
    texts,
    module: {
      lessonCount: moduleOneLessons.length,
      vocabularyCount: moduleOneVocabulary.length,
      uniqueLemmaCount: new Set(normalizedLemmas).size,
      exerciseCount: exerciseIds.length,
    },
  }
}

export async function validateFinnishMorphologyContent(
  analyzer?: FinnishMorphologyAnalyzer,
): Promise<FinnishMorphologyContentReport> {
  const ownsAnalyzer = !analyzer
  const morphology =
    analyzer ?? (await VoikkoFinnishMorphologyAnalyzer.create())

  try {
    validateFinnishIdentityTemplate(lessonIdentityTemplateDefinition)
    const generatedCandidates = (
      ['affirmative', 'negative', 'question'] as FinnishIdentityCategory[]
    ).flatMap((category) =>
      lessonIdentityTemplateDefinition.personKeys.flatMap((person) =>
        lessonIdentityTemplateDefinition.complements.map((complement) =>
          realizeFinnishIdentity(lessonIdentityTemplateDefinition, {
            category,
            person: person as FinnishIdentityPerson,
            complementKey: complement.key,
          }),
        ),
      ),
    )
    const uniqueTargets = new Set(
      generatedCandidates.map((candidate) => candidate.targetText),
    )
    if (uniqueTargets.size !== generatedCandidates.length) {
      throw new ContentValidationError([
        'Finnish identity template generates duplicate target sentences',
      ])
    }
    const forms = moduleOneVocabulary.flatMap((item) => [
      { surface: item.lemma, expectedLemma: item.lemma },
      ...item.forms.map((form) => ({
        surface: form.surface,
        expectedLemma: item.lemma,
      })),
    ])
    const exerciseWords = moduleOneLessons.flatMap((lesson) =>
      lesson.exercises.flatMap((exercise) => [
        ...extractFinnishWords(exercise.targetText),
        ...exercise.slots.flatMap((slot) => slot.accepted),
      ]),
    )
    const textWords = preparedTexts.flatMap((text) =>
      text.tokens.map((token) => ({
        surface: token.surface,
        expectedLemma: token.lemma,
      })),
    )
    const expectedLemmas = new Map<string, Set<string>>()
    for (const value of [...forms, ...textWords]) {
      const normalized = value.surface.toLocaleLowerCase('fi')
      const lemmas = expectedLemmas.get(normalized) ?? new Set<string>()
      lemmas.add(value.expectedLemma.toLocaleLowerCase('fi'))
      expectedLemmas.set(normalized, lemmas)
    }
    const surfaces = [
      ...new Set(
        [
          ...forms.map((form) => form.surface),
          ...exerciseWords,
          ...generatedCandidates.flatMap((candidate) =>
            extractFinnishWords(candidate.targetText),
          ),
          ...textWords.map((token) => token.surface),
        ].map((surface) => surface.toLocaleLowerCase('fi')),
      ),
    ]
    const issues: string[] = []
    let lemmaOverrideCount = 0

    for (const surface of surfaces) {
      const analyses = await morphology.analyzeWord(surface)
      if (analyses.length === 0) {
        issues.push(`Finnish morphology does not recognize «${surface}»`)
        continue
      }

      const expected = expectedLemmas.get(surface)
      if (
        expected &&
        !analyses.some((analysis) =>
          expected.has(analysis.lemma.toLocaleLowerCase('fi')),
        )
      ) {
        // A curated lexical sense can intentionally treat a fixed form as its
        // own learning unit (for example, pedagogical "kotona"). The surface
        // still has to be recognized; the mismatch is made visible in report.
        lemmaOverrideCount += 1
      }
    }

    if (issues.length > 0) throw new ContentValidationError(issues)
    return {
      checkedWordCount: surfaces.length,
      generatedCandidateCount: generatedCandidates.length,
      lemmaOverrideCount,
    }
  } finally {
    if (ownsAnalyzer) morphology.close()
  }
}

function extractFinnishWords(text: string): string[] {
  return [...text.matchAll(/[\p{L}\p{M}]+/gu)].map((match) => match[0])
}

function requireExactCount(
  values: unknown[],
  expected: number,
  label: string,
  issues: string[],
) {
  if (values.length !== expected) {
    issues.push(
      `${label} must contain ${expected} entries, received ${values.length}`,
    )
  }
}

function requireUnique(
  values: Array<number | string>,
  label: string,
  issues: string[],
) {
  if (new Set(values).size !== values.length) {
    issues.push(`${label} must be unique`)
  }
}
