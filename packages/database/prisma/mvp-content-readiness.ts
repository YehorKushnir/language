import { ContentValidationError } from '@language/content-schema'
import { validateFinnishPreparedVariationTemplate } from '@language/language-fi'

import {
  moduleOneLessons,
  type CourseLessonSeed,
} from '../../../content/courses/ru-fi/module-one.js'
import { preparedTexts } from '../../../content/courses/ru-fi/texts/fi.olla.introductions.js'
import { inspectCurriculumProgression } from './curriculum-progression.js'

const MINIMUM_EXPLANATION_SECTIONS = 5
const MINIMUM_EXPLANATION_EXAMPLES = 12
const MINIMUM_GOLDEN_EXERCISES = 5
const MINIMUM_GRAMMAR_EXERCISES = 30
const MINIMUM_DISTINCT_SLOT_SHAPES = 5
const MINIMUM_VARIANT_EXERCISES = 10

export interface MvpLessonReadiness {
  lessonId: string
  ready: boolean
  issues: string[]
}

export interface MvpContentReadinessReport {
  ready: boolean
  readyLessonCount: number
  lessonCount: number
  lessons: MvpLessonReadiness[]
  courseIssues: string[]
}

export function inspectMvpContentReadiness(
  lessons: readonly CourseLessonSeed[] = moduleOneLessons,
): MvpContentReadinessReport {
  const lessonReports = lessons.map(inspectLesson)
  const courseIssues: string[] = []
  const levels = new Set(preparedTexts.map((text) => text.level))

  if (levels.size < 2) {
    courseIssues.push(
      `prepared texts must cover at least 2 levels, received ${[...levels].join(', ')}`,
    )
  }
  courseIssues.push(...inspectCurriculumProgression(lessons))

  const readyLessonCount = lessonReports.filter((lesson) => lesson.ready).length
  return {
    ready: readyLessonCount === lessons.length && courseIssues.length === 0,
    readyLessonCount,
    lessonCount: lessons.length,
    lessons: lessonReports,
    courseIssues,
  }
}

export function assertMvpContentReadiness(): MvpContentReadinessReport {
  const report = inspectMvpContentReadiness()
  const issues = [
    ...report.courseIssues,
    ...report.lessons.flatMap((lesson) =>
      lesson.issues.map((issue) => `${lesson.lessonId}: ${issue}`),
    ),
  ]

  if (issues.length > 0) throw new ContentValidationError(issues)
  return report
}

function inspectLesson(lesson: CourseLessonSeed): MvpLessonReadiness {
  const issues: string[] = []
  const screens = lesson.content.explanationScreens
  const searchableExplanation = screens
    .flatMap((screen) => [
      screen.title.ru,
      ...screen.paragraphs.map((paragraph) => paragraph.ru),
      screen.callout?.ru ?? '',
    ])
    .join(' ')
    .toLocaleLowerCase('ru')
  const nonInvariantVocabulary = lesson.vocabulary.filter(
    (item) => item.partOfSpeech !== 'adverb',
  )
  const usefulFormCount = nonInvariantVocabulary.filter(
    (item) => new Set(item.forms.map((form) => form.surface)).size >= 2,
  ).length
  const grammarExerciseCount = lesson.exercises.filter((exercise) =>
    lesson.skills.some((skill) => skill.id === exercise.primaryItemId),
  ).length
  const distinctSlotShapes = new Set(
    lesson.exercises.map((exercise) =>
      exercise.slots
        .map((slot) => `${slot.role}${slot.optional ? '?' : ''}`)
        .join('>'),
    ),
  ).size
  const variantExerciseCount = lesson.exercises.filter(
    (exercise) => exercise.acceptedVariants.length > 1,
  ).length

  if (lesson.mvpQuality.content !== 'CURATED') {
    issues.push('content is still marked as scaffold')
  }
  if (lesson.mvpQuality.linguisticReview !== 'PASSED') {
    issues.push('linguistic review has not passed')
  }
  if (lesson.mvpQuality.goldenExerciseIds.length < MINIMUM_GOLDEN_EXERCISES) {
    issues.push(
      `expected at least ${MINIMUM_GOLDEN_EXERCISES} golden exercises`,
    )
  }
  for (const exerciseId of lesson.mvpQuality.goldenExerciseIds) {
    if (!lesson.exercises.some((exercise) => exercise.id === exerciseId)) {
      issues.push(`golden exercise ${exerciseId} does not exist`)
    }
  }
  if (screens.length < MINIMUM_EXPLANATION_SECTIONS) {
    issues.push(
      `expected at least ${MINIMUM_EXPLANATION_SECTIONS} explanation sections`,
    )
  }
  if (!screens[0]?.table) {
    issues.push('first explanation section must contain the overview table')
  }
  const explanationExampleCount = screens.reduce(
    (count, screen) => count + (screen.examples?.length ?? 0),
    0,
  )
  if (explanationExampleCount < MINIMUM_EXPLANATION_EXAMPLES) {
    issues.push(
      `expected at least ${MINIMUM_EXPLANATION_EXAMPLES} explanation examples`,
    )
  }
  if (screens.some((screen) => (screen.examples?.length ?? 0) < 2)) {
    issues.push('every explanation section must contain at least 2 examples')
  }
  if (!screens.some((screen) => screen.callout)) {
    issues.push('explanation has no important callout')
  }
  if (
    screens.some((screen) =>
      /(шаг|самопроверк|контроль|главное|объяснение)/iu.test(screen.title.ru),
    )
  ) {
    issues.push('explanation contains a service or self-check heading')
  }
  if (
    screens.some((screen) => {
      const candidate = screen as unknown as Record<string, unknown>
      return 'eyebrow' in candidate || 'quickChecks' in candidate
    }) ||
    screens.some((screen) =>
      (screen.examples ?? []).some(
        (example) => 'note' in (example as unknown as Record<string, unknown>),
      ),
    )
  ) {
    issues.push('explanation contains a forbidden service field')
  }
  if (!/ошиб/u.test(searchableExplanation)) {
    issues.push('explanation does not cover typical errors')
  }
  if (!/(puhekieli|разговорн)/u.test(searchableExplanation)) {
    issues.push('explanation does not compare kirjakieli and puhekieli')
  }
  if (
    nonInvariantVocabulary.length > 0 &&
    usefulFormCount / nonInvariantVocabulary.length < 0.8
  ) {
    issues.push(
      'fewer than 80% of inflected vocabulary items have useful forms',
    )
  }
  if (grammarExerciseCount < MINIMUM_GRAMMAR_EXERCISES) {
    issues.push(
      `expected at least ${MINIMUM_GRAMMAR_EXERCISES} grammar-primary exercises`,
    )
  }
  const minimumDistinctSlotShapes =
    lesson.id === 'fi.partitive.formation' ? 4 : MINIMUM_DISTINCT_SLOT_SHAPES
  if (distinctSlotShapes < minimumDistinctSlotShapes) {
    issues.push(
      `expected at least ${minimumDistinctSlotShapes} distinct answer-slot shapes`,
    )
  }
  const minimumVariantExercises =
    lesson.id === 'fi.plural.agreement' ? 0 : MINIMUM_VARIANT_EXERCISES
  if (variantExerciseCount < minimumVariantExercises) {
    issues.push(
      `expected at least ${minimumVariantExercises} exercises with curated variants`,
    )
  }
  if (!lesson.template || !lesson.templateId) {
    issues.push('lesson has no curated generation template')
  } else if (lesson.lessonPosition > 1) {
    try {
      const template = lesson.template
      validateFinnishPreparedVariationTemplate(template)
      const expectedExerciseIds = new Set(
        lesson.exercises.map((exercise) => exercise.id),
      )
      const expectedItemIds = [
        ...lesson.skills.map((skill) => skill.id),
        ...lesson.vocabulary.map((item) => item.itemId),
      ]
      const testedItemIds = new Set(
        lesson.exercises.flatMap((exercise) => [
          exercise.primaryItemId,
          ...exercise.secondaryItemIds,
          exercise.vocabularyItemId,
        ]),
      )
      if (
        template.exerciseIds.length !== expectedExerciseIds.size ||
        !template.exerciseIds.every((exerciseId) =>
          expectedExerciseIds.has(exerciseId),
        )
      ) {
        issues.push('generation template does not cover every lesson exercise')
      }
      if (
        expectedItemIds.some(
          (itemId) =>
            !template.supportedItemIds.includes(itemId) ||
            !testedItemIds.has(itemId),
        )
      ) {
        issues.push(
          'generation template does not cover every lesson knowledge item',
        )
      }
    } catch (error) {
      issues.push(
        `lesson has an invalid generation template: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
  }

  return { lessonId: lesson.id, ready: issues.length === 0, issues }
}
