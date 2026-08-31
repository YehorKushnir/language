import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type { LessonVocabularySeed } from './fi.olla.basics.js'
import { OBJECT_TOTAL_FORMS_SKILL_ID } from './fi.object.total.forms.js'

export const NUMERALS_QUANTITIES_SKILL_ID = 'grammar.fi.numerals.quantities'
export const NUMERALS_NUMBER_SKILL_ID = 'grammar.fi.numerals.quantities.number'
export const NUMERALS_QUANTITY_SKILL_ID =
  'grammar.fi.numerals.quantities.quantity'
export const NUMERALS_UNIT_SKILL_ID = 'grammar.fi.numerals.quantities.unit'
export const NUMERALS_SUBJECT_SKILL_ID =
  'grammar.fi.numerals.quantities.subject'
export const NUMERALS_NEGATIVE_SKILL_ID =
  'grammar.fi.numerals.quantities.negative'

export const numeralsQuantitiesSkills: CourseSkillSeed[] = [
  {
    id: NUMERALS_QUANTITIES_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Числительные и количество' },
    description: {
      ru: 'Числа 0–12, партитив после количества, согласование сказуемого, меры и цены.',
    },
    prerequisiteSkillIds: [OBJECT_TOTAL_FORMS_SKILL_ID],
  },
  {
    id: NUMERALS_NUMBER_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Число и форма существительного' },
    description: {
      ru: 'Один предмет в номинативе и партитив единственного числа после чисел от двух.',
    },
    prerequisiteSkillIds: [NUMERALS_QUANTITIES_SKILL_ID],
  },
  {
    id: NUMERALS_QUANTITY_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Неопределённое количество' },
    description: {
      ru: 'Monta, paljon, vähän, tarpeeksi и liikaa с партитивом.',
    },
    prerequisiteSkillIds: [NUMERALS_QUANTITIES_SKILL_ID],
  },
  {
    id: NUMERALS_UNIT_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Меры и цены' },
    description: {
      ru: 'Числительное и партитив единицы измерения или валюты.',
    },
    prerequisiteSkillIds: [NUMERALS_QUANTITIES_SKILL_ID],
  },
  {
    id: NUMERALS_SUBJECT_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Числовая группа как подлежащее' },
    description: {
      ru: 'Сказуемое в единственном числе после числовой группы в нейтральном утвердительном предложении.',
    },
    prerequisiteSkillIds: [NUMERALS_QUANTITIES_SKILL_ID],
  },
  {
    id: NUMERALS_NEGATIVE_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Числовой объект в отрицании' },
    description: {
      ru: 'Партитив числительного и существительного, когда числовая группа является отрицательным объектом.',
    },
    prerequisiteSkillIds: [NUMERALS_QUANTITIES_SKILL_ID],
  },
]

export const numeralsQuantitiesContent: CourseLessonContentSeed = {
  version: 1,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'cardinal-numbers-zero-twelve',
      title: { ru: 'Числа от нуля до двенадцати' },
      paragraphs: [
        {
          ru: 'Финские числительные не меняются по роду. Yksi подходит для одного предмета любого рода, а kaksi — для любых двух предметов.',
        },
        {
          ru: 'Числа 11 и 12 строятся с частью -toista: yksitoista и kaksitoista. Пока запомни их как цельные слова.',
        },
      ],
      table: {
        headers: [{ ru: 'Число' }, { ru: 'По-фински' }],
        rows: [
          [{ ru: '0' }, { ru: 'nolla' }],
          [{ ru: '1' }, { ru: 'yksi' }],
          [{ ru: '2' }, { ru: 'kaksi' }],
          [{ ru: '3' }, { ru: 'kolme' }],
          [{ ru: '4' }, { ru: 'neljä' }],
          [{ ru: '5' }, { ru: 'viisi' }],
          [{ ru: '6' }, { ru: 'kuusi' }],
          [{ ru: '7' }, { ru: 'seitsemän' }],
          [{ ru: '8' }, { ru: 'kahdeksan' }],
          [{ ru: '9' }, { ru: 'yhdeksän' }],
          [{ ru: '10' }, { ru: 'kymmenen' }],
          [{ ru: '11' }, { ru: 'yksitoista' }],
          [{ ru: '12' }, { ru: 'kaksitoista' }],
        ],
      },
      examples: [
        {
          target: 'Pöydällä on yksi kirja.',
          source: { ru: 'На столе одна книга.' },
        },
        {
          target: 'Huoneessa on kaksi tuolia.',
          source: { ru: 'В комнате два стула.' },
        },
        {
          target: 'Minulla on yksitoista kutsua.',
          source: { ru: 'У меня одиннадцать приглашений.' },
        },
      ],
    },
    {
      id: 'number-counted-noun',
      title: { ru: 'После двух и больше — партитив единственного числа' },
      paragraphs: [
        {
          ru: 'После yksi существительное в простой числовой группе стоит в единственном числе: yksi kirja. После nolla и чисел от двух существительное получает партитив единственного числа: kaksi kirjaa, viisi kirjaa.',
        },
        {
          ru: 'Окончание -t не нужно: само числительное уже сообщает, что предметов несколько. Поэтому kaksi kirjat неверно.',
        },
      ],
      table: {
        headers: [{ ru: 'Количество' }, { ru: 'Форма' }, { ru: 'Пример' }],
        rows: [
          [{ ru: '1' }, { ru: 'номинатив' }, { ru: 'yksi omena' }],
          [
            { ru: '0, 2–12' },
            { ru: 'партитив ед. ч.' },
            { ru: 'kolme omenaa' },
          ],
          [
            { ru: 'неопределённо много' },
            { ru: 'monta + партитив' },
            { ru: 'monta omenaa' },
          ],
        ],
      },
      examples: [
        {
          target: 'Laukussa on kolme omenaa.',
          source: { ru: 'В сумке три яблока.' },
        },
        {
          target: 'Hotellissa on kahdeksan huonetta.',
          source: { ru: 'В отеле восемь номеров.' },
        },
        {
          target: 'Tässä on kaksitoista tiedostoa.',
          source: { ru: 'Здесь двенадцать файлов.' },
        },
      ],
    },
    {
      id: 'number-subject-agreement',
      title: {
        ru: 'Числовая группа обычно требует глагол в единственном числе',
      },
      paragraphs: [
        {
          ru: 'В нейтральном утвердительном предложении числовая группа воспринимается как одно количество. Поэтому сказуемое обычно стоит в третьем лице единственного числа: kaksi opiskelijaa opiskelee.',
        },
        {
          ru: 'Сравни обычное подлежащее во множественном числе: opiskelijat opiskelevat. Числительное меняет и форму существительного, и согласование глагола.',
        },
      ],
      examples: [
        {
          target: 'Kaksi opiskelijaa opiskelee täällä.',
          source: { ru: 'Два студента учатся здесь.' },
        },
        {
          target: 'Neljä bussia tulee asemalle.',
          source: { ru: 'Четыре автобуса прибудут на станцию.' },
        },
        {
          target: 'Yhdeksän turistia odottaa bussia.',
          source: { ru: 'Девять туристов ждут автобус.' },
        },
      ],
    },
    {
      id: 'number-object',
      title: { ru: 'Числовая группа как объект' },
      paragraphs: [
        {
          ru: 'В утвердительном предложении точное количество задаёт границу действия: ostan kaksi kirjaa. После kaksi и других чисел существительное всё равно остаётся в партитиве единственного числа.',
        },
        {
          ru: 'С yksi действует знакомое правило полного объекта: ostan yhden kirjan. В отрицании вся числовая группа получает партитив: en osta yhtä kirjaa, en osta kahta kirjaa.',
        },
      ],
      table: {
        headers: [{ ru: 'Смысл' }, { ru: 'Один' }, { ru: 'Два' }],
        rows: [
          [
            { ru: 'результат' },
            { ru: 'ostan yhden kirjan' },
            { ru: 'ostan kaksi kirjaa' },
          ],
          [
            { ru: 'отрицание' },
            { ru: 'en osta yhtä kirjaa' },
            { ru: 'en osta kahta kirjaa' },
          ],
        ],
      },
      examples: [
        {
          target: 'Ostan yhden lipun huomenna.',
          source: { ru: 'Я куплю один билет завтра.' },
        },
        {
          target: 'Me varaamme neljä huonetta.',
          source: { ru: 'Мы забронируем четыре номера.' },
        },
        {
          target: 'Hän ei varaa kahta huonetta.',
          source: { ru: 'Она не забронирует два номера.' },
        },
      ],
    },
    {
      id: 'indefinite-quantity',
      title: { ru: 'Kuinka monta и kuinka paljon' },
      paragraphs: [
        {
          ru: 'Kuinka monta спрашивает о количестве считаемых предметов: kuinka monta kirjaa. Monta требует партитив единственного числа.',
        },
        {
          ru: 'Kuinka paljon спрашивает о количестве вещества или степени. Paljon, vähän, tarpeeksi и liikaa также требуют партитив: paljon vettä, vähän aikaa.',
        },
      ],
      table: {
        headers: [{ ru: 'Выражение' }, { ru: 'Значение' }, { ru: 'Пример' }],
        rows: [
          [
            { ru: 'kuinka monta' },
            { ru: 'сколько предметов' },
            { ru: 'kuinka monta tehtävää' },
          ],
          [
            { ru: 'kuinka paljon' },
            { ru: 'сколько вещества' },
            { ru: 'kuinka paljon vettä' },
          ],
          [
            { ru: 'tarpeeksi' },
            { ru: 'достаточно' },
            { ru: 'tarpeeksi aikaa' },
          ],
          [{ ru: 'liikaa' }, { ru: 'слишком много' }, { ru: 'liikaa kahvia' }],
        ],
      },
      examples: [
        {
          target: 'Kuinka monta kirjaa sinulla on?',
          source: { ru: 'Сколько у тебя книг?' },
        },
        {
          target: 'Minulla on vähän aikaa.',
          source: { ru: 'У меня мало времени.' },
        },
        {
          target: 'Meillä on tarpeeksi maitoa.',
          source: { ru: 'У нас достаточно молока.' },
        },
        {
          target: 'Hän juo liikaa kahvia.',
          source: { ru: 'Она пьёт слишком много кофе.' },
        },
      ],
    },
    {
      id: 'units-and-prices',
      title: { ru: 'Единицы измерения и цены' },
      paragraphs: [
        {
          ru: 'После числа единица измерения ставится в партитиве единственного числа: kaksi litraa, viisi euroa, kymmenen metriä. Измеряемое вещество тоже может стоять в партитиве: kaksi litraa vettä.',
        },
        {
          ru: 'Pari передаёт приблизительное количество «пара, несколько», а puoli — половину. После них также используется партитив: pari päivää, puoli kiloa.',
        },
      ],
      examples: [
        {
          target: 'Kirja maksaa viisi euroa.',
          source: { ru: 'Книга стоит пять евро.' },
        },
        {
          target: 'Tarvitsemme kaksi litraa vettä.',
          source: { ru: 'Нам нужны два литра воды.' },
        },
        {
          target: 'Silta on kymmenen metriä pitkä.',
          source: { ru: 'Мост длиной десять метров.' },
        },
        {
          target: 'Ostan puoli kiloa juustoa.',
          source: { ru: 'Я куплю полкилограмма сыра.' },
        },
      ],
      callout: {
        ru: 'Один → обычное единственное число. Ноль, два и больше → партитив единственного числа. Числовое подлежащее → обычно глагол в единственном числе.',
      },
    },
  ],
}

interface NumberSeed {
  lemma: string
  gloss: string
  genitive: string
  partitive: string
  exampleTarget: string
  exampleSource: string
}

const numbers: NumberSeed[] = [
  {
    lemma: 'nolla',
    gloss: 'ноль',
    genitive: 'nollan',
    partitive: 'nollaa',
    exampleTarget: 'Minulla on nolla euroa.',
    exampleSource: 'У меня ноль евро.',
  },
  {
    lemma: 'yksi',
    gloss: 'один',
    genitive: 'yhden',
    partitive: 'yhtä',
    exampleTarget: 'Pöydällä on yksi kirja.',
    exampleSource: 'На столе одна книга.',
  },
  {
    lemma: 'kaksi',
    gloss: 'два',
    genitive: 'kahden',
    partitive: 'kahta',
    exampleTarget: 'Huoneessa on kaksi tuolia.',
    exampleSource: 'В комнате два стула.',
  },
  {
    lemma: 'kolme',
    gloss: 'три',
    genitive: 'kolmen',
    partitive: 'kolmea',
    exampleTarget: 'Laukussa on kolme omenaa.',
    exampleSource: 'В сумке три яблока.',
  },
  {
    lemma: 'neljä',
    gloss: 'четыре',
    genitive: 'neljän',
    partitive: 'neljää',
    exampleTarget: 'Varaamme neljä huonetta.',
    exampleSource: 'Мы забронируем четыре номера.',
  },
  {
    lemma: 'viisi',
    gloss: 'пять',
    genitive: 'viiden',
    partitive: 'viittä',
    exampleTarget: 'Kirja maksaa viisi euroa.',
    exampleSource: 'Книга стоит пять евро.',
  },
  {
    lemma: 'kuusi',
    gloss: 'шесть',
    genitive: 'kuuden',
    partitive: 'kuutta',
    exampleTarget: 'Laukussa on kuusi omenaa.',
    exampleSource: 'В сумке шесть яблок.',
  },
  {
    lemma: 'seitsemän',
    gloss: 'семь',
    genitive: 'seitsemän',
    partitive: 'seitsemää',
    exampleTarget: 'Tulostan seitsemän lomaketta.',
    exampleSource: 'Я распечатаю семь форм.',
  },
  {
    lemma: 'kahdeksan',
    gloss: 'восемь',
    genitive: 'kahdeksan',
    partitive: 'kahdeksaa',
    exampleTarget: 'Hotellissa on kahdeksan huonetta.',
    exampleSource: 'В отеле восемь номеров.',
  },
  {
    lemma: 'yhdeksän',
    gloss: 'девять',
    genitive: 'yhdeksän',
    partitive: 'yhdeksää',
    exampleTarget: 'Pöydällä on yhdeksän kuppia.',
    exampleSource: 'На столе девять чашек.',
  },
  {
    lemma: 'kymmenen',
    gloss: 'десять',
    genitive: 'kymmenen',
    partitive: 'kymmentä',
    exampleTarget: 'Lähetämme kymmenen kutsua.',
    exampleSource: 'Мы отправим десять приглашений.',
  },
  {
    lemma: 'yksitoista',
    gloss: 'одиннадцать',
    genitive: 'yhdentoista',
    partitive: 'yhtätoista',
    exampleTarget: 'Minulla on yksitoista kutsua.',
    exampleSource: 'У меня одиннадцать приглашений.',
  },
  {
    lemma: 'kaksitoista',
    gloss: 'двенадцать',
    genitive: 'kahdentoista',
    partitive: 'kahtatoista',
    exampleTarget: 'Tässä on kaksitoista tiedostoa.',
    exampleSource: 'Здесь двенадцать файлов.',
  },
]

const quantityWords = [
  [
    'moni',
    'многие; много',
    'pronoun',
    'monta',
    'Odotin monta päivää.',
    'Я ждал много дней.',
  ],
  [
    'paljon',
    'много',
    'adverb',
    'paljon',
    'Hän juo paljon vettä.',
    'Она пьёт много воды.',
  ],
  [
    'vähän',
    'мало, немного',
    'adverb',
    'vähän',
    'Minulla on vähän aikaa.',
    'У меня мало времени.',
  ],
  [
    'tarpeeksi',
    'достаточно',
    'adverb',
    'tarpeeksi',
    'Meillä on tarpeeksi maitoa.',
    'У нас достаточно молока.',
  ],
  [
    'liikaa',
    'слишком много',
    'adverb',
    'liikaa',
    'Hän juo liikaa kahvia.',
    'Она пьёт слишком много кофе.',
  ],
  [
    'kuinka',
    'сколько; как',
    'adverb',
    'kuinka',
    'Kuinka paljon kahvi maksaa?',
    'Сколько стоит кофе?',
  ],
] as const

const nouns = [
  [
    'euro',
    'евро',
    'евро',
    'euron',
    'euroa',
    'eurot',
    'Kirja maksaa viisi euroa.',
    'Книга стоит пять евро.',
  ],
  [
    'kilo',
    'килограмм',
    'килограммы',
    'kilon',
    'kiloa',
    'kilot',
    'Ostan puoli kiloa juustoa.',
    'Я куплю полкилограмма сыра.',
  ],
  [
    'litra',
    'литр',
    'литры',
    'litran',
    'litraa',
    'litrat',
    'Tarvitsemme kaksi litraa vettä.',
    'Нам нужны два литра воды.',
  ],
  [
    'metri',
    'метр',
    'метры',
    'metrin',
    'metriä',
    'metrit',
    'Silta on kymmenen metriä pitkä.',
    'Мост длиной десять метров.',
  ],
  [
    'kappale',
    'штука, экземпляр',
    'штуки, экземпляры',
    'kappaleen',
    'kappaletta',
    'kappaleet',
    'Tarvitsen viisi kappaletta.',
    'Мне нужно пять штук.',
  ],
  [
    'pari',
    'пара, несколько',
    'пары',
    'parin',
    'paria',
    'parit',
    'Minulla on pari kysymystä.',
    'У меня пара вопросов.',
  ],
  [
    'puoli',
    'половина',
    'половины',
    'puolen',
    'puolta',
    'puolet',
    'Ostan puoli kiloa juustoa.',
    'Я куплю полкилограмма сыра.',
  ],
] as const

export const numeralsQuantitiesVocabulary: LessonVocabularySeed[] = [
  ...numbers.map((number, index) => numberVocabulary(number, index + 1)),
  ...quantityWords.map((word, index) =>
    quantityVocabulary(word, numbers.length + index + 1),
  ),
  ...nouns.map((noun, index) =>
    nounVocabulary(noun, numbers.length + quantityWords.length + index + 1),
  ),
]

function numberVocabulary(
  number: NumberSeed,
  position: number,
): LessonVocabularySeed {
  const serial = serialFor(position)
  return {
    ...identity(serial, number.lemma),
    lemma: number.lemma,
    partOfSpeech: 'numeral',
    gloss: number.gloss,
    example: {
      target: number.exampleTarget,
      source: { ru: number.exampleSource },
    },
    semanticTypes: ['module-two', 'cardinal-number'],
    singular: number.lemma,
    plural: number.lemma,
    sourceSingular: number.gloss,
    sourcePlural: number.gloss,
    forms: [
      form(serial, 'nominative', number.lemma, {
        case: 'nominative',
        number: 'singular',
      }),
      form(serial, 'genitive', number.genitive, {
        case: 'genitive',
        number: 'singular',
      }),
      form(serial, 'partitive', number.partitive, {
        case: 'partitive',
        number: 'singular',
      }),
    ],
  }
}

function quantityVocabulary(
  word: (typeof quantityWords)[number],
  position: number,
): LessonVocabularySeed {
  const [lemma, gloss, partOfSpeech, surface, exampleTarget, exampleSource] =
    word
  const serial = serialFor(position)
  return {
    ...identity(serial, lemma),
    lemma,
    partOfSpeech,
    gloss,
    example: { target: exampleTarget, source: { ru: exampleSource } },
    semanticTypes: ['module-two', 'quantity-expression'],
    singular: lemma,
    plural: lemma,
    sourceSingular: gloss,
    sourcePlural: gloss,
    forms:
      partOfSpeech === 'pronoun'
        ? [
            form(serial, 'nominative', lemma, {
              case: 'nominative',
              number: 'singular',
            }),
            form(serial, 'partitive', surface, {
              case: 'partitive',
              number: 'singular',
            }),
          ]
        : [form(serial, 'invariant', surface, { form: 'invariant' })],
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
    example: { target: exampleTarget, source: { ru: exampleSource } },
    semanticTypes: ['module-two', 'quantity-unit'],
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

function identity(serial: string, lemma: string) {
  return {
    key: `m2-${serial.replace('.', '-')}`,
    itemId: `word.fi.m2.${serial}`,
    conceptId: `concept.fi.m2.${serial}`,
    lexicalEntryId: `lex.fi.${lemma}`,
  }
}

function serialFor(position: number) {
  return `03.${String(position).padStart(2, '0')}`
}

function form(
  serial: string,
  key: string,
  surface: string,
  features: Record<string, string>,
) {
  return { id: `form.fi.m2.${serial}.${key}`, surface, features }
}
