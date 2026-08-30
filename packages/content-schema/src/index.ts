import { z } from 'zod'

const identifierSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[\p{L}\p{N}][\p{L}\p{N}._-]*$/u)

const slotRoleSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z][A-Za-z0-9]*$/u)

export const localizedTextSchema = z
  .record(z.string().min(2).max(12), z.string().trim().min(1))
  .refine((value) => Boolean(value.ru), 'Russian localization is required')

const explanationExampleSchema = z
  .object({
    target: z.string().trim().min(1),
    source: localizedTextSchema,
  })
  .strict()

const explanationTableSchema = z
  .object({
    headers: z.array(localizedTextSchema).min(1),
    rows: z.array(z.array(localizedTextSchema).min(1)).min(1),
  })
  .superRefine((table, context) => {
    table.rows.forEach((row, index) => {
      if (row.length !== table.headers.length) {
        context.addIssue({
          code: 'custom',
          message: 'Table row width must match the header width',
          path: ['rows', index],
        })
      }
    })
  })

const explanationScreenSchema = z
  .object({
    id: identifierSchema,
    title: localizedTextSchema,
    paragraphs: z.array(localizedTextSchema).min(1),
    table: explanationTableSchema.optional(),
    examples: z.array(explanationExampleSchema).min(1).optional(),
    callout: localizedTextSchema.optional(),
  })
  .strict()

export const lessonContentSchema = z.object({
  version: z.number().int().positive(),
  sections: z
    .array(z.enum(['explanation', 'vocabulary', 'practice']))
    .length(3),
  explanationScreens: z.array(explanationScreenSchema).min(1),
})

const vocabularyFormSchema = z.object({
  id: identifierSchema,
  surface: z.string().trim().min(1),
  features: z.record(z.string().min(1), z.string().min(1)),
})

export const lessonVocabularyItemSchema = z.object({
  key: identifierSchema,
  itemId: identifierSchema,
  conceptId: identifierSchema,
  lexicalEntryId: identifierSchema,
  lemma: z.string().trim().min(1),
  partOfSpeech: z.enum(['noun', 'adjective', 'adverb', 'pronoun', 'verb']),
  gloss: z.string().trim().min(1),
  example: z.object({
    target: z.string().trim().min(1),
    source: localizedTextSchema,
  }),
  semanticTypes: z.array(z.string().trim().min(1)).min(1),
  singular: z.string().trim().min(1),
  plural: z.string().trim().min(1),
  sourceSingular: z.string().trim().min(1),
  sourcePlural: z.string().trim().min(1),
  forms: z.array(vocabularyFormSchema).min(1),
})

const exerciseSlotSchema = z.object({
  role: slotRoleSchema,
  accepted: z.array(z.string().trim().min(1)).min(1),
  itemIds: z.array(identifierSchema).min(1),
  optional: z.boolean().optional(),
})

export const preparedExerciseSchema = z.object({
  id: identifierSchema,
  selectionOrder: z.number().int().positive(),
  prompt: z.string().trim().min(1),
  targetText: z.string().trim().min(1),
  acceptedVariants: z.array(z.string().trim().min(1)).min(1),
  slots: z.array(exerciseSlotSchema).min(1),
  primaryItemId: identifierSchema,
  secondaryItemIds: z.array(identifierSchema),
  vocabularyItemId: identifierSchema,
})

export const lessonBundleSchema = z.object({
  lessonId: identifierSchema,
  content: lessonContentSchema,
  vocabulary: z.array(lessonVocabularyItemSchema).min(1),
  exercises: z.array(preparedExerciseSchema).min(1),
})

export type LessonBundle = z.infer<typeof lessonBundleSchema>

const preparedTextTokenSchema = z.object({
  position: z.number().int().nonnegative(),
  surface: z.string().min(1),
  lemma: z.string().trim().min(1),
  lexicalSenseId: identifierSchema.optional(),
  analysis: z.record(z.string().min(1), z.string().min(1)),
  charStart: z.number().int().nonnegative(),
  charEnd: z.number().int().positive(),
})

export const preparedTextSchema = z.object({
  id: identifierSchema,
  courseId: identifierSchema,
  title: localizedTextSchema,
  level: z.string().trim().min(1).max(16),
  topics: z.array(z.string().trim().min(1)).min(1),
  body: z.string().trim().min(1),
  knowledgeItemIds: z.array(identifierSchema).min(1),
  tokens: z.array(preparedTextTokenSchema).min(1),
})

export type PreparedText = z.infer<typeof preparedTextSchema>

export interface PreparedTextValidationReport {
  textCount: number
  tokenCount: number
  lexicalTokenCount: number
}

export function validatePreparedTexts(
  value: unknown,
): PreparedTextValidationReport {
  const parsed = z.array(preparedTextSchema).min(1).safeParse(value)
  if (!parsed.success) {
    throw new ContentValidationError(
      parsed.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'texts'
        return `${path}: ${issue.message}`
      }),
    )
  }

  const issues: string[] = []
  requireUnique(
    parsed.data.map((text) => text.id),
    'prepared text ids',
    issues,
  )

  for (const text of parsed.data) {
    requireUnique(
      text.knowledgeItemIds,
      `${text.id} knowledge item ids`,
      issues,
    )
    requireUnique(
      text.tokens.map((token) => token.position),
      `${text.id} token positions`,
      issues,
    )

    text.tokens.forEach((token, index) => {
      if (token.position !== index) {
        issues.push(
          `${text.id} token positions must be contiguous and start at 0`,
        )
      }
      if (token.charStart >= token.charEnd) {
        issues.push(`${text.id} token ${index} has an invalid character range`)
      }
      if (text.body.slice(token.charStart, token.charEnd) !== token.surface) {
        issues.push(`${text.id} token ${index} does not match the text body`)
      }
      if (
        token.lexicalSenseId &&
        !text.knowledgeItemIds.includes(token.lexicalSenseId)
      ) {
        issues.push(
          `${text.id} token ${index} references undeclared item ${token.lexicalSenseId}`,
        )
      }
    })
  }

  if (issues.length > 0) {
    throw new ContentValidationError(issues)
  }

  return {
    textCount: parsed.data.length,
    tokenCount: parsed.data.reduce(
      (total, text) => total + text.tokens.length,
      0,
    ),
    lexicalTokenCount: parsed.data.reduce(
      (total, text) =>
        total + text.tokens.filter((token) => token.lexicalSenseId).length,
      0,
    ),
  }
}

export interface LessonValidationOptions {
  allowedVocabularyItemIds?: readonly string[]
  expectedExerciseCount?: number
  minimumExampleCount?: number
  minimumVocabularyCount?: number
}

export interface LessonValidationReport {
  lessonId: string
  explanationScreenCount: number
  exampleCount: number
  vocabularyCount: number
  exerciseCount: number
}

export class ContentValidationError extends Error {
  constructor(readonly issues: string[]) {
    super(`Content validation failed:\n- ${issues.join('\n- ')}`)
    this.name = 'ContentValidationError'
  }
}

export function validateLessonBundle(
  value: unknown,
  options: LessonValidationOptions = {},
): LessonValidationReport {
  const parsed = lessonBundleSchema.safeParse(value)
  if (!parsed.success) {
    throw new ContentValidationError(
      parsed.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'bundle'
        return `${path}: ${issue.message}`
      }),
    )
  }

  const bundle = parsed.data
  const issues: string[] = []
  requireUnique(bundle.content.sections, 'lesson sections', issues)
  requireUnique(
    bundle.content.explanationScreens.map((screen) => screen.id),
    'explanation screen ids',
    issues,
  )
  requireUnique(
    bundle.vocabulary.map((item) => item.key),
    'vocabulary keys',
    issues,
  )
  requireUnique(
    bundle.vocabulary.map((item) => item.itemId),
    'vocabulary item ids',
    issues,
  )
  requireUnique(
    bundle.vocabulary.flatMap((item) => item.forms.map((form) => form.id)),
    'vocabulary form ids',
    issues,
  )
  requireUnique(
    bundle.exercises.map((exercise) => exercise.id),
    'exercise ids',
    issues,
  )
  requireUnique(
    bundle.exercises.map((exercise) => exercise.selectionOrder),
    'exercise selection orders',
    issues,
  )

  const sortedOrders = bundle.exercises
    .map((exercise) => exercise.selectionOrder)
    .sort((left, right) => left - right)
  if (!sortedOrders.every((order, index) => order === index + 1)) {
    issues.push('exercise selection orders must be contiguous and start at 1')
  }

  const vocabularyIds = new Set(bundle.vocabulary.map((item) => item.itemId))
  const allowedVocabularyIds = new Set([
    ...vocabularyIds,
    ...(options.allowedVocabularyItemIds ?? []),
  ])
  for (const exercise of bundle.exercises) {
    if (!allowedVocabularyIds.has(exercise.vocabularyItemId)) {
      issues.push(
        `${exercise.id} references unknown vocabulary item ${exercise.vocabularyItemId}`,
      )
    }

    const declaredItemIds = new Set([
      exercise.primaryItemId,
      ...exercise.secondaryItemIds,
      exercise.vocabularyItemId,
    ])
    const mappedItemIds = new Set(
      exercise.slots.flatMap((slot) => slot.itemIds),
    )
    for (const itemId of mappedItemIds) {
      if (!declaredItemIds.has(itemId)) {
        issues.push(`${exercise.id} maps a slot to undeclared item ${itemId}`)
      }
    }
    for (const itemId of declaredItemIds) {
      if (!mappedItemIds.has(itemId)) {
        issues.push(`${exercise.id} does not map a slot to item ${itemId}`)
      }
    }
  }
  for (const item of bundle.vocabulary) {
    if (
      !bundle.exercises.some((exercise) =>
        exercise.slots.some((slot) => slot.itemIds.includes(item.itemId)),
      )
    ) {
      issues.push(`${item.itemId} is not covered by a prepared exercise`)
    }
  }

  const exampleCount = bundle.content.explanationScreens.reduce(
    (total, screen) => total + (screen.examples?.length ?? 0),
    0,
  )
  if (
    options.expectedExerciseCount !== undefined &&
    bundle.exercises.length !== options.expectedExerciseCount
  ) {
    issues.push(
      `expected ${options.expectedExerciseCount} exercises, received ${bundle.exercises.length}`,
    )
  }
  if (
    options.minimumVocabularyCount !== undefined &&
    bundle.vocabulary.length < options.minimumVocabularyCount
  ) {
    issues.push(
      `expected at least ${options.minimumVocabularyCount} vocabulary items, received ${bundle.vocabulary.length}`,
    )
  }
  if (
    options.minimumExampleCount !== undefined &&
    exampleCount < options.minimumExampleCount
  ) {
    issues.push(
      `expected at least ${options.minimumExampleCount} examples, received ${exampleCount}`,
    )
  }

  if (issues.length > 0) {
    throw new ContentValidationError(issues)
  }

  return {
    lessonId: bundle.lessonId,
    explanationScreenCount: bundle.content.explanationScreens.length,
    exampleCount,
    vocabularyCount: bundle.vocabulary.length,
    exerciseCount: bundle.exercises.length,
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
