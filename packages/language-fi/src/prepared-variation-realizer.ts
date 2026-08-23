export interface FinnishPreparedVariationTemplateDefinition {
  schemaVersion: 1
  frame: 'prepared-variation'
  lessonId: string
  sourceLanguage: 'ru'
  targetLanguage: 'fi'
  exerciseIds: string[]
  supportedItemIds: string[]
}

export interface FinnishPreparedVariationParameters {
  exerciseId: string
  variantIndex: number
}

export interface FinnishPreparedVariationSlot {
  role: string
  accepted: string[]
  itemIds: string[]
  optional?: boolean
}

export interface FinnishPreparedVariationSource {
  exerciseId: string
  prompt: string
  targetText: string
  acceptedVariants: string[]
  slots: FinnishPreparedVariationSlot[]
}

export interface FinnishGeneratedPreparedVariation {
  parameters: FinnishPreparedVariationParameters
  sourceExerciseId: string
  prompt: string
  targetText: string
  acceptedVariants: string[]
  slots: FinnishPreparedVariationSlot[]
}

export function realizeFinnishPreparedVariation(
  definition: FinnishPreparedVariationTemplateDefinition,
  source: FinnishPreparedVariationSource,
  parameters: FinnishPreparedVariationParameters,
): FinnishGeneratedPreparedVariation {
  validateFinnishPreparedVariationTemplate(definition)
  validateSource(source)

  if (parameters.exerciseId !== source.exerciseId) {
    throw new Error('Prepared variation parameters reference another exercise')
  }
  if (!definition.exerciseIds.includes(source.exerciseId)) {
    throw new Error(
      `Exercise ${source.exerciseId} is not enabled by prepared variation template`,
    )
  }
  if (
    !Number.isInteger(parameters.variantIndex) ||
    parameters.variantIndex < 0 ||
    parameters.variantIndex >= source.acceptedVariants.length
  ) {
    throw new Error(
      `Variant ${parameters.variantIndex} is not available for ${source.exerciseId}`,
    )
  }

  return {
    parameters,
    sourceExerciseId: source.exerciseId,
    prompt: source.prompt,
    targetText: source.acceptedVariants[parameters.variantIndex]!,
    acceptedVariants: [...source.acceptedVariants],
    slots: source.slots.map((slot) => ({
      ...slot,
      accepted: [...slot.accepted],
      itemIds: [...slot.itemIds],
    })),
  }
}

export function validateFinnishPreparedVariationTemplate(
  value: unknown,
): asserts value is FinnishPreparedVariationTemplateDefinition {
  if (!isRecord(value)) {
    throw new Error('Finnish prepared variation template must be an object')
  }
  if (
    value.schemaVersion !== 1 ||
    value.frame !== 'prepared-variation' ||
    value.sourceLanguage !== 'ru' ||
    value.targetLanguage !== 'fi'
  ) {
    throw new Error('Unsupported Finnish prepared variation template')
  }
  if (typeof value.lessonId !== 'string' || !value.lessonId) {
    throw new Error('Prepared variation template must declare a lesson')
  }
  assertUniqueStrings(
    value.exerciseIds,
    'Prepared variation template exercise ids',
  )
  assertUniqueStrings(
    value.supportedItemIds,
    'Prepared variation template knowledge item ids',
  )
}

function validateSource(
  source: FinnishPreparedVariationSource,
): asserts source is FinnishPreparedVariationSource {
  if (
    !source.exerciseId ||
    !source.prompt.trim() ||
    !source.targetText.trim()
  ) {
    throw new Error('Prepared variation source is incomplete')
  }
  if (
    source.acceptedVariants.length === 0 ||
    !source.acceptedVariants.includes(source.targetText)
  ) {
    throw new Error('Prepared variation source does not accept its target')
  }
  if (
    source.slots.length === 0 ||
    source.slots.some(
      (slot) =>
        !slot.role ||
        slot.accepted.length === 0 ||
        slot.itemIds.length === 0 ||
        slot.accepted.some((value) => !value) ||
        slot.itemIds.some((value) => !value),
    )
  ) {
    throw new Error('Prepared variation source has an invalid AnswerSpec')
  }
}

function assertUniqueStrings(value: unknown, label: string) {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => typeof item !== 'string' || !item)
  ) {
    throw new Error(`${label} must be a non-empty string array`)
  }
  if (new Set(value).size !== value.length) {
    throw new Error(`${label} must be unique`)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
