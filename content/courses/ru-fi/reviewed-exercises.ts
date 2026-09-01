import reviewedLessonSentences from './lesson-sentences.review.json' with { type: 'json' }

import type { CourseLessonSeed } from './module-one.js'
import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './lessons/fi.olla.basics.js'

interface ReviewedExerciseSentence {
  order: number
  id: string
  prompt: string
  targetText: string
  acceptedVariants: string[]
}

interface VocabularyMatch {
  item: LessonVocabularySeed
  lessonPosition: number
  tokenIndexes: number[]
}

interface ExerciseDraft {
  reviewed: ReviewedExerciseSentence
  base: PreparedExerciseSeed | undefined
  matches: VocabularyMatch[]
  vocabulary: LessonVocabularySeed | undefined
}

interface ReviewedExerciseApplicationOptions {
  previousLessons?: readonly CourseLessonSeed[]
  reviewLessonOffset?: number
}

const SUBJECT_FORMS = new Set([
  'he',
  'hän',
  'me',
  'minä',
  'ne',
  'se',
  'sinä',
  'sä',
  'te',
  'mä',
])

const NEGATIVE_VERB_FORMS = new Set([
  'ei',
  'eivät',
  'emme',
  'en',
  'et',
  'ette',
  'eikö',
  'eivätkö',
  'emmekö',
  'enkö',
  'etkö',
  'ettekö',
])

export function applyReviewedExercises(
  lessons: readonly CourseLessonSeed[],
  options: ReviewedExerciseApplicationOptions = {},
): CourseLessonSeed[] {
  const review = parseReview()
  const previousLessons = options.previousLessons ?? []
  const reviewLessonOffset = options.reviewLessonOffset ?? 0
  const courseLessons = [...previousLessons, ...lessons]
  const vocabularyLessonById = new Map(
    courseLessons.flatMap((lesson, courseLessonIndex) =>
      lesson.vocabulary.map(
        (item) => [item.itemId, courseLessonIndex + 1] as const,
      ),
    ),
  )

  return lessons.map((lesson, lessonIndex) => {
    const reviewLessonNumber = reviewLessonOffset + lessonIndex + 1
    const reviewed = review.get(reviewLessonNumber)
    if (!reviewed) {
      throw new Error(
        `Missing reviewed exercises for course lesson ${reviewLessonNumber}`,
      )
    }

    const availableVocabulary = courseLessons
      .slice(0, previousLessons.length + lessonIndex + 1)
      .flatMap((candidate) =>
        candidate.vocabulary.map((item) => ({
          item,
          lessonPosition: candidate.lessonPosition,
        })),
      )
    const surfaceIndex = createVocabularySurfaceIndex(availableVocabulary)
    const baseById = new Map(
      lesson.exercises.map((exercise) => [exercise.id, exercise]),
    )
    const currentVocabularyIds = new Set(
      lesson.vocabulary.map((item) => item.itemId),
    )
    const drafts: ExerciseDraft[] = reviewed.map((entry) => {
      const base = baseById.get(entry.id)
      const matches = matchVocabulary(entry.targetText, surfaceIndex)
      return {
        reviewed: entry,
        base,
        matches,
        vocabulary: selectVocabulary(
          matches,
          base,
          currentVocabularyIds,
          vocabularyLessonById,
        ),
      }
    })

    assignUncoveredVocabulary(drafts, lesson)

    const exercises = drafts.map((draft) =>
      createReviewedExercise(draft, lesson),
    )
    const exerciseIds = new Set(exercises.map((exercise) => exercise.id))
    const retainedGoldenIds = lesson.mvpQuality.goldenExerciseIds.filter((id) =>
      exerciseIds.has(id),
    )
    const goldenExerciseIds = [
      ...retainedGoldenIds,
      ...exercises
        .map((exercise) => exercise.id)
        .filter((id) => !retainedGoldenIds.includes(id)),
    ].slice(0, Math.max(5, retainedGoldenIds.length))
    const template =
      lesson.template?.frame === 'prepared-variation'
        ? {
            ...lesson.template,
            exerciseIds: exercises.map((exercise) => exercise.id),
          }
        : lesson.template

    return {
      ...lesson,
      exercises,
      template,
      mvpQuality: {
        ...lesson.mvpQuality,
        goldenExerciseIds,
      },
    }
  })
}

function createReviewedExercise(
  draft: ExerciseDraft,
  lesson: CourseLessonSeed,
): PreparedExerciseSeed {
  const { reviewed, base, matches, vocabulary } = draft
  if (!vocabulary) {
    throw new Error(
      `${reviewed.id} has no vocabulary item available by lesson ${lesson.lessonPosition}`,
    )
  }

  if (
    base &&
    base.targetText === reviewed.targetText &&
    sameStrings(base.acceptedVariants, reviewed.acceptedVariants)
  ) {
    return {
      ...base,
      selectionOrder: reviewed.order,
      prompt: reviewed.prompt,
      targetText: reviewed.targetText,
      acceptedVariants: [...reviewed.acceptedVariants],
      slots: base.slots.map((slot) => ({
        ...slot,
        accepted: [...slot.accepted],
        itemIds: [...slot.itemIds],
      })),
    }
  }

  const lessonSkillIds = new Set(lesson.skills.map((skill) => skill.id))
  const primaryItemId = lesson.skills[0]?.id
  if (!primaryItemId) {
    throw new Error(`${lesson.id} must declare at least one skill`)
  }
  const preservedSkillIds = base
    ? [base.primaryItemId, ...base.secondaryItemIds].filter((itemId) =>
        lessonSkillIds.has(itemId),
      )
    : []
  const secondaryItemIds = unique([
    ...preservedSkillIds.filter((itemId) => itemId !== primaryItemId),
    ...inferSpecificSkillIds(lesson, reviewed).filter(
      (itemId) => itemId !== primaryItemId,
    ),
  ])
  const grammarItemIds = [primaryItemId, ...secondaryItemIds]
  const vocabularyMatch = matches.find(
    (match) => match.item.itemId === vocabulary.itemId,
  )

  return {
    id: reviewed.id,
    selectionOrder: reviewed.order,
    prompt: reviewed.prompt,
    targetText: reviewed.targetText,
    acceptedVariants: [...reviewed.acceptedVariants],
    slots: createSlots(
      reviewed,
      grammarItemIds,
      vocabulary,
      vocabularyMatch?.tokenIndexes ?? [],
    ),
    primaryItemId,
    secondaryItemIds,
    vocabularyItemId: vocabulary.itemId,
  }
}

function createSlots(
  reviewed: ReviewedExerciseSentence,
  grammarItemIds: string[],
  vocabulary: LessonVocabularySeed,
  vocabularyTokenIndexes: number[],
): PreparedExerciseSeed['slots'] {
  const targetTokens = tokenize(reviewed.targetText)
  const acceptedByIndex = targetTokens.map((token) => new Set([token]))
  const optionalIndexes = new Set<number>()

  for (const variant of reviewed.acceptedVariants) {
    const variantTokens = tokenize(variant)
    if (variantTokens.length === targetTokens.length) {
      const differences = targetTokens.flatMap((token, index) =>
        token === variantTokens[index] ? [] : [index],
      )
      if (differences.length === 1) {
        acceptedByIndex[differences[0]!]!.add(variantTokens[differences[0]!]!)
      }
      continue
    }

    if (variantTokens.length === targetTokens.length - 1) {
      const omittedIndex = targetTokens.findIndex((_, index) =>
        targetTokens
          .filter((__, candidateIndex) => candidateIndex !== index)
          .every(
            (token, candidateIndex) => token === variantTokens[candidateIndex],
          ),
      )
      if (omittedIndex >= 0) optionalIndexes.add(omittedIndex)
    }
  }

  return targetTokens.map((token, index) => ({
    role: slotRole(
      token,
      index,
      reviewed.id,
      vocabulary,
      vocabularyTokenIndexes,
    ),
    accepted: [...acceptedByIndex[index]!],
    itemIds: unique([
      ...grammarItemIds,
      ...(vocabularyTokenIndexes.includes(index) ||
      (vocabularyTokenIndexes.length === 0 && index === 0)
        ? [vocabulary.itemId]
        : []),
    ]),
    ...(optionalIndexes.has(index) ? { optional: true } : {}),
  }))
}

function slotRole(
  token: string,
  index: number,
  exerciseId: string,
  vocabulary: LessonVocabularySeed,
  vocabularyTokenIndexes: number[],
) {
  if (SUBJECT_FORMS.has(token)) return 'subject'
  if (NEGATIVE_VERB_FORMS.has(token)) return 'negativeVerb'
  if (token.endsWith('ko') || token.endsWith('kö')) return 'questionVerb'
  const group = exerciseGroup(exerciseId)
  if (vocabularyTokenIndexes.includes(index)) {
    return `vocabulary${capitalize(vocabulary.partOfSpeech)}${group}`
  }
  return `context${index + 1}${group}`
}

function exerciseGroup(exerciseId: string) {
  const raw = exerciseId.split('.').at(-2) ?? 'reviewed'
  return raw
    .split(/[^A-Za-z0-9]+/u)
    .filter(Boolean)
    .map(capitalize)
    .join('')
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}

function inferSpecificSkillIds(
  lesson: CourseLessonSeed,
  reviewed: ReviewedExerciseSentence,
) {
  const normalizedTarget = ` ${normalize(reviewed.targetText)} `
  const isNegative = [...NEGATIVE_VERB_FORMS].some((form) =>
    normalizedTarget.includes(` ${form} `),
  )
  const isQuestion = reviewed.targetText.trim().endsWith('?')

  return lesson.skills.flatMap((skill) => {
    if (skill.id.endsWith('.negative') && isNegative) return [skill.id]
    if (skill.id.endsWith('.question') && isQuestion) return [skill.id]
    if (
      skill.id.endsWith('.partitive') &&
      reviewed.id.includes('.partitive.')
    ) {
      return [skill.id]
    }
    if (skill.id.endsWith('.total') && reviewed.id.includes('.total.')) {
      return [skill.id]
    }
    if (skill.id.endsWith('.singular') && reviewed.id.includes('.singular.')) {
      return [skill.id]
    }
    if (skill.id.endsWith('.plural') && reviewed.id.includes('.plural.')) {
      return [skill.id]
    }
    for (const marker of [
      'number',
      'quantity',
      'unit',
      'subject',
      'vowel',
      'stem',
      'derived',
      'special',
      'existential',
      'object',
      'inessive',
      'elative',
      'illative',
      'adessive',
      'ablative',
      'allative',
      'jen',
      'ien',
      'iden',
      'ten',
      'usage',
      'genitive',
      'internal',
      'external',
      'pluralgenitive',
    ]) {
      if (
        skill.id.endsWith(`.${marker}`) &&
        reviewed.id.includes(`.${marker}.`)
      ) {
        return [skill.id]
      }
    }
    if (skill.id.endsWith('.contrast')) {
      if (
        reviewed.id.includes('.contrast.') ||
        reviewed.id.includes('.negative.')
      ) {
        return [skill.id]
      }
    }
    return []
  })
}

function assignUncoveredVocabulary(
  drafts: ExerciseDraft[],
  lesson: CourseLessonSeed,
) {
  const currentVocabularyIds = new Set(
    lesson.vocabulary.map((item) => item.itemId),
  )
  const assignmentCounts = new Map<string, number>()

  for (const draft of drafts) {
    const itemId = draft.vocabulary?.itemId
    if (!itemId || !currentVocabularyIds.has(itemId)) continue
    assignmentCounts.set(itemId, (assignmentCounts.get(itemId) ?? 0) + 1)
  }

  const uncovered = lesson.vocabulary.filter(
    (item) => !assignmentCounts.has(item.itemId),
  )
  const remainingUncovered: LessonVocabularySeed[] = []

  for (const item of uncovered) {
    const draft = drafts.find((candidate) => {
      if (
        !candidate.matches.some((match) => match.item.itemId === item.itemId)
      ) {
        return false
      }
      const assignedItemId = candidate.vocabulary?.itemId
      if (!assignedItemId) return false
      return (
        !currentVocabularyIds.has(assignedItemId) ||
        (assignmentCounts.get(assignedItemId) ?? 0) > 1
      )
    })
    if (!draft) {
      remainingUncovered.push(item)
      continue
    }

    const previousItemId = draft.vocabulary?.itemId
    if (previousItemId && currentVocabularyIds.has(previousItemId)) {
      assignmentCounts.set(
        previousItemId,
        (assignmentCounts.get(previousItemId) ?? 1) - 1,
      )
    }
    draft.vocabulary = item
    assignmentCounts.set(item.itemId, 1)
  }

  const unassigned = drafts.filter((draft) => !draft.vocabulary)
  for (const item of remainingUncovered) {
    const draft = unassigned.shift()
    if (!draft) break
    draft.vocabulary = item
  }

  for (const draft of unassigned) {
    draft.vocabulary =
      draft.base &&
      lesson.vocabulary.find(
        (item) => item.itemId === draft.base?.vocabularyItemId,
      )
        ? lesson.vocabulary.find(
            (item) => item.itemId === draft.base?.vocabularyItemId,
          )
        : lesson.vocabulary[0]
  }
}

function selectVocabulary(
  matches: VocabularyMatch[],
  base: PreparedExerciseSeed | undefined,
  currentVocabularyIds: ReadonlySet<string>,
  vocabularyLessonById: ReadonlyMap<string, number>,
) {
  const preserved = base
    ? matches.find((match) => match.item.itemId === base.vocabularyItemId)
    : undefined
  if (preserved) return preserved.item

  const current = matches.find((match) =>
    currentVocabularyIds.has(match.item.itemId),
  )
  if (current) return current.item

  return [...matches].sort(
    (left, right) =>
      (vocabularyLessonById.get(right.item.itemId) ?? 0) -
      (vocabularyLessonById.get(left.item.itemId) ?? 0),
  )[0]?.item
}

function matchVocabulary(
  targetText: string,
  surfaceIndex: ReadonlyMap<string, VocabularyMatch[]>,
) {
  const matchesByItemId = new Map<string, VocabularyMatch>()

  tokenize(targetText).forEach((token, tokenIndex) => {
    const surfaces = [token]
    if (token.endsWith('ko') || token.endsWith('kö')) {
      surfaces.push(token.slice(0, -2))
    }

    for (const surface of surfaces) {
      for (const candidate of surfaceIndex.get(surface) ?? []) {
        const existing = matchesByItemId.get(candidate.item.itemId)
        if (existing) {
          if (!existing.tokenIndexes.includes(tokenIndex)) {
            existing.tokenIndexes.push(tokenIndex)
          }
          continue
        }
        matchesByItemId.set(candidate.item.itemId, {
          ...candidate,
          tokenIndexes: [tokenIndex],
        })
      }
    }
  })

  return [...matchesByItemId.values()]
}

function createVocabularySurfaceIndex(
  vocabulary: Array<{
    item: LessonVocabularySeed
    lessonPosition: number
  }>,
) {
  const index = new Map<string, VocabularyMatch[]>()

  for (const candidate of vocabulary) {
    const surfaces = unique([
      candidate.item.lemma,
      ...candidate.item.forms.map((form) => form.surface),
    ])
    for (const surface of surfaces) {
      const normalized = normalize(surface)
      if (!normalized || normalized.includes(' ')) continue
      const matches = index.get(normalized) ?? []
      matches.push({ ...candidate, tokenIndexes: [] })
      index.set(normalized, matches)
    }
  }

  return index
}

function parseReview(): Map<number, ReviewedExerciseSentence[]> {
  if (!Array.isArray(reviewedLessonSentences)) {
    throw new Error('Reviewed lesson sentences must be an array')
  }

  const globalIds = new Set<string>()
  const review = new Map<number, ReviewedExerciseSentence[]>()
  reviewedLessonSentences.forEach((entry, lessonIndex) => {
    const lessonNumber = String(lessonIndex + 1)
    if (!isRecord(entry) || Object.keys(entry).join(',') !== lessonNumber) {
      throw new Error(`Reviewed lesson ${lessonNumber} has an invalid wrapper`)
    }
    const exercises = (entry as Record<string, unknown>)[lessonNumber]
    if (!Array.isArray(exercises) || exercises.length !== 60) {
      throw new Error(
        `Reviewed lesson ${lessonNumber} must contain 60 exercises`,
      )
    }

    const parsed = exercises.map((exercise, exerciseIndex) => {
      if (
        !isRecord(exercise) ||
        exercise.order !== exerciseIndex + 1 ||
        typeof exercise.id !== 'string' ||
        typeof exercise.prompt !== 'string' ||
        typeof exercise.targetText !== 'string' ||
        !Array.isArray(exercise.acceptedVariants) ||
        !exercise.acceptedVariants.every(
          (variant) => typeof variant === 'string' && variant.length > 0,
        ) ||
        !exercise.acceptedVariants.includes(exercise.targetText)
      ) {
        throw new Error(
          `Reviewed lesson ${lessonNumber} exercise ${exerciseIndex + 1} is invalid`,
        )
      }
      if (globalIds.has(exercise.id)) {
        throw new Error(`Reviewed exercise id ${exercise.id} is duplicated`)
      }
      globalIds.add(exercise.id)
      return exercise as unknown as ReviewedExerciseSentence
    })
    review.set(lessonIndex + 1, parsed)
  })
  return review
}

function tokenize(value: string) {
  const normalized = normalize(value)
  return normalized ? normalized.split(' ') : []
}

function normalize(value: string) {
  return value
    .normalize('NFC')
    .trim()
    .replace(/\s+/gu, ' ')
    .replace(/[.!?…]+$/u, '')
    .trim()
    .toLocaleLowerCase('fi')
}

function unique(values: readonly string[]) {
  return [...new Set(values)]
}

function sameStrings(left: readonly string[], right: readonly string[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
