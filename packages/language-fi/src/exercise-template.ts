import {
  validateFinnishIdentityTemplate,
  type FinnishIdentityTemplateDefinition,
} from './identity-realizer.js'
import {
  validateFinnishPreparedVariationTemplate,
  type FinnishPreparedVariationTemplateDefinition,
} from './prepared-variation-realizer.js'

export type FinnishExerciseTemplateDefinition =
  FinnishIdentityTemplateDefinition | FinnishPreparedVariationTemplateDefinition

export function validateFinnishExerciseTemplate(
  value: unknown,
): asserts value is FinnishExerciseTemplateDefinition {
  if (!isRecord(value)) {
    throw new Error('Finnish exercise template must be an object')
  }
  if (value.frame === 'identity') {
    validateFinnishIdentityTemplate(value)
    return
  }
  if (value.frame === 'prepared-variation') {
    validateFinnishPreparedVariationTemplate(value)
    return
  }
  throw new Error(
    `Unsupported Finnish exercise template frame ${String(value.frame)}`,
  )
}

export function finnishTemplateSupportedItemIds(
  definition: FinnishExerciseTemplateDefinition,
): string[] {
  return definition.frame === 'identity'
    ? [
        ...Object.values(definition.grammarItems),
        ...definition.complements.map((item) => item.itemId),
      ]
    : definition.supportedItemIds
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
