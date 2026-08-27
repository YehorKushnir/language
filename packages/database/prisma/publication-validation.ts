import {
  finnishTemplateSupportedItemIds,
  realizeFinnishIdentity,
  validateFinnishExerciseTemplate,
  type FinnishIdentityCategory,
} from '@language/language-fi'

import {
  ContentStatus,
  type DatabaseClient,
  ExerciseItemRole,
  ExerciseKind,
} from '../src/index.js'

const GENERATED_PUBLIC_STATUSES = new Set<ContentStatus>([
  ContentStatus.GENERATED,
  ContentStatus.VERIFIED,
  ContentStatus.CURATED,
])

export interface PublicationValidationReport {
  routeVersionId: string
  lessonCount: number
  knowledgeItemCount: number
  preparedExerciseCount: number
  generatedExerciseCount: number
  templateCount: number
  generatedCandidateCount: number
  textCount: number
  flashcardFallbackCount: number
  skillDependencyCount: number
  linkedAudioCount: number
  warnings: string[]
}

export class PublicationValidationError extends Error {
  constructor(readonly issues: string[]) {
    super(`Publication validation failed:\n- ${issues.join('\n- ')}`)
    this.name = 'PublicationValidationError'
  }
}

export async function validatePublishedCourse(
  prisma: DatabaseClient,
  routeVersionId: string,
): Promise<PublicationValidationReport> {
  const route = await prisma.courseRouteVersion.findUnique({
    where: { id: routeVersionId },
    include: {
      course: true,
      entries: {
        orderBy: [{ modulePosition: 'asc' }, { lessonPosition: 'asc' }],
        include: { lesson: true },
      },
      dependencies: true,
    },
  })
  if (!route) {
    throw new PublicationValidationError([
      `Route version ${routeVersionId} does not exist`,
    ])
  }

  const issues: string[] = []
  const warnings: string[] = []
  if (route.status !== ContentStatus.CURATED) {
    issues.push(`${route.id} must be CURATED before publication`)
  }
  if (!route.publishedAt) {
    issues.push(`${route.id} must have publishedAt`)
  }
  if (route.course.status !== ContentStatus.CURATED) {
    issues.push(`${route.courseId} must be CURATED before publication`)
  }
  if (route.course.sourceLanguage === route.course.targetLanguage) {
    issues.push(`${route.courseId} source and target languages must differ`)
  }
  if (route.entries.length === 0) {
    issues.push(`${route.id} must contain at least one lesson`)
  }

  const lessonIds = route.entries.map((entry) => entry.lessonId)
  const lessonOrder = new Map(
    route.entries.map((entry, index) => [entry.lessonId, index]),
  )
  for (const entry of route.entries) {
    if (entry.modulePosition < 1 || entry.lessonPosition < 1) {
      issues.push(`${entry.lessonId} has a non-positive route position`)
    }
    if (entry.lesson.courseId !== route.courseId) {
      issues.push(`${entry.lessonId} belongs to another course`)
    }
    if (entry.lesson.status !== ContentStatus.CURATED) {
      issues.push(`${entry.lessonId} must be CURATED before publication`)
    }
  }

  validateLessonDependencies(
    route.dependencies,
    new Set(lessonIds),
    lessonOrder,
    issues,
  )

  const lessonItems = await prisma.lessonKnowledgeItem.findMany({
    where: { lessonId: { in: lessonIds } },
    include: {
      item: {
        include: {
          lexicalSense: {
            include: {
              lexicalEntry: {
                include: { forms: { include: { audioAssets: true } } },
              },
            },
          },
        },
      },
    },
  })
  const introducedAt = new Map<string, number>()
  for (const lessonItem of lessonItems) {
    const order = lessonOrder.get(lessonItem.lessonId)
    if (order === undefined) continue
    introducedAt.set(
      lessonItem.itemId,
      Math.min(introducedAt.get(lessonItem.itemId) ?? order, order),
    )
    if (lessonItem.item.languageCode !== route.course.targetLanguage) {
      issues.push(
        `${lessonItem.itemId} must use target language ${route.course.targetLanguage}`,
      )
    }
    const lexicalSense = lessonItem.item.lexicalSense
    if (
      lexicalSense &&
      (lexicalSense.status !== ContentStatus.CURATED ||
        lexicalSense.lexicalEntry.status !== ContentStatus.CURATED)
    ) {
      issues.push(`${lessonItem.itemId} has unpublished lexical content`)
    }
    const exampleTarget = readVocabularyExampleTarget(lexicalSense?.metadata)
    if (
      lexicalSense &&
      exampleTarget &&
      lexicalSense.lexicalEntry.forms.length > 0 &&
      !lexicalSense.lexicalEntry.forms.some((form) =>
        containsFinnishForm(exampleTarget, form.surface),
      )
    ) {
      issues.push(
        `${lessonItem.itemId} example does not contain a form of ${lexicalSense.lexicalEntry.lemma}`,
      )
    }
  }

  const skillItemIds = lessonItems
    .filter((lessonItem) => !lessonItem.item.lexicalSense)
    .map((lessonItem) => lessonItem.itemId)
  const skillDependencies = await prisma.skillDependency.findMany({
    where: { skillId: { in: skillItemIds } },
  })
  validateSkillDependencies(
    skillDependencies,
    introducedAt,
    lessonOrder.size,
    issues,
  )

  const exercises = await prisma.exercise.findMany({
    where: { lessonId: { in: lessonIds } },
    include: { prompts: true, items: true, generated: true },
  })
  const preparedExercises = exercises.filter(
    (exercise) => exercise.kind === ExerciseKind.PREPARED,
  )
  const generatedExercises = exercises.filter(
    (exercise) => exercise.kind === ExerciseKind.GENERATED,
  )
  for (const lessonId of lessonIds) {
    const lessonExerciseCount = preparedExercises.filter(
      (exercise) =>
        exercise.lessonId === lessonId &&
        exercise.status === ContentStatus.CURATED,
    ).length
    if (lessonExerciseCount !== 60) {
      issues.push(
        `${lessonId} must have exactly 60 curated prepared exercises; received ${lessonExerciseCount}`,
      )
    }
  }
  for (const exercise of exercises) {
    if (exercise.status === ContentStatus.BLOCKED) {
      issues.push(`${exercise.id} is blocked but attached to a published route`)
      continue
    }
    if (
      exercise.kind === ExerciseKind.PREPARED &&
      exercise.status !== ContentStatus.CURATED
    ) {
      continue
    }
    if (
      exercise.kind === ExerciseKind.GENERATED &&
      !GENERATED_PUBLIC_STATUSES.has(exercise.status)
    ) {
      continue
    }
    if (exercise.kind === ExerciseKind.GENERATED && !exercise.generated) {
      issues.push(`${exercise.id} has no generation provenance`)
    }
    validateExercise(
      exercise,
      route.course.sourceLanguage,
      route.course.targetLanguage,
      introducedAt,
      lessonOrder,
      route.id,
      issues,
    )
  }

  const templates = await prisma.exerciseTemplate.findMany({
    where: { courseId: route.courseId },
  })
  let generatedCandidateCount = 0
  const curatedTemplateCountByLesson = new Map<string, number>()
  for (const template of templates) {
    if (template.status === ContentStatus.BLOCKED) {
      issues.push(`${template.id} is blocked in a published course`)
      continue
    }
    if (template.status !== ContentStatus.CURATED) continue
    try {
      validateFinnishExerciseTemplate(template.definition)
      const definition = template.definition
      if (
        definition.sourceLanguage !== route.course.sourceLanguage ||
        definition.targetLanguage !== route.course.targetLanguage
      ) {
        issues.push(`${template.id} language pair does not match the course`)
      }
      const templateLessonOrder = lessonOrder.get(definition.lessonId)
      if (templateLessonOrder === undefined) {
        issues.push(`${template.id} references a lesson outside the route`)
        continue
      }
      curatedTemplateCountByLesson.set(
        definition.lessonId,
        (curatedTemplateCountByLesson.get(definition.lessonId) ?? 0) + 1,
      )
      for (const itemId of finnishTemplateSupportedItemIds(definition)) {
        const itemOrder = introducedAt.get(itemId)
        if (itemOrder === undefined || itemOrder > templateLessonOrder) {
          issues.push(`${template.id} uses unavailable item ${itemId}`)
        }
      }
      if (definition.frame === 'identity') {
        const targets = new Set<string>()
        for (const category of [
          'affirmative',
          'negative',
          'question',
        ] as FinnishIdentityCategory[]) {
          for (const person of definition.personKeys) {
            for (const complement of definition.complements) {
              const candidate = realizeFinnishIdentity(definition, {
                category,
                person,
                complementKey: complement.key,
              })
              generatedCandidateCount += 1
              targets.add(candidate.targetText)
              if (!candidate.acceptedVariants.includes(candidate.targetText)) {
                issues.push(
                  `${template.id} does not accept generated target ${candidate.targetText}`,
                )
              }
              const mappedItems = new Set(
                candidate.slots.flatMap((slot) => slot.itemIds),
              )
              if (
                !mappedItems.has(candidate.grammarItemId) ||
                !mappedItems.has(candidate.vocabularyItemId)
              ) {
                issues.push(`${template.id} generates an incomplete AnswerSpec`)
              }
            }
          }
        }
        const expectedCount =
          3 * definition.personKeys.length * definition.complements.length
        if (targets.size !== expectedCount) {
          issues.push(`${template.id} generates duplicate target sentences`)
        }
      } else {
        const referencedExercises = preparedExercises.filter((exercise) =>
          definition.exerciseIds.includes(exercise.id),
        )
        const referencedExerciseIds = new Set(
          referencedExercises.map((exercise) => exercise.id),
        )
        for (const exerciseId of definition.exerciseIds) {
          if (!referencedExerciseIds.has(exerciseId)) {
            issues.push(
              `${template.id} references unavailable prepared exercise ${exerciseId}`,
            )
          }
        }
        const coveredItemIds = new Set(
          referencedExercises.flatMap((exercise) =>
            exercise.items
              .filter((item) => item.role !== ExerciseItemRole.CONTEXT)
              .map((item) => item.itemId),
          ),
        )
        for (const itemId of definition.supportedItemIds) {
          if (!coveredItemIds.has(itemId)) {
            issues.push(`${template.id} does not cover item ${itemId}`)
          }
        }
        for (const exercise of referencedExercises) {
          if (exercise.lessonId !== definition.lessonId) {
            issues.push(
              `${template.id} references exercise ${exercise.id} from another lesson`,
            )
          }
          const answerSpec = readAnswerSpec(exercise.answerSpec)
          if (answerSpec) {
            generatedCandidateCount += answerSpec.acceptedVariants.length
          }
        }
      }
    } catch (error) {
      issues.push(
        `${template.id} has an invalid definition: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
  }
  if (
    !templates.some((template) => template.status === ContentStatus.CURATED)
  ) {
    issues.push(`${route.courseId} has no curated exercise template`)
  }
  for (const lessonId of lessonIds) {
    const templateCount = curatedTemplateCountByLesson.get(lessonId) ?? 0
    if (templateCount !== 1) {
      issues.push(
        `${lessonId} must have exactly one curated exercise template; received ${templateCount}`,
      )
    }
  }
  const testedItemIds = new Set(
    exercises
      .filter(
        (exercise) =>
          exercise.status === ContentStatus.CURATED ||
          (exercise.kind === ExerciseKind.GENERATED &&
            GENERATED_PUBLIC_STATUSES.has(exercise.status)),
      )
      .flatMap((exercise) =>
        exercise.items
          .filter((item) => item.role !== ExerciseItemRole.CONTEXT)
          .map((item) => item.itemId),
      ),
  )
  for (const itemId of introducedAt.keys()) {
    if (!testedItemIds.has(itemId)) {
      issues.push(`${itemId} has no exercise coverage`)
    }
  }

  const texts = await prisma.text.findMany({
    where: { courseId: route.courseId, status: ContentStatus.CURATED },
    include: {
      audioAssets: true,
      tokens: { orderBy: { position: 'asc' } },
      knowledgeItems: {
        include: {
          item: {
            include: { lexicalSense: { include: { lexicalEntry: true } } },
          },
        },
      },
    },
  })
  const routeItemIds = new Set(introducedAt.keys())
  const flashcardFallbackItemIds = new Set<string>()
  for (const text of texts) {
    for (const textItem of text.knowledgeItems) {
      if (routeItemIds.has(textItem.itemId)) continue

      const lexicalSense = textItem.item.lexicalSense
      if (
        textItem.item.languageCode !== route.course.targetLanguage ||
        !lexicalSense ||
        lexicalSense.status !== ContentStatus.CURATED ||
        lexicalSense.lexicalEntry.status !== ContentStatus.CURATED
      ) {
        issues.push(`${text.id} uses knowledge outside the published route`)
      } else {
        flashcardFallbackItemIds.add(textItem.itemId)
      }
    }
    text.tokens.forEach((token, index) => {
      if (token.position !== index) {
        issues.push(`${text.id} token positions are not contiguous`)
      }
      if (
        token.charStart < 0 ||
        token.charStart >= token.charEnd ||
        text.body.slice(token.charStart, token.charEnd) !== token.surface
      ) {
        issues.push(`${text.id} token ${token.position} has an invalid range`)
      }
      if (
        token.lexicalSenseId &&
        !text.knowledgeItems.some(
          (item) => item.itemId === token.lexicalSenseId,
        )
      ) {
        issues.push(
          `${text.id} token ${token.position} references an undeclared lexical sense`,
        )
      }
    })
  }

  const linkedAudioCount =
    texts.filter((text) => text.audioAssets.length > 0).length +
    lessonItems.filter(
      (lessonItem) =>
        lessonItem.item.lexicalSense?.lexicalEntry.forms?.some(
          (form) => form.audioAssets.length > 0,
        ) ?? false,
    ).length
  if (linkedAudioCount === 0) {
    warnings.push('Published course has no prepared audio assets yet')
  }

  if (issues.length > 0) throw new PublicationValidationError(issues)
  return {
    routeVersionId,
    lessonCount: lessonIds.length,
    knowledgeItemCount: introducedAt.size,
    preparedExerciseCount: preparedExercises.filter(
      (exercise) => exercise.status === ContentStatus.CURATED,
    ).length,
    generatedExerciseCount: generatedExercises.filter((exercise) =>
      GENERATED_PUBLIC_STATUSES.has(exercise.status),
    ).length,
    templateCount: templates.filter(
      (template) => template.status === ContentStatus.CURATED,
    ).length,
    generatedCandidateCount,
    textCount: texts.length,
    flashcardFallbackCount: flashcardFallbackItemIds.size,
    skillDependencyCount: skillDependencies.length,
    linkedAudioCount,
    warnings,
  }
}

function readVocabularyExampleTarget(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }
  const example = (metadata as Record<string, unknown>).example
  if (!example || typeof example !== 'object' || Array.isArray(example)) {
    return null
  }
  const target = (example as Record<string, unknown>).target
  return typeof target === 'string' && target.trim() ? target : null
}

function containsFinnishForm(example: string, surface: string): boolean {
  const normalize = (value: string) =>
    ` ${value
      .normalize('NFC')
      .toLocaleLowerCase('fi')
      .replace(/[^\p{L}\p{M}-]+/gu, ' ')
      .trim()} `

  return normalize(example).includes(normalize(surface))
}

function validateLessonDependencies(
  dependencies: Array<{ lessonId: string; prerequisiteLessonId: string }>,
  lessonIds: Set<string>,
  lessonOrder: Map<string, number>,
  issues: string[],
) {
  const graph = new Map<string, string[]>()
  for (const dependency of dependencies) {
    if (
      !lessonIds.has(dependency.lessonId) ||
      !lessonIds.has(dependency.prerequisiteLessonId)
    ) {
      issues.push('Lesson dependency references a lesson outside the route')
      continue
    }
    if (dependency.lessonId === dependency.prerequisiteLessonId) {
      issues.push(`${dependency.lessonId} depends on itself`)
    }
    if (
      (lessonOrder.get(dependency.prerequisiteLessonId) ?? Infinity) >=
      (lessonOrder.get(dependency.lessonId) ?? -1)
    ) {
      issues.push(
        `${dependency.lessonId} depends on a lesson that is not earlier in the route`,
      )
    }
    graph.set(dependency.lessonId, [
      ...(graph.get(dependency.lessonId) ?? []),
      dependency.prerequisiteLessonId,
    ])
  }
  if (hasCycle(graph)) issues.push('Lesson dependencies contain a cycle')
}

function validateSkillDependencies(
  dependencies: Array<{ skillId: string; prerequisiteSkillId: string }>,
  introducedAt: Map<string, number>,
  lessonCount: number,
  issues: string[],
) {
  const graph = new Map<string, string[]>()
  for (const dependency of dependencies) {
    const skillOrder = introducedAt.get(dependency.skillId)
    const prerequisiteOrder = introducedAt.get(dependency.prerequisiteSkillId)
    if (skillOrder === undefined || prerequisiteOrder === undefined) {
      issues.push(
        `${dependency.skillId} has a prerequisite outside the published route`,
      )
      continue
    }
    if (prerequisiteOrder > skillOrder || skillOrder >= lessonCount) {
      issues.push(
        `${dependency.skillId} is introduced before its prerequisite ${dependency.prerequisiteSkillId}`,
      )
    }
    graph.set(dependency.skillId, [
      ...(graph.get(dependency.skillId) ?? []),
      dependency.prerequisiteSkillId,
    ])
  }
  if (hasCycle(graph)) issues.push('Skill dependencies contain a cycle')
}

function validateExercise(
  exercise: {
    id: string
    lessonId: string | null
    targetLanguage: string
    targetText: string
    answerSpec: unknown
    prompts: Array<{ sourceLanguage: string; text: string }>
    items: Array<{ itemId: string; role: ExerciseItemRole }>
    generated: { routeVersionId: string } | null
  },
  sourceLanguage: string,
  targetLanguage: string,
  introducedAt: Map<string, number>,
  lessonOrder: Map<string, number>,
  routeVersionId: string,
  issues: string[],
) {
  const order = exercise.lessonId
    ? lessonOrder.get(exercise.lessonId)
    : undefined
  if (order === undefined) {
    issues.push(`${exercise.id} is not attached to a route lesson`)
    return
  }
  if (exercise.targetLanguage !== targetLanguage) {
    issues.push(`${exercise.id} has the wrong target language`)
  }
  if (
    !exercise.prompts.some(
      (prompt) =>
        prompt.sourceLanguage === sourceLanguage && prompt.text.trim(),
    )
  ) {
    issues.push(`${exercise.id} has no ${sourceLanguage} prompt`)
  }
  if (
    exercise.generated &&
    exercise.generated.routeVersionId !== routeVersionId
  ) {
    issues.push(`${exercise.id} belongs to another route version`)
  }
  if (!exercise.items.some((item) => item.role === ExerciseItemRole.PRIMARY)) {
    issues.push(`${exercise.id} has no primary knowledge item`)
  }
  for (const item of exercise.items) {
    const itemOrder = introducedAt.get(item.itemId)
    if (itemOrder === undefined || itemOrder > order) {
      issues.push(`${exercise.id} uses unavailable item ${item.itemId}`)
    }
  }

  if (!isRecord(exercise.answerSpec)) {
    issues.push(`${exercise.id} has an invalid AnswerSpec`)
    return
  }
  const acceptedVariants = exercise.answerSpec.acceptedVariants
  const slots = exercise.answerSpec.slots
  if (
    !Array.isArray(acceptedVariants) ||
    !acceptedVariants.every((value) => typeof value === 'string' && value) ||
    !acceptedVariants.includes(exercise.targetText)
  ) {
    issues.push(`${exercise.id} AnswerSpec does not accept its target text`)
  }
  if (!Array.isArray(slots) || !slots.every(isAnswerSlot)) {
    issues.push(`${exercise.id} has invalid AnswerSpec slots`)
    return
  }
  const mappedItems = new Set(
    slots.flatMap((slot) => (slot as { itemIds: string[] }).itemIds),
  )
  for (const item of exercise.items) {
    if (
      item.role !== ExerciseItemRole.CONTEXT &&
      !mappedItems.has(item.itemId)
    ) {
      issues.push(`${exercise.id} does not map tested item ${item.itemId}`)
    }
  }
}

function isAnswerSlot(value: unknown): boolean {
  if (!isRecord(value)) return false
  return (
    typeof value.role === 'string' &&
    Array.isArray(value.accepted) &&
    value.accepted.every((item) => typeof item === 'string' && item) &&
    Array.isArray(value.itemIds) &&
    value.itemIds.every((item) => typeof item === 'string' && item)
  )
}

function readAnswerSpec(value: unknown): { acceptedVariants: string[] } | null {
  if (!isRecord(value) || !Array.isArray(value.acceptedVariants)) return null
  if (
    !value.acceptedVariants.every(
      (item) => typeof item === 'string' && item.length > 0,
    )
  ) {
    return null
  }
  return { acceptedVariants: value.acceptedVariants }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasCycle(graph: Map<string, string[]>): boolean {
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const visit = (node: string): boolean => {
    if (visiting.has(node)) return true
    if (visited.has(node)) return false
    visiting.add(node)
    if ((graph.get(node) ?? []).some(visit)) return true
    visiting.delete(node)
    visited.add(node)
    return false
  }
  return [...graph.keys()].some(visit)
}
