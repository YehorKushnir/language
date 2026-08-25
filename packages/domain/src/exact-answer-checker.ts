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
  optional?: boolean
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

interface NormalizedAnswerSlot extends StructuredAnswerSlot {
  accepted: string[]
}

type AlignmentOperation =
  | { type: 'match'; slot: NormalizedAnswerSlot; token: string }
  | { type: 'substitute'; slot: NormalizedAnswerSlot; token: string }
  | { type: 'missing'; slot: NormalizedAnswerSlot }
  | { type: 'extra'; token: string }

interface SlotAlignment {
  cost: number
  exactMatches: number
  structuralEdits: number
  substitutionDistance: number
  operations: AlignmentOperation[]
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
  const expectedSlots = normalizeSlots(spec.slots)

  if (expectedSlots.length === 0) {
    return {
      ...exact,
      diagnostics: [{ code: 'ANSWER_MISMATCH' }],
    }
  }

  const candidateSlots = expandOptionalSlots(expectedSlots)
  if (
    candidateSlots.some(
      (slots) =>
        slots.length === actualTokens.length &&
        slots.every((slot, index) =>
          slot.accepted.includes(actualTokens[index]!),
        ),
    )
  ) {
    return {
      ...exact,
      isCorrect: true,
      diagnostics: [{ code: 'EXACT_MATCH' }],
    }
  }
  if (
    candidateSlots.some((slots) => tokensMatchWithoutOrder(slots, actualTokens))
  ) {
    return {
      ...exact,
      diagnostics: [{ code: 'WORD_ORDER' }],
    }
  }

  const selectedSlots = selectBestSlotSequence(expectedSlots, actualTokens)
  const alignment = alignSlots(selectedSlots, actualTokens)

  const diagnostics = alignment.operations.flatMap((operation) => {
    const diagnostic = diagnoseAlignmentOperation(operation)
    return diagnostic ? [diagnostic] : []
  })
  if (diagnostics.length === 0) {
    return {
      ...exact,
      diagnostics: [{ code: 'ANSWER_MISMATCH' }],
    }
  }

  return {
    ...exact,
    diagnostics,
  }
}

function diagnoseAlignmentOperation(
  operation: AlignmentOperation,
): StructuredAnswerDiagnostic | null {
  if (operation.type === 'match') return null
  if (operation.type === 'missing') {
    return {
      code: 'MISSING_TOKEN',
      slot: operation.slot.role,
      expected: operation.slot.accepted,
    }
  }
  if (operation.type === 'extra') {
    return { code: 'EXTRA_TOKEN', actual: operation.token }
  }

  const likelyTypo = findLikelyTypo(operation.token, operation.slot.accepted)
  return {
    code: likelyTypo ? 'TYPO' : 'WRONG_FORM',
    slot: operation.slot.role,
    actual: operation.token,
    expected: likelyTypo ? [likelyTypo] : operation.slot.accepted,
  }
}

function findLikelyTypo(actual: string, accepted: string[]): string | null {
  return (
    accepted.find((expected) => {
      if (Math.abs(expected.length - actual.length) > 1) return false
      const differsOnlyByDiacritics =
        stripDiacritics(expected) === stripDiacritics(actual)
      const maximumDistance =
        expected.length >= 5 || differsOnlyByDiacritics ? 1 : 0
      return damerauLevenshteinDistance(actual, expected) <= maximumDistance
    }) ?? null
  )
}

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '')
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

  const actualTokens = tokenizeNormalizedAnswer(normalizeExactAnswer(answer))
  const slots = selectBestSlotSequence(normalizeSlots(spec.slots), actualTokens)
  const unmatchedTokens = [...actualTokens]
  const resultByItem = new Map(itemIds.map((itemId) => [itemId, true]))

  for (const slot of slots) {
    const tokenIndex = unmatchedTokens.findIndex((token) =>
      slot.accepted.includes(token),
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

function normalizeSlots(slots: StructuredAnswerSlot[]): NormalizedAnswerSlot[] {
  return slots.map((slot) => ({
    ...slot,
    accepted: slot.accepted.map(normalizeExactAnswer),
  }))
}

function selectBestSlotSequence(
  slots: NormalizedAnswerSlot[],
  actualTokens: string[],
): NormalizedAnswerSlot[] {
  const candidates = expandOptionalSlots(slots)
  return candidates.reduce((best, candidate) => {
    const candidateAlignment = alignSlots(candidate, actualTokens)
    const bestAlignment = alignSlots(best, actualTokens)
    return isBetterAlignment(candidateAlignment, bestAlignment)
      ? candidate
      : best
  })
}

function expandOptionalSlots(
  slots: NormalizedAnswerSlot[],
): NormalizedAnswerSlot[][] {
  return slots.reduce<NormalizedAnswerSlot[][]>(
    (variants, slot) =>
      slot.optional
        ? variants.flatMap((variant) => [[...variant, slot], [...variant]])
        : variants.map((variant) => [...variant, slot]),
    [[]],
  )
}

function alignSlots(
  slots: NormalizedAnswerSlot[],
  actualTokens: string[],
): SlotAlignment {
  const table = Array.from({ length: slots.length + 1 }, () =>
    Array<SlotAlignment | undefined>(actualTokens.length + 1),
  )
  table[0]![0] = {
    cost: 0,
    exactMatches: 0,
    structuralEdits: 0,
    substitutionDistance: 0,
    operations: [],
  }

  for (let slotIndex = 0; slotIndex <= slots.length; slotIndex += 1) {
    for (
      let tokenIndex = 0;
      tokenIndex <= actualTokens.length;
      tokenIndex += 1
    ) {
      const current = table[slotIndex]![tokenIndex]
      if (!current) continue

      const slot = slots[slotIndex]
      const token = actualTokens[tokenIndex]
      if (slot && token !== undefined) {
        const matches = slot.accepted.includes(token)
        updateAlignment(table, slotIndex + 1, tokenIndex + 1, {
          cost: current.cost + (matches ? 0 : 1),
          exactMatches: current.exactMatches + (matches ? 1 : 0),
          structuralEdits: current.structuralEdits,
          substitutionDistance:
            current.substitutionDistance +
            (matches ? 0 : distanceToSlot(token, slot)),
          operations: [
            ...current.operations,
            matches
              ? { type: 'match', slot, token }
              : { type: 'substitute', slot, token },
          ],
        })
      }
      if (slot) {
        updateAlignment(table, slotIndex + 1, tokenIndex, {
          cost: current.cost + 1,
          exactMatches: current.exactMatches,
          structuralEdits: current.structuralEdits + 1,
          substitutionDistance: current.substitutionDistance,
          operations: [...current.operations, { type: 'missing', slot }],
        })
      }
      if (token !== undefined) {
        updateAlignment(table, slotIndex, tokenIndex + 1, {
          cost: current.cost + 1,
          exactMatches: current.exactMatches,
          structuralEdits: current.structuralEdits + 1,
          substitutionDistance: current.substitutionDistance,
          operations: [...current.operations, { type: 'extra', token }],
        })
      }
    }
  }

  return table[slots.length]![actualTokens.length]!
}

function updateAlignment(
  table: Array<Array<SlotAlignment | undefined>>,
  slotIndex: number,
  tokenIndex: number,
  candidate: SlotAlignment,
) {
  const current = table[slotIndex]![tokenIndex]
  if (!current || isBetterAlignment(candidate, current)) {
    table[slotIndex]![tokenIndex] = candidate
  }
}

function isBetterAlignment(
  candidate: SlotAlignment,
  current: SlotAlignment,
): boolean {
  if (candidate.cost !== current.cost) return candidate.cost < current.cost
  if (candidate.exactMatches !== current.exactMatches) {
    return candidate.exactMatches > current.exactMatches
  }
  if (candidate.structuralEdits !== current.structuralEdits) {
    return candidate.structuralEdits < current.structuralEdits
  }
  if (candidate.substitutionDistance !== current.substitutionDistance) {
    return candidate.substitutionDistance < current.substitutionDistance
  }
  return false
}

function distanceToSlot(token: string, slot: NormalizedAnswerSlot): number {
  return Math.min(
    ...slot.accepted.map((expected) =>
      damerauLevenshteinDistance(token, expected),
    ),
  )
}

function tokensMatchWithoutOrder(
  slots: NormalizedAnswerSlot[],
  actualTokens: string[],
): boolean {
  if (slots.length !== actualTokens.length) return false
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
