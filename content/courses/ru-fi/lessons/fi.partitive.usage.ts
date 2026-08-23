import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './fi.olla.basics.js'

export const PARTITIVE_USAGE_SKILL_ID = 'grammar.fi.partitive.usage'
export const PARTITIVE_GOVERNMENT_SKILL_ID = 'grammar.fi.partitive.government'
export const PARTITIVE_NEGATIVE_SKILL_ID = 'grammar.fi.partitive.negative'
export const PARTITIVE_QUANTITY_SKILL_ID = 'grammar.fi.partitive.quantity'

export const partitiveUsageSkills: CourseSkillSeed[] = [
  {
    id: PARTITIVE_USAGE_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Основные случаи партитива' },
    description: {
      ru: 'Управление, отрицание, количество и незавершённый процесс.',
    },
    prerequisiteSkillIds: ['grammar.fi.partitive.formation'],
  },
  {
    id: PARTITIVE_GOVERNMENT_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Глагольное управление партитивом' },
    description: {
      ru: 'Партитив после ajatella, odottaa и других частотных глаголов.',
    },
    prerequisiteSkillIds: [PARTITIVE_USAGE_SKILL_ID],
  },
  {
    id: PARTITIVE_NEGATIVE_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Партитив в отрицании' },
    description: { ru: 'Объект отрицательного предложения в партитиве.' },
    prerequisiteSkillIds: [PARTITIVE_USAGE_SKILL_ID],
  },
  {
    id: PARTITIVE_QUANTITY_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Партитив после количества' },
    description: {
      ru: 'Единственное число партитива после чисел больше одного.',
    },
    prerequisiteSkillIds: [PARTITIVE_USAGE_SKILL_ID],
  },
]

export const partitiveUsageContent: CourseLessonContentSeed = {
  version: 3,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'partitive-functions',
      title: { ru: 'Когда нужен партитив' },
      paragraphs: [
        {
          ru: 'Партитив используется по нескольким причинам: для неопределённого количества, действия без указанного результата, отрицательного объекта, существительного после числительного и управления некоторых глаголов.',
        },
        {
          ru: 'Сначала определи причину выбора падежа, а затем образуй форму по правилам предыдущего урока. Одинаковое окончание может выполнять разные смысловые задачи.',
        },
      ],
      table: {
        headers: [
          { ru: 'Причина' },
          { ru: 'Вопрос к смыслу' },
          { ru: 'Пример' },
        ],
        rows: [
          [
            { ru: 'количество' },
            { ru: 'сколько-то чего' },
            { ru: 'Juon vettä.' },
          ],
          [
            { ru: 'процесс' },
            { ru: 'результат не указан' },
            { ru: 'Luen kirjaa.' },
          ],
          [
            { ru: 'отрицание' },
            { ru: 'объекта нет' },
            { ru: 'En lue kirjaa.' },
          ],
          [
            { ru: 'числительное' },
            { ru: 'два и больше' },
            { ru: 'kaksi kirjaa' },
          ],
          [
            { ru: 'управление' },
            { ru: 'этого требует глагол' },
            { ru: 'Odotan bussia.' },
          ],
        ],
      },
      examples: [
        { target: 'Juon vettä.', source: { ru: 'Я пью воду.' } },
        { target: 'Kuuntelen musiikkia.', source: { ru: 'Я слушаю музыку.' } },
        { target: 'Odotan bussia.', source: { ru: 'Я жду автобус.' } },
      ],
    },
    {
      id: 'partitive-process',
      title: { ru: 'Незавершённое действие' },
      paragraphs: [
        {
          ru: 'Партитив показывает действие как процесс без указанной границы. Сравни luen kirjaa — «читаю книгу» как процесс — и luen kirjan, когда предложение представляет чтение всей книги как результат.',
        },
      ],
      table: {
        headers: [
          { ru: 'Взгляд на действие' },
          { ru: 'Объект' },
          { ru: 'Пример' },
        ],
        rows: [
          [{ ru: 'идёт процесс' }, { ru: 'kirjaa' }, { ru: 'Luen kirjaa.' }],
          [
            { ru: 'важен весь результат' },
            { ru: 'kirjan' },
            { ru: 'Luen kirjan.' },
          ],
          [
            { ru: 'идёт просмотр' },
            { ru: 'elokuvaa' },
            { ru: 'Katson elokuvaa.' },
          ],
        ],
      },
      examples: [
        { target: 'Katson elokuvaa.', source: { ru: 'Я смотрю фильм.' } },
        { target: 'Luen kirjaa.', source: { ru: 'Я читаю книгу.' } },
      ],
    },
    {
      id: 'partitive-negative',
      title: { ru: 'Отрицательный объект стоит в партитиве' },
      paragraphs: [
        {
          ru: 'В отрицательном предложении объект обычно принимает партитив независимо от того, могло ли действие быть завершённым в утвердительной версии.',
        },
      ],
      examples: [
        { target: 'En katso elokuvaa.', source: { ru: 'Я не смотрю фильм.' } },
        {
          target: 'Hän ei odota juhlaa.',
          source: { ru: 'Он не ждёт праздника.' },
        },
      ],
    },
    {
      id: 'partitive-number',
      title: { ru: 'После kaksi и больше — партитив единственного числа' },
      paragraphs: [
        {
          ru: 'После числительного существительное не получает t-множественное: kaksi elokuvaa, kolme peliä. Число уже выражает количество.',
        },
      ],
      examples: [
        { target: 'kaksi elokuvaa', source: { ru: 'два фильма' } },
        { target: 'kolme peliä', source: { ru: 'три игры' } },
      ],
    },
    {
      id: 'partitive-government',
      title: { ru: 'Некоторые глаголы требуют партитива' },
      paragraphs: [
        {
          ru: 'Управление нужно учить вместе с глаголом: ajatella jotakin, odottaa jotakin, rakastaa jotakin. Русский предлог не определяет финский падеж.',
        },
      ],
      examples: [
        { target: 'Ajattelen matkaa.', source: { ru: 'Я думаю о поездке.' } },
        { target: 'Rakastan musiikkia.', source: { ru: 'Я люблю музыку.' } },
      ],
    },
    {
      id: 'partitive-usage-errors-register',
      title: { ru: 'Типичные ошибки и puhekieli' },
      paragraphs: [
        {
          ru: 'Типичная ошибка — использовать nominatiivi после отрицания или числа: en katso elokuva, kaksi pelit. Правильно elokuvaa и kaksi peliä.',
        },
        {
          ru: 'В puhekieli окончания могут редуцироваться на слух, но выбор партитива не исчезает. В активных ответах сохраняй полные формы kirjakieli.',
        },
      ],
      examples: [
        {
          target: 'Mä katon leffaa.',
          source: { ru: 'Я смотрю фильм.' },
        },
        {
          target: 'En kato leffaa.',
          source: { ru: 'Я не смотрю фильм.' },
        },
      ],
      callout: {
        ru: 'Сначала определи причину партитива, затем образуй форму.',
      },
    },
  ],
}

const nouns = [
  ['musiikki', 'музыка', 'музыке', 'musiikkia'],
  ['elokuva', 'фильм', 'фильме', 'elokuvaa'],
  ['teatteri', 'театр', 'театре', 'teatteria'],
  ['taide', 'искусство', 'искусстве', 'taidetta'],
  ['urheilu', 'спорт', 'спорте', 'urheilua'],
  ['jalkapallo', 'футбол', 'футболе', 'jalkapalloa'],
  ['jääkiekko', 'хоккей', 'хоккее', 'jääkiekkoa'],
  ['tennis', 'теннис', 'теннисе', 'tennistä'],
  ['uinti', 'плавание', 'плавании', 'uintia'],
  ['hiihto', 'лыжи', 'лыжах', 'hiihtoa'],
  ['lukeminen', 'чтение', 'чтении', 'lukemista'],
  ['kirjoittaminen', 'письмо', 'письме', 'kirjoittamista'],
  ['valokuvaus', 'фотография', 'фотографии', 'valokuvausta'],
  ['peli', 'игра', 'игре', 'peliä'],
  ['matka', 'поездка', 'поездке', 'matkaa'],
  ['juhla', 'праздник', 'празднике', 'juhlaa'],
  ['ilo', 'радость', 'радости', 'iloa'],
  ['suru', 'печаль', 'печали', 'surua'],
  ['pelko', 'страх', 'страхе', 'pelkoa'],
  ['rakkaus', 'любовь', 'любви', 'rakkautta'],
  ['viha', 'ненависть', 'ненависти', 'vihaa'],
  ['rauha', 'покой', 'покое', 'rauhaa'],
  ['kiire', 'спешка', 'спешке', 'kiirettä'],
  ['uni', 'сон', 'сне', 'unta'],
  ['lepo', 'отдых', 'отдыхе', 'lepoa'],
  ['harrastus', 'увлечение', 'увлечении', 'harrastusta'],
] as const

interface UsageVocabulary extends LessonVocabularySeed {
  partitive: string
  sourcePrepositional: string
}

export const partitiveUsageVocabulary: UsageVocabulary[] = nouns.map(
  ([lemma, gloss, sourcePrepositional, partitive], index) => {
    const serial = `11.${String(index + 1).padStart(2, '0')}`
    return {
      key: `partitive-use-${lemma}`,
      itemId: `word.fi.m1.${serial}`,
      conceptId: `concept.fi.m1.${serial}`,
      lexicalEntryId: `lex.fi.${lemma}`,
      lemma,
      partOfSpeech: 'noun',
      gloss,
      partitive,
      sourcePrepositional,
      example: {
        target: `Ajattelen ${partitive}.`,
        source: { ru: `Я думаю о ${sourcePrepositional}.` },
      },
      semanticTypes: ['abstract-or-activity', 'partitive-governed'],
      singular: lemma,
      plural: partitive,
      sourceSingular: gloss,
      sourcePlural: sourcePrepositional,
      forms: [
        form(serial, 'nominative-sg', lemma, {
          case: 'nominative',
          number: 'singular',
        }),
        form(serial, 'partitive-sg', partitive, {
          case: 'partitive',
          number: 'singular',
        }),
      ],
    }
  },
)

const countableIndexes = [1, 2, 13, 14, 15, 25] as const

export const partitiveUsageExercises: PreparedExerciseSeed[] = [
  ...group('word', 0, 26, (index) => governed(index, 'plain')),
  ...group('context', 26, 10, (index) => governed(index + 7, 'temporal')),
  ...group('context', 36, 8, (index) => governed(index + 14, 'negative')),
  ...group('context', 44, 8, (index) => quantity(index)),
  ...group('pair', 52, 8, (index) => governed(index + 2, 'question')),
]

export const partitiveUsageGoldenExerciseIds = [
  'exercise.fi.partitive.usage.word.1',
  'exercise.fi.partitive.usage.word.4',
  'exercise.fi.partitive.usage.context.11',
  'exercise.fi.partitive.usage.context.19',
  'exercise.fi.partitive.usage.pair.1',
] as const

type GovernedFrame = 'plain' | 'temporal' | 'negative' | 'question'

function governed(index: number, frame: GovernedFrame) {
  const item = partitiveUsageVocabulary[index % nouns.length]!
  const frames: Record<
    GovernedFrame,
    {
      prompt: string
      target: string
      slots: PreparedExerciseSeed['slots']
      variants: string[]
      skill: string
    }
  > = {
    plain: {
      prompt: `Я думаю о ${item.sourcePrepositional}.`,
      target: `Minä ajattelen ${item.partitive}.`,
      variants: [`Ajattelen ${item.partitive}.`],
      slots: [
        grammarSlot('subject', ['minä'], PARTITIVE_GOVERNMENT_SKILL_ID, true),
        grammarSlot('mainVerb', ['ajattelen'], PARTITIVE_GOVERNMENT_SKILL_ID),
      ],
      skill: PARTITIVE_GOVERNMENT_SKILL_ID,
    },
    temporal: {
      prompt: `Сейчас я думаю о ${item.sourcePrepositional}.`,
      target: `Nyt minä ajattelen ${item.partitive}.`,
      variants: [`Nyt ajattelen ${item.partitive}.`],
      slots: [
        grammarSlot('adverb', ['nyt'], PARTITIVE_GOVERNMENT_SKILL_ID),
        grammarSlot('subject', ['minä'], PARTITIVE_GOVERNMENT_SKILL_ID, true),
        grammarSlot('mainVerb', ['ajattelen'], PARTITIVE_GOVERNMENT_SKILL_ID),
      ],
      skill: PARTITIVE_GOVERNMENT_SKILL_ID,
    },
    negative: {
      prompt: `Я не думаю о ${item.sourcePrepositional}.`,
      target: `Minä en ajattele ${item.partitive}.`,
      variants: [`En ajattele ${item.partitive}.`],
      slots: [
        grammarSlot('subject', ['minä'], PARTITIVE_NEGATIVE_SKILL_ID, true),
        grammarSlot('negativeVerb', ['en'], PARTITIVE_NEGATIVE_SKILL_ID),
        grammarSlot('mainVerb', ['ajattele'], PARTITIVE_NEGATIVE_SKILL_ID),
      ],
      skill: PARTITIVE_NEGATIVE_SKILL_ID,
    },
    question: {
      prompt: `Ты думаешь о ${item.sourcePrepositional}?`,
      target: `Ajatteletko sinä ${item.partitive}?`,
      variants: [`Ajatteletko ${item.partitive}?`],
      slots: [
        grammarSlot(
          'questionVerb',
          ['ajatteletko'],
          PARTITIVE_GOVERNMENT_SKILL_ID,
        ),
        grammarSlot('subject', ['sinä'], PARTITIVE_GOVERNMENT_SKILL_ID, true),
      ],
      skill: PARTITIVE_GOVERNMENT_SKILL_ID,
    },
  }
  const selected = frames[frame]
  return exercise(item, selected, selected.skill)
}

function quantity(index: number) {
  const item =
    partitiveUsageVocabulary[
      countableIndexes[index % countableIndexes.length]!
    ]!
  const target = `Tässä on kaksi ${item.partitive}.`
  return exercise(
    item,
    {
      prompt: `Здесь два предмета: ${item.gloss}.`,
      target,
      variants: [],
      slots: [
        grammarSlot('deictic', ['tässä'], PARTITIVE_QUANTITY_SKILL_ID),
        grammarSlot('copula', ['on'], PARTITIVE_QUANTITY_SKILL_ID),
        grammarSlot('number', ['kaksi'], PARTITIVE_QUANTITY_SKILL_ID),
      ],
    },
    PARTITIVE_QUANTITY_SKILL_ID,
  )
}

function exercise(
  item: UsageVocabulary,
  frame: {
    prompt: string
    target: string
    variants: string[]
    slots: PreparedExerciseSeed['slots']
  },
  secondary: string,
): Omit<PreparedExerciseSeed, 'id' | 'selectionOrder'> {
  return {
    prompt: frame.prompt,
    targetText: frame.target,
    acceptedVariants: [frame.target, ...frame.variants],
    slots: [
      ...frame.slots,
      {
        role: 'partitiveObject',
        accepted: [item.partitive],
        itemIds: [PARTITIVE_USAGE_SKILL_ID, secondary, item.itemId],
      },
    ],
    primaryItemId: PARTITIVE_USAGE_SKILL_ID,
    secondaryItemIds: [secondary],
    vocabularyItemId: item.itemId,
  }
}

function grammarSlot(
  role: string,
  accepted: string[],
  secondary: string,
  optional = false,
) {
  return {
    role,
    accepted,
    itemIds: [PARTITIVE_USAGE_SKILL_ID, secondary],
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
    id: `exercise.fi.partitive.usage.${category}.${start + index - base + 1}`,
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
