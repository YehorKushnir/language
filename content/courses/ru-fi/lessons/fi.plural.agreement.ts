import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './fi.olla.basics.js'

export const PLURAL_AGREEMENT_SKILL_ID = 'grammar.fi.plural.agreement'
export const T_PLURAL_SKILL_ID = 'grammar.fi.plural.nominative-t'
export const PLURAL_PREDICATE_SKILL_ID = 'grammar.fi.plural.predicate'

export const pluralAgreementSkills: CourseSkillSeed[] = [
  {
    id: PLURAL_AGREEMENT_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'T-множественное и согласование' },
    description: {
      ru: 'Согласование определения, подлежащего и сказуемого во множественном числе.',
    },
    prerequisiteSkillIds: ['grammar.fi.local-cases.external'],
  },
  {
    id: T_PLURAL_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Именительный множественного числа' },
    description: { ru: 'Форма основы с окончанием -t.' },
    prerequisiteSkillIds: [PLURAL_AGREEMENT_SKILL_ID],
  },
  {
    id: PLURAL_PREDICATE_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Согласование сказуемого' },
    description: {
      ru: 'Ovat и eivät ole при подлежащем во множественном числе.',
    },
    prerequisiteSkillIds: [PLURAL_AGREEMENT_SKILL_ID],
  },
]

export const pluralAgreementContent: CourseLessonContentSeed = {
  version: 3,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'plural-agreement-overview',
      title: { ru: 'Как согласуется фраза во множественном числе' },
      paragraphs: [
        {
          ru: 'При переходе от одного предмета к нескольким меняются все связанные части фразы, но они получают разные формы: определение и существительное — t-множественное, olla — ovat, признак после olla — обычно партитив множественного числа.',
        },
        {
          ru: 'Поэтому нельзя просто добавить -t к одному существительному. Сначала найди все слова, которые должны согласоваться с множественным подлежащим.',
        },
      ],
      table: {
        headers: [
          { ru: 'Часть фразы' },
          { ru: 'Один предмет' },
          { ru: 'Несколько предметов' },
        ],
        rows: [
          [{ ru: 'определение' }, { ru: 'uusi' }, { ru: 'uudet' }],
          [{ ru: 'существительное' }, { ru: 'huone' }, { ru: 'huoneet' }],
          [{ ru: 'olla' }, { ru: 'on' }, { ru: 'ovat' }],
          [{ ru: 'признак после olla' }, { ru: 'vapaa' }, { ru: 'vapaita' }],
          [
            { ru: 'вся фраза' },
            { ru: 'Uusi huone on vapaa.' },
            { ru: 'Uudet huoneet ovat vapaita.' },
          ],
        ],
      },
      examples: [
        {
          target: 'Uusi huone on vapaa.',
          source: { ru: 'Новая комната свободна.' },
        },
        {
          target: 'Uudet huoneet ovat vapaita.',
          source: { ru: 'Новые комнаты свободны.' },
        },
      ],
    },
    {
      id: 't-plural',
      title: { ru: 'Как образуется t-множественное' },
      paragraphs: [
        {
          ru: 'Окончание -t присоединяется к падежной основе: kirja → kirjat, uusi → uudet. Основа может отличаться от словарной формы, поэтому полезно опираться на уже знакомую генитивную основу.',
        },
      ],
      table: {
        headers: [
          { ru: 'Словарная форма' },
          { ru: 'Основа' },
          { ru: 'Множественное' },
        ],
        rows: [
          [{ ru: 'kirja' }, { ru: 'kirja-' }, { ru: 'kirjat' }],
          [{ ru: 'uusi' }, { ru: 'uude-' }, { ru: 'uudet' }],
          [{ ru: 'pieni' }, { ru: 'piene-' }, { ru: 'pienet' }],
          [{ ru: 'lämmin' }, { ru: 'lämpimä-' }, { ru: 'lämpimät' }],
        ],
      },
      examples: [
        { target: 'kirja → kirjat', source: { ru: 'книга → книги' } },
        { target: 'uusi → uudet', source: { ru: 'новый → новые' } },
        { target: 'lämmin → lämpimät', source: { ru: 'тёплый → тёплые' } },
      ],
    },
    {
      id: 'adjective-stems',
      title: { ru: 'Прилагательное получает форму по своей роли' },
      paragraphs: [
        {
          ru: 'Перед существительным прилагательное получает t-множественное: pienet huoneet. После olla признак множественного подлежащего обычно стоит в партитиве множественного числа: huoneet ovat pieniä.',
        },
        {
          ru: 'Обе формы строятся от основы прилагательного, которая иногда отличается от словарной формы. Для частых слов запоминай сразу пару: pienet/pieniä, lämpimät/lämpimiä.',
        },
      ],
      table: {
        headers: [
          { ru: 'Прилагательное' },
          { ru: 'Перед существительным' },
          { ru: 'После olla' },
        ],
        rows: [
          [
            { ru: 'suuri' },
            { ru: 'suuret talot' },
            { ru: 'talot ovat suuria' },
          ],
          [
            { ru: 'pieni' },
            { ru: 'pienet huoneet' },
            { ru: 'huoneet ovat pieniä' },
          ],
          [
            { ru: 'lämmin' },
            { ru: 'lämpimät päivät' },
            { ru: 'päivät ovat lämpimiä' },
          ],
          [
            { ru: 'kallis' },
            { ru: 'kalliit hotellit' },
            { ru: 'hotellit ovat kalliita' },
          ],
        ],
      },
      examples: [
        {
          target: 'Pienet huoneet ovat vapaita.',
          source: { ru: 'Маленькие комнаты свободны.' },
        },
        {
          target: 'Lämpimät päivät ovat pitkiä.',
          source: { ru: 'Тёплые дни длинные.' },
        },
        {
          target: 'Kalliit hotellit ovat suuria.',
          source: { ru: 'Дорогие отели большие.' },
        },
      ],
    },
    {
      id: 'plural-negative-question',
      title: { ru: 'Утверждение, отрицание и вопрос' },
      paragraphs: [
        {
          ru: 'В отрицании he/eivät согласуются во множественном числе, а ole остаётся без личного окончания. В вопросе ovat получает частицу -ko.',
        },
      ],
      examples: [
        {
          target: 'Kirjat eivät ole uusia.',
          source: { ru: 'Книги не новые.' },
        },
        { target: 'Ovatko kirjat uusia?', source: { ru: 'Книги новые?' } },
      ],
    },
    {
      id: 'plural-after-number',
      title: { ru: 'После числительного t-множественное не используется' },
      paragraphs: [
        {
          ru: 'Kaksi kirjaa содержит партитив единственного числа, потому что количество уже выражено числом. Kirjat означает определённую группу без числительного.',
        },
      ],
      examples: [
        { target: 'kaksi kirjaa', source: { ru: 'две книги' } },
        { target: 'uudet kirjat', source: { ru: 'новые книги' } },
      ],
    },
    {
      id: 'plural-errors-register',
      title: { ru: 'Типичные ошибки и puhekieli' },
      paragraphs: [
        {
          ru: 'Типичные ошибки — оставить определение или глагол в единственном числе: uusi kirjat on täällä. Правильно uudet kirjat ovat täällä.',
        },
        {
          ru: 'В puhekieli с неодушевлённым множественным часто слышно ne on. В активных ответах kirjakieli используй ne ovat или существительное + ovat.',
        },
      ],
      examples: [
        {
          target: 'Ne on uusia.',
          source: { ru: 'Они новые.' },
        },
        {
          target: 'Nää talot on kalliita.',
          source: { ru: 'Эти дома дорогие.' },
        },
      ],
      callout: {
        ru: 'Проверь число определения, существительного и сказуемого.',
      },
    },
  ],
}

const adjectives = [
  ['suuri', 'большой', 'большие', 'suuret', 'talot', 'дома'],
  ['pieni', 'маленький', 'маленькие', 'pienet', 'huoneet', 'комнаты'],
  ['pitkä', 'длинный', 'длинные', 'pitkät', 'päivät', 'дни'],
  ['lyhyt', 'короткий', 'короткие', 'lyhyet', 'matkat', 'поездки'],
  ['vanha', 'старый', 'старые', 'vanhat', 'kirjat', 'книги'],
  ['nuori', 'молодой', 'молодые', 'nuoret', 'opiskelijat', 'студенты'],
  ['uusi', 'новый', 'новые', 'uudet', 'autot', 'автомобили'],
  ['hyvä', 'хороший', 'хорошие', 'hyvät', 'tulokset', 'результаты'],
  ['huono', 'плохой', 'плохие', 'huonot', 'uutiset', 'новости'],
  ['kaunis', 'красивый', 'красивые', 'kauniit', 'kaupungit', 'города'],
  ['ruma', 'некрасивый', 'некрасивые', 'rumat', 'rakennukset', 'здания'],
  ['helppo', 'лёгкий', 'лёгкие', 'helpot', 'tehtävät', 'задания'],
  ['vaikea', 'трудный', 'трудные', 'vaikeat', 'kokeet', 'экзамены'],
  ['nopea', 'быстрый', 'быстрые', 'nopeat', 'junat', 'поезда'],
  ['hidas', 'медленный', 'медленные', 'hitaat', 'bussit', 'автобусы'],
  ['lämmin', 'тёплый', 'тёплые', 'lämpimät', 'päivät', 'дни'],
  ['kylmä', 'холодный', 'холодные', 'kylmät', 'yöt', 'ночи'],
  ['kuuma', 'горячий', 'горячие', 'kuumat', 'juomat', 'напитки'],
  ['makea', 'сладкий', 'сладкие', 'makeat', 'kakut', 'торты'],
  ['suolainen', 'солёный', 'солёные', 'suolaiset', 'ruoat', 'блюда'],
  ['puhdas', 'чистый', 'чистые', 'puhtaat', 'huoneet', 'комнаты'],
  ['likainen', 'грязный', 'грязные', 'likaiset', 'lattiat', 'полы'],
  ['kallis', 'дорогой', 'дорогие', 'kalliit', 'hotellit', 'отели'],
  ['halpa', 'дешёвый', 'дешёвые', 'halvat', 'liput', 'билеты'],
  ['tärkeä', 'важный', 'важные', 'tärkeät', 'asiat', 'дела'],
  ['vapaa', 'свободный', 'свободные', 'vapaat', 'päivät', 'дни'],
] as const

interface PluralVocabulary extends LessonVocabularySeed {
  pluralForm: string
  sourcePluralForm: string
  noun: string
  sourceNoun: string
}

export const pluralAgreementVocabulary: PluralVocabulary[] = adjectives.map(
  ([lemma, gloss, sourcePluralForm, pluralForm, noun, sourceNoun], index) => {
    const serial = `14.${String(index + 1).padStart(2, '0')}`
    return {
      key: `plural-${lemma}`,
      itemId: `word.fi.m1.${serial}`,
      conceptId: `concept.fi.m1.${serial}`,
      lexicalEntryId: `lex.fi.${lemma}`,
      lemma,
      partOfSpeech: 'adjective',
      gloss,
      pluralForm,
      sourcePluralForm,
      noun,
      sourceNoun,
      example: {
        target: `${pluralForm} ${noun}`,
        source: { ru: `${sourcePluralForm} ${sourceNoun}` },
      },
      semanticTypes: ['quality', 'plural-agreement'],
      singular: lemma,
      plural: pluralForm,
      sourceSingular: gloss,
      sourcePlural: sourcePluralForm,
      forms: [
        form(serial, 'nominative-sg', lemma, {
          case: 'nominative',
          number: 'singular',
        }),
        form(serial, 'nominative-pl', pluralForm, {
          case: 'nominative',
          number: 'plural',
        }),
      ],
    }
  },
)

export const pluralAgreementExercises: PreparedExerciseSeed[] = [
  ...group('word', 0, 26, (i) => build(i, 'plain')),
  ...group('context', 26, 10, (i) => build(i + 5, 'demonstrative')),
  ...group('context', 36, 8, (i) => build(i + 12, 'negative')),
  ...group('context', 44, 8, (i) => build(i + 18, 'temporal')),
  ...group('pair', 52, 8, (i) => build(i + 2, 'question')),
]

export const pluralAgreementGoldenExerciseIds = [
  'exercise.fi.plural.agreement.word.1',
  'exercise.fi.plural.agreement.word.7',
  'exercise.fi.plural.agreement.context.1',
  'exercise.fi.plural.agreement.context.11',
  'exercise.fi.plural.agreement.pair.1',
] as const

type Frame = 'plain' | 'demonstrative' | 'negative' | 'temporal' | 'question'
function build(index: number, frame: Frame) {
  const item = pluralAgreementVocabulary[index % adjectives.length]!
  const phrase = `${item.pluralForm} ${item.noun}`
  const source = `${item.sourcePluralForm} ${item.sourceNoun}`
  const frames: Record<
    Frame,
    {
      prompt: string
      target: string
      variants: string[]
      slots: PreparedExerciseSeed['slots']
    }
  > = {
    plain: {
      prompt: `${capitalize(source)} здесь.`,
      target: `${capitalize(phrase)} ovat täällä.`,
      variants: [`Täällä ovat ${phrase}.`],
      slots: [
        grammar('adjective'),
        grammar('noun'),
        grammar('copula'),
        grammar('location'),
      ],
    },
    demonstrative: {
      prompt: `Эти ${source} здесь.`,
      target: `Nämä ${phrase} ovat täällä.`,
      variants: [],
      slots: [
        grammar('demonstrative'),
        grammar('adjective'),
        grammar('noun'),
        grammar('copula'),
        grammar('location'),
      ],
    },
    negative: {
      prompt: `${capitalize(source)} не здесь.`,
      target: `${capitalize(phrase)} eivät ole täällä.`,
      variants: [],
      slots: [
        grammar('adjective'),
        grammar('noun'),
        grammar('negativeVerb'),
        grammar('copula'),
        grammar('location'),
      ],
    },
    temporal: {
      prompt: `Сейчас ${source} здесь.`,
      target: `Nyt ${phrase} ovat täällä.`,
      variants: [],
      slots: [
        grammar('adverb'),
        grammar('adjective'),
        grammar('noun'),
        grammar('copula'),
        grammar('location'),
      ],
    },
    question: {
      prompt: `${capitalize(source)} здесь?`,
      target: `Ovatko ${phrase} täällä?`,
      variants: [],
      slots: [
        grammar('questionCopula'),
        grammar('adjective'),
        grammar('noun'),
        grammar('location'),
      ],
    },
  }
  const selected = frames[frame]
  const adjectiveIndex = selected.slots.findIndex(
    (slot) => slot.role === 'adjective',
  )
  const nounIndex = selected.slots.findIndex((slot) => slot.role === 'noun')
  selected.slots[adjectiveIndex] = {
    role: 'pluralAdjective',
    accepted: [item.pluralForm],
    itemIds: [PLURAL_AGREEMENT_SKILL_ID, T_PLURAL_SKILL_ID, item.itemId],
  }
  selected.slots[nounIndex] = {
    role: 'pluralNoun',
    accepted: [item.noun],
    itemIds: [PLURAL_AGREEMENT_SKILL_ID, PLURAL_PREDICATE_SKILL_ID],
  }
  return {
    prompt: selected.prompt,
    targetText: selected.target,
    acceptedVariants: [selected.target, ...selected.variants],
    slots: selected.slots,
    primaryItemId: PLURAL_AGREEMENT_SKILL_ID,
    secondaryItemIds: [T_PLURAL_SKILL_ID, PLURAL_PREDICATE_SKILL_ID],
    vocabularyItemId: item.itemId,
  }
}

function grammar(role: string) {
  const accepted: Record<string, string[]> = {
    adjective: [],
    noun: [],
    copula: ['ovat', 'ole'],
    location: ['täällä'],
    demonstrative: ['nämä'],
    negativeVerb: ['eivät'],
    adverb: ['nyt'],
    questionCopula: ['ovatko'],
  }
  return {
    role,
    accepted: accepted[role] ?? [],
    itemIds: [PLURAL_AGREEMENT_SKILL_ID, PLURAL_PREDICATE_SKILL_ID],
  }
}
function group(
  category: 'word' | 'context' | 'pair',
  start: number,
  count: number,
  create: (
    index: number,
  ) => Omit<PreparedExerciseSeed, 'id' | 'selectionOrder'>,
) {
  const base = category === 'word' ? 0 : category === 'context' ? 26 : 52
  return Array.from({ length: count }, (_, index) => ({
    id: `exercise.fi.plural.agreement.${category}.${start + index - base + 1}`,
    selectionOrder: start + index + 1,
    ...create(index),
  }))
}
function form(
  serial: string,
  key: string,
  surface: string,
  features: Record<string, string>,
) {
  return { id: `form.fi.m1.${serial}.${key}`, surface, features }
}
function capitalize(value: string) {
  return `${value.charAt(0).toLocaleUpperCase('ru')}${value.slice(1)}`
}
