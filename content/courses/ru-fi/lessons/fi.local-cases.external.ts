import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './fi.olla.basics.js'

export const EXTERNAL_CASES_SKILL_ID = 'grammar.fi.local-cases.external'
export const EXTERNAL_DIRECTION_SKILL_ID =
  'grammar.fi.local-cases.external.direction'
export const EXTERNAL_INSTRUMENT_SKILL_ID =
  'grammar.fi.local-cases.external.instrument'

export const externalCasesSkills: CourseSkillSeed[] = [
  {
    id: EXTERNAL_CASES_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Внешние местные падежи' },
    description: {
      ru: 'Адессив, аллатив и аблатив в пространстве и способе передвижения.',
    },
    prerequisiteSkillIds: ['grammar.fi.local-cases.internal'],
  },
  {
    id: EXTERNAL_DIRECTION_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Направление во внешней серии' },
    description: { ru: 'Формы на -lle и -lta/-ltä.' },
    prerequisiteSkillIds: [EXTERNAL_CASES_SKILL_ID],
  },
  {
    id: EXTERNAL_INSTRUMENT_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Адессив транспорта' },
    description: { ru: 'Способ передвижения: bussilla, junalla, autolla.' },
    prerequisiteSkillIds: [EXTERNAL_CASES_SKILL_ID],
  },
]

export const externalCasesContent: CourseLessonContentSeed = {
  version: 2,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'external-matrix',
      eyebrow: { ru: 'Матрица' },
      title: { ru: 'На чём, куда и откуда' },
      paragraphs: [
        {
          ru: 'Внешняя серия использует -lla/-llä для положения или инструмента, -lle для направления к поверхности и -lta/-ltä для движения от неё.',
        },
      ],
      examples: [
        { target: 'Olen järvellä.', source: { ru: 'Я на озере.' } },
        { target: 'Menen järvelle.', source: { ru: 'Я еду на озеро.' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Ответь на missä: järvi → ___' },
          answer: 'järvellä',
          explanation: { ru: 'С järvi обычно используется внешняя серия.' },
        },
      ],
    },
    {
      id: 'external-table',
      eyebrow: { ru: 'Формы' },
      title: { ru: 'Три окончания внешней серии' },
      paragraphs: [
        {
          ru: 'Все три формы строятся от одной падежной основы. Гармония гласных выбирает lla или llä, lta или ltä.',
        },
      ],
      table: {
        headers: [{ ru: 'Вопрос' }, { ru: 'Падеж' }, { ru: 'Пример' }],
        rows: [
          [{ ru: 'missä / millä?' }, { ru: 'adessiivi' }, { ru: 'järvellä' }],
          [{ ru: 'mihin?' }, { ru: 'allatiivi' }, { ru: 'järvelle' }],
          [{ ru: 'mistä?' }, { ru: 'ablatiivi' }, { ru: 'järveltä' }],
        ],
      },
      examples: [
        {
          target: 'tiellä — tielle — tieltä',
          source: { ru: 'на дороге — на дорогу — с дороги' },
        },
        {
          target: 'saarella — saarelle — saarelta',
          source: { ru: 'на острове — на остров — с острова' },
        },
      ],
    },
    {
      id: 'transport-adessive',
      eyebrow: { ru: 'Транспорт' },
      title: { ru: 'Способ передвижения выражается адессивом' },
      paragraphs: [
        {
          ru: 'Bussilla, junalla и autolla отвечают на вопрос millä — «на чём». Для движения внутрь транспорта используются другие формы: bussiin, junaan, autoon.',
        },
      ],
      examples: [
        { target: 'Matkustan bussilla.', source: { ru: 'Я еду на автобусе.' } },
        { target: 'Tulen junalla.', source: { ru: 'Я приезжаю на поезде.' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Вставь способ: Menen ___ (автобус).' },
          answer: 'bussilla',
          explanation: { ru: 'Способ передвижения требует адессива.' },
        },
      ],
    },
    {
      id: 'series-contrast',
      eyebrow: { ru: 'Контраст' },
      title: { ru: 'Выбор серии хранится вместе со словом' },
      paragraphs: [
        {
          ru: 'Русский предлог не выбирает финский падеж: järvellä, но metsässä; vuorella, но auringossa. Учи место сразу в короткой тройке форм.',
        },
      ],
      examples: [
        { target: 'järvellä — metsässä', source: { ru: 'на озере — в лесу' } },
        { target: 'vuorelle — metsään', source: { ru: 'на гору — в лес' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Выбери: metsässä или metsällä?' },
          answer: 'metsässä',
          explanation: { ru: 'Metsä употребляется во внутренней серии.' },
        },
      ],
    },
    {
      id: 'weather-context',
      eyebrow: { ru: 'Погода' },
      title: { ru: 'Местные формы получают переносные значения' },
      paragraphs: [
        {
          ru: 'Sateessa, tuulessa и auringossa описывают условия, а не буквальное нахождение внутри. Значение падежа уточняется лексическим контекстом.',
        },
      ],
      examples: [
        { target: 'Kävelen sateessa.', source: { ru: 'Я иду под дождём.' } },
        { target: 'Istun auringossa.', source: { ru: 'Я сижу на солнце.' } },
      ],
    },
    {
      id: 'external-errors-register',
      eyebrow: { ru: 'Контроль' },
      title: { ru: 'Типичные ошибки и puhekieli' },
      paragraphs: [
        {
          ru: 'Типичная ошибка — применять внешнюю серию ко всем открытым местам или путать инструмент с направлением: menen bussilla означает «еду автобусом», menen bussiin — «захожу в автобус».',
        },
        {
          ru: 'В puhekieli окончания могут сокращаться: järvellä → järvel. В письменных ответах kirjakieli сохраняй -llä, -lle и -ltä.',
        },
      ],
      examples: [
        {
          target: 'Mä meen bussil.',
          source: { ru: 'Я еду автобусом.' },
          note: { ru: 'Kirjakieli: Minä menen bussilla.' },
        },
        {
          target: 'Tuun järvelt.',
          source: { ru: 'Я еду с озера.' },
          note: { ru: 'Kirjakieli: Tulen järveltä.' },
        },
      ],
      callout: { ru: 'Различай место, направление, источник и способ.' },
    },
  ],
}

const items = [
  ['bussi', 'автобус', 'на автобусе', 'bussilla', '', '', 'instrument'],
  ['juna', 'поезд', 'на поезде', 'junalla', '', '', 'instrument'],
  [
    'raitiovaunu',
    'трамвай',
    'на трамвае',
    'raitiovaunulla',
    '',
    '',
    'instrument',
  ],
  ['metro', 'метро', 'на метро', 'metrolla', '', '', 'instrument'],
  ['taksi', 'такси', 'на такси', 'taksilla', '', '', 'instrument'],
  [
    'polkupyörä',
    'велосипед',
    'на велосипеде',
    'polkupyörällä',
    '',
    '',
    'instrument',
  ],
  ['auto', 'автомобиль', 'на автомобиле', 'autolla', '', '', 'instrument'],
  ['tie', 'дорога', 'на дороге', 'tiellä', 'tielle', 'tieltä', 'external'],
  [
    'risteys',
    'перекрёсток',
    'на перекрёстке',
    'risteyksessä',
    'risteykseen',
    'risteyksestä',
    'internal',
  ],
  [
    'liikennevalo',
    'светофор',
    'у светофора',
    'liikennevalolla',
    'liikennevalolle',
    'liikennevalolta',
    'external',
  ],
  [
    'pysäkki',
    'остановка',
    'на остановке',
    'pysäkillä',
    'pysäkille',
    'pysäkiltä',
    'external',
  ],
  ['metsä', 'лес', 'в лесу', 'metsässä', 'metsään', 'metsästä', 'internal'],
  [
    'järvi',
    'озеро',
    'на озере',
    'järvellä',
    'järvelle',
    'järveltä',
    'external',
  ],
  ['meri', 'море', 'на море', 'merellä', 'merelle', 'mereltä', 'external'],
  ['joki', 'река', 'на реке', 'joella', 'joelle', 'joelta', 'external'],
  ['vuori', 'гора', 'на горе', 'vuorella', 'vuorelle', 'vuorelta', 'external'],
  [
    'saari',
    'остров',
    'на острове',
    'saarella',
    'saarelle',
    'saarelta',
    'external',
  ],
  ['pelto', 'поле', 'на поле', 'pellolla', 'pellolle', 'pellolta', 'external'],
  ['niitty', 'луг', 'на лугу', 'niityllä', 'niitylle', 'niityltä', 'external'],
  ['puu', 'дерево', 'на дереве', 'puussa', 'puuhun', 'puusta', 'internal'],
  [
    'ruoho',
    'трава',
    'на траве',
    'ruoholla',
    'ruoholle',
    'ruoholta',
    'external',
  ],
  ['lumi', 'снег', 'в снегу', 'lumessa', 'lumeen', 'lumesta', 'internal'],
  [
    'sade',
    'дождь',
    'под дождём',
    'sateessa',
    'sateeseen',
    'sateesta',
    'internal',
  ],
  ['tuuli', 'ветер', 'на ветру', 'tuulessa', 'tuuleen', 'tuulesta', 'internal'],
  [
    'aurinko',
    'солнце',
    'на солнце',
    'auringossa',
    'aurinkoon',
    'auringosta',
    'internal',
  ],
  [
    'pilvi',
    'облако',
    'в облаке',
    'pilvessä',
    'pilveen',
    'pilvestä',
    'internal',
  ],
] as const

interface ExternalVocabulary extends LessonVocabularySeed {
  location: string
  direction: string
  origin: string
  sourceLocation: string
  usage: string
}

export const externalCasesVocabulary: ExternalVocabulary[] = items.map(
  (
    [lemma, gloss, sourceLocation, location, direction, origin, usage],
    index,
  ) => {
    const serial = `13.${String(index + 1).padStart(2, '0')}`
    return {
      key: `external-${lemma}`,
      itemId: `word.fi.m1.${serial}`,
      conceptId: `concept.fi.m1.${serial}`,
      lexicalEntryId: `lex.fi.${lemma}`,
      lemma,
      partOfSpeech: 'noun',
      gloss,
      location,
      direction,
      origin,
      sourceLocation,
      usage,
      example: {
        target:
          usage === 'instrument'
            ? `Matkustan ${location}.`
            : `Olen ${location}.`,
        source: {
          ru:
            usage === 'instrument'
              ? `Я еду ${sourceLocation}.`
              : `Я ${sourceLocation}.`,
        },
      },
      semanticTypes: ['transport-or-nature', `local-usage:${usage}`],
      singular: lemma,
      plural: location,
      sourceSingular: gloss,
      sourcePlural: sourceLocation,
      forms: [
        form(serial, 'nominative-sg', lemma, {
          case: 'nominative',
          number: 'singular',
        }),
        form(serial, 'location-or-instrument', location, {
          case:
            usage === 'external' || usage === 'instrument'
              ? 'adessive'
              : 'inessive',
          number: 'singular',
        }),
        ...(direction
          ? [
              form(serial, 'direction', direction, {
                case: usage === 'external' ? 'allative' : 'illative',
                number: 'singular',
              }),
              form(serial, 'origin', origin, {
                case: usage === 'external' ? 'ablative' : 'elative',
                number: 'singular',
              }),
            ]
          : []),
      ],
    }
  },
)

const directional = externalCasesVocabulary.filter((item) => item.direction)

export const externalCasesExercises: PreparedExerciseSeed[] = [
  ...group('word', 0, 26, (index) => location(index, 'plain')),
  ...group('context', 26, 10, (index) => direction(index, 'to')),
  ...group('context', 36, 8, (index) => direction(index + 7, 'from')),
  ...group('context', 44, 8, (index) => location(index + 12, 'negative')),
  ...group('pair', 52, 8, (index) => location(index + 7, 'question')),
]

export const externalCasesGoldenExerciseIds = [
  'exercise.fi.local-cases.external.word.1',
  'exercise.fi.local-cases.external.word.13',
  'exercise.fi.local-cases.external.context.1',
  'exercise.fi.local-cases.external.context.11',
  'exercise.fi.local-cases.external.pair.1',
] as const

function location(index: number, frame: 'plain' | 'negative' | 'question') {
  const item = externalCasesVocabulary[index % items.length]!
  const instrument = item.usage === 'instrument'
  const secondary = instrument ? EXTERNAL_INSTRUMENT_SKILL_ID : undefined
  const plainVerb = instrument ? 'matkustan' : 'olen'
  const source = instrument
    ? `Я еду ${item.sourceLocation}.`
    : `Я ${item.sourceLocation}.`
  const frames: Record<
    'plain' | 'negative' | 'question',
    {
      prompt: string
      target: string
      variants: string[]
      slots: PreparedExerciseSeed['slots']
    }
  > = {
    plain: {
      prompt: source,
      target: `Minä ${plainVerb} ${item.location}.`,
      variants: [`${capitalize(plainVerb)} ${item.location}.`],
      slots: [
        slot('subject', ['minä'], secondary, true),
        slot(instrument ? 'movementVerb' : 'copula', [plainVerb], secondary),
      ],
    },
    negative: {
      prompt: instrument
        ? `Я не еду ${item.sourceLocation}.`
        : `Я не ${item.sourceLocation}.`,
      target: `Minä en ${instrument ? 'matkusta' : 'ole'} ${item.location}.`,
      variants: [`En ${instrument ? 'matkusta' : 'ole'} ${item.location}.`],
      slots: [
        slot('subject', ['minä'], secondary, true),
        slot('negativeVerb', ['en'], secondary),
        slot(
          instrument ? 'movementVerb' : 'copula',
          [instrument ? 'matkusta' : 'ole'],
          secondary,
        ),
      ],
    },
    question: {
      prompt: instrument
        ? `Ты едешь ${item.sourceLocation}?`
        : `Ты ${item.sourceLocation}?`,
      target: `${instrument ? 'Matkustatko' : 'Oletko'} sinä ${item.location}?`,
      variants: [`${instrument ? 'Matkustatko' : 'Oletko'} ${item.location}?`],
      slots: [
        slot(
          instrument ? 'questionVerb' : 'questionCopula',
          [instrument ? 'matkustatko' : 'oletko'],
          secondary,
        ),
        slot('subject', ['sinä'], secondary, true),
      ],
    },
  }
  const selected = frames[frame]
  return exercise(item, selected, secondary, item.location)
}

function direction(index: number, frame: 'to' | 'from') {
  const item = directional[index % directional.length]!
  const value = frame === 'to' ? item.direction : item.origin
  const selected =
    frame === 'to'
      ? {
          prompt: `Я иду к месту «${item.gloss}».`,
          target: `Minä menen ${value}.`,
          variants: [`Menen ${value}.`],
          slots: [
            slot('subject', ['minä'], EXTERNAL_DIRECTION_SKILL_ID, true),
            slot('movementVerb', ['menen'], EXTERNAL_DIRECTION_SKILL_ID),
          ],
        }
      : {
          prompt: `Сейчас я иду от места «${item.gloss}».`,
          target: `Nyt minä tulen ${value}.`,
          variants: [`Nyt tulen ${value}.`],
          slots: [
            slot('adverb', ['nyt'], EXTERNAL_DIRECTION_SKILL_ID),
            slot('subject', ['minä'], EXTERNAL_DIRECTION_SKILL_ID, true),
            slot('movementVerb', ['tulen'], EXTERNAL_DIRECTION_SKILL_ID),
          ],
        }
  return exercise(item, selected, EXTERNAL_DIRECTION_SKILL_ID, value)
}

function exercise(
  item: ExternalVocabulary,
  selected: {
    prompt: string
    target: string
    variants: readonly string[]
    slots: PreparedExerciseSeed['slots']
  },
  secondary: string | undefined,
  value: string,
): Omit<PreparedExerciseSeed, 'id' | 'selectionOrder'> {
  return {
    prompt: selected.prompt,
    targetText: selected.target,
    acceptedVariants: [selected.target, ...selected.variants],
    slots: [
      ...selected.slots,
      {
        role: 'location',
        accepted: [value],
        itemIds: [
          EXTERNAL_CASES_SKILL_ID,
          ...(secondary ? [secondary] : []),
          item.itemId,
        ],
      },
    ],
    primaryItemId: EXTERNAL_CASES_SKILL_ID,
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
    itemIds: [EXTERNAL_CASES_SKILL_ID, ...(secondary ? [secondary] : [])],
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
    id: `exercise.fi.local-cases.external.${category}.${start + index - base + 1}`,
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
  return `${value.charAt(0).toLocaleUpperCase('fi')}${value.slice(1)}`
}
