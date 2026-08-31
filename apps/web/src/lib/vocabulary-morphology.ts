import type {
  LessonVocabularyFormResponse,
  UserVocabularyItemResponse,
} from '@language/contracts'

export interface VocabularyGradation {
  from: string
  to: string
}

export interface VocabularyWordChange {
  surface: string
  stem: string
  ending: string
}

export interface VocabularyKeyForm {
  form: LessonVocabularyFormResponse
  label: string
}

export interface VocabularyMorphology {
  partOfSpeechLabel: string
  typeLabel: string | null
  stems: string[]
  gradation: VocabularyGradation | null
  change: VocabularyWordChange | null
  keyForms: VocabularyKeyForm[]
}

export interface VocabularyFormDimension {
  key: FormDimensionKey
  label: string
  options: Array<{ value: string; label: string }>
}

export type VocabularyFormSelections = Partial<Record<FormDimensionKey, string>>

type FormDimensionKey =
  | 'comparison'
  | 'number'
  | 'case'
  | 'tense'
  | 'mood'
  | 'person'
  | 'form'
  | 'voice'

const partOfSpeechLabels: Record<string, string> = {
  adjective: 'Прилагательное',
  adverb: 'Наречие',
  conjunction: 'Союз',
  adposition: 'Послелог',
  negativeVerb: 'Отрицательный глагол',
  noun: 'Существительное',
  numeral: 'Числительное',
  properNoun: 'Имя собственное',
  pronoun: 'Местоимение',
  verb: 'Глагол',
  unknown: 'Слово',
}

const caseLabels: Record<string, string> = {
  nominative: 'nominatiivi',
  genitive: 'genetiivi',
  accusative: 'akkusatiivi',
  partitive: 'partitiivi',
  inessive: 'inessiivi',
  elative: 'elatiivi',
  illative: 'illatiivi',
  adessive: 'adessiivi',
  ablative: 'ablatiivi',
  allative: 'allatiivi',
  essive: 'essiivi',
  translative: 'translatiivi',
  abessive: 'abessiivi',
  instructive: 'instruktiivi',
  comitative: 'komitatiivi',
}

const featureValueLabels: Record<string, string> = {
  singular: 'единственное',
  plural: 'множественное',
  first: '1-е',
  second: '2-е',
  third: '3-е',
  present: 'настоящее',
  imperfect: 'имперфект',
  indicative: 'индикатив',
  conditional: 'кондиционал',
  imperative: 'императив',
  active: 'актив',
  passive: 'пассив',
  infinitive: 'инфинитив',
  connegative: 'отрицательная основа',
  past_participle: 'причастие прошедшего времени',
  present_participle: 'причастие настоящего времени',
  agent_participle: 'агентное причастие',
  negative_participle: 'отрицательное причастие',
  lemma: 'словарная форма',
  invariant: 'неизменяемая форма',
  positive: 'положительная степень',
  comparative: 'сравнительная степень',
  superlative: 'превосходная степень',
  ...caseLabels,
}

const dimensionLabels: Record<FormDimensionKey, string> = {
  comparison: 'Степень сравнения',
  number: 'Число',
  case: 'Падеж',
  tense: 'Время',
  mood: 'Наклонение',
  person: 'Лицо',
  form: 'Форма',
  voice: 'Залог',
}

const dimensionOrder: FormDimensionKey[] = [
  'comparison',
  'number',
  'case',
  'tense',
  'mood',
  'person',
  'form',
  'voice',
]

const gradationPairs: Array<[string, string]> = [
  ['kk', 'k'],
  ['pp', 'p'],
  ['tt', 't'],
  ['nk', 'ng'],
  ['mp', 'mm'],
  ['lt', 'll'],
  ['nt', 'nn'],
  ['rt', 'rr'],
  ['p', 'v'],
  ['t', 'd'],
  ['k', ''],
]

export function getVocabularyMorphology(
  item: UserVocabularyItemResponse,
): VocabularyMorphology {
  const verbType = findFeature(item.forms, 'verbType')
  const inflectionType = findFeature(item.forms, 'inflectionType')
  const stems = getStems(item)

  return {
    partOfSpeechLabel:
      partOfSpeechLabels[item.partOfSpeech] ?? capitalize(item.partOfSpeech),
    typeLabel: getTypeLabel(item.partOfSpeech, verbType, inflectionType),
    stems,
    gradation: getGradation(item, stems[0]),
    change: getWordChange(item),
    keyForms: getKeyForms(item),
  }
}

export function getVocabularyFormLabel(
  form: LessonVocabularyFormResponse,
): string {
  const features = normalizedFeatures(form)
  const grammaticalCase = features.case
  const number = features.number
  const person = features.person
  const mood = features.mood
  const tense = features.tense
  const formKind = features.form
  const voice = features.voice
  const comparison = features.comparison

  if (grammaticalCase) {
    const caseLabel = caseLabels[grammaticalCase] ?? grammaticalCase
    return [
      comparison && comparison !== 'positive'
        ? featureValueLabels[comparison]
        : null,
      number === 'plural' ? 'monikko' : null,
      caseLabel,
    ]
      .filter(Boolean)
      .join(' · ')
  }
  if (formKind === 'past_participle') {
    return voice === 'passive'
      ? 'пассивное причастие прошедшего времени'
      : 'причастие прошедшего времени'
  }
  if (formKind === 'present_participle') {
    return voice === 'passive'
      ? 'пассивное причастие настоящего времени'
      : 'причастие настоящего времени'
  }
  if (formKind === 'agent_participle') return 'агентное причастие'
  if (formKind === 'negative_participle') return 'отрицательное причастие'
  if (formKind === 'infinitive') return 'инфинитив'
  if (formKind === 'connegative') return 'отрицательная основа'
  if (voice === 'passive') return 'пассив'
  if (mood === 'conditional') return withPerson('кондиционал', person, number)
  if (mood === 'imperative') return withPerson('императив', person, number)
  if (tense === 'imperfect') return withPerson('imperfekti', person, number)
  if (person) return pronounFor(person, number)
  if (formKind === 'invariant') return 'неизменяемая форма'

  const visibleFeatures = dimensionOrder
    .map((key) => features[key])
    .filter(Boolean)
    .map((value) => featureValueLabels[value!] ?? value)
  return visibleFeatures.join(' · ') || 'форма слова'
}

export function getVocabularyFormDimensions(
  forms: LessonVocabularyFormResponse[],
): VocabularyFormDimension[] {
  return dimensionOrder.flatMap((key) => {
    const values = Array.from(
      new Set(
        forms
          .map((form) => normalizedFeatures(form)[key])
          .filter((value): value is string => Boolean(value)),
      ),
    )
    if (values.length < 2) return []

    return [
      {
        key,
        label: dimensionLabels[key],
        options: values.map((value) => ({
          value,
          label: featureValueLabels[value] ?? value,
        })),
      },
    ]
  })
}

export function getVocabularyFormsForDisplay(
  forms: LessonVocabularyFormResponse[],
) {
  return forms.filter((form) => {
    if (String(form.features.form ?? '') !== 'lemma') return true
    return !forms.some(
      (candidate) =>
        candidate.id !== form.id && candidate.surface === form.surface,
    )
  })
}

export function matchesVocabularyFormSelections(
  form: LessonVocabularyFormResponse,
  selections: VocabularyFormSelections,
): boolean {
  const features = normalizedFeatures(form)
  return Object.entries(selections).every(
    ([key, value]) => !value || features[key as FormDimensionKey] === value,
  )
}

function getStems(item: UserVocabularyItemResponse): string[] {
  if (item.partOfSpeech === 'verb') {
    const firstSingular = findForm(item.forms, {
      mood: 'indicative',
      tense: 'present',
      person: 'first',
      number: 'singular',
    })
    const stem = firstSingular?.surface.replace(/n$/u, '')
    return stem ? [stem] : []
  }

  const genitive = findForm(item.forms, {
    case: 'genitive',
    number: 'singular',
  })
  const declinedStem = genitive?.surface.replace(/n$/u, '')
  if (!declinedStem) return []
  const hasGradation = Boolean(findFeature(item.forms, 'gradationType'))
  return declinedStem === item.lemma || !hasGradation
    ? [declinedStem]
    : [declinedStem, item.lemma]
}

function getGradation(
  item: UserVocabularyItemResponse,
  primaryStem: string | undefined,
): VocabularyGradation | null {
  if (!primaryStem) return null

  const verbType = findFeature(item.forms, 'verbType')
  const inflectionType = findFeature(item.forms, 'inflectionType')
  const gradationType = findFeature(item.forms, 'gradationType')
  if (inflectionType && !gradationType) return null

  const source =
    item.partOfSpeech === 'verb'
      ? getInfinitiveStem(item.lemma, verbType)
      : item.lemma
  const target =
    item.partOfSpeech === 'verb'
      ? removeRepeatedFinalVowel(primaryStem)
      : primaryStem

  for (const [strong, weak] of gradationPairs) {
    if (
      source.includes(strong) &&
      replaceOnce(source, strong, weak) === target
    ) {
      return { from: strong, to: weak || '∅' }
    }
    if (
      weak &&
      source.includes(weak) &&
      replaceOnce(source, weak, strong) === target
    ) {
      return { from: weak || '∅', to: strong }
    }
  }
  return null
}

function getWordChange(
  item: UserVocabularyItemResponse,
): VocabularyWordChange | null {
  const target =
    item.partOfSpeech === 'verb'
      ? findForm(item.forms, {
          mood: 'indicative',
          tense: 'present',
          person: 'first',
          number: 'singular',
        })
      : findForm(item.forms, { case: 'genitive', number: 'singular' })
  if (!target) return null

  const ending = target.surface.endsWith('n') ? 'n' : ''
  return {
    surface: target.surface,
    stem: ending ? target.surface.slice(0, -ending.length) : target.surface,
    ending,
  }
}

function getKeyForms(item: UserVocabularyItemResponse): VocabularyKeyForm[] {
  const criteria =
    item.partOfSpeech === 'verb'
      ? verbKeyFormCriteria
      : item.partOfSpeech === 'adjective'
        ? nominalKeyFormCriteria.map((expected) => ({
            ...expected,
            comparison: 'positive',
          }))
        : nominalKeyFormCriteria
  const result: LessonVocabularyFormResponse[] = []

  for (const expected of criteria) {
    const form = findForm(item.forms, expected)
    if (form && !result.some((candidate) => candidate.id === form.id)) {
      result.push(form)
    }
  }
  for (const form of item.forms) {
    if (result.length >= 7) break
    if (
      !result.some(
        (candidate) =>
          candidate.id === form.id || candidate.surface === form.surface,
      )
    ) {
      result.push(form)
    }
  }

  return result.slice(0, 7).map((form) => ({
    form,
    label: getVocabularyFormLabel(form),
  }))
}

const verbKeyFormCriteria: Array<Record<string, string>> = [
  {
    mood: 'indicative',
    tense: 'present',
    person: 'first',
    number: 'singular',
  },
  {
    mood: 'indicative',
    tense: 'present',
    person: 'third',
    number: 'singular',
  },
  { tense: 'imperfect', person: 'first', number: 'singular' },
  { form: 'past_participle' },
  { voice: 'passive' },
  { mood: 'conditional', person: 'first', number: 'singular' },
  { mood: 'imperative', person: 'second', number: 'singular' },
]

const nominalKeyFormCriteria: Array<Record<string, string>> = [
  { case: 'nominative', number: 'singular' },
  { case: 'genitive', number: 'singular' },
  { case: 'partitive', number: 'singular' },
  { case: 'illative', number: 'singular' },
  { case: 'nominative', number: 'plural' },
  { case: 'partitive', number: 'plural' },
  { case: 'elative', number: 'plural' },
]

function findForm(
  forms: LessonVocabularyFormResponse[],
  expected: Record<string, string>,
) {
  return forms.find((form) => {
    const features = normalizedFeatures(form)
    return Object.entries(expected).every(
      ([key, value]) => features[key as FormDimensionKey] === value,
    )
  })
}

function findFeature(
  forms: LessonVocabularyFormResponse[],
  feature: string,
): string | null {
  for (const form of forms) {
    const value = form.features[feature]
    if (value !== undefined) return String(value)
  }
  return null
}

function getTypeLabel(
  partOfSpeech: string,
  verbType: string | null,
  inflectionType: string | null,
) {
  if (partOfSpeech === 'verb' && verbType) return `тип ${verbType}`
  if (partOfSpeech === 'adverb' || inflectionType === '99') {
    return 'неизменяемое'
  }
  if (inflectionType === 'compound') {
    return 'склонение по последней части'
  }
  return inflectionType ? `тип склонения ${inflectionType}` : null
}

function normalizedFeatures(form: LessonVocabularyFormResponse) {
  return Object.fromEntries(
    Object.entries(form.features).map(([key, value]) => [key, String(value)]),
  ) as Partial<Record<FormDimensionKey, string>>
}

function getInfinitiveStem(lemma: string, verbType: string | null) {
  if (verbType === '1') return lemma.slice(0, -1)
  if (
    verbType === '2' ||
    verbType === '4' ||
    verbType === '5' ||
    verbType === '6'
  ) {
    return lemma.slice(0, -2)
  }
  if (verbType === '3') {
    return lemma.replace(/(?:st|l|n|r)[aä]$/u, '')
  }
  return lemma
}

function removeRepeatedFinalVowel(value: string) {
  const characters = Array.from(value)
  if (
    characters.length >= 2 &&
    characters.at(-1) === characters.at(-2) &&
    /[aeiouyäö]/u.test(characters.at(-1) ?? '')
  ) {
    return characters.slice(0, -1).join('')
  }
  return value
}

function replaceOnce(value: string, from: string, to: string) {
  if (from === '') return value
  const position = value.indexOf(from)
  if (position < 0) return value
  return `${value.slice(0, position)}${to}${value.slice(position + from.length)}`
}

function pronounFor(person: string, number: string | undefined) {
  const pronouns: Record<string, string> = {
    'first:singular': 'minä',
    'second:singular': 'sinä',
    'third:singular': 'hän',
    'first:plural': 'me',
    'second:plural': 'te',
    'third:plural': 'he',
  }
  return pronouns[`${person}:${number}`] ?? `${person} · ${number ?? ''}`
}

function withPerson(
  label: string,
  person: string | undefined,
  number: string | undefined,
) {
  return person ? `${label} · ${pronounFor(person, number)}` : label
}

function capitalize(value: string) {
  return `${value.charAt(0).toLocaleUpperCase('ru')}${value.slice(1)}`
}
