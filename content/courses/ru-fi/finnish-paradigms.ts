import type { LessonVocabularySeed } from './lessons/fi.olla.basics.js'
import { finnishGeneratedParadigms } from './finnish-paradigms.generated.js'

const grammaticalFeatureKeys = [
  'case',
  'comparison',
  'form',
  'mood',
  'number',
  'person',
  'tense',
  'voice',
] as const

export function withFinnishParadigm(
  vocabulary: LessonVocabularySeed,
): LessonVocabularySeed {
  const paradigm = finnishGeneratedParadigms[vocabulary.lemma]
  if (!paradigm || paradigm.partOfSpeech !== vocabulary.partOfSpeech) {
    return vocabulary
  }

  const metadata = Object.fromEntries(
    Object.entries({
      inflectionType: paradigm.inflectionType,
      gradationType: paradigm.gradationType,
      verbType: paradigm.verbType,
    }).filter((entry): entry is [string, string] => entry[1] !== null),
  )
  const forms = vocabulary.forms.map((form, index) =>
    index === 0
      ? { ...form, features: { ...metadata, ...form.features } }
      : form,
  )

  for (const generated of paradigm.forms) {
    if (
      forms.some((form) =>
        isSameGrammaticalForm(
          form.features,
          generated.features,
          vocabulary.partOfSpeech,
        ),
      )
    ) {
      continue
    }
    forms.push({
      id: `form.fi.paradigm.${sanitizeId(vocabulary.lemma)}.${generated.key}`,
      surface: generated.surface,
      features: generated.features,
    })
  }

  return { ...vocabulary, forms }
}

function isSameGrammaticalForm(
  left: Record<string, string>,
  right: Record<string, string>,
  partOfSpeech: LessonVocabularySeed['partOfSpeech'],
) {
  const keys =
    partOfSpeech === 'verb'
      ? grammaticalFeatureKeys
      : grammaticalFeatureKeys.filter((key) =>
          ['case', 'comparison', 'form', 'number'].includes(key),
        )
  return keys.every(
    (key) =>
      normalizeFeature(key, left[key], partOfSpeech) ===
      normalizeFeature(key, right[key], partOfSpeech),
  )
}

function normalizeFeature(
  key: (typeof grammaticalFeatureKeys)[number],
  value: string | undefined,
  partOfSpeech: LessonVocabularySeed['partOfSpeech'],
) {
  if (key === 'comparison' && partOfSpeech === 'adjective') {
    return value ?? 'positive'
  }
  if (key === 'voice' && partOfSpeech === 'verb') return value ?? 'active'
  if (key === 'tense') {
    if (value === 'present_simple') return 'present'
    if (value === 'past_imperfective') return 'imperfect'
  }
  return value ?? null
}

function sanitizeId(value: string) {
  return value
    .normalize('NFKD')
    .replaceAll(/[^a-zA-Z0-9.-]+/gu, '-')
    .replaceAll(/^-|-$/gu, '')
}
