import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './fi.olla.basics.js'

export const CONSONANT_GRADATION_SKILL_ID = 'grammar.fi.consonant-gradation'
export const CONSONANT_GRADATION_WEAK_SKILL_ID =
  'grammar.fi.consonant-gradation.weak'
export const CONSONANT_GRADATION_STRONG_SKILL_ID =
  'grammar.fi.consonant-gradation.strong'

export const consonantGradationSkills: CourseSkillSeed[] = [
  {
    id: CONSONANT_GRADATION_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Чередование согласных в глаголах' },
    description: {
      ru: 'Выбор сильной и слабой ступени k, p и t в личных формах.',
    },
    prerequisiteSkillIds: ['grammar.fi.verb-types.four-six'],
  },
  {
    id: CONSONANT_GRADATION_WEAK_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Слабая ступень' },
    description: {
      ru: 'Слабая ступень в формах minä, sinä, me, te и отрицательной основе.',
    },
    prerequisiteSkillIds: [CONSONANT_GRADATION_SKILL_ID],
  },
  {
    id: CONSONANT_GRADATION_STRONG_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Сильная ступень' },
    description: {
      ru: 'Сильная ступень в третьем лице и обратное чередование типов 3–4.',
    },
    prerequisiteSkillIds: [CONSONANT_GRADATION_SKILL_ID],
  },
]

export const consonantGradationContent: CourseLessonContentSeed = {
  version: 2,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'gradation-principle',
      eyebrow: { ru: 'Основа правила' },
      title: { ru: 'Сильная и слабая ступень' },
      paragraphs: [
        {
          ru: 'Внутри основы k, p и t могут чередоваться. У глаголов первого типа словарная форма и hän обычно показывают сильную ступень, а minä, sinä, me и te — слабую.',
        },
        {
          ru: 'Сначала определи тип глагола и основу, затем выбери ступень, и только после этого добавляй личное окончание.',
        },
      ],
      examples: [
        { target: 'ottaa → otan', source: { ru: 'брать → я беру' } },
        {
          target: 'käyttää → käytän',
          source: { ru: 'использовать → я использую' },
        },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Выбери форму minä от ottaa.' },
          answer: 'otan',
          explanation: { ru: 'В слабой ступени tt превращается в t.' },
        },
      ],
    },
    {
      id: 'quantitative-gradation',
      eyebrow: { ru: 'Модель 1' },
      title: { ru: 'Количественное чередование' },
      paragraphs: [
        {
          ru: 'Двойной согласный сокращается: kk → k, pp → p, tt → t. Долгота согласного различает формы, поэтому её нельзя считать мелкой орфографией.',
        },
      ],
      table: {
        headers: [{ ru: 'Сильная' }, { ru: 'Слабая' }, { ru: 'Пример' }],
        rows: [
          [{ ru: 'kk' }, { ru: 'k' }, { ru: 'pakata → pakkaan' }],
          [{ ru: 'pp' }, { ru: 'p' }, { ru: 'tappaa → tapan' }],
          [{ ru: 'tt' }, { ru: 't' }, { ru: 'ottaa → otan' }],
        ],
      },
      examples: [
        {
          target: 'Hän ottaa. Minä otan.',
          source: { ru: 'Он берёт. Я беру.' },
        },
        {
          target: 'Hän pakkaa. Me pakkaamme.',
          source: { ru: 'Он упаковывает. Мы упаковываем.' },
        },
      ],
    },
    {
      id: 'qualitative-gradation',
      eyebrow: { ru: 'Модель 2' },
      title: { ru: 'Качественное чередование' },
      paragraphs: [
        {
          ru: 'В качественных парах меняется сам согласный: p → v, t → d, nk → ng, а k иногда исчезает. Конкретную пару полезно хранить вместе с формой minä.',
        },
      ],
      table: {
        headers: [{ ru: 'Сильная' }, { ru: 'Слабая' }, { ru: 'Пример' }],
        rows: [
          [{ ru: 'p' }, { ru: 'v' }, { ru: 'tavata → tapaan' }],
          [{ ru: 't' }, { ru: 'd' }, { ru: 'löytää → löydän' }],
          [
            { ru: 'k' },
            { ru: '— / j' },
            { ru: 'lukea → luen, sulkea → suljen' },
          ],
          [{ ru: 'nt' }, { ru: 'nn' }, { ru: 'antaa → annan' }],
        ],
      },
      examples: [
        { target: 'Minä luen.', source: { ru: 'Я читаю.' } },
        { target: 'Me annamme.', source: { ru: 'Мы даём.' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Выбери форму hän от antaa.' },
          answer: 'antaa',
          explanation: { ru: 'Форма hän сохраняет сильную ступень nt.' },
        },
      ],
    },
    {
      id: 'reverse-gradation',
      eyebrow: { ru: 'Типы 3–4' },
      title: { ru: 'Обратное чередование' },
      paragraphs: [
        {
          ru: 'У некоторых глаголов типов 3 и 4 инфинитив выглядит слабым, а личная основа становится сильной: tavata → tapaan, tykätä → tykkään, pelätä → pelkään.',
        },
        {
          ru: 'Здесь нельзя механически ослаблять форму minä: после построения основы требуется именно сильная ступень.',
        },
      ],
      examples: [
        { target: 'Tapaan ystävän.', source: { ru: 'Я встречаю друга.' } },
        {
          target: 'Tykkäätkö kahvista?',
          source: { ru: 'Тебе нравится кофе?' },
        },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Выбери форму minä от tykätä.' },
          answer: 'tykkään',
          explanation: {
            ru: 'Слабая k инфинитива восстанавливается до kk в личной основе.',
          },
        },
      ],
    },
    {
      id: 'noun-recognition',
      eyebrow: { ru: 'Лексика урока' },
      title: { ru: 'Те же пары в существительных' },
      paragraphs: [
        {
          ru: 'Слова урока показывают, что та же система встречается в именах: kauppa → kaupan, matto → maton, kaupunki → kaupungin. Пока достаточно узнавать пару; подробно основы существительных разбираются в уроке 9.',
        },
      ],
      examples: [
        { target: 'kauppa — kaupan', source: { ru: 'магазин — магазина' } },
        { target: 'laukku — laukun', source: { ru: 'сумка — сумки' } },
      ],
    },
    {
      id: 'gradation-register-errors',
      eyebrow: { ru: 'Контроль' },
      title: { ru: 'Типичные ошибки и разговорная речь' },
      paragraphs: [
        {
          ru: 'Типичная ошибка — сохранить сильную ступень во всех лицах: minä ottan вместо minä otan. Другая ошибка — применить чередование там, где его у глагола нет.',
        },
        {
          ru: 'В puhekieli личные окончания и местоимения сокращаются, но чередование основы сохраняется: mä otan, sä käytät. Сначала строй нормативную форму kirjakieli, затем узнавай разговорное окружение.',
        },
      ],
      examples: [
        {
          target: 'Mä otan tämän.',
          source: { ru: 'Я возьму это.' },
          note: { ru: 'Kirjakieli: Minä otan tämän.' },
        },
        {
          target: 'Sä tykkäät siitä.',
          source: { ru: 'Тебе это нравится.' },
          note: { ru: 'Kirjakieli: Sinä tykkäät siitä.' },
        },
      ],
      callout: {
        ru: 'Проверяй форму в порядке: тип → основа → ступень → личное окончание.',
      },
    },
  ],
}

const nouns = [
  ['kauppa', 'магазин', 'kaupan', 'place'],
  ['matto', 'ковёр', 'maton', 'object'],
  ['pankki', 'банк', 'pankin', 'place'],
  ['lippu', 'билет', 'lipun', 'object'],
  ['kukka', 'цветок', 'kukan', 'plant'],
  ['kenkä', 'ботинок', 'kengän', 'clothing'],
  ['hammas', 'зуб', 'hampaan', 'body'],
  ['käsi', 'рука', 'käden', 'body'],
  ['jalka', 'нога', 'jalan', 'body'],
  ['poika', 'мальчик', 'pojan', 'person'],
  ['aika', 'время', 'ajan', 'time'],
  ['paikka', 'место', 'paikan', 'place'],
  ['kaupunki', 'город', 'kaupungin', 'place'],
  ['katu', 'улица', 'kadun', 'place'],
  ['silta', 'мост', 'sillan', 'place'],
  ['ranta', 'берег', 'rannan', 'place'],
  ['pöytä', 'стол', 'pöydän', 'object'],
  ['hylly', 'полка', 'hyllyn', 'object'],
  ['tuoli', 'стул', 'tuolin', 'object'],
  ['sänky', 'кровать', 'sängyn', 'object'],
  ['laukku', 'сумка', 'laukun', 'object'],
  ['takki', 'куртка', 'takin', 'clothing'],
  ['paita', 'рубашка', 'paidan', 'clothing'],
  ['katto', 'крыша', 'katon', 'place-part'],
  ['lattia', 'пол', 'lattian', 'place-part'],
  ['seinä', 'стена', 'seinän', 'place-part'],
] as const

export const consonantGradationVocabulary: LessonVocabularySeed[] = nouns.map(
  ([lemma, gloss, genitive, semanticType], index) => {
    const serial = `06.${String(index + 1).padStart(2, '0')}`
    return {
      key: `gradation-${lemma}`,
      itemId: `word.fi.m1.${serial}`,
      conceptId: `concept.fi.m1.${serial}`,
      lexicalEntryId: `lex.fi.${lemma}`,
      lemma,
      partOfSpeech: 'noun',
      gloss,
      example: {
        target: `Tämä on ${lemma}.`,
        source: { ru: `Это ${gloss}.` },
      },
      semanticTypes: ['noun', semanticType, 'gradation-recognition'],
      singular: lemma,
      plural: genitive,
      sourceSingular: gloss,
      sourcePlural: `форма генитива: ${genitive}`,
      forms: [
        lexicalForm(serial, 'nominative-sg', lemma, {
          case: 'nominative',
          number: 'singular',
        }),
        lexicalForm(serial, 'genitive-sg', genitive, {
          case: 'genitive',
          number: 'singular',
        }),
      ],
    }
  },
)

interface GradatingVerb {
  lemma: string
  gloss: string
  itemId: string
  forms: [string, string, string, string, string, string]
  connegative: string
  source: [string, string, string, string, string, string]
  reverse?: boolean
}

const verbs: GradatingVerb[] = [
  verb(
    'lukea',
    'читать',
    'word.fi.m1.02.07',
    ['luen', 'luet', 'lukee', 'luemme', 'luette', 'lukevat'],
    'lue',
    [
      'я читаю',
      'ты читаешь',
      'он читает',
      'мы читаем',
      'вы читаете',
      'они читают',
    ],
  ),
  verb(
    'kirjoittaa',
    'писать',
    'word.fi.m1.02.08',
    [
      'kirjoitan',
      'kirjoitat',
      'kirjoittaa',
      'kirjoitamme',
      'kirjoitatte',
      'kirjoittavat',
    ],
    'kirjoita',
    ['я пишу', 'ты пишешь', 'он пишет', 'мы пишем', 'вы пишете', 'они пишут'],
  ),
  verb(
    'ymmärtää',
    'понимать',
    'word.fi.m1.02.13',
    [
      'ymmärrän',
      'ymmärrät',
      'ymmärtää',
      'ymmärrämme',
      'ymmärrätte',
      'ymmärtävät',
    ],
    'ymmärrä',
    [
      'я понимаю',
      'ты понимаешь',
      'он понимает',
      'мы понимаем',
      'вы понимаете',
      'они понимают',
    ],
  ),
  verb(
    'auttaa',
    'помогать',
    'word.fi.m1.02.16',
    ['autan', 'autat', 'auttaa', 'autamme', 'autatte', 'auttavat'],
    'auta',
    [
      'я помогаю',
      'ты помогаешь',
      'он помогает',
      'мы помогаем',
      'вы помогаете',
      'они помогают',
    ],
  ),
  verb(
    'ottaa',
    'брать',
    'word.fi.m1.02.18',
    ['otan', 'otat', 'ottaa', 'otamme', 'otatte', 'ottavat'],
    'ota',
    ['я беру', 'ты берёшь', 'он берёт', 'мы берём', 'вы берёте', 'они берут'],
  ),
  verb(
    'antaa',
    'давать',
    'word.fi.m1.02.19',
    ['annan', 'annat', 'antaa', 'annamme', 'annatte', 'antavat'],
    'anna',
    ['я даю', 'ты даёшь', 'он даёт', 'мы даём', 'вы даёте', 'они дают'],
  ),
  verb(
    'löytää',
    'находить',
    'word.fi.m1.02.20',
    ['löydän', 'löydät', 'löytää', 'löydämme', 'löydätte', 'löytävät'],
    'löydä',
    [
      'я нахожу',
      'ты находишь',
      'он находит',
      'мы находим',
      'вы находите',
      'они находят',
    ],
  ),
  verb(
    'käyttää',
    'использовать',
    'word.fi.m1.02.21',
    ['käytän', 'käytät', 'käyttää', 'käytämme', 'käytätte', 'käyttävät'],
    'käytä',
    [
      'я использую',
      'ты используешь',
      'он использует',
      'мы используем',
      'вы используете',
      'они используют',
    ],
  ),
  verb(
    'tavata',
    'встречать',
    'word.fi.m1.05.03',
    ['tapaan', 'tapaat', 'tapaa', 'tapaamme', 'tapaatte', 'tapaavat'],
    'tapaa',
    [
      'я встречаю',
      'ты встречаешь',
      'он встречает',
      'мы встречаем',
      'вы встречаете',
      'они встречают',
    ],
    true,
  ),
  verb(
    'pakata',
    'упаковывать',
    'word.fi.m1.05.11',
    ['pakkaan', 'pakkaat', 'pakkaa', 'pakkaamme', 'pakkaatte', 'pakkaavat'],
    'pakkaa',
    [
      'я упаковываю',
      'ты упаковываешь',
      'он упаковывает',
      'мы упаковываем',
      'вы упаковываете',
      'они упаковывают',
    ],
    true,
  ),
  verb(
    'tykätä',
    'нравиться',
    'word.fi.m1.05.08',
    ['tykkään', 'tykkäät', 'tykkää', 'tykkäämme', 'tykkäätte', 'tykkäävät'],
    'tykkää',
    [
      'мне нравится',
      'тебе нравится',
      'ему нравится',
      'нам нравится',
      'вам нравится',
      'им нравится',
    ],
    true,
  ),
  verb(
    'pelätä',
    'бояться',
    'word.fi.m1.05.20',
    ['pelkään', 'pelkäät', 'pelkää', 'pelkäämme', 'pelkäätte', 'pelkäävät'],
    'pelkää',
    [
      'я боюсь',
      'ты боишься',
      'он боится',
      'мы боимся',
      'вы боитесь',
      'они боятся',
    ],
    true,
  ),
]

export const consonantGradationExercises: PreparedExerciseSeed[] = [
  ...exerciseGroup('word', 0, 26, (index) =>
    affirmative(index, index % 2, index),
  ),
  ...exerciseGroup('context', 26, 26, (index) => {
    const personIndex = 2 + (index % 4)
    return affirmative(index + 3, personIndex, index)
  }),
  ...exerciseGroup('pair', 52, 4, (index) => negative(index, index % 2, index)),
  ...exerciseGroup('pair', 56, 4, (index) =>
    question(index + 5, (index % 2) + 1, index + 4),
  ),
]

export const consonantGradationGoldenExerciseIds = [
  'exercise.fi.consonant-gradation.word.1',
  'exercise.fi.consonant-gradation.word.2',
  'exercise.fi.consonant-gradation.context.1',
  'exercise.fi.consonant-gradation.pair.1',
  'exercise.fi.consonant-gradation.pair.5',
] as const

function affirmative(
  verbIndex: number,
  personIndex: number,
  nounIndex: number,
) {
  const item = verbs[verbIndex % verbs.length]!
  const vocabulary = consonantGradationVocabulary[nounIndex % nouns.length]!
  const pronouns = ['Minä', 'Sinä', 'Hän', 'Me', 'Te', 'He']
  const skillId = item.reverse
    ? CONSONANT_GRADATION_STRONG_SKILL_ID
    : personIndex === 2 || personIndex === 5
      ? CONSONANT_GRADATION_STRONG_SKILL_ID
      : CONSONANT_GRADATION_WEAK_SKILL_ID
  const targetText = `Tämä on ${vocabulary.lemma}. ${pronouns[personIndex]} ${item.forms[personIndex]}.`
  const canOmit = personIndex === 0 || personIndex === 1 || personIndex === 3
  return {
    prompt: `Это ${vocabulary.gloss}. ${capitalize(item.source[personIndex]!)}.`,
    targetText,
    acceptedVariants: canOmit
      ? [
          targetText,
          `Tämä on ${vocabulary.lemma}. ${capitalize(item.forms[personIndex])}.`,
        ]
      : [targetText],
    slots: [
      vocabularySlot('demonstrative', ['tämä'], vocabulary.itemId),
      vocabularySlot('copula', ['on'], vocabulary.itemId),
      vocabularySlot('vocabulary', [vocabulary.lemma], vocabulary.itemId),
      grammarSlot(
        'subject',
        [pronouns[personIndex]!.toLocaleLowerCase('fi')],
        skillId,
        canOmit,
      ),
      grammarSlot('mainVerb', [item.forms[personIndex]!], skillId),
    ],
    primaryItemId: CONSONANT_GRADATION_SKILL_ID,
    secondaryItemIds: [skillId],
    vocabularyItemId: vocabulary.itemId,
  }
}

function negative(verbIndex: number, personIndex: number, nounIndex: number) {
  const item = verbs[verbIndex % verbs.length]!
  const vocabulary = consonantGradationVocabulary[nounIndex % nouns.length]!
  const pronoun = personIndex === 0 ? 'Minä' : 'Sinä'
  const negativeVerb = personIndex === 0 ? 'en' : 'et'
  const targetText = `Tämä on ${vocabulary.lemma}. ${pronoun} ${negativeVerb} ${item.connegative}.`
  return {
    prompt: `Это ${vocabulary.gloss}. ${negateRussian(item.source[personIndex]!)}.`,
    targetText,
    acceptedVariants: [
      targetText,
      `Tämä on ${vocabulary.lemma}. ${capitalize(negativeVerb)} ${item.connegative}.`,
    ],
    slots: [
      vocabularySlot('demonstrative', ['tämä'], vocabulary.itemId),
      vocabularySlot('copula', ['on'], vocabulary.itemId),
      vocabularySlot('vocabulary', [vocabulary.lemma], vocabulary.itemId),
      grammarSlot(
        'subject',
        [pronoun.toLocaleLowerCase('fi')],
        CONSONANT_GRADATION_WEAK_SKILL_ID,
        true,
      ),
      grammarSlot(
        'negativeVerb',
        [negativeVerb],
        CONSONANT_GRADATION_WEAK_SKILL_ID,
      ),
      grammarSlot(
        'mainVerb',
        [item.connegative],
        CONSONANT_GRADATION_WEAK_SKILL_ID,
      ),
    ],
    primaryItemId: CONSONANT_GRADATION_SKILL_ID,
    secondaryItemIds: [CONSONANT_GRADATION_WEAK_SKILL_ID],
    vocabularyItemId: vocabulary.itemId,
  }
}

function question(verbIndex: number, personIndex: number, nounIndex: number) {
  const item = verbs[verbIndex % verbs.length]!
  const vocabulary = consonantGradationVocabulary[nounIndex % nouns.length]!
  const pronoun = personIndex === 1 ? 'sinä' : 'hän'
  const questionForm = `${item.forms[personIndex]}${questionParticle(item.forms[personIndex]!)}`
  const targetText = `Tämä on ${vocabulary.lemma}. ${capitalize(questionForm)} ${pronoun}?`
  return {
    prompt: `Это ${vocabulary.gloss}. ${capitalize(item.source[personIndex]!)}?`,
    targetText,
    acceptedVariants: [
      targetText,
      ...(personIndex === 1
        ? [`Tämä on ${vocabulary.lemma}. ${capitalize(questionForm)}?`]
        : []),
    ],
    slots: [
      vocabularySlot('demonstrative', ['tämä'], vocabulary.itemId),
      vocabularySlot('copula', ['on'], vocabulary.itemId),
      vocabularySlot('vocabulary', [vocabulary.lemma], vocabulary.itemId),
      grammarSlot('questionVerb', [questionForm], CONSONANT_GRADATION_SKILL_ID),
      grammarSlot(
        'subject',
        [pronoun],
        CONSONANT_GRADATION_SKILL_ID,
        personIndex === 1,
      ),
    ],
    primaryItemId: CONSONANT_GRADATION_SKILL_ID,
    secondaryItemIds: [],
    vocabularyItemId: vocabulary.itemId,
  }
}

function exerciseGroup(
  category: 'word' | 'context' | 'pair',
  start: number,
  count: number,
  create: (
    index: number,
  ) => Omit<PreparedExerciseSeed, 'id' | 'selectionOrder'>,
) {
  return Array.from({ length: count }, (_, offset) => ({
    id: `exercise.fi.consonant-gradation.${category}.${category === 'word' ? offset + 1 : category === 'context' ? offset + 1 : start + offset - 51}`,
    selectionOrder: start + offset + 1,
    ...create(offset),
  }))
}

function verb(
  lemma: string,
  gloss: string,
  itemId: string,
  forms: GradatingVerb['forms'],
  connegative: string,
  source: GradatingVerb['source'],
  reverse = false,
): GradatingVerb {
  return { lemma, gloss, itemId, forms, connegative, source, reverse }
}

function grammarSlot(
  role: string,
  accepted: string[],
  skillId: string,
  optional = false,
) {
  return {
    role,
    accepted,
    itemIds:
      skillId === CONSONANT_GRADATION_SKILL_ID
        ? [skillId]
        : [CONSONANT_GRADATION_SKILL_ID, skillId],
    ...(optional ? { optional: true } : {}),
  }
}

function vocabularySlot(role: string, accepted: string[], itemId: string) {
  return { role, accepted, itemIds: [itemId] }
}

function lexicalForm(
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

function negateRussian(value: string) {
  if (value.startsWith('мне ')) return `Мне не ${value.slice(4)}`
  if (value.startsWith('тебе ')) return `Тебе не ${value.slice(5)}`
  const [subject, ...predicate] = value.split(' ')
  return `${capitalize(subject!)} не ${predicate.join(' ')}`
}

function questionParticle(value: string) {
  return /[aou]/u.test(value) ? 'ko' : 'kö'
}
