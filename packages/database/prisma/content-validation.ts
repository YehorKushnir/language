import {
  ContentValidationError,
  type LessonValidationReport,
  type PreparedTextValidationReport,
  validateLessonBundle,
  validatePreparedTexts,
} from '@language/content-schema'
import {
  VoikkoFinnishMorphologyAnalyzer,
  type FinnishMorphologyAnalyzer,
} from '@language/language-fi'

import {
  assertLessonOneContent,
  lessonContent,
  lessonExercises,
  lessonVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.olla.basics.js'
import { preparedTexts } from '../../../content/courses/ru-fi/texts/fi.olla.introductions.js'

export interface CourseContentValidationReport {
  lessons: LessonValidationReport[]
  texts: PreparedTextValidationReport
}

export interface FinnishMorphologyContentReport {
  checkedWordCount: number
  lemmaOverrideCount: number
}

export function validateCourseContent(): CourseContentValidationReport {
  assertLessonOneContent()

  return {
    lessons: [
      validateLessonBundle(
        {
          lessonId: 'fi.olla.basics',
          content: lessonContent,
          vocabulary: lessonVocabulary,
          exercises: lessonExercises,
        },
        {
          expectedExerciseCount: 60,
          minimumExampleCount: 12,
          minimumVocabularyCount: 10,
        },
      ),
    ],
    texts: validatePreparedTexts(preparedTexts),
  }
}

export async function validateFinnishMorphologyContent(
  analyzer?: FinnishMorphologyAnalyzer,
): Promise<FinnishMorphologyContentReport> {
  const ownsAnalyzer = !analyzer
  const morphology =
    analyzer ?? (await VoikkoFinnishMorphologyAnalyzer.create())

  try {
    const forms = lessonVocabulary.flatMap((item) => [
      { surface: item.lemma, expectedLemma: item.lemma },
      ...item.forms.map((form) => ({
        surface: form.surface,
        expectedLemma: item.lemma,
      })),
    ])
    const exerciseWords = lessonExercises.flatMap((exercise) => [
      ...extractFinnishWords(exercise.targetText),
      ...exercise.slots.flatMap((slot) => slot.accepted),
    ])
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
    return { checkedWordCount: surfaces.length, lemmaOverrideCount }
  } finally {
    if (ownsAnalyzer) morphology.close()
  }
}

function extractFinnishWords(text: string): string[] {
  return [...text.matchAll(/[\p{L}\p{M}]+/gu)].map((match) => match[0])
}
