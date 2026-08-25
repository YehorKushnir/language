import type { PreparedAnswerSpec } from '@language/contracts'

export const EXERCISE_CHECKER_VERSION = 'structured-v4-all-diagnostics-voikko'

export function toPreparedAnswerSpec(value: unknown): PreparedAnswerSpec {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { acceptedVariants: [], slots: [] }
  }

  const candidate = value as Record<string, unknown>
  const acceptedVariants = candidate.acceptedVariants
  return {
    acceptedVariants: Array.isArray(acceptedVariants)
      ? acceptedVariants.filter(
          (variant): variant is string => typeof variant === 'string',
        )
      : [],
    slots: Array.isArray(candidate.slots)
      ? candidate.slots.flatMap((slot) => {
          if (!slot || typeof slot !== 'object' || Array.isArray(slot)) {
            return []
          }

          const slotCandidate = slot as Record<string, unknown>
          const accepted = Array.isArray(slotCandidate.accepted)
            ? slotCandidate.accepted.filter(
                (variant): variant is string => typeof variant === 'string',
              )
            : []
          const itemIds = Array.isArray(slotCandidate.itemIds)
            ? slotCandidate.itemIds.filter(
                (itemId): itemId is string => typeof itemId === 'string',
              )
            : []
          return typeof slotCandidate.role === 'string' && accepted.length > 0
            ? [
                {
                  role: slotCandidate.role,
                  accepted,
                  itemIds,
                  ...(slotCandidate.optional === true
                    ? { optional: true }
                    : {}),
                },
              ]
            : []
        })
      : [],
  }
}
