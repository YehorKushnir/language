export interface ExactAnswerSpec {
  acceptedVariants: string[]
}

export interface ExactAnswerCheckResult {
  isCorrect: boolean
  normalizedAnswer: string
  matchedVariant: string | null
}

export interface StructuredAnswerSlot {
  role: string
  accepted: string[]
}

export interface StructuredAnswerSpec extends ExactAnswerSpec {
  slots: StructuredAnswerSlot[]
}

export type StructuredAnswerDiagnosticCode =
  | 'EXACT_MATCH'
  | 'MISSING_TOKEN'
  | 'EXTRA_TOKEN'
  | 'WORD_ORDER'
  | 'WRONG_FORM'
  | 'ANSWER_MISMATCH'

export interface StructuredAnswerDiagnostic {
  code: StructuredAnswerDiagnosticCode
  slot?: string
  actual?: string
  expected?: string[]
}

export interface StructuredAnswerCheckResult extends ExactAnswerCheckResult {
  diagnostics: StructuredAnswerDiagnostic[]
}

export function normalizeExactAnswer(answer: string): string {
  return answer
    .normalize('NFC')
    .trim()
    .replace(/\s+/gu, ' ')
    .replace(/[.!?…]+$/u, '')
    .trim()
    .toLocaleLowerCase('fi-FI')
}

export function checkExactAnswer(
  answer: string,
  spec: ExactAnswerSpec,
): ExactAnswerCheckResult {
  const normalizedAnswer = normalizeExactAnswer(answer)
  const matchedVariant =
    spec.acceptedVariants.find(
      (variant) => normalizeExactAnswer(variant) === normalizedAnswer,
    ) ?? null

  return {
    isCorrect: matchedVariant !== null,
    normalizedAnswer,
    matchedVariant,
  }
}

export function checkStructuredAnswer(
  answer: string,
  spec: StructuredAnswerSpec,
): StructuredAnswerCheckResult {
  const exact = checkExactAnswer(answer, spec)
  if (exact.isCorrect) {
    return {
      ...exact,
      diagnostics: [{ code: 'EXACT_MATCH' }],
    }
  }

  const actualTokens = tokenizeNormalizedAnswer(exact.normalizedAnswer)
  const expectedSlots = spec.slots.map((slot) => ({
    ...slot,
    accepted: slot.accepted.map(normalizeExactAnswer),
  }))

  if (expectedSlots.length === 0) {
    return {
      ...exact,
      diagnostics: [{ code: 'ANSWER_MISMATCH' }],
    }
  }

  const positionalMatch = expectedSlots.every((slot, index) => {
    const token = actualTokens[index]
    return token !== undefined && slot.accepted.includes(token)
  })
  if (positionalMatch && actualTokens.length === expectedSlots.length) {
    return {
      ...exact,
      isCorrect: true,
      diagnostics: [{ code: 'EXACT_MATCH' }],
    }
  }

  if (actualTokens.length < expectedSlots.length) {
    const missingSlot = findMissingSlot(expectedSlots, actualTokens)
    return {
      ...exact,
      diagnostics: [
        {
          code: 'MISSING_TOKEN',
          ...(missingSlot
            ? {
                slot: missingSlot.role,
                expected: missingSlot.accepted,
              }
            : {}),
        },
      ],
    }
  }

  if (actualTokens.length > expectedSlots.length) {
    return {
      ...exact,
      diagnostics: [
        {
          code: 'EXTRA_TOKEN',
          actual: findExtraToken(expectedSlots, actualTokens),
        },
      ],
    }
  }

  if (tokensMatchWithoutOrder(expectedSlots, actualTokens)) {
    return {
      ...exact,
      diagnostics: [{ code: 'WORD_ORDER' }],
    }
  }

  const mismatchIndex = expectedSlots.findIndex((slot, index) => {
    const token = actualTokens[index]
    return token === undefined || !slot.accepted.includes(token)
  })
  const mismatchedSlot = expectedSlots[mismatchIndex]

  return {
    ...exact,
    diagnostics: mismatchedSlot
      ? [
          {
            code: 'WRONG_FORM',
            slot: mismatchedSlot.role,
            actual: actualTokens[mismatchIndex],
            expected: mismatchedSlot.accepted,
          },
        ]
      : [{ code: 'ANSWER_MISMATCH' }],
  }
}

function tokenizeNormalizedAnswer(answer: string): string[] {
  return answer ? answer.split(' ') : []
}

function findMissingSlot(
  slots: StructuredAnswerSlot[],
  actualTokens: string[],
): StructuredAnswerSlot | undefined {
  const unmatchedTokens = [...actualTokens]
  return slots.find((slot) => {
    const tokenIndex = unmatchedTokens.findIndex((token) =>
      slot.accepted.includes(token),
    )
    if (tokenIndex === -1) {
      return true
    }

    unmatchedTokens.splice(tokenIndex, 1)
    return false
  })
}

function findExtraToken(
  slots: StructuredAnswerSlot[],
  actualTokens: string[],
): string | undefined {
  const unmatchedSlots = [...slots]
  return actualTokens.find((token) => {
    const slotIndex = unmatchedSlots.findIndex((slot) =>
      slot.accepted.includes(token),
    )
    if (slotIndex === -1) {
      return true
    }

    unmatchedSlots.splice(slotIndex, 1)
    return false
  })
}

function tokensMatchWithoutOrder(
  slots: StructuredAnswerSlot[],
  actualTokens: string[],
): boolean {
  const unmatchedTokens = [...actualTokens]
  return slots.every((slot) => {
    const tokenIndex = unmatchedTokens.findIndex((token) =>
      slot.accepted.includes(token),
    )
    if (tokenIndex === -1) {
      return false
    }

    unmatchedTokens.splice(tokenIndex, 1)
    return true
  })
}
