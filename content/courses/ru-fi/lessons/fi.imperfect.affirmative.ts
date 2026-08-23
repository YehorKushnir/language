import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './fi.olla.basics.js'

export const IMPERFECT_AFFIRMATIVE_SKILL_ID = 'grammar.fi.imperfect.affirmative'
export const IMPERFECT_IRREGULAR_SKILL_ID = 'grammar.fi.imperfect.irregular'

export const imperfectAffirmativeSkills: CourseSkillSeed[] = [
  {
    id: IMPERFECT_AFFIRMATIVE_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Утвердительный имперфект' },
    description: { ru: 'Личные формы прошедшего времени и показатель -i-.' },
    prerequisiteSkillIds: ['grammar.fi.plural.agreement'],
  },
  {
    id: IMPERFECT_IRREGULAR_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Частотные формы имперфекта' },
    description: { ru: 'Olin, näin, menin, tulin и tein.' },
    prerequisiteSkillIds: [IMPERFECT_AFFIRMATIVE_SKILL_ID],
  },
]

export const imperfectAffirmativeContent: CourseLessonContentSeed = {
  version: 2,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'imperfect-meaning',
      eyebrow: { ru: 'Время' },
      title: { ru: 'Имперфект переносит событие в прошлое' },
      paragraphs: [
        {
          ru: 'Имперфект описывает событие или состояние в завершённой прошлой рамке. Слова eilen и viime viikolla делают эту рамку явной.',
        },
      ],
      examples: [
        { target: 'Eilen olin kotona.', source: { ru: 'Вчера я был дома.' } },
        {
          target: 'Viime viikolla matkustin.',
          source: { ru: 'На прошлой неделе я путешествовал.' },
        },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Выбери прошлое olla для minä.' },
          answer: 'olin',
          explanation: { ru: 'Форма minä в имперфекте — olin.' },
        },
      ],
    },
    {
      id: 'imperfect-table',
      eyebrow: { ru: 'Формы' },
      title: { ru: 'Показатель -i- стоит перед личным окончанием' },
      paragraphs: [
        {
          ru: 'Личная форма строится от основы имперфекта. Гласная основы может измениться, поэтому одной вставки i недостаточно.',
        },
      ],
      table: {
        headers: [
          { ru: 'Лицо' },
          { ru: 'olla' },
          { ru: 'mennä' },
          { ru: 'nähdä' },
        ],
        rows: [
          [{ ru: 'minä' }, { ru: 'olin' }, { ru: 'menin' }, { ru: 'näin' }],
          [{ ru: 'sinä' }, { ru: 'olit' }, { ru: 'menit' }, { ru: 'näit' }],
          [{ ru: 'hän' }, { ru: 'oli' }, { ru: 'meni' }, { ru: 'näki' }],
          [{ ru: 'me' }, { ru: 'olimme' }, { ru: 'menimme' }, { ru: 'näimme' }],
        ],
      },
      examples: [
        { target: 'Minä näin kartan.', source: { ru: 'Я увидел карту.' } },
        { target: 'Me näimme hotellin.', source: { ru: 'Мы увидели отель.' } },
      ],
    },
    {
      id: 'imperfect-stems',
      eyebrow: { ru: 'Основа' },
      title: { ru: 'Гласная основы меняется по модели' },
      paragraphs: [
        {
          ru: 'У частых глаголов встречаются изменения: antaa → annoin, lukea → luin, tulla → tulin. Форму проверяют по глагольному типу и основе.',
        },
      ],
      examples: [
        { target: 'lukea → luin', source: { ru: 'читать → я читал' } },
        { target: 'antaa → annoin', source: { ru: 'давать → я дал' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Выбери: lukein или luin?' },
          answer: 'luin',
          explanation: { ru: 'У lukea перед i исчезает e.' },
        },
      ],
    },
    {
      id: 'imperfect-persons',
      eyebrow: { ru: 'Лицо' },
      title: { ru: 'Окончание по-прежнему показывает участника' },
      paragraphs: [
        {
          ru: 'После основы имперфекта добавляются знакомые личные окончания. В первом и втором лице местоимение можно опустить.',
        },
      ],
      examples: [
        { target: 'Näin passin.', source: { ru: 'Я увидел паспорт.' } },
        { target: 'Näimme passin.', source: { ru: 'Мы увидели паспорт.' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Вставь форму nähdä для me: Me ___.' },
          answer: 'näimme',
          explanation: { ru: 'Основа näi- получает окончание -mme.' },
        },
      ],
    },
    {
      id: 'past-story',
      eyebrow: { ru: 'Рассказ' },
      title: { ru: 'Одна временная рамка связывает события' },
      paragraphs: [
        {
          ru: 'В коротком рассказе временное слово можно назвать один раз, а затем сохранять имперфект у следующих глаголов.',
        },
      ],
      examples: [
        {
          target: 'Eilen lähdin ja tulin takaisin.',
          source: { ru: 'Вчера я ушёл и вернулся.' },
        },
        {
          target: 'Näin kartan ja löysin hotellin.',
          source: { ru: 'Я увидел карту и нашёл отель.' },
        },
      ],
    },
    {
      id: 'imperfect-errors-register',
      eyebrow: { ru: 'Контроль' },
      title: { ru: 'Типичные ошибки и puhekieli' },
      paragraphs: [
        {
          ru: 'Типичная ошибка — добавить i прямо к инфинитиву: nähti вместо näin или lukein вместо luin. Сначала нужна основа имперфекта.',
        },
        {
          ru: 'В puhekieli местоимение сокращается, но прошедшая форма остаётся узнаваемой: mä olin, mä näin. В kirjakieli пиши minä olin, minä näin.',
        },
      ],
      examples: [
        {
          target: 'Mä olin kotona.',
          source: { ru: 'Я был дома.' },
          note: { ru: 'Kirjakieli: Minä olin kotona.' },
        },
        {
          target: 'Mä näin sen.',
          source: { ru: 'Я это видел.' },
          note: { ru: 'Kirjakieli: Minä näin sen.' },
        },
      ],
      callout: {
        ru: 'Временная рамка → основа имперфекта → личное окончание.',
      },
    },
  ],
}

const nouns = [
  ['matkalaukku', 'чемодан', 'чемодан', 'matkalaukun'],
  ['passi', 'паспорт', 'паспорт', 'passin'],
  ['varaus', 'бронирование', 'бронирование', 'varauksen'],
  ['matkalippu', 'проездной билет', 'проездной билет', 'matkalipun'],
  ['hotellihuone', 'номер в отеле', 'номер в отеле', 'hotellihuoneen'],
  ['kartta', 'карта', 'карту', 'kartan'],
  ['matkaopas', 'путеводитель', 'путеводитель', 'matkaoppaan'],
  ['turisti', 'турист', 'туриста', 'turistin'],
  ['retki', 'экскурсия', 'экскурсию', 'retken'],
  ['loma', 'отпуск', 'отпуск', 'loman'],
  ['lähtö', 'отправление', 'отправление', 'lähdön'],
  ['saapuminen', 'прибытие', 'прибытие', 'saapumisen'],
  ['lento', 'рейс', 'рейс', 'lennon'],
  ['matkatavara', 'багаж', 'багаж', 'matkatavaran'],
  ['valokuva', 'фотография', 'фотографию', 'valokuvan'],
  ['muisto', 'воспоминание', 'воспоминание', 'muiston'],
  ['tapahtuma', 'событие', 'событие', 'tapahtuman'],
  ['konsertti', 'концерт', 'концерт', 'konsertin'],
  ['kokous', 'собрание', 'собрание', 'kokouksen'],
  ['kilpailu', 'соревнование', 'соревнование', 'kilpailun'],
  ['kurssi', 'курс', 'курс', 'kurssin'],
  ['koe', 'экзамен', 'экзамен', 'kokeen'],
  ['tehtävä', 'задание', 'задание', 'tehtävän'],
  ['tulos', 'результат', 'результат', 'tuloksen'],
  ['palkinto', 'награда', 'награду', 'palkinnon'],
  ['päivä', 'день', 'день', 'päivän'],
] as const

interface PastVocabulary extends LessonVocabularySeed {
  object: string
  sourceObject: string
}
export const imperfectAffirmativeVocabulary: PastVocabulary[] = nouns.map(
  ([lemma, gloss, sourceObject, object], index) => {
    const serial = `15.${String(index + 1).padStart(2, '0')}`
    return {
      key: `past-${lemma}`,
      itemId: `word.fi.m1.${serial}`,
      conceptId: `concept.fi.m1.${serial}`,
      lexicalEntryId: `lex.fi.${lemma}`,
      lemma,
      partOfSpeech: 'noun',
      gloss,
      object,
      sourceObject,
      example: {
        target: `Eilen näin ${object}.`,
        source: { ru: `Вчера я увидел ${sourceObject}.` },
      },
      semanticTypes: ['travel', 'past-story-context'],
      singular: lemma,
      plural: object,
      sourceSingular: gloss,
      sourcePlural: sourceObject,
      forms: [
        form(serial, 'nominative-sg', lemma, {
          case: 'nominative',
          number: 'singular',
        }),
        form(serial, 'total-object-sg', object, {
          case: 'genitive',
          number: 'singular',
        }),
      ],
    }
  },
)

export const imperfectAffirmativeExercises: PreparedExerciseSeed[] = [
  ...group('word', 0, 26, (i) => build(i, 'yesterday')),
  ...group('context', 26, 10, (i) => build(i + 5, 'last-week')),
  ...group('context', 36, 8, (i) => build(i + 12, 'third')),
  ...group('context', 44, 8, (i) => build(i + 18, 'plural')),
  ...group('pair', 52, 8, (i) => build(i + 2, 'then')),
]
export const imperfectAffirmativeGoldenExerciseIds = [
  'exercise.fi.imperfect.affirmative.word.1',
  'exercise.fi.imperfect.affirmative.word.6',
  'exercise.fi.imperfect.affirmative.context.1',
  'exercise.fi.imperfect.affirmative.context.11',
  'exercise.fi.imperfect.affirmative.pair.1',
] as const

type Frame = 'yesterday' | 'last-week' | 'third' | 'plural' | 'then'
function build(index: number, frame: Frame) {
  const item = imperfectAffirmativeVocabulary[index % nouns.length]!
  const frames: Record<
    Frame,
    {
      prompt: string
      target: string
      variants: string[]
      slots: PreparedExerciseSeed['slots']
    }
  > = {
    yesterday: {
      prompt: `Вчера я увидел ${item.sourceObject}.`,
      target: `Eilen minä näin ${item.object}.`,
      variants: [`Eilen näin ${item.object}.`],
      slots: [
        grammar('adverb', ['eilen']),
        grammar('subject', ['minä'], true),
        grammar('pastVerb', ['näin']),
      ],
    },
    'last-week': {
      prompt: `На прошлой неделе я нашёл ${item.sourceObject}.`,
      target: `Viime viikolla minä löysin ${item.object}.`,
      variants: [`Viime viikolla löysin ${item.object}.`],
      slots: [
        grammar('timeAdjective', ['viime']),
        grammar('timeNoun', ['viikolla']),
        grammar('subject', ['minä'], true),
        grammar('pastVerb', ['löysin']),
      ],
    },
    third: {
      prompt: `Он увидел ${item.sourceObject} вчера.`,
      target: `Hän näki ${item.object} eilen.`,
      variants: [],
      slots: [
        grammar('subject', ['hän']),
        grammar('pastVerb', ['näki']),
        grammar('adverb', ['eilen']),
      ],
    },
    plural: {
      prompt: `Мы увидели ${item.sourceObject}.`,
      target: `Me näimme ${item.object}.`,
      variants: [`Näimme ${item.object}.`],
      slots: [
        grammar('subject', ['me'], true),
        grammar('pastVerb', ['näimme']),
      ],
    },
    then: {
      prompt: `Затем я также увидел ${item.sourceObject}.`,
      target: `Sitten minä näin myös ${item.object}.`,
      variants: [`Sitten näin myös ${item.object}.`],
      slots: [
        grammar('adverb', ['sitten']),
        grammar('subject', ['minä'], true),
        grammar('pastVerb', ['näin']),
        grammar('focusAdverb', ['myös']),
      ],
    },
  }
  const selected = frames[frame]
  return {
    prompt: selected.prompt,
    targetText: selected.target,
    acceptedVariants: [selected.target, ...selected.variants],
    slots: [
      ...selected.slots,
      {
        role: 'object',
        accepted: [item.object],
        itemIds: [IMPERFECT_AFFIRMATIVE_SKILL_ID, item.itemId],
      },
    ],
    primaryItemId: IMPERFECT_AFFIRMATIVE_SKILL_ID,
    secondaryItemIds: [IMPERFECT_IRREGULAR_SKILL_ID],
    vocabularyItemId: item.itemId,
  }
}
function grammar(role: string, accepted: string[], optional = false) {
  return {
    role,
    accepted,
    itemIds: [IMPERFECT_AFFIRMATIVE_SKILL_ID, IMPERFECT_IRREGULAR_SKILL_ID],
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
    id: `exercise.fi.imperfect.affirmative.${category}.${start + index - base + 1}`,
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
