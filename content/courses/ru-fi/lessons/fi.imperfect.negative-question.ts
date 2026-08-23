import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './fi.olla.basics.js'

export const IMPERFECT_NEGATIVE_QUESTION_SKILL_ID =
  'grammar.fi.imperfect.negative-question'
export const IMPERFECT_NEGATIVE_SKILL_ID = 'grammar.fi.imperfect.negative'
export const IMPERFECT_QUESTION_SKILL_ID = 'grammar.fi.imperfect.question'

export const imperfectNegativeQuestionSkills: CourseSkillSeed[] = [
  {
    id: IMPERFECT_NEGATIVE_QUESTION_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Отрицание и вопросы в имперфекте' },
    description: {
      ru: 'Отрицательное причастие и вопросительная частица в прошедшем времени.',
    },
    prerequisiteSkillIds: ['grammar.fi.imperfect.affirmative'],
  },
  {
    id: IMPERFECT_NEGATIVE_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Отрицательный имперфект' },
    description: {
      ru: 'Личная форма ei и причастия mennyt / menneet.',
    },
    prerequisiteSkillIds: [IMPERFECT_NEGATIVE_QUESTION_SKILL_ID],
  },
  {
    id: IMPERFECT_QUESTION_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Вопросы в имперфекте' },
    description: { ru: 'Личная форма имперфекта с частицей -ko/-kö.' },
    prerequisiteSkillIds: [IMPERFECT_NEGATIVE_QUESTION_SKILL_ID],
  },
]

export const imperfectNegativeQuestionContent: CourseLessonContentSeed = {
  version: 3,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'past-negative-question-overview',
      title: { ru: 'Утверждение, отрицание и вопрос в прошлом' },
      paragraphs: [
        {
          ru: 'Утверждение использует личную форму имперфекта. В отрицании лицо переносится на ei, а смысловой глагол принимает форму прошедшего причастия. В общем вопросе личная форма имперфекта получает -ko/-kö и выходит в начало.',
        },
        {
          ru: 'Это две разные операции: отрицание строится как et mennyt, а вопрос — как menitkö. Их нельзя получать простым добавлением одной частицы к одной и той же форме.',
        },
      ],
      table: {
        headers: [{ ru: 'Задача' }, { ru: 'Модель' }, { ru: 'Пример' }],
        rows: [
          [
            { ru: 'утверждение' },
            { ru: 'личная форма имперфекта' },
            { ru: 'Sinä menit kotiin.' },
          ],
          [
            { ru: 'отрицание' },
            { ru: 'ei + причастие' },
            { ru: 'Sinä et mennyt kotiin.' },
          ],
          [
            { ru: 'общий вопрос' },
            { ru: 'имперфект-ko/-kö + подлежащее' },
            { ru: 'Menitkö sinä kotiin?' },
          ],
          [
            { ru: 'отрицательный вопрос' },
            { ru: 'ei-ko/-kö + причастие' },
            { ru: 'Etkö sinä mennyt kotiin?' },
          ],
        ],
      },
      examples: [
        { target: 'Minä lähdin.', source: { ru: 'Я ушёл.' } },
        { target: 'Minä en lähtenyt.', source: { ru: 'Я не ушёл.' } },
        { target: 'Lähditkö sinä?', source: { ru: 'Ты ушёл?' } },
      ],
    },
    {
      id: 'negative-person-table',
      title: { ru: 'Ei согласуется, причастие различает число' },
      paragraphs: [
        {
          ru: 'В единственном числе используется mennyt, во множественном — menneet. Форму лица несут en, et, ei, emme, ette, eivät.',
        },
      ],
      table: {
        headers: [{ ru: 'Лицо' }, { ru: 'mennä' }, { ru: 'lähteä' }],
        rows: [
          [{ ru: 'minä' }, { ru: 'en mennyt' }, { ru: 'en lähtenyt' }],
          [{ ru: 'sinä' }, { ru: 'et mennyt' }, { ru: 'et lähtenyt' }],
          [{ ru: 'hän' }, { ru: 'ei mennyt' }, { ru: 'ei lähtenyt' }],
          [{ ru: 'me' }, { ru: 'emme menneet' }, { ru: 'emme lähteneet' }],
          [{ ru: 'te' }, { ru: 'ette menneet' }, { ru: 'ette lähteneet' }],
          [{ ru: 'he' }, { ru: 'eivät menneet' }, { ru: 'eivät lähteneet' }],
        ],
      },
      examples: [
        { target: 'Me emme jääneet.', source: { ru: 'Мы не остались.' } },
        { target: 'He eivät nukkuneet.', source: { ru: 'Они не спали.' } },
      ],
    },
    {
      id: 'past-questions',
      title: { ru: 'Частица -ko/-kö присоединяется к прошедшей форме' },
      paragraphs: [
        {
          ru: 'В общем вопросе личная форма имперфекта выходит на первое место: Sinä lähdit → Lähditkö sinä? Hän soitti → Soittiko hän?',
        },
      ],
      examples: [
        { target: 'Lähditkö sinä?', source: { ru: 'Ты ушёл?' } },
        { target: 'Soittiko hän?', source: { ru: 'Он позвонил?' } },
      ],
    },
    {
      id: 'participle-stems',
      title: { ru: 'Причастие строится не от личной формы имперфекта' },
      paragraphs: [
        {
          ru: 'Формы нужно связывать с типом глагола: lähteä → lähtenyt, nukkua → nukkunut, kävellä → kävellyt, lähettää → lähettänyt.',
        },
      ],
      examples: [
        { target: 'nukkua → nukkunut', source: { ru: 'спать → не спал' } },
        {
          target: 'kävellä → kävelleet',
          source: { ru: 'ходить → не ходили' },
        },
      ],
    },
    {
      id: 'past-dialogue',
      title: { ru: 'Вопрос и отрицание сохраняют прошлую рамку' },
      paragraphs: [
        {
          ru: 'Если время уже задано словом eilen, все реплики можно связать в один рассказ: вопрос — короткий ответ — уточнение.',
        },
      ],
      examples: [
        {
          target: 'Lähditkö eilen? En lähtenyt.',
          source: { ru: 'Ты ушёл вчера? Нет, не ушёл.' },
        },
        {
          target: 'Soittiko hän? Ei, hän lähetti viestin.',
          source: { ru: 'Он позвонил? Нет, он отправил сообщение.' },
        },
      ],
    },
    {
      id: 'past-errors-register',
      title: { ru: 'Типичные ошибки и puhekieli' },
      paragraphs: [
        {
          ru: 'Типичная ошибка — оставить личную форму после отрицания: en menin. Правильно en mennyt. Другая ошибка — присоединить -ko к инфинитиву вместо личной формы.',
        },
        {
          ru: 'В puhekieli часто слышно mä en menny и me ei menty. В активных ответах kirjakieli используй minä en mennyt и me emme menneet.',
        },
      ],
      examples: [
        {
          target: 'Mä en menny.',
          source: { ru: 'Я не пошёл.' },
        },
        {
          target: 'Me ei lähdetty.',
          source: { ru: 'Мы не ушли.' },
        },
      ],
      callout: {
        ru: 'Отрицание: личная форма ei + причастие. Вопрос: прошедшая личная форма + -ko/-kö.',
      },
    },
  ],
}

const verbs = [
  [
    'lähteä',
    'уходить',
    'lähdin',
    'lähdit',
    'lähti',
    'lähtenyt',
    'lähteneet',
    'minä',
  ],
  ['jäädä', 'оставаться', 'jäin', 'jäit', 'jäi', 'jäänyt', 'jääneet', 'minä'],
  [
    'nukkua',
    'спать',
    'nukuin',
    'nukuit',
    'nukkui',
    'nukkunut',
    'nukkuneet',
    'minä',
  ],
  [
    'istua',
    'сидеть',
    'istuin',
    'istuit',
    'istui',
    'istunut',
    'istuneet',
    'minä',
  ],
  [
    'seisoa',
    'стоять',
    'seisoin',
    'seisoit',
    'seisoi',
    'seissyt',
    'seisseet',
    'minä',
  ],
  [
    'kävellä',
    'ходить пешком',
    'kävelin',
    'kävelit',
    'käveli',
    'kävellyt',
    'kävelleet',
    'minä',
  ],
  [
    'soittaa',
    'звонить',
    'soitin',
    'soitit',
    'soitti',
    'soittanut',
    'soittaneet',
    'minä',
  ],
  [
    'lähettää',
    'отправлять',
    'lähetin',
    'lähetit',
    'lähetti',
    'lähettänyt',
    'lähettäneet',
    'minä',
  ],
  [
    'syntyä',
    'рождаться',
    'synnyin',
    'synnyit',
    'syntyi',
    'syntynyt',
    'syntyneet',
    'hän',
  ],
  [
    'kasvaa',
    'расти',
    'kasvoin',
    'kasvoit',
    'kasvoi',
    'kasvanut',
    'kasvaneet',
    'minä',
  ],
  [
    'tapahtua',
    'случаться',
    '',
    '',
    'tapahtui',
    'tapahtunut',
    'tapahtuneet',
    'se',
  ],
  [
    'kadota',
    'исчезать',
    'katosin',
    'katosit',
    'katosi',
    'kadonnut',
    'kadonneet',
    'minä',
  ],
  [
    'rikkoa',
    'ломать',
    'rikoin',
    'rikoit',
    'rikkoi',
    'rikkonut',
    'rikkoneet',
    'minä',
  ],
  [
    'voittaa',
    'побеждать',
    'voitin',
    'voitit',
    'voitti',
    'voittanut',
    'voittaneet',
    'minä',
  ],
  [
    'saapua',
    'прибывать',
    'saavuin',
    'saavuit',
    'saapui',
    'saapunut',
    'saapuneet',
    'minä',
  ],
  [
    'vapista',
    'дрожать',
    'vapisin',
    'vapisit',
    'vapisi',
    'vapissut',
    'vapisseet',
    'minä',
  ],
  [
    'nauraa',
    'смеяться',
    'nauroin',
    'nauroit',
    'nauroi',
    'nauranut',
    'nauraneet',
    'minä',
  ],
  ['itkeä', 'плакать', 'itkin', 'itkit', 'itki', 'itkenyt', 'itkeneet', 'minä'],
  [
    'hymyillä',
    'улыбаться',
    'hymyilin',
    'hymyilit',
    'hymyili',
    'hymyillyt',
    'hymyilleet',
    'minä',
  ],
  [
    'huutaa',
    'кричать',
    'huusin',
    'huusit',
    'huusi',
    'huutanut',
    'huutaneet',
    'minä',
  ],
  [
    'kuiskata',
    'шептать',
    'kuiskasin',
    'kuiskasit',
    'kuiskasi',
    'kuiskannut',
    'kuiskanneet',
    'minä',
  ],
  [
    'kantaa',
    'нести',
    'kannoin',
    'kannoit',
    'kantoi',
    'kantanut',
    'kantaneet',
    'minä',
  ],
  [
    'nostaa',
    'поднимать',
    'nostin',
    'nostit',
    'nosti',
    'nostanut',
    'nostaneet',
    'minä',
  ],
  [
    'laskea',
    'считать',
    'laskin',
    'laskit',
    'laski',
    'laskenut',
    'laskeneet',
    'minä',
  ],
  [
    'pudottaa',
    'ронять',
    'pudotin',
    'pudotit',
    'pudotti',
    'pudottanut',
    'pudottaneet',
    'minä',
  ],
  [
    'vaihtaa',
    'менять',
    'vaihdoin',
    'vaihdoit',
    'vaihtoi',
    'vaihtanut',
    'vaihtaneet',
    'minä',
  ],
] as const

const singularNegativeSources = [
  'Вчера я не ушёл.',
  'Вчера я не остался.',
  'Вчера я не спал.',
  'Вчера я не сидел.',
  'Вчера я не стоял.',
  'Вчера я не ходил пешком.',
  'Вчера я не звонил.',
  'Вчера я не отправлял.',
  'Он не родился вчера.',
  'Вчера я не рос.',
  'Это не произошло вчера.',
  'Вчера я не исчез.',
  'Вчера я не ломал.',
  'Вчера я не победил.',
  'Вчера я не прибыл.',
  'Вчера я не дрожал.',
  'Вчера я не смеялся.',
  'Вчера я не плакал.',
  'Вчера я не улыбался.',
  'Вчера я не кричал.',
  'Вчера я не шептал.',
  'Вчера я не нёс.',
  'Вчера я не поднимал.',
  'Вчера я не считал.',
  'Вчера я не ронял.',
  'Вчера я не менял.',
] as const

const pluralNegativeSources = [
  'Мы не ушли.',
  'Мы не остались.',
  'Мы не спали.',
  'Мы не сидели.',
  'Мы не стояли.',
  'Мы не ходили пешком.',
  'Мы не звонили.',
  'Мы не отправляли.',
  'Мы не родились.',
  'Мы не росли.',
] as const

const secondPersonQuestionSources = [
  'Ты исчез?',
  'Ты сломал?',
  'Ты победил?',
  'Ты прибыл?',
  'Ты дрожал?',
  'Ты смеялся?',
  'Ты плакал?',
  'Ты улыбался?',
] as const

const thirdPersonQuestionSources = [
  'Он улыбался вчера?',
  'Он кричал вчера?',
  'Он шептал вчера?',
  'Он нёс вчера?',
  'Он поднимал вчера?',
  'Он считал вчера?',
  'Он ронял вчера?',
  'Он менял вчера?',
] as const

const thirdPersonNegativeSources = [
  'Он не спал вчера.',
  'Он не сидел вчера.',
  'Он не стоял вчера.',
  'Он не ходил пешком вчера.',
  'Он не звонил вчера.',
  'Он не отправлял вчера.',
  'Он не родился вчера.',
  'Он не рос вчера.',
] as const

interface ImperfectVerbVocabulary extends LessonVocabularySeed {
  imperfectSecond: string
  imperfectThird: string
  negativeSingular: string
  negativePlural: string
  subject: 'minä' | 'hän' | 'se'
}

export const imperfectNegativeQuestionVocabulary: ImperfectVerbVocabulary[] =
  verbs.map(
    (
      [
        lemma,
        gloss,
        imperfectFirst,
        imperfectSecond,
        imperfectThird,
        negativeSingular,
        negativePlural,
        subject,
      ],
      index,
    ) => {
      const serial = `16.${String(index + 1).padStart(2, '0')}`
      const subjectText =
        subject === 'minä' ? 'Minä' : subject === 'hän' ? 'Hän' : 'Se'
      const negativeVerb = subject === 'minä' ? 'en' : 'ei'
      const firstPersonForm = imperfectFirst
        ? [
            form(serial, 'imperfect-1sg', imperfectFirst, {
              mood: 'indicative',
              tense: 'past',
              person: 'first',
              number: 'singular',
            }),
          ]
        : []

      return {
        key: `imperfect-${lemma}`,
        itemId: `word.fi.m1.${serial}`,
        conceptId: `concept.fi.m1.${serial}`,
        lexicalEntryId: `lex.fi.${lemma}`,
        lemma,
        partOfSpeech: 'verb',
        gloss,
        example: {
          target: `Eilen ${subjectText.toLocaleLowerCase('fi')} ${negativeVerb} ${negativeSingular}.`,
          source: { ru: singularNegativeSources[index]! },
        },
        semanticTypes: ['past-action', 'imperfect-verb'],
        singular: negativeSingular,
        plural: negativePlural,
        sourceSingular: gloss,
        sourcePlural: gloss,
        forms: [
          form(serial, 'infinitive', lemma, { form: 'first-infinitive' }),
          ...firstPersonForm,
          ...(imperfectSecond
            ? [
                form(serial, 'imperfect-2sg', imperfectSecond, {
                  mood: 'indicative',
                  tense: 'past',
                  person: 'second',
                  number: 'singular',
                }),
              ]
            : []),
          form(serial, 'imperfect-3sg', imperfectThird, {
            mood: 'indicative',
            tense: 'past',
            person: 'third',
            number: 'singular',
          }),
          form(serial, 'past-participle-sg', negativeSingular, {
            form: 'past-participle',
            number: 'singular',
          }),
          form(serial, 'past-participle-pl', negativePlural, {
            form: 'past-participle',
            number: 'plural',
          }),
        ],
        imperfectSecond,
        imperfectThird,
        negativeSingular,
        negativePlural,
        subject,
      }
    },
  )

export const imperfectNegativeQuestionExercises: PreparedExerciseSeed[] = [
  ...exerciseGroup('word', 1, 0, 26, (index) => buildSingularNegative(index)),
  ...exerciseGroup('context', 1, 26, 10, (index) => buildPluralNegative(index)),
  ...exerciseGroup('context', 11, 36, 8, (index) =>
    buildSecondPersonQuestion(index + 11),
  ),
  ...exerciseGroup('context', 19, 44, 8, (index) =>
    buildThirdPersonQuestion(index + 18),
  ),
  ...exerciseGroup('pair', 1, 52, 8, (index) =>
    buildThirdPersonNegative(index + 2),
  ),
]

export const imperfectNegativeQuestionGoldenExerciseIds = [
  'exercise.fi.imperfect.negative-question.word.1',
  'exercise.fi.imperfect.negative-question.word.10',
  'exercise.fi.imperfect.negative-question.context.1',
  'exercise.fi.imperfect.negative-question.context.11',
  'exercise.fi.imperfect.negative-question.pair.1',
] as const

function buildSingularNegative(index: number) {
  const item = imperfectNegativeQuestionVocabulary[index]!
  const subject =
    item.subject === 'minä' ? 'Minä' : item.subject === 'hän' ? 'Hän' : 'Se'
  const negativeVerb = item.subject === 'minä' ? 'en' : 'ei'
  const targetText = `Eilen ${subject.toLocaleLowerCase('fi')} ${negativeVerb} ${item.negativeSingular}.`
  const canOmitSubject = item.subject === 'minä'
  return exercise({
    item,
    prompt: singularNegativeSources[index]!,
    targetText,
    acceptedVariants: canOmitSubject
      ? [targetText, `Eilen en ${item.negativeSingular}.`]
      : [targetText],
    slots: [
      grammarSlot('adverb', ['eilen'], IMPERFECT_NEGATIVE_SKILL_ID),
      grammarSlot(
        'subject',
        [item.subject],
        IMPERFECT_NEGATIVE_SKILL_ID,
        canOmitSubject,
      ),
      grammarSlot('negativeVerb', [negativeVerb], IMPERFECT_NEGATIVE_SKILL_ID),
      vocabularySlot(
        'participle',
        [item.negativeSingular],
        item,
        IMPERFECT_NEGATIVE_SKILL_ID,
      ),
    ],
    secondaryItemId: IMPERFECT_NEGATIVE_SKILL_ID,
  })
}

function buildPluralNegative(index: number) {
  const item = imperfectNegativeQuestionVocabulary[index]!
  const targetText = `Me emme ${item.negativePlural}.`
  return exercise({
    item,
    prompt: pluralNegativeSources[index]!,
    targetText,
    acceptedVariants: [targetText, `Emme ${item.negativePlural}.`],
    slots: [
      grammarSlot('subject', ['me'], IMPERFECT_NEGATIVE_SKILL_ID, true),
      grammarSlot('negativeVerb', ['emme'], IMPERFECT_NEGATIVE_SKILL_ID),
      vocabularySlot(
        'pluralParticiple',
        [item.negativePlural],
        item,
        IMPERFECT_NEGATIVE_SKILL_ID,
      ),
    ],
    secondaryItemId: IMPERFECT_NEGATIVE_SKILL_ID,
  })
}

function buildSecondPersonQuestion(index: number) {
  const item = imperfectNegativeQuestionVocabulary[index]!
  const questionVerb = `${capitalize(item.imperfectSecond)}${questionParticle(item.imperfectSecond)}`
  const targetText = `${questionVerb} sinä?`
  return exercise({
    item,
    prompt: secondPersonQuestionSources[index - 11]!,
    targetText,
    acceptedVariants: [targetText, `${questionVerb}?`],
    slots: [
      vocabularySlot(
        'questionVerb',
        [questionVerb.toLocaleLowerCase('fi')],
        item,
        IMPERFECT_QUESTION_SKILL_ID,
      ),
      grammarSlot('subject', ['sinä'], IMPERFECT_QUESTION_SKILL_ID, true),
    ],
    secondaryItemId: IMPERFECT_QUESTION_SKILL_ID,
  })
}

function buildThirdPersonQuestion(index: number) {
  const item = imperfectNegativeQuestionVocabulary[index]!
  const questionVerb = `${capitalize(item.imperfectThird)}${questionParticle(item.imperfectThird)}`
  const targetText = `${questionVerb} hän eilen?`
  return exercise({
    item,
    prompt: thirdPersonQuestionSources[index - 18]!,
    targetText,
    acceptedVariants: [targetText],
    slots: [
      vocabularySlot(
        'questionVerb',
        [questionVerb.toLocaleLowerCase('fi')],
        item,
        IMPERFECT_QUESTION_SKILL_ID,
      ),
      grammarSlot('subject', ['hän'], IMPERFECT_QUESTION_SKILL_ID),
      grammarSlot('adverb', ['eilen'], IMPERFECT_QUESTION_SKILL_ID),
    ],
    secondaryItemId: IMPERFECT_QUESTION_SKILL_ID,
  })
}

function buildThirdPersonNegative(index: number) {
  const item = imperfectNegativeQuestionVocabulary[index]!
  const targetText = `Hän ei ${item.negativeSingular} eilen.`
  return exercise({
    item,
    prompt: thirdPersonNegativeSources[index - 2]!,
    targetText,
    acceptedVariants: [targetText],
    slots: [
      grammarSlot('subject', ['hän'], IMPERFECT_NEGATIVE_SKILL_ID),
      grammarSlot('negativeVerb', ['ei'], IMPERFECT_NEGATIVE_SKILL_ID),
      vocabularySlot(
        'participle',
        [item.negativeSingular],
        item,
        IMPERFECT_NEGATIVE_SKILL_ID,
      ),
      grammarSlot('adverb', ['eilen'], IMPERFECT_NEGATIVE_SKILL_ID),
    ],
    secondaryItemId: IMPERFECT_NEGATIVE_SKILL_ID,
  })
}

function exercise(input: {
  item: ImperfectVerbVocabulary
  prompt: string
  targetText: string
  acceptedVariants: string[]
  slots: PreparedExerciseSeed['slots']
  secondaryItemId: string
}) {
  return {
    prompt: input.prompt,
    targetText: input.targetText,
    acceptedVariants: input.acceptedVariants,
    slots: input.slots,
    primaryItemId: IMPERFECT_NEGATIVE_QUESTION_SKILL_ID,
    secondaryItemIds: [input.secondaryItemId],
    vocabularyItemId: input.item.itemId,
  }
}

function grammarSlot(
  role: string,
  accepted: string[],
  secondaryItemId: string,
  optional = false,
) {
  return {
    role,
    accepted,
    itemIds: [IMPERFECT_NEGATIVE_QUESTION_SKILL_ID, secondaryItemId],
    ...(optional ? { optional: true } : {}),
  }
}

function vocabularySlot(
  role: string,
  accepted: string[],
  item: ImperfectVerbVocabulary,
  secondaryItemId: string,
) {
  return {
    role,
    accepted,
    itemIds: [
      IMPERFECT_NEGATIVE_QUESTION_SKILL_ID,
      secondaryItemId,
      item.itemId,
    ],
  }
}

function exerciseGroup(
  category: 'word' | 'context' | 'pair',
  idStart: number,
  selectionStart: number,
  count: number,
  create: (
    index: number,
  ) => Omit<PreparedExerciseSeed, 'id' | 'selectionOrder'>,
) {
  return Array.from({ length: count }, (_, index) => ({
    id: `exercise.fi.imperfect.negative-question.${category}.${idStart + index}`,
    selectionOrder: selectionStart + index + 1,
    ...create(index),
  }))
}

function questionParticle(surface: string) {
  return /[aou]/u.test(surface) ? 'ko' : 'kö'
}

function capitalize(value: string) {
  return `${value.charAt(0).toLocaleUpperCase('fi')}${value.slice(1)}`
}

function form(
  serial: string,
  key: string,
  surface: string,
  features: Record<string, string>,
) {
  return { id: `form.fi.m1.${serial}.${key}`, surface, features }
}
