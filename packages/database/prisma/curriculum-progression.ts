import {
  getExerciseConstructionKey,
  getExercisePersonKey,
} from '../../../content/courses/ru-fi/lessons/exercise-sequencing.js'
import {
  moduleOneLessons,
  type CourseLessonSeed,
} from '../../../content/courses/ru-fi/module-one.js'

const ROLE_MINIMUM_LESSON = new Map<string, number>([
  ['genitiveOwner', 8],
  ['partitiveObject', 10],
  ['partitivePossessed', 10],
  ['pluralAdjective', 14],
  ['pluralNoun', 14],
  ['pastVerb', 15],
  ['participle', 16],
  ['pluralParticiple', 16],
])

const EXPLANATION_TERM_MINIMUM_LESSON = [
  { pattern: /(?:генитив|genetiiv)/iu, lesson: 8, label: 'генитив' },
  { pattern: /(?:партитив|partitiiv)/iu, lesson: 10, label: 'партитив' },
  { pattern: /(?:имперфект|imperfekt)/iu, lesson: 15, label: 'имперфект' },
] as const

export function inspectCurriculumProgression(
  lessons: readonly CourseLessonSeed[] = moduleOneLessons,
): string[] {
  const orderedLessons = [...lessons].sort(
    (left, right) => left.lessonPosition - right.lessonPosition,
  )
  const availableItemIds = new Set<string>()
  const vocabularyByItemId = new Map(
    orderedLessons.flatMap((lesson) =>
      lesson.vocabulary.map((item) => [item.itemId, item] as const),
    ),
  )
  const issues: string[] = []

  for (const lesson of orderedLessons) {
    for (const skill of lesson.skills) availableItemIds.add(skill.id)
    for (const vocabulary of lesson.vocabulary) {
      availableItemIds.add(vocabulary.itemId)
    }

    inspectSkillPrerequisites(lesson, availableItemIds, issues)
    inspectExplanationScope(lesson, issues)
    inspectExerciseScope(lesson, availableItemIds, vocabularyByItemId, issues)
    inspectExerciseSequence(lesson, issues)
  }

  return issues
}

function inspectSkillPrerequisites(
  lesson: CourseLessonSeed,
  availableItemIds: ReadonlySet<string>,
  issues: string[],
) {
  for (const skill of lesson.skills) {
    for (const prerequisiteId of skill.prerequisiteSkillIds) {
      if (!availableItemIds.has(prerequisiteId)) {
        issues.push(
          `${lesson.id}: skill ${skill.id} depends on future item ${prerequisiteId}`,
        )
      }
    }
  }
}

function inspectExplanationScope(lesson: CourseLessonSeed, issues: string[]) {
  const explanation = lesson.content.explanationScreens
    .flatMap((screen) => [
      screen.title.ru,
      ...screen.paragraphs.map((paragraph) => paragraph.ru),
      ...(screen.examples ?? []).flatMap((example) => [
        example.target,
        example.source.ru,
      ]),
      ...(screen.table?.headers.map((cell) => cell.ru) ?? []),
      ...(screen.table?.rows.flatMap((row) => row.map((cell) => cell.ru)) ??
        []),
      screen.callout?.ru ?? '',
    ])
    .join(' ')

  for (const requirement of EXPLANATION_TERM_MINIMUM_LESSON) {
    if (
      lesson.lessonPosition < requirement.lesson &&
      requirement.pattern.test(explanation)
    ) {
      issues.push(
        `${lesson.id}: explanation introduces ${requirement.label} before lesson ${requirement.lesson}`,
      )
    }
  }
}

function inspectExerciseScope(
  lesson: CourseLessonSeed,
  availableItemIds: ReadonlySet<string>,
  vocabularyByItemId: ReadonlyMap<
    string,
    CourseLessonSeed['vocabulary'][number]
  >,
  issues: string[],
) {
  for (const exercise of lesson.exercises) {
    const referencedItemIds = new Set([
      exercise.primaryItemId,
      ...exercise.secondaryItemIds,
      exercise.vocabularyItemId,
      ...exercise.slots.flatMap((slot) => slot.itemIds),
    ])
    for (const itemId of referencedItemIds) {
      if (!availableItemIds.has(itemId)) {
        issues.push(
          `${lesson.id}: ${exercise.id} references future item ${itemId}`,
        )
      }
    }

    for (const slot of exercise.slots) {
      const minimumLesson = ROLE_MINIMUM_LESSON.get(slot.role)
      if (minimumLesson && lesson.lessonPosition < minimumLesson) {
        issues.push(
          `${lesson.id}: ${exercise.id} uses ${slot.role} before lesson ${minimumLesson}`,
        )
      }

      for (const itemId of slot.itemIds) {
        const vocabulary = vocabularyByItemId.get(itemId)
        if (!vocabulary) continue

        for (const accepted of slot.accepted) {
          const normalizedAccepted = accepted.toLocaleLowerCase('fi')
          const matchingForms = vocabulary.forms.filter(
            (form) =>
              form.surface.toLocaleLowerCase('fi') === normalizedAccepted,
          )
          const formIssues = matchingForms.map((form) =>
            getFormScopeIssue(
              lesson.lessonPosition,
              vocabulary.partOfSpeech,
              form.features,
            ),
          )
          const grammaticalIssue = formIssues[0]
          if (
            grammaticalIssue &&
            formIssues.every((formIssue) => formIssue !== null)
          ) {
            issues.push(
              `${lesson.id}: ${exercise.id} uses ${accepted} (${grammaticalIssue}) too early`,
            )
          }
        }
      }
    }
  }
}

function getFormScopeIssue(
  lessonPosition: number,
  partOfSpeech: CourseLessonSeed['vocabulary'][number]['partOfSpeech'],
  features: Readonly<Record<string, string>>,
): string | null {
  if (features.case === 'genitive' && lessonPosition < 8) return 'genitive'
  if (features.case === 'partitive' && lessonPosition < 10) return 'partitive'
  if (
    features.number === 'plural' &&
    (partOfSpeech === 'noun' || partOfSpeech === 'adjective') &&
    lessonPosition < 14
  ) {
    return 'nominal plural'
  }
  if (features.tense === 'imperfect' && lessonPosition < 15) {
    return 'imperfect'
  }
  return null
}

function inspectExerciseSequence(lesson: CourseLessonSeed, issues: string[]) {
  const orderedExercises = [...lesson.exercises].sort(
    (left, right) => left.selectionOrder - right.selectionOrder,
  )
  const personCounts = new Map<string, number>()
  for (const exercise of orderedExercises) {
    const personKey = getExercisePersonKey(exercise)
    if (personKey) {
      personCounts.set(personKey, (personCounts.get(personKey) ?? 0) + 1)
    }
  }
  let previousKey: string | null = null
  let runLength = 0
  let previousPersonKey: string | null = null
  let personRunLength = 0

  for (const exercise of orderedExercises) {
    const key = getExerciseConstructionKey(exercise)
    runLength = key === previousKey ? runLength + 1 : 1
    previousKey = key
    if (runLength > 2) {
      issues.push(
        `${lesson.id}: more than 2 exercises with construction ${key} appear in a row`,
      )
      return
    }

    const personKey = getExercisePersonKey(exercise)
    personRunLength =
      personKey && personKey === previousPersonKey ? personRunLength + 1 : 1
    previousPersonKey = personKey
    const personCount = personKey ? (personCounts.get(personKey) ?? 0) : 0
    const minimumPossibleLongestRun = Math.ceil(
      personCount / (orderedExercises.length - personCount + 1),
    )
    const allowedRunLength = Math.max(2, minimumPossibleLongestRun)
    if (personKey && personRunLength > allowedRunLength) {
      issues.push(
        `${lesson.id}: more than ${allowedRunLength} exercises with person ${personKey} appear in a row`,
      )
      return
    }
  }
}
