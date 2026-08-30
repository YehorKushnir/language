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
  version: 3,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'gradation-principle',
      title: { ru: 'Где появляются сильная и слабая ступени' },
      paragraphs: [
        {
          ru: 'Внутри основы k, p и t могут чередоваться. У многих глаголов первого типа hän показывает сильную ступень, а minä, sinä, me и te — слабую. У части глаголов типов 3 и 4 направление обратное: инфинитив слабый, а личная основа сильная.',
        },
        {
          ru: 'Чередование принадлежит конкретному слову и модели. Поэтому порядок всегда один: определить тип, построить основу, выбрать нужную ступень и добавить личное окончание.',
        },
      ],
      table: {
        headers: [
          { ru: 'Модель' },
          { ru: 'Исходная форма' },
          { ru: 'Личная форма' },
          { ru: 'Направление' },
        ],
        rows: [
          [
            { ru: 'тип 1' },
            { ru: 'hän ottaa' },
            { ru: 'minä otan' },
            { ru: 'tt → t' },
          ],
          [
            { ru: 'тип 1' },
            { ru: 'hän antaa' },
            { ru: 'minä annan' },
            { ru: 'nt → nn' },
          ],
          [
            { ru: 'тип 4' },
            { ru: 'tavata' },
            { ru: 'minä tapaan' },
            { ru: 'v → p' },
          ],
          [
            { ru: 'тип 4' },
            { ru: 'tykätä' },
            { ru: 'minä tykkään' },
            { ru: 'k → kk' },
          ],
        ],
      },
      examples: [
        {
          target: 'Hän ottaa. Minä otan.',
          source: { ru: 'Он берёт. Я беру.' },
        },
        {
          target: 'Tavata → minä tapaan.',
          source: { ru: 'встречать → я встречаю' },
        },
      ],
    },
    {
      id: 'quantitative-gradation',
      title: { ru: 'Количественное чередование' },
      paragraphs: [
        {
          ru: 'Двойной согласный сокращается: kk → k, pp → p, tt → t. Долгота согласного различает формы, поэтому её нельзя считать мелкой орфографией.',
        },
      ],
      table: {
        headers: [{ ru: 'Сильная' }, { ru: 'Слабая' }, { ru: 'Пример' }],
        rows: [
          [{ ru: 'kk' }, { ru: 'k' }, { ru: 'nukkua → nukun' }],
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
      title: { ru: 'Качественное чередование' },
      paragraphs: [
        {
          ru: 'В качественных парах меняется сам согласный: p → v, t → d, nk → ng, а k иногда исчезает. Конкретную пару полезно хранить вместе с формой minä.',
        },
      ],
      table: {
        headers: [{ ru: 'Сильная' }, { ru: 'Слабая' }, { ru: 'Пример' }],
        rows: [
          [{ ru: 'p' }, { ru: 'v' }, { ru: 'leipoa → leivon' }],
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
    },
    {
      id: 'reverse-gradation',
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
    },
    {
      id: 'noun-recognition',
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
        },
        {
          target: 'Sä tykkäät siitä.',
          source: { ru: 'Тебе это нравится.' },
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
          ...(lemma === 'kauppa' ? { inflectionType: '9' } : {}),
        }),
        lexicalForm(serial, 'genitive-sg', genitive, {
          case: 'genitive',
          number: 'singular',
        }),
        ...supplementalNounForms(serial, lemma),
      ],
    }
  },
)

function supplementalNounForms(
  serial: string,
  lemma: string,
): LessonVocabularySeed['forms'] {
  if (lemma !== 'kauppa') return []

  return [
    lexicalForm(serial, 'partitive-sg', 'kauppaa', {
      case: 'partitive',
      number: 'singular',
    }),
    lexicalForm(serial, 'illative-sg', 'kauppaan', {
      case: 'illative',
      number: 'singular',
    }),
    lexicalForm(serial, 'nominative-pl', 'kaupat', {
      case: 'nominative',
      number: 'plural',
    }),
    lexicalForm(serial, 'partitive-pl', 'kauppoja', {
      case: 'partitive',
      number: 'plural',
    }),
    lexicalForm(serial, 'elative-pl', 'kaupoista', {
      case: 'elative',
      number: 'plural',
    }),
  ]
}

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
  ...exerciseGroup('word', 0, 26, (index) => affirmative(index % 2, index)),
  ...exerciseGroup('context', 26, 26, (index) => {
    const personIndex = 2 + (index % 4)
    return affirmative(personIndex, index)
  }),
  ...exerciseGroup('pair', 52, 4, (index) => negative(index % 2, index)),
  ...exerciseGroup('pair', 56, 4, (index) => packingQuestion(index)),
]

export const consonantGradationGoldenExerciseIds = [
  'exercise.fi.consonant-gradation.word.1',
  'exercise.fi.consonant-gradation.word.2',
  'exercise.fi.consonant-gradation.context.1',
  'exercise.fi.consonant-gradation.pair.1',
  'exercise.fi.consonant-gradation.pair.5',
] as const

function affirmative(personIndex: number, nounIndex: number) {
  const item = verbs[1]!
  const vocabulary = consonantGradationVocabulary[nounIndex % nouns.length]!
  const pronouns = ['Minä', 'Sinä', 'Hän', 'Me', 'Te', 'He']
  const skillId =
    personIndex === 2 || personIndex === 5
      ? CONSONANT_GRADATION_STRONG_SKILL_ID
      : CONSONANT_GRADATION_WEAK_SKILL_ID
  const adverbPosition = nounIndex % 3
  const targetText =
    adverbPosition === 1
      ? `Nyt ${pronouns[personIndex]!.toLocaleLowerCase('fi')} ${item.forms[personIndex]}: ${vocabulary.lemma}.`
      : adverbPosition === 2
        ? `${pronouns[personIndex]} ${item.forms[personIndex]} nyt: ${vocabulary.lemma}.`
        : `${pronouns[personIndex]} ${item.forms[personIndex]}: ${vocabulary.lemma}.`
  const canOmit = personIndex === 0 || personIndex === 1 || personIndex === 3
  const promptPrefix = adverbPosition === 0 ? '' : 'Сейчас '
  const withoutSubject =
    adverbPosition === 1
      ? `Nyt ${item.forms[personIndex]}: ${vocabulary.lemma}.`
      : adverbPosition === 2
        ? `${capitalize(item.forms[personIndex]!)} nyt: ${vocabulary.lemma}.`
        : `${capitalize(item.forms[personIndex]!)}: ${vocabulary.lemma}.`
  return {
    prompt: `${promptPrefix}${adverbPosition === 0 ? capitalize(item.source[personIndex]!) : item.source[personIndex]}: «${vocabulary.lemma}».`,
    targetText,
    acceptedVariants: canOmit ? [targetText, withoutSubject] : [targetText],
    slots: [
      ...(adverbPosition === 1
        ? [grammarSlot('adverb', ['nyt'], skillId)]
        : []),
      grammarSlot(
        'subject',
        [pronouns[personIndex]!.toLocaleLowerCase('fi')],
        skillId,
        canOmit,
      ),
      grammarSlot('mainVerb', [item.forms[personIndex]!], skillId),
      ...(adverbPosition === 2
        ? [grammarSlot('adverb', ['nyt'], skillId)]
        : []),
      vocabularySlot(vocabulary.lemma, vocabulary.itemId, skillId),
    ],
    primaryItemId: CONSONANT_GRADATION_SKILL_ID,
    secondaryItemIds: [skillId],
    vocabularyItemId: vocabulary.itemId,
  }
}

function negative(personIndex: number, nounIndex: number) {
  const item = verbs[1]!
  const vocabulary = consonantGradationVocabulary[nounIndex % nouns.length]!
  const pronoun = personIndex === 0 ? 'Minä' : 'Sinä'
  const negativeVerb = personIndex === 0 ? 'en' : 'et'
  const targetText = `${pronoun} ${negativeVerb} ${item.connegative}: ${vocabulary.lemma}.`
  return {
    prompt: `${negateRussian(item.source[personIndex]!)}: «${vocabulary.lemma}».`,
    targetText,
    acceptedVariants: [
      targetText,
      `${capitalize(negativeVerb)} ${item.connegative}: ${vocabulary.lemma}.`,
    ],
    slots: [
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
      vocabularySlot(
        vocabulary.lemma,
        vocabulary.itemId,
        CONSONANT_GRADATION_WEAK_SKILL_ID,
      ),
    ],
    primaryItemId: CONSONANT_GRADATION_SKILL_ID,
    secondaryItemIds: [CONSONANT_GRADATION_WEAK_SKILL_ID],
    vocabularyItemId: vocabulary.itemId,
  }
}

function packingQuestion(index: number) {
  const item = verbs[9]!
  const nounIndexes = [20, 21, 22, 5] as const
  const vocabulary = consonantGradationVocabulary[nounIndexes[index]!]!
  const questionForm = `${item.forms[1]}${questionParticle(item.forms[1]!)}`
  const targetText = `${capitalize(questionForm)} sinä nyt? ${capitalize(vocabulary.lemma)} on tässä.`
  return {
    prompt: `Ты сейчас собираешь вещи? ${capitalize(vocabulary.gloss)} здесь.`,
    targetText,
    acceptedVariants: [
      targetText,
      `${capitalize(questionForm)} nyt? ${capitalize(vocabulary.lemma)} on tässä.`,
    ],
    slots: [
      grammarSlot(
        'questionVerb',
        [questionForm],
        CONSONANT_GRADATION_STRONG_SKILL_ID,
      ),
      grammarSlot(
        'subject',
        ['sinä'],
        CONSONANT_GRADATION_STRONG_SKILL_ID,
        true,
      ),
      grammarSlot('adverb', ['nyt'], CONSONANT_GRADATION_STRONG_SKILL_ID),
      vocabularySlot(
        vocabulary.lemma,
        vocabulary.itemId,
        CONSONANT_GRADATION_STRONG_SKILL_ID,
      ),
      grammarSlot('copula', ['on'], CONSONANT_GRADATION_STRONG_SKILL_ID),
      grammarSlot('location', ['tässä'], CONSONANT_GRADATION_STRONG_SKILL_ID),
    ],
    primaryItemId: CONSONANT_GRADATION_SKILL_ID,
    secondaryItemIds: [CONSONANT_GRADATION_STRONG_SKILL_ID],
    vocabularyItemId: vocabulary.itemId,
  }
}

function vocabularySlot(value: string, itemId: string, skillId: string) {
  return {
    role: 'citedWord',
    accepted: [value],
    itemIds: [CONSONANT_GRADATION_SKILL_ID, skillId, itemId],
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
