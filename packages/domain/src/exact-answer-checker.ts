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
  itemIds?: string[]
}

export interface StructuredAnswerSpec extends ExactAnswerSpec {
  slots: StructuredAnswerSlot[]
}

export type StructuredAnswerDiagnosticCode =
  | 'EXACT_MATCH'
  | 'MISSING_TOKEN'
  | 'EXTRA_TOKEN'
  | 'WORD_ORDER'
  | 'TYPO'
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

export interface StructuredAnswerItemResult {
  itemId: string
  isCorrect: boolean
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
  const actualToken = actualTokens[mismatchIndex]
  const likelyTypo =
    mismatchedSlot && actualToken
      ? findLikelyTypo(actualToken, mismatchedSlot.accepted)
      : null

  return {
    ...exact,
    diagnostics: mismatchedSlot
      ? [
          {
            code: likelyTypo ? 'TYPO' : 'WRONG_FORM',
            slot: mismatchedSlot.role,
            actual: actualToken,
            expected: likelyTypo ? [likelyTypo] : mismatchedSlot.accepted,
          },
        ]
      : [{ code: 'ANSWER_MISMATCH' }],
  }
}

function findLikelyTypo(actual: string, accepted: string[]): string | null {
  return (
    accepted.find((expected) => {
      if (Math.abs(expected.length - actual.length) > 1) return false
      const maximumDistance = expected.length >= 5 ? 1 : 0
      return damerauLevenshteinDistance(actual, expected) <= maximumDistance
    }) ?? null
  )
}

function damerauLevenshteinDistance(left: string, right: string): number {
  const rows = left.length + 1
  const columns = right.length + 1
  const matrix = Array.from({ length: rows }, () =>
    Array<number>(columns).fill(0),
  )

  for (let row = 0; row < rows; row += 1) matrix[row]![0] = row
  for (let column = 0; column < columns; column += 1) {
    matrix[0]![column] = column
  }

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1
      matrix[row]![column] = Math.min(
        matrix[row - 1]![column]! + 1,
        matrix[row]![column - 1]! + 1,
        matrix[row - 1]![column - 1]! + substitutionCost,
      )

      if (
        row > 1 &&
        column > 1 &&
        left[row - 1] === right[column - 2] &&
        left[row - 2] === right[column - 1]
      ) {
        matrix[row]![column] = Math.min(
          matrix[row]![column]!,
          matrix[row - 2]![column - 2]! + 1,
        )
      }
    }
  }

  return matrix[left.length]![right.length]!
}

export function checkStructuredAnswerItems(
  answer: string,
  spec: StructuredAnswerSpec,
): StructuredAnswerItemResult[] {
  const itemIds = [...new Set(spec.slots.flatMap((slot) => slot.itemIds ?? []))]
  if (itemIds.length === 0) return []

  if (checkExactAnswer(answer, spec).isCorrect) {
    return itemIds.map((itemId) => ({ itemId, isCorrect: true }))
  }

  const unmatchedTokens = tokenizeNormalizedAnswer(normalizeExactAnswer(answer))
  const resultByItem = new Map(itemIds.map((itemId) => [itemId, true]))

  for (const slot of spec.slots) {
    const accepted = slot.accepted.map(normalizeExactAnswer)
    const tokenIndex = unmatchedTokens.findIndex((token) =>
      accepted.includes(token),
    )
    const slotMatches = tokenIndex >= 0
    if (slotMatches) unmatchedTokens.splice(tokenIndex, 1)

    for (const itemId of slot.itemIds ?? []) {
      resultByItem.set(itemId, Boolean(resultByItem.get(itemId)) && slotMatches)
    }
  }

  return [...resultByItem].map(([itemId, isCorrect]) => ({
    itemId,
    isCorrect,
  }))
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
