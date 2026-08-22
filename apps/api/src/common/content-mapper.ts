import type {
  LessonExplanationExample,
  LessonExplanationScreen,
  LessonExplanationTable,
  LessonPart,
  LocalizedText,
} from '@language/contracts'

const lessonParts = new Set<LessonPart>([
  'explanation',
  'vocabulary',
  'practice',
])

export function toLocalizedText(value: unknown): LocalizedText {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  )
}

export function toNullableLocalizedText(value: unknown): LocalizedText | null {
  const text = toLocalizedText(value)
  return Object.keys(text).length > 0 ? text : null
}

export function toLessonContent(value: unknown): {
  version: number
  sections: LessonPart[]
  explanationScreens: LessonExplanationScreen[]
} {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { version: 1, sections: [], explanationScreens: [] }
  }

  const candidate = value as Record<string, unknown>
  const sections = Array.isArray(candidate.sections)
    ? candidate.sections.filter(
        (section): section is LessonPart =>
          typeof section === 'string' && lessonParts.has(section as LessonPart),
      )
    : []
  const explanationScreens = Array.isArray(candidate.explanationScreens)
    ? candidate.explanationScreens
        .map(toExplanationScreen)
        .filter((screen): screen is LessonExplanationScreen => screen !== null)
    : []

  return {
    version:
      typeof candidate.version === 'number' && candidate.version > 0
        ? candidate.version
        : 1,
    sections,
    explanationScreens,
  }
}

function toExplanationScreen(value: unknown): LessonExplanationScreen | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const candidate = value as Record<string, unknown>
  if (typeof candidate.id !== 'string') {
    return null
  }

  const eyebrow = toNullableLocalizedText(candidate.eyebrow)
  const table = toExplanationTable(candidate.table)
  const examples = Array.isArray(candidate.examples)
    ? candidate.examples
        .map(toExplanationExample)
        .filter(
          (example): example is LessonExplanationExample => example !== null,
        )
    : []
  const callout = toNullableLocalizedText(candidate.callout)

  return {
    id: candidate.id,
    ...(eyebrow ? { eyebrow } : {}),
    title: toLocalizedText(candidate.title),
    paragraphs: Array.isArray(candidate.paragraphs)
      ? candidate.paragraphs.map(toLocalizedText)
      : [],
    ...(table ? { table } : {}),
    ...(examples.length > 0 ? { examples } : {}),
    ...(callout ? { callout } : {}),
  }
}

function toExplanationTable(value: unknown): LessonExplanationTable | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const candidate = value as Record<string, unknown>
  if (!Array.isArray(candidate.headers) || !Array.isArray(candidate.rows)) {
    return null
  }

  return {
    headers: candidate.headers.map(toLocalizedText),
    rows: candidate.rows
      .filter((row): row is unknown[] => Array.isArray(row))
      .map((row) => row.map(toLocalizedText)),
  }
}

function toExplanationExample(value: unknown): LessonExplanationExample | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const candidate = value as Record<string, unknown>
  if (typeof candidate.target !== 'string') {
    return null
  }

  const note = toNullableLocalizedText(candidate.note)
  return {
    target: candidate.target,
    source: toLocalizedText(candidate.source),
    ...(note ? { note } : {}),
  }
}
