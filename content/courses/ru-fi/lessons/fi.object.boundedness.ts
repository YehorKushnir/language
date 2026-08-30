import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type { LessonVocabularySeed } from './fi.olla.basics.js'

export const OBJECT_BOUNDEDNESS_SKILL_ID = 'grammar.fi.object.boundedness'
export const OBJECT_PARTITIVE_SKILL_ID =
  'grammar.fi.object.boundedness.partitive'
export const OBJECT_TOTAL_SKILL_ID = 'grammar.fi.object.boundedness.total'
export const OBJECT_NEGATIVE_SKILL_ID = 'grammar.fi.object.boundedness.negative'

export const objectBoundednessSkills: CourseSkillSeed[] = [
  {
    id: OBJECT_BOUNDEDNESS_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Объект: процесс или результат' },
    description: {
      ru: 'Выбор между партитивом и полным объектом по смысловой границе действия.',
    },
    prerequisiteSkillIds: ['grammar.fi.imperfect.negative-question'],
  },
  {
    id: OBJECT_PARTITIVE_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Объект как процесс' },
    description: {
      ru: 'Партитив, когда действие показано в процессе или без результата.',
    },
    prerequisiteSkillIds: [OBJECT_BOUNDEDNESS_SKILL_ID],
  },
  {
    id: OBJECT_TOTAL_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Объект как результат' },
    description: {
      ru: 'Генитив единственного числа, когда действие охватывает весь объект и имеет границу.',
    },
    prerequisiteSkillIds: [OBJECT_BOUNDEDNESS_SKILL_ID],
  },
  {
    id: OBJECT_NEGATIVE_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Объект в отрицании' },
    description: {
      ru: 'Партитив объекта в отрицательном предложении независимо от ожидаемого результата.',
    },
    prerequisiteSkillIds: [OBJECT_BOUNDEDNESS_SKILL_ID],
  },
]

export const objectBoundednessContent: CourseLessonContentSeed = {
  version: 1,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'object-choice-overview',
      title: { ru: 'Один объект — два взгляда на действие' },
      paragraphs: [
        {
          ru: 'Падеж объекта показывает, как говорящий видит действие. Партитив представляет действие как процесс без достигнутой границы, а полный объект — как результат, охватывающий весь предмет.',
        },
        {
          ru: 'Сравни не сами предметы, а смысл всего предложения: действие происходит сейчас или сообщается, что оно будет либо было доведено до результата.',
        },
      ],
      table: {
        headers: [{ ru: 'Смысл' }, { ru: 'Форма объекта' }, { ru: 'Пример' }],
        rows: [
          [
            { ru: 'идёт процесс' },
            { ru: 'партитив' },
            { ru: 'Kirjoitan raporttia.' },
          ],
          [
            { ru: 'есть полный результат' },
            { ru: 'генитив' },
            { ru: 'Kirjoitan raportin.' },
          ],
          [
            { ru: 'предложение отрицательное' },
            { ru: 'партитив' },
            { ru: 'En kirjoita raporttia.' },
          ],
        ],
      },
      examples: [
        {
          target: 'Kirjoitan parhaillaan raporttia.',
          source: { ru: 'Я сейчас пишу отчёт.' },
        },
        {
          target: 'Kirjoitan raportin tänään.',
          source: { ru: 'Я напишу отчёт сегодня.' },
        },
        {
          target: 'En kirjoita raporttia.',
          source: { ru: 'Я не пишу отчёт.' },
        },
      ],
    },
    {
      id: 'object-open-process',
      title: { ru: 'Партитив оставляет действие открытым' },
      paragraphs: [
        {
          ru: 'Если предложение показывает действие в процессе и не сообщает о полном результате, объект стоит в партитиве. Слова nyt и parhaillaan часто помогают увидеть такой смысл, но решение определяется не одним словом, а всей ситуацией.',
        },
      ],
      examples: [
        {
          target: 'Täytän nyt hakemusta.',
          source: { ru: 'Я сейчас заполняю заявление.' },
        },
        {
          target: 'He järjestävät parhaillaan illallista.',
          source: { ru: 'Они сейчас организуют ужин.' },
        },
        {
          target: 'Kirjoitin raporttia eilen.',
          source: { ru: 'Вчера я писал отчёт.' },
        },
      ],
    },
    {
      id: 'object-bounded-result',
      title: { ru: 'Полный объект показывает достигнутую границу' },
      paragraphs: [
        {
          ru: 'Когда утвердительное предложение сообщает о результате для всего предмета, объект единственного числа получает генитив. Результат может относиться к прошлому или быть запланирован на будущее.',
        },
        {
          ru: 'В этом уроке рассматривается только обычное личное предложение: tekijä + личная форма глагола. Другие формы полного объекта появятся вместе с императивом и пассивом.',
        },
      ],
      table: {
        headers: [{ ru: 'Время' }, { ru: 'Процесс' }, { ru: 'Результат' }],
        rows: [
          [
            { ru: 'настоящее / будущее' },
            { ru: 'täytän lomaketta' },
            { ru: 'täytän lomakkeen' },
          ],
          [
            { ru: 'прошлое' },
            { ru: 'täytin lomaketta' },
            { ru: 'täytin lomakkeen' },
          ],
        ],
      },
      examples: [
        {
          target: 'Täytän hakemuksen tänään.',
          source: { ru: 'Я заполню заявление сегодня.' },
        },
        {
          target: 'Tulostin lomakkeen eilen.',
          source: { ru: 'Я распечатал форму вчера.' },
        },
      ],
    },
    {
      id: 'object-negative',
      title: { ru: 'Отрицание требует партитива' },
      paragraphs: [
        {
          ru: 'В отрицательном предложении объект ставится в партитиве. Это правило сильнее предполагаемого результата: даже если в утвердительной версии объект был бы полным, после отрицания используется партитив.',
        },
      ],
      examples: [
        {
          target: 'En allekirjoita sopimusta.',
          source: { ru: 'Я не подпишу договор.' },
        },
        {
          target: 'He eivät palauttaneet asiakirjaa.',
          source: { ru: 'Они не вернули документ.' },
        },
      ],
    },
    {
      id: 'object-infinitive-chain',
      title: { ru: 'В цепочке глаголов выбор сохраняется' },
      paragraphs: [
        {
          ru: 'После haluta и voida смысловой глагол остаётся в A-инфинитиве, но его объект по-прежнему показывает процесс или результат. Намерение выполнить действие полностью допускает полный объект.',
        },
      ],
      examples: [
        {
          target: 'Haluan valmistaa lounaan.',
          source: { ru: 'Я хочу приготовить обед.' },
        },
        {
          target: 'Voimme viimeistellä projektin.',
          source: { ru: 'Мы можем закончить проект.' },
        },
      ],
    },
    {
      id: 'object-errors-register',
      title: { ru: 'Смысл важнее отдельного маркера времени' },
      paragraphs: [
        {
          ru: 'Nyt часто сопровождает процесс, а tänään — ограниченный план, но сами эти слова не назначают падеж. Tänään можно и заниматься процессом, а nyt — сообщить о действии, которое будет завершено.',
        },
        {
          ru: 'В puhekieli окончания могут звучать короче, но противопоставление сохраняется: raporttii передаёт процесс, raportin — результат. В активных ответах используй полные формы kirjakieli.',
        },
      ],
      examples: [
        {
          target: 'Mä täytän nyt hakemusta.',
          source: { ru: 'Я сейчас заполняю заявление.' },
        },
        {
          target: 'Mä täytän hakemuksen tänään.',
          source: { ru: 'Я заполню заявление сегодня.' },
        },
      ],
      callout: {
        ru: 'Отрицание → партитив. В утверждении: процесс → партитив, полный результат → генитив.',
      },
    },
  ],
}

interface VerbSeed {
  lemma: string
  gloss: string
  exampleTarget: string
  exampleSource: string
  forms: Array<{
    surface: string
    tense: 'present' | 'imperfect'
    person: '1sg' | '2sg' | '3sg' | '1pl' | '2pl' | '3pl'
  }>
  connegative: string
  pastParticipleSingular?: string
  pastParticiplePlural?: string
}

const verbs: VerbSeed[] = [
  {
    lemma: 'valmistaa',
    gloss: 'готовить',
    exampleTarget: 'Haluan valmistaa aamiaisen.',
    exampleSource: 'Я хочу приготовить завтрак.',
    forms: [
      { surface: 'valmistan', tense: 'present', person: '1sg' },
      { surface: 'valmistat', tense: 'present', person: '2sg' },
      { surface: 'valmistamme', tense: 'present', person: '1pl' },
      { surface: 'valmistimme', tense: 'imperfect', person: '1pl' },
      { surface: 'valmistatko', tense: 'present', person: '2sg' },
    ],
    connegative: 'valmista',
  },
  {
    lemma: 'täyttää',
    gloss: 'заполнять',
    exampleTarget: 'Haluan täyttää lomakkeen.',
    exampleSource: 'Я хочу заполнить форму.',
    forms: [
      { surface: 'täytät', tense: 'present', person: '2sg' },
      { surface: 'täytit', tense: 'imperfect', person: '2sg' },
      { surface: 'täytätkö', tense: 'present', person: '2sg' },
    ],
    connegative: 'täytä',
  },
  {
    lemma: 'aloittaa',
    gloss: 'начинать',
    exampleTarget: 'Haluan aloittaa projektin.',
    exampleSource: 'Я хочу начать проект.',
    forms: [
      { surface: 'aloitti', tense: 'imperfect', person: '3sg' },
      { surface: 'aloittiko', tense: 'imperfect', person: '3sg' },
    ],
    connegative: 'aloita',
    pastParticipleSingular: 'aloittanut',
  },
  {
    lemma: 'varata',
    gloss: 'бронировать',
    exampleTarget: 'Haluan varata hotellihuoneen.',
    exampleSource: 'Я хочу забронировать номер в отеле.',
    forms: [
      { surface: 'varaamme', tense: 'present', person: '1pl' },
      { surface: 'varaammeko', tense: 'present', person: '1pl' },
    ],
    connegative: 'varaa',
  },
  {
    lemma: 'purkaa',
    gloss: 'распаковывать',
    exampleTarget: 'Haluan purkaa paketin.',
    exampleSource: 'Я хочу распаковать посылку.',
    forms: [
      { surface: 'purin', tense: 'imperfect', person: '1sg' },
      { surface: 'puramme', tense: 'present', person: '1pl' },
      { surface: 'puratteko', tense: 'present', person: '2pl' },
    ],
    connegative: 'pura',
  },
  {
    lemma: 'järjestää',
    gloss: 'организовывать',
    exampleTarget: 'Haluan järjestää illallisen.',
    exampleSource: 'Я хочу организовать ужин.',
    forms: [
      { surface: 'järjestän', tense: 'present', person: '1sg' },
      { surface: 'järjestää', tense: 'present', person: '3sg' },
      { surface: 'järjestävät', tense: 'present', person: '3pl' },
      { surface: 'järjestävätkö', tense: 'present', person: '3pl' },
    ],
    connegative: 'järjestä',
  },
  {
    lemma: 'viimeistellä',
    gloss: 'заканчивать, доводить до готовности',
    exampleTarget: 'Haluan viimeistellä raportin.',
    exampleSource: 'Я хочу закончить отчёт.',
    forms: [
      { surface: 'viimeistelet', tense: 'present', person: '2sg' },
      { surface: 'viimeistelemme', tense: 'present', person: '1pl' },
      { surface: 'viimeistelitkö', tense: 'imperfect', person: '2sg' },
    ],
    connegative: 'viimeistele',
    pastParticipleSingular: 'viimeistellyt',
  },
  {
    lemma: 'tulostaa',
    gloss: 'распечатывать',
    exampleTarget: 'Haluan tulostaa asiakirjan.',
    exampleSource: 'Я хочу распечатать документ.',
    forms: [
      { surface: 'tulostan', tense: 'present', person: '1sg' },
      { surface: 'tulostin', tense: 'imperfect', person: '1sg' },
      { surface: 'tulostaa', tense: 'present', person: '3sg' },
      { surface: 'tulostaako', tense: 'present', person: '3sg' },
    ],
    connegative: 'tulosta',
  },
  {
    lemma: 'allekirjoittaa',
    gloss: 'подписывать',
    exampleTarget: 'Haluan allekirjoittaa sopimuksen.',
    exampleSource: 'Я хочу подписать договор.',
    forms: [
      { surface: 'allekirjoittaa', tense: 'present', person: '3sg' },
      { surface: 'allekirjoittavat', tense: 'present', person: '3pl' },
      { surface: 'allekirjoitammeko', tense: 'present', person: '1pl' },
    ],
    connegative: 'allekirjoita',
  },
  {
    lemma: 'palauttaa',
    gloss: 'возвращать, сдавать',
    exampleTarget: 'Haluan palauttaa hakemuksen.',
    exampleSource: 'Я хочу сдать заявление.',
    forms: [
      { surface: 'palautat', tense: 'present', person: '2sg' },
      { surface: 'palautimme', tense: 'imperfect', person: '1pl' },
      { surface: 'palautitko', tense: 'imperfect', person: '2sg' },
    ],
    connegative: 'palauta',
    pastParticiplePlural: 'palauttaneet',
  },
]

const nouns = [
  [
    'raportti',
    'отчёт',
    'отчёты',
    'raportin',
    'raporttia',
    'raportit',
    'Kirjoitan raporttia.',
    'Я пишу отчёт.',
  ],
  [
    'hakemus',
    'заявление',
    'заявления',
    'hakemuksen',
    'hakemusta',
    'hakemukset',
    'Täytän hakemusta.',
    'Я заполняю заявление.',
  ],
  [
    'lomake',
    'форма',
    'формы',
    'lomakkeen',
    'lomaketta',
    'lomakkeet',
    'Täytän lomaketta.',
    'Я заполняю форму.',
  ],
  [
    'projekti',
    'проект',
    'проекты',
    'projektin',
    'projektia',
    'projektit',
    'Suunnittelen projektia.',
    'Я планирую проект.',
  ],
  [
    'paketti',
    'посылка',
    'посылки',
    'paketin',
    'pakettia',
    'paketit',
    'Avaan pakettia.',
    'Я открываю посылку.',
  ],
  [
    'aamiainen',
    'завтрак',
    'завтраки',
    'aamiaisen',
    'aamiaista',
    'aamiaiset',
    'Valmistan aamiaista.',
    'Я готовлю завтрак.',
  ],
  [
    'lounas',
    'обед',
    'обеды',
    'lounaan',
    'lounasta',
    'lounaat',
    'Valmistan lounasta.',
    'Я готовлю обед.',
  ],
  [
    'päivällinen',
    'ужин',
    'ужины',
    'päivällisen',
    'päivällistä',
    'päivälliset',
    'Valmistan päivällistä.',
    'Я готовлю ужин.',
  ],
  [
    'illallinen',
    'вечерний ужин',
    'вечерние ужины',
    'illallisen',
    'illallista',
    'illalliset',
    'Järjestän illallista.',
    'Я организую вечерний ужин.',
  ],
  [
    'sopimus',
    'договор',
    'договоры',
    'sopimuksen',
    'sopimusta',
    'sopimukset',
    'Luen sopimusta.',
    'Я читаю договор.',
  ],
  [
    'asiakirja',
    'документ',
    'документы',
    'asiakirjan',
    'asiakirjaa',
    'asiakirjat',
    'Kirjoitan asiakirjaa.',
    'Я пишу документ.',
  ],
  [
    'remontti',
    'ремонт',
    'ремонты',
    'remontin',
    'remonttia',
    'remontit',
    'Suunnittelen remonttia.',
    'Я планирую ремонт.',
  ],
] as const

const adverbs = [
  ['nyt', 'сейчас', 'Kirjoitan nyt raporttia.', 'Я сейчас пишу отчёт.'],
  [
    'tänään',
    'сегодня',
    'Kirjoitan raportin tänään.',
    'Я напишу отчёт сегодня.',
  ],
  [
    'parhaillaan',
    'в данный момент',
    'Kirjoitan parhaillaan raporttia.',
    'Я в данный момент пишу отчёт.',
  ],
  [
    'kokonaan',
    'полностью',
    'Luin kirjan kokonaan.',
    'Я прочитал книгу полностью.',
  ],
] as const

export const objectBoundednessVocabulary: LessonVocabularySeed[] = [
  ...verbs.map((verb, index) => verbVocabulary(verb, index + 1)),
  ...nouns.map((noun, index) => nounVocabulary(noun, verbs.length + index + 1)),
  ...adverbs.map((adverb, index) =>
    adverbVocabulary(adverb, verbs.length + nouns.length + index + 1),
  ),
]

function verbVocabulary(
  verb: VerbSeed,
  position: number,
): LessonVocabularySeed {
  const serial = serialFor(position)
  return {
    ...identity(serial, verb.lemma),
    lemma: verb.lemma,
    partOfSpeech: 'verb',
    gloss: verb.gloss,
    example: {
      target: verb.exampleTarget,
      source: { ru: verb.exampleSource },
    },
    semanticTypes: ['module-two', 'bounded-action', 'transitive-verb'],
    singular: verb.lemma,
    plural: verb.lemma,
    sourceSingular: verb.gloss,
    sourcePlural: verb.gloss,
    forms: [
      form(serial, 'lemma', verb.lemma, { form: 'A-infinitive' }),
      ...verb.forms.map((value, index) =>
        form(serial, `finite-${index + 1}`, value.surface, {
          mood: 'indicative',
          tense: value.tense,
          person: value.person,
          polarity: 'affirmative',
        }),
      ),
      form(serial, 'connegative', verb.connegative, {
        mood: 'indicative',
        tense: 'present',
        form: 'connegative',
      }),
      ...(verb.pastParticipleSingular
        ? [
            form(
              serial,
              'past-participle-singular',
              verb.pastParticipleSingular,
              {
                form: 'past-participle',
                number: 'singular',
              },
            ),
          ]
        : []),
      ...(verb.pastParticiplePlural
        ? [
            form(serial, 'past-participle-plural', verb.pastParticiplePlural, {
              form: 'past-participle',
              number: 'plural',
            }),
          ]
        : []),
    ],
  }
}

function nounVocabulary(
  noun: (typeof nouns)[number],
  position: number,
): LessonVocabularySeed {
  const [
    lemma,
    gloss,
    sourcePlural,
    genitive,
    partitive,
    plural,
    exampleTarget,
    exampleSource,
  ] = noun
  const serial = serialFor(position)
  return {
    ...identity(serial, lemma),
    lemma,
    partOfSpeech: 'noun',
    gloss,
    example: {
      target: exampleTarget,
      source: { ru: exampleSource },
    },
    semanticTypes: ['module-two', 'bounded-object', 'countable'],
    singular: lemma,
    plural,
    sourceSingular: gloss,
    sourcePlural,
    forms: [
      form(serial, 'nominative-singular', lemma, {
        case: 'nominative',
        number: 'singular',
      }),
      form(serial, 'genitive-singular', genitive, {
        case: 'genitive',
        number: 'singular',
      }),
      form(serial, 'partitive-singular', partitive, {
        case: 'partitive',
        number: 'singular',
      }),
      form(serial, 'nominative-plural', plural, {
        case: 'nominative',
        number: 'plural',
      }),
    ],
  }
}

function adverbVocabulary(
  adverb: (typeof adverbs)[number],
  position: number,
): LessonVocabularySeed {
  const [lemma, gloss, exampleTarget, exampleSource] = adverb
  const serial = serialFor(position)
  return {
    ...identity(serial, lemma),
    lemma,
    partOfSpeech: 'adverb',
    gloss,
    example: {
      target: exampleTarget,
      source: { ru: exampleSource },
    },
    semanticTypes: ['module-two', 'aspect-cue', 'adverb'],
    singular: lemma,
    plural: lemma,
    sourceSingular: gloss,
    sourcePlural: gloss,
    forms: [form(serial, 'invariant', lemma, { form: 'invariant' })],
  }
}

function identity(serial: string, lemma: string) {
  return {
    key: `m2-${serial.replace('.', '-')}`,
    itemId: `word.fi.m2.${serial}`,
    conceptId: `concept.fi.m2.${serial}`,
    lexicalEntryId: `lex.fi.${lemma}`,
  }
}

function serialFor(position: number) {
  return `01.${String(position).padStart(2, '0')}`
}

function form(
  serial: string,
  key: string,
  surface: string,
  features: Record<string, string>,
) {
  return {
    id: `form.fi.m2.${serial}.${key}`,
    surface,
    features,
  }
}
