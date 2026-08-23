import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './fi.olla.basics.js'

export const INTERNAL_CASES_SKILL_ID = 'grammar.fi.local-cases.internal'
export const INTERNAL_CASES_DIRECTION_SKILL_ID =
  'grammar.fi.local-cases.internal.direction'
export const LOCATION_SERIES_CHOICE_SKILL_ID =
  'grammar.fi.local-cases.series-choice'

export const internalCasesSkills: CourseSkillSeed[] = [
  {
    id: INTERNAL_CASES_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Внутренние местные падежи' },
    description: {
      ru: 'Missä, mihin и mistä: место, направление и исходная точка.',
    },
    prerequisiteSkillIds: ['grammar.fi.partitive.usage'],
  },
  {
    id: INTERNAL_CASES_DIRECTION_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Направление во внутренней серии' },
    description: { ru: 'Иллатив и элатив в парах menen/tulen.' },
    prerequisiteSkillIds: [INTERNAL_CASES_SKILL_ID],
  },
  {
    id: LOCATION_SERIES_CHOICE_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Лексический выбор местной серии' },
    description: { ru: 'Исключения вроде asemalla и torilla.' },
    prerequisiteSkillIds: [INTERNAL_CASES_SKILL_ID],
  },
]

export const internalCasesContent: CourseLessonContentSeed = {
  version: 2,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'internal-case-matrix',
      eyebrow: { ru: 'Матрица' },
      title: { ru: 'Где, куда и откуда' },
      paragraphs: [
        {
          ru: 'Внутренняя серия описывает нахождение внутри или связь с ограниченным местом. Missä требует инессива, mihin — иллатива, mistä — элатива.',
        },
      ],
      examples: [
        { target: 'Olen koulussa.', source: { ru: 'Я в школе.' } },
        { target: 'Menen kouluun.', source: { ru: 'Я иду в школу.' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Ответь на missä: koulu → ___' },
          answer: 'koulussa',
          explanation: { ru: 'Местонахождение внутри получает -ssa.' },
        },
      ],
    },
    {
      id: 'internal-case-table',
      eyebrow: { ru: 'Формы' },
      title: { ru: 'Три направления одной основы' },
      paragraphs: [
        {
          ru: 'Инесив и элатив имеют прозрачные окончания -ssa/-ssä и -sta/-stä. Иллатив зависит от типа основы: kouluun, hotelliin, huoneeseen.',
        },
      ],
      table: {
        headers: [{ ru: 'Вопрос' }, { ru: 'Падеж' }, { ru: 'Форма' }],
        rows: [
          [{ ru: 'missä?' }, { ru: 'inessiivi' }, { ru: 'koulussa' }],
          [{ ru: 'mihin?' }, { ru: 'illatiivi' }, { ru: 'kouluun' }],
          [{ ru: 'mistä?' }, { ru: 'elatiivi' }, { ru: 'koulusta' }],
        ],
      },
      examples: [
        {
          target: 'hotellissa — hotelliin — hotellista',
          source: { ru: 'в отеле — в отель — из отеля' },
        },
        {
          target: 'huoneessa — huoneeseen — huoneesta',
          source: { ru: 'в комнате — в комнату — из комнаты' },
        },
      ],
    },
    {
      id: 'illative-models',
      eyebrow: { ru: 'Иллатив' },
      title: { ru: 'Не своди направление к одному окончанию' },
      paragraphs: [
        {
          ru: 'После одной гласной она часто удлиняется перед -n. У основ на -e появляется -seen, а некоторые формы требуют готовой падежной основы.',
        },
      ],
      examples: [
        {
          target: 'ravintola → ravintolaan',
          source: { ru: 'ресторан → в ресторан' },
        },
        {
          target: 'tehdas → tehtaaseen',
          source: { ru: 'фабрика → на фабрику' },
        },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Ответь на mihin: hotelli → ___' },
          answer: 'hotelliin',
          explanation: { ru: 'Конечная i удлиняется перед -n.' },
        },
      ],
    },
    {
      id: 'series-exceptions',
      eyebrow: { ru: 'Выбор серии' },
      title: { ru: 'Некоторые места требуют внешнюю серию' },
      paragraphs: [
        {
          ru: 'Форма выбирается не по русскому предлогу. Asema, tori и lentokenttä обычно употребляются как asemalla, torilla и lentokentällä; эти пары учатся лексически.',
        },
      ],
      examples: [
        { target: 'Olen asemalla.', source: { ru: 'Я на станции.' } },
        { target: 'Menen torille.', source: { ru: 'Я иду на площадь.' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Выбери: asemassa или asemalla?' },
          answer: 'asemalla',
          explanation: { ru: 'В значении станции используется внешняя серия.' },
        },
      ],
    },
    {
      id: 'local-case-verbs',
      eyebrow: { ru: 'Контекст' },
      title: { ru: 'Глагол подсказывает направление' },
      paragraphs: [
        {
          ru: 'Olla описывает положение, mennä — движение к цели, tulla — движение от исходной точки. Сначала выбери отношение, затем конкретную форму места.',
        },
      ],
      examples: [
        { target: 'Hän on kirjastossa.', source: { ru: 'Он в библиотеке.' } },
        {
          target: 'Hän tulee kirjastosta.',
          source: { ru: 'Он идёт из библиотеки.' },
        },
      ],
    },
    {
      id: 'internal-errors-register',
      eyebrow: { ru: 'Контроль' },
      title: { ru: 'Типичные ошибки и puhekieli' },
      paragraphs: [
        {
          ru: 'Типичная ошибка — использовать форму «где» после глагола движения: menen koulussa. Правильно menen kouluun.',
        },
        {
          ru: 'В puhekieli окончания могут сокращаться: koulussa → koulus, koulusta → koulust. В ответах kirjakieli сохраняй полные формы.',
        },
      ],
      examples: [
        {
          target: 'Mä oon koulus.',
          source: { ru: 'Я в школе.' },
          note: { ru: 'Kirjakieli: Minä olen koulussa.' },
        },
        {
          target: 'Tuun koulust.',
          source: { ru: 'Я иду из школы.' },
          note: { ru: 'Kirjakieli: Tulen koulusta.' },
        },
      ],
      callout: { ru: 'missä = положение, mihin = цель, mistä = источник.' },
    },
  ],
}

const places = [
  [
    'koulu',
    'школа',
    'в школе',
    'в школу',
    'из школы',
    'koulussa',
    'kouluun',
    'koulusta',
    'internal',
  ],
  [
    'yliopisto',
    'университет',
    'в университете',
    'в университет',
    'из университета',
    'yliopistossa',
    'yliopistoon',
    'yliopistosta',
    'internal',
  ],
  [
    'kirjasto',
    'библиотека',
    'в библиотеке',
    'в библиотеку',
    'из библиотеки',
    'kirjastossa',
    'kirjastoon',
    'kirjastosta',
    'internal',
  ],
  [
    'museo',
    'музей',
    'в музее',
    'в музей',
    'из музея',
    'museossa',
    'museoon',
    'museosta',
    'internal',
  ],
  [
    'ravintola',
    'ресторан',
    'в ресторане',
    'в ресторан',
    'из ресторана',
    'ravintolassa',
    'ravintolaan',
    'ravintolasta',
    'internal',
  ],
  [
    'kahvila',
    'кафе',
    'в кафе',
    'в кафе',
    'из кафе',
    'kahvilassa',
    'kahvilaan',
    'kahvilasta',
    'internal',
  ],
  [
    'hotelli',
    'отель',
    'в отеле',
    'в отель',
    'из отеля',
    'hotellissa',
    'hotelliin',
    'hotellista',
    'internal',
  ],
  [
    'sairaala',
    'больница',
    'в больнице',
    'в больницу',
    'из больницы',
    'sairaalassa',
    'sairaalaan',
    'sairaalasta',
    'internal',
  ],
  [
    'apteekki',
    'аптека',
    'в аптеке',
    'в аптеку',
    'из аптеки',
    'apteekissa',
    'apteekkiin',
    'apteekista',
    'internal',
  ],
  [
    'asema',
    'станция',
    'на станции',
    'на станцию',
    'со станции',
    'asemalla',
    'asemalle',
    'asemalta',
    'external',
  ],
  [
    'lentokenttä',
    'аэропорт',
    'в аэропорту',
    'в аэропорт',
    'из аэропорта',
    'lentokentällä',
    'lentokentälle',
    'lentokentältä',
    'external',
  ],
  [
    'satama',
    'порт',
    'в порту',
    'в порт',
    'из порта',
    'satamassa',
    'satamaan',
    'satamasta',
    'internal',
  ],
  [
    'tehdas',
    'фабрика',
    'на фабрике',
    'на фабрику',
    'с фабрики',
    'tehtaassa',
    'tehtaaseen',
    'tehtaasta',
    'internal',
  ],
  [
    'toimisto',
    'офис',
    'в офисе',
    'в офис',
    'из офиса',
    'toimistossa',
    'toimistoon',
    'toimistosta',
    'internal',
  ],
  [
    'myymälä',
    'торговая точка',
    'в магазине',
    'в магазин',
    'из магазина',
    'myymälässä',
    'myymälään',
    'myymälästä',
    'internal',
  ],
  [
    'posti',
    'почта',
    'на почте',
    'на почту',
    'с почты',
    'postissa',
    'postiin',
    'postista',
    'internal',
  ],
  [
    'poliisiasema',
    'полицейский участок',
    'в полицейском участке',
    'в полицейский участок',
    'из полицейского участка',
    'poliisiasemalla',
    'poliisiasemalle',
    'poliisiasemalta',
    'external',
  ],
  [
    'kirkko',
    'церковь',
    'в церкви',
    'в церковь',
    'из церкви',
    'kirkossa',
    'kirkkoon',
    'kirkosta',
    'internal',
  ],
  [
    'puisto',
    'парк',
    'в парке',
    'в парк',
    'из парка',
    'puistossa',
    'puistoon',
    'puistosta',
    'internal',
  ],
  [
    'tori',
    'площадь',
    'на площади',
    'на площадь',
    'с площади',
    'torilla',
    'torille',
    'torilta',
    'external',
  ],
  [
    'elokuvateatteri',
    'кинотеатр',
    'в кинотеатре',
    'в кинотеатр',
    'из кинотеатра',
    'elokuvateatterissa',
    'elokuvateatteriin',
    'elokuvateatterista',
    'internal',
  ],
  [
    'kuntosali',
    'тренажёрный зал',
    'в тренажёрном зале',
    'в тренажёрный зал',
    'из тренажёрного зала',
    'kuntosalilla',
    'kuntosalille',
    'kuntosalilta',
    'external',
  ],
  [
    'uimahalli',
    'бассейн',
    'в бассейне',
    'в бассейн',
    'из бассейна',
    'uimahallissa',
    'uimahalliin',
    'uimahallista',
    'internal',
  ],
  [
    'päiväkoti',
    'детский сад',
    'в детском саду',
    'в детский сад',
    'из детского сада',
    'päiväkodissa',
    'päiväkotiin',
    'päiväkodista',
    'internal',
  ],
  [
    'hissi',
    'лифт',
    'в лифте',
    'в лифт',
    'из лифта',
    'hississä',
    'hissiin',
    'hissistä',
    'internal',
  ],
  [
    'kerros',
    'этаж',
    'на этаже',
    'на этаж',
    'с этажа',
    'kerroksessa',
    'kerrokseen',
    'kerroksesta',
    'internal',
  ],
] as const

interface PlaceVocabulary extends LessonVocabularySeed {
  where: string
  to: string
  from: string
  sourceWhere: string
  sourceTo: string
  sourceFrom: string
  series: string
}

export const internalCasesVocabulary: PlaceVocabulary[] = places.map(
  (
    [lemma, gloss, sourceWhere, sourceTo, sourceFrom, where, to, from, series],
    index,
  ) => {
    const serial = `12.${String(index + 1).padStart(2, '0')}`
    return {
      key: `place-${lemma}`,
      itemId: `word.fi.m1.${serial}`,
      conceptId: `concept.fi.m1.${serial}`,
      lexicalEntryId: `lex.fi.${lemma}`,
      lemma,
      partOfSpeech: 'noun',
      gloss,
      where,
      to,
      from,
      sourceWhere,
      sourceTo,
      sourceFrom,
      series,
      example: {
        target: `Olen ${where}.`,
        source: { ru: `Я ${sourceWhere}.` },
      },
      semanticTypes: ['place', `local-series:${series}`],
      singular: lemma,
      plural: where,
      sourceSingular: gloss,
      sourcePlural: sourceWhere,
      forms: [
        form(serial, 'nominative-sg', lemma, {
          case: 'nominative',
          number: 'singular',
        }),
        form(serial, 'location', where, {
          case: series === 'internal' ? 'inessive' : 'adessive',
          number: 'singular',
        }),
        form(serial, 'direction', to, {
          case: series === 'internal' ? 'illative' : 'allative',
          number: 'singular',
        }),
        form(serial, 'origin', from, {
          case: series === 'internal' ? 'elative' : 'ablative',
          number: 'singular',
        }),
      ],
    }
  },
)

export const internalCasesExercises: PreparedExerciseSeed[] = [
  ...group('word', 0, 26, (index) => build(index, 'where')),
  ...group('context', 26, 10, (index) => build(index + 5, 'to')),
  ...group('context', 36, 8, (index) => build(index + 12, 'from')),
  ...group('context', 44, 8, (index) => build(index + 18, 'negative')),
  ...group('pair', 52, 8, (index) => build(index + 2, 'question')),
]

export const internalCasesGoldenExerciseIds = [
  'exercise.fi.local-cases.internal.word.1',
  'exercise.fi.local-cases.internal.word.10',
  'exercise.fi.local-cases.internal.context.1',
  'exercise.fi.local-cases.internal.context.11',
  'exercise.fi.local-cases.internal.pair.1',
] as const

type Frame = 'where' | 'to' | 'from' | 'negative' | 'question'

function build(index: number, frame: Frame) {
  const item = internalCasesVocabulary[index % places.length]!
  const secondary =
    item.series === 'external'
      ? LOCATION_SERIES_CHOICE_SKILL_ID
      : frame === 'where' || frame === 'negative' || frame === 'question'
        ? undefined
        : INTERNAL_CASES_DIRECTION_SKILL_ID
  const frames = {
    where: {
      prompt: `Я ${item.sourceWhere}.`,
      target: `Minä olen ${item.where}.`,
      variants: [`Olen ${item.where}.`],
      slots: [
        slot('subject', ['minä'], secondary, true),
        slot('copula', ['olen'], secondary),
      ],
      value: item.where,
    },
    to: {
      prompt: `Я иду ${item.sourceTo}.`,
      target: `Minä menen ${item.to}.`,
      variants: [`Menen ${item.to}.`],
      slots: [
        slot('subject', ['minä'], secondary, true),
        slot('movementVerb', ['menen'], secondary),
      ],
      value: item.to,
    },
    from: {
      prompt: `Сейчас я иду ${item.sourceFrom}.`,
      target: `Nyt minä tulen ${item.from}.`,
      variants: [`Nyt tulen ${item.from}.`],
      slots: [
        slot('adverb', ['nyt'], secondary),
        slot('subject', ['minä'], secondary, true),
        slot('movementVerb', ['tulen'], secondary),
      ],
      value: item.from,
    },
    negative: {
      prompt: `Я не ${item.sourceWhere}.`,
      target: `Minä en ole ${item.where}.`,
      variants: [`En ole ${item.where}.`],
      slots: [
        slot('subject', ['minä'], secondary, true),
        slot('negativeVerb', ['en'], secondary),
        slot('copula', ['ole'], secondary),
      ],
      value: item.where,
    },
    question: {
      prompt: `Ты ${item.sourceWhere}?`,
      target: `Oletko sinä ${item.where}?`,
      variants: [`Oletko ${item.where}?`],
      slots: [
        slot('questionCopula', ['oletko'], secondary),
        slot('subject', ['sinä'], secondary, true),
      ],
      value: item.where,
    },
  } satisfies Record<
    Frame,
    {
      prompt: string
      target: string
      variants: string[]
      slots: PreparedExerciseSeed['slots']
      value: string
    }
  >
  const selected = frames[frame]
  return {
    prompt: selected.prompt,
    targetText: selected.target,
    acceptedVariants: [selected.target, ...selected.variants],
    slots: [
      ...selected.slots,
      {
        role: 'location',
        accepted: [selected.value],
        itemIds: [
          INTERNAL_CASES_SKILL_ID,
          ...(secondary ? [secondary] : []),
          item.itemId,
        ],
      },
    ],
    primaryItemId: INTERNAL_CASES_SKILL_ID,
    secondaryItemIds: secondary ? [secondary] : [],
    vocabularyItemId: item.itemId,
  }
}

function slot(
  role: string,
  accepted: string[],
  secondary?: string,
  optional = false,
) {
  return {
    role,
    accepted,
    itemIds: [INTERNAL_CASES_SKILL_ID, ...(secondary ? [secondary] : [])],
    ...(optional ? { optional: true } : {}),
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
    id: `exercise.fi.local-cases.internal.${category}.${start + index - base + 1}`,
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
