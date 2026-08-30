import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type { LessonVocabularySeed } from './fi.olla.basics.js'
import { OBJECT_BOUNDEDNESS_SKILL_ID } from './fi.object.boundedness.js'

export const OBJECT_TOTAL_FORMS_SKILL_ID = 'grammar.fi.object.total.forms'
export const OBJECT_TOTAL_SINGULAR_SKILL_ID =
  'grammar.fi.object.total.forms.singular'
export const OBJECT_TOTAL_PLURAL_SKILL_ID =
  'grammar.fi.object.total.forms.plural'
export const OBJECT_TOTAL_CONTRAST_SKILL_ID =
  'grammar.fi.object.total.forms.contrast'

export const objectTotalFormsSkills: CourseSkillSeed[] = [
  {
    id: OBJECT_TOTAL_FORMS_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Форма полного объекта в личном предложении' },
    description: {
      ru: 'Генитив единственного числа и номинатив множественного числа для полного объекта.',
    },
    prerequisiteSkillIds: [OBJECT_BOUNDEDNESS_SKILL_ID],
  },
  {
    id: OBJECT_TOTAL_SINGULAR_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Полный объект в единственном числе' },
    description: {
      ru: 'Генитив единственного числа, когда личное предложение сообщает о результате для всего предмета.',
    },
    prerequisiteSkillIds: [OBJECT_TOTAL_FORMS_SKILL_ID],
  },
  {
    id: OBJECT_TOTAL_PLURAL_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Полный объект во множественном числе' },
    description: {
      ru: 'Номинатив множественного числа с окончанием -t, когда результат охватывает все названные предметы.',
    },
    prerequisiteSkillIds: [OBJECT_TOTAL_FORMS_SKILL_ID],
  },
  {
    id: OBJECT_TOTAL_CONTRAST_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Результат, процесс и отрицание' },
    description: {
      ru: 'Сопоставление полного объекта с партитивом процесса и отрицательного предложения.',
    },
    prerequisiteSkillIds: [OBJECT_TOTAL_FORMS_SKILL_ID],
  },
]

export const objectTotalFormsContent: CourseLessonContentSeed = {
  version: 1,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'total-object-number-overview',
      title: { ru: 'Число определяет форму полного объекта' },
      paragraphs: [
        {
          ru: 'В прошлом уроке полный результат обозначался формой генитива: suunnitelman. Теперь добавляется второе правило: полный объект во множественном числе имеет форму обычного номинатива множественного числа: suunnitelmat.',
        },
        {
          ru: 'Эти формы используются в обычном утвердительном личном предложении, где глагол согласуется с minä, sinä, hän, me, te или he.',
        },
      ],
      table: {
        headers: [{ ru: 'Объект' }, { ru: 'Форма' }, { ru: 'Пример' }],
        rows: [
          [
            { ru: 'один полный предмет' },
            { ru: 'генитив: -n' },
            { ru: 'Tallennan tiedoston.' },
          ],
          [
            { ru: 'несколько полных предметов' },
            { ru: 'номинатив мн. ч.: -t' },
            { ru: 'Tallennan tiedostot.' },
          ],
          [
            { ru: 'процесс или отрицание' },
            { ru: 'партитив' },
            { ru: 'En tallenna tiedostoa.' },
          ],
        ],
      },
      examples: [
        {
          target: 'Laadin suunnitelman huomenna.',
          source: { ru: 'Я составлю план завтра.' },
        },
        {
          target: 'Laadimme suunnitelmat huomenna.',
          source: { ru: 'Мы составим планы завтра.' },
        },
      ],
    },
    {
      id: 'total-object-singular',
      title: { ru: 'Один предмет: генитив единственного числа' },
      paragraphs: [
        {
          ru: 'Если результат охватывает один исчисляемый предмет, полный объект получает генитив единственного числа. Для многих слов его легко узнать по окончанию -n, но внутри основы могут происходить уже знакомые изменения.',
        },
        {
          ru: 'Форма объекта не зависит от лица: minä laadin suunnitelman, hän laatii suunnitelman, me laadimme suunnitelman.',
        },
      ],
      table: {
        headers: [{ ru: 'Слово' }, { ru: 'Полный объект' }],
        rows: [
          [{ ru: 'päätös' }, { ru: 'päätöksen' }],
          [{ ru: 'tiedosto' }, { ru: 'tiedoston' }],
          [{ ru: 'kutsu' }, { ru: 'kutsun' }],
          [{ ru: 'tapaaminen' }, { ru: 'tapaamisen' }],
        ],
      },
      examples: [
        {
          target: 'Hän hyväksyi päätöksen eilen.',
          source: { ru: 'Она утвердила решение вчера.' },
        },
        {
          target: 'Toimitan tilauksen huomenna.',
          source: { ru: 'Я доставлю заказ завтра.' },
        },
      ],
    },
    {
      id: 'total-object-plural',
      title: { ru: 'Несколько предметов: номинатив множественного числа' },
      paragraphs: [
        {
          ru: 'Если действие полностью охватывает несколько предметов, используется форма номинатива множественного числа. Обычно она оканчивается на -t: tiedostot, tarjoukset, päätökset.',
        },
        {
          ru: 'Не добавляй к этой форме окончание генитива. Tiedostot уже является нужной формой полного объекта во множественном числе.',
        },
      ],
      table: {
        headers: [{ ru: 'Единственное число' }, { ru: 'Множественное число' }],
        rows: [
          [{ ru: 'suunnitelman' }, { ru: 'suunnitelmat' }],
          [{ ru: 'tarjouksen' }, { ru: 'tarjoukset' }],
          [{ ru: 'laskun' }, { ru: 'laskut' }],
          [{ ru: 'todistuksen' }, { ru: 'todistukset' }],
        ],
      },
      examples: [
        {
          target: 'He hylkäsivät tarjoukset eilen.',
          source: { ru: 'Они отклонили предложения вчера.' },
        },
        {
          target: 'Tulostan todistukset heti.',
          source: { ru: 'Я распечатаю свидетельства сразу.' },
        },
      ],
    },
    {
      id: 'total-object-tense-person',
      title: { ru: 'Лицо и время не меняют падеж объекта' },
      paragraphs: [
        {
          ru: 'Глагол меняется по лицу и времени, а форма полного объекта определяется числом самого объекта. Результат можно сообщить в прошедшем времени или запланировать на будущее с помощью настоящего времени.',
        },
      ],
      examples: [
        {
          target: 'Julkaisen tuloksen huomenna.',
          source: { ru: 'Я опубликую результат завтра.' },
        },
        {
          target: 'He julkaisivat tulokset eilen.',
          source: { ru: 'Они опубликовали результаты вчера.' },
        },
        {
          target: 'Ratkaisitteko te ongelmat?',
          source: { ru: 'Вы решили проблемы?' },
        },
      ],
    },
    {
      id: 'total-object-contrast',
      title: { ru: 'Сначала выбери смысл, потом число' },
      paragraphs: [
        {
          ru: 'Окончания -n и -t появляются только после решения, что действие имеет полный результат. Если действие показано как незавершённый процесс, один объект остаётся в партитиве. В отрицании партитив обязателен.',
        },
        {
          ru: 'Партитив множественного числа будет отдельной темой. Пока в активных заданиях процесс и отрицание сопоставляются с объектом в единственном числе.',
        },
      ],
      examples: [
        {
          target: 'Rakennamme sillan.',
          source: { ru: 'Мы построим мост.' },
        },
        {
          target: 'Rakennamme parhaillaan siltaa.',
          source: { ru: 'Мы сейчас строим мост.' },
        },
        {
          target: 'Emme rakenna siltaa.',
          source: { ru: 'Мы не построим мост.' },
        },
      ],
    },
    {
      id: 'total-object-scope',
      title: { ru: 'Граница этого правила' },
      paragraphs: [
        {
          ru: 'В этом уроке правило применяется только к существительным в обычных личных предложениях. У личных местоимений есть особые объектные формы — они появятся позже вместе с падежными формами местоимений.',
        },
        {
          ru: 'Императив, пассив и безличные конструкции тоже могут менять форму полного объекта. Пока не переноси на них правило единственного числа самостоятельно.',
        },
      ],
      examples: [
        {
          target: 'Tallennatko sinä tiedostot heti?',
          source: { ru: 'Ты сохранишь файлы сразу?' },
        },
        {
          target: 'Me hyväksymme suunnitelman huomenna.',
          source: { ru: 'Мы утвердим план завтра.' },
        },
      ],
      callout: {
        ru: 'Полный результат в личном предложении: один предмет → генитив; несколько предметов → номинатив множественного числа.',
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
}

const verbs: VerbSeed[] = [
  {
    lemma: 'laatia',
    gloss: 'составлять',
    exampleTarget: 'Laadin suunnitelman huomenna.',
    exampleSource: 'Я составлю план завтра.',
    forms: [
      { surface: 'laadin', tense: 'present', person: '1sg' },
      { surface: 'laadit', tense: 'present', person: '2sg' },
      { surface: 'laatii', tense: 'present', person: '3sg' },
      { surface: 'laadimme', tense: 'present', person: '1pl' },
      { surface: 'laaditte', tense: 'present', person: '2pl' },
      { surface: 'laativat', tense: 'present', person: '3pl' },
      { surface: 'laati', tense: 'imperfect', person: '3sg' },
    ],
    connegative: 'laadi',
  },
  {
    lemma: 'hyväksyä',
    gloss: 'утверждать, принимать',
    exampleTarget: 'Hyväksymme päätöksen huomenna.',
    exampleSource: 'Мы утвердим решение завтра.',
    forms: [
      { surface: 'hyväksyn', tense: 'present', person: '1sg' },
      { surface: 'hyväksyt', tense: 'present', person: '2sg' },
      { surface: 'hyväksyy', tense: 'present', person: '3sg' },
      { surface: 'hyväksymme', tense: 'present', person: '1pl' },
      { surface: 'hyväksytte', tense: 'present', person: '2pl' },
      { surface: 'hyväksyvät', tense: 'present', person: '3pl' },
      { surface: 'hyväksyi', tense: 'imperfect', person: '3sg' },
      { surface: 'hyväksyimme', tense: 'imperfect', person: '1pl' },
      { surface: 'hyväksyivät', tense: 'imperfect', person: '3pl' },
    ],
    connegative: 'hyväksy',
  },
  {
    lemma: 'hylätä',
    gloss: 'отклонять',
    exampleTarget: 'He hylkäsivät tarjoukset eilen.',
    exampleSource: 'Они отклонили предложения вчера.',
    forms: [
      { surface: 'hylkään', tense: 'present', person: '1sg' },
      { surface: 'hylkäät', tense: 'present', person: '2sg' },
      { surface: 'hylkää', tense: 'present', person: '3sg' },
      { surface: 'hylkäämme', tense: 'present', person: '1pl' },
      { surface: 'hylkäävät', tense: 'present', person: '3pl' },
      { surface: 'hylkäsi', tense: 'imperfect', person: '3sg' },
      { surface: 'hylkäsivät', tense: 'imperfect', person: '3pl' },
    ],
    connegative: 'hylkää',
  },
  {
    lemma: 'toimittaa',
    gloss: 'доставлять, подавать',
    exampleTarget: 'Toimitan tilauksen huomenna.',
    exampleSource: 'Я доставлю заказ завтра.',
    forms: [
      { surface: 'toimitan', tense: 'present', person: '1sg' },
      { surface: 'toimitat', tense: 'present', person: '2sg' },
      { surface: 'toimittaa', tense: 'present', person: '3sg' },
      { surface: 'toimitamme', tense: 'present', person: '1pl' },
      { surface: 'toimitatte', tense: 'present', person: '2pl' },
      { surface: 'toimittavat', tense: 'present', person: '3pl' },
      { surface: 'toimitin', tense: 'imperfect', person: '1sg' },
      { surface: 'toimitti', tense: 'imperfect', person: '3sg' },
      { surface: 'toimitimme', tense: 'imperfect', person: '1pl' },
      { surface: 'toimittivat', tense: 'imperfect', person: '3pl' },
    ],
    connegative: 'toimita',
  },
  {
    lemma: 'ratkaista',
    gloss: 'решать',
    exampleTarget: 'Ratkaisemme ongelman tänään.',
    exampleSource: 'Мы решим проблему сегодня.',
    forms: [
      { surface: 'ratkaisen', tense: 'present', person: '1sg' },
      { surface: 'ratkaiset', tense: 'present', person: '2sg' },
      { surface: 'ratkaisee', tense: 'present', person: '3sg' },
      { surface: 'ratkaisemme', tense: 'present', person: '1pl' },
      { surface: 'ratkaisette', tense: 'present', person: '2pl' },
      { surface: 'ratkaisevat', tense: 'present', person: '3pl' },
      { surface: 'ratkaisi', tense: 'imperfect', person: '3sg' },
      { surface: 'ratkaisimme', tense: 'imperfect', person: '1pl' },
      { surface: 'ratkaisitte', tense: 'imperfect', person: '2pl' },
      { surface: 'ratkaisivat', tense: 'imperfect', person: '3pl' },
    ],
    connegative: 'ratkaise',
  },
  {
    lemma: 'suorittaa',
    gloss: 'выполнять, проходить',
    exampleTarget: 'Suoritat tehtävän huomenna.',
    exampleSource: 'Ты выполнишь задание завтра.',
    forms: [
      { surface: 'suoritan', tense: 'present', person: '1sg' },
      { surface: 'suoritat', tense: 'present', person: '2sg' },
      { surface: 'suorittaa', tense: 'present', person: '3sg' },
      { surface: 'suoritamme', tense: 'present', person: '1pl' },
      { surface: 'suoritatte', tense: 'present', person: '2pl' },
      { surface: 'suorittavat', tense: 'present', person: '3pl' },
      { surface: 'suoritin', tense: 'imperfect', person: '1sg' },
      { surface: 'suoritit', tense: 'imperfect', person: '2sg' },
      { surface: 'suoritti', tense: 'imperfect', person: '3sg' },
      { surface: 'suoritimme', tense: 'imperfect', person: '1pl' },
      { surface: 'suorittivat', tense: 'imperfect', person: '3pl' },
    ],
    connegative: 'suorita',
  },
  {
    lemma: 'rakentaa',
    gloss: 'строить',
    exampleTarget: 'Rakennamme sillan.',
    exampleSource: 'Мы построим мост.',
    forms: [
      { surface: 'rakennan', tense: 'present', person: '1sg' },
      { surface: 'rakennat', tense: 'present', person: '2sg' },
      { surface: 'rakentaa', tense: 'present', person: '3sg' },
      { surface: 'rakennamme', tense: 'present', person: '1pl' },
      { surface: 'rakennatte', tense: 'present', person: '2pl' },
      { surface: 'rakentavat', tense: 'present', person: '3pl' },
      { surface: 'rakensin', tense: 'imperfect', person: '1sg' },
      { surface: 'rakensi', tense: 'imperfect', person: '3sg' },
      { surface: 'rakensimme', tense: 'imperfect', person: '1pl' },
      { surface: 'rakensivat', tense: 'imperfect', person: '3pl' },
    ],
    connegative: 'rakenna',
  },
  {
    lemma: 'tallentaa',
    gloss: 'сохранять',
    exampleTarget: 'Tallennan tiedoston heti.',
    exampleSource: 'Я сохраню файл сразу.',
    forms: [
      { surface: 'tallennan', tense: 'present', person: '1sg' },
      { surface: 'tallennat', tense: 'present', person: '2sg' },
      { surface: 'tallentaa', tense: 'present', person: '3sg' },
      { surface: 'tallennamme', tense: 'present', person: '1pl' },
      { surface: 'tallennatte', tense: 'present', person: '2pl' },
      { surface: 'tallentavat', tense: 'present', person: '3pl' },
      { surface: 'tallensin', tense: 'imperfect', person: '1sg' },
      { surface: 'tallensit', tense: 'imperfect', person: '2sg' },
      { surface: 'tallensi', tense: 'imperfect', person: '3sg' },
      { surface: 'tallensimme', tense: 'imperfect', person: '1pl' },
      { surface: 'tallensivat', tense: 'imperfect', person: '3pl' },
    ],
    connegative: 'tallenna',
  },
  {
    lemma: 'julkaista',
    gloss: 'публиковать',
    exampleTarget: 'Julkaisen tuloksen huomenna.',
    exampleSource: 'Я опубликую результат завтра.',
    forms: [
      { surface: 'julkaisen', tense: 'present', person: '1sg' },
      { surface: 'julkaiset', tense: 'present', person: '2sg' },
      { surface: 'julkaisee', tense: 'present', person: '3sg' },
      { surface: 'julkaisemme', tense: 'present', person: '1pl' },
      { surface: 'julkaisette', tense: 'present', person: '2pl' },
      { surface: 'julkaisevat', tense: 'present', person: '3pl' },
      { surface: 'julkaisin', tense: 'imperfect', person: '1sg' },
      { surface: 'julkaisi', tense: 'imperfect', person: '3sg' },
      { surface: 'julkaisimme', tense: 'imperfect', person: '1pl' },
      { surface: 'julkaisivat', tense: 'imperfect', person: '3pl' },
    ],
    connegative: 'julkaise',
  },
  {
    lemma: 'kopioida',
    gloss: 'копировать',
    exampleTarget: 'Kopioin asiakirjan tänään.',
    exampleSource: 'Я скопирую документ сегодня.',
    forms: [
      { surface: 'kopioin', tense: 'present', person: '1sg' },
      { surface: 'kopioit', tense: 'present', person: '2sg' },
      { surface: 'kopioi', tense: 'present', person: '3sg' },
      { surface: 'kopioimme', tense: 'present', person: '1pl' },
      { surface: 'kopioitte', tense: 'present', person: '2pl' },
      { surface: 'kopioivat', tense: 'present', person: '3pl' },
    ],
    connegative: 'kopioi',
  },
]

const nouns = [
  [
    'päätös',
    'решение',
    'решения',
    'päätöksen',
    'päätöstä',
    'päätökset',
    'Hyväksymme päätöksen huomenna.',
    'Мы утвердим решение завтра.',
  ],
  [
    'suunnitelma',
    'план',
    'планы',
    'suunnitelman',
    'suunnitelmaa',
    'suunnitelmat',
    'Laadin suunnitelman huomenna.',
    'Я составлю план завтра.',
  ],
  [
    'tarjous',
    'предложение',
    'предложения',
    'tarjouksen',
    'tarjousta',
    'tarjoukset',
    'Hän hylkäsi tarjouksen.',
    'Она отклонила предложение.',
  ],
  [
    'lasku',
    'счёт',
    'счета',
    'laskun',
    'laskua',
    'laskut',
    'Maksan laskun huomenna.',
    'Я оплачу счёт завтра.',
  ],
  [
    'tilaus',
    'заказ',
    'заказы',
    'tilauksen',
    'tilausta',
    'tilaukset',
    'Toimitan tilauksen huomenna.',
    'Я доставлю заказ завтра.',
  ],
  [
    'tapaaminen',
    'встреча',
    'встречи',
    'tapaamisen',
    'tapaamista',
    'tapaamiset',
    'Varaan tapaamisen huomenna.',
    'Я назначу встречу завтра.',
  ],
  [
    'tiedosto',
    'файл',
    'файлы',
    'tiedoston',
    'tiedostoa',
    'tiedostot',
    'Tallennan tiedoston heti.',
    'Я сохраню файл сразу.',
  ],
  [
    'kansio',
    'папка',
    'папки',
    'kansion',
    'kansiota',
    'kansiot',
    'Kopioin kansion tänään.',
    'Я скопирую папку сегодня.',
  ],
  [
    'lista',
    'список',
    'списки',
    'listan',
    'listaa',
    'listat',
    'Laadimme listan tänään.',
    'Мы составим список сегодня.',
  ],
  [
    'aikataulu',
    'расписание',
    'расписания',
    'aikataulun',
    'aikataulua',
    'aikataulut',
    'Laadimme aikataulun huomenna.',
    'Мы составим расписание завтра.',
  ],
  [
    'kutsu',
    'приглашение',
    'приглашения',
    'kutsun',
    'kutsua',
    'kutsut',
    'Lähetän kutsun tänään.',
    'Я отправлю приглашение сегодня.',
  ],
  [
    'todistus',
    'свидетельство, справка',
    'свидетельства, справки',
    'todistuksen',
    'todistusta',
    'todistukset',
    'Tulostan todistuksen heti.',
    'Я распечатаю справку сразу.',
  ],
] as const

const adverbs = [
  [
    'huomenna',
    'завтра',
    'Laadin suunnitelman huomenna.',
    'Я составлю план завтра.',
  ],
  [
    'pian',
    'скоро',
    'Julkaisemme tulokset pian.',
    'Мы скоро опубликуем результаты.',
  ],
  [
    'vihdoin',
    'наконец',
    'Ratkaisimme ongelman vihdoin.',
    'Мы наконец решили проблему.',
  ],
  ['heti', 'сразу', 'Tallennan tiedoston heti.', 'Я сохраню файл сразу.'],
] as const

export const objectTotalFormsVocabulary: LessonVocabularySeed[] = [
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
    semanticTypes: ['module-two', 'result-action', 'transitive-verb'],
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
    semanticTypes: ['module-two', 'total-object', 'countable'],
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
    semanticTypes: ['module-two', 'result-cue', 'adverb'],
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
  return `02.${String(position).padStart(2, '0')}`
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
