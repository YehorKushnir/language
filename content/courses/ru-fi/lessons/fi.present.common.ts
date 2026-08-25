import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './fi.olla.basics.js'

const SKILL_ID = 'grammar.fi.present.common'

interface TypeOneVerbSeed {
  key: string
  lemma: string
  gloss: string
  forms: [string, string, string, string, string, string]
  connegative: string
  source: [string, string, string, string, string, string]
  valency: 'intransitive' | 'transitive' | 'ambitransitive'
}

const verbs: TypeOneVerbSeed[] = [
  verb(
    'puhua',
    'говорить',
    ['puhun', 'puhut', 'puhuu', 'puhumme', 'puhutte', 'puhuvat'],
    'puhu',
    ['говорю', 'говоришь', 'говорит', 'говорим', 'говорите', 'говорят'],
    'ambitransitive',
  ),
  verb(
    'asua',
    'жить',
    ['asun', 'asut', 'asuu', 'asumme', 'asutte', 'asuvat'],
    'asu',
    ['живу', 'живёшь', 'живёт', 'живём', 'живёте', 'живут'],
    'intransitive',
  ),
  verb(
    'kysyä',
    'спрашивать',
    ['kysyn', 'kysyt', 'kysyy', 'kysymme', 'kysytte', 'kysyvät'],
    'kysy',
    [
      'спрашиваю',
      'спрашиваешь',
      'спрашивает',
      'спрашиваем',
      'спрашиваете',
      'спрашивают',
    ],
    'ambitransitive',
  ),
  verb(
    'sanoa',
    'сказать; произносить',
    ['sanon', 'sanot', 'sanoo', 'sanomme', 'sanotte', 'sanovat'],
    'sano',
    [
      'произношу',
      'произносишь',
      'произносит',
      'произносим',
      'произносите',
      'произносят',
    ],
    'transitive',
  ),
  verb(
    'kertoa',
    'рассказывать',
    ['kerron', 'kerrot', 'kertoo', 'kerromme', 'kerrotte', 'kertovat'],
    'kerro',
    [
      'рассказываю',
      'рассказываешь',
      'рассказывает',
      'рассказываем',
      'рассказываете',
      'рассказывают',
    ],
    'ambitransitive',
  ),
  verb(
    'lukea',
    'читать',
    ['luen', 'luet', 'lukee', 'luemme', 'luette', 'lukevat'],
    'lue',
    ['читаю', 'читаешь', 'читает', 'читаем', 'читаете', 'читают'],
    'ambitransitive',
  ),
  verb(
    'kirjoittaa',
    'писать',
    [
      'kirjoitan',
      'kirjoitat',
      'kirjoittaa',
      'kirjoitamme',
      'kirjoitatte',
      'kirjoittavat',
    ],
    'kirjoita',
    ['пишу', 'пишешь', 'пишет', 'пишем', 'пишете', 'пишут'],
    'ambitransitive',
  ),
  verb(
    'katsoa',
    'смотреть',
    ['katson', 'katsot', 'katsoo', 'katsomme', 'katsotte', 'katsovat'],
    'katso',
    ['смотрю', 'смотришь', 'смотрит', 'смотрим', 'смотрите', 'смотрят'],
    'ambitransitive',
  ),
  verb(
    'oppia',
    'усваивать; научиться',
    ['opin', 'opit', 'oppii', 'opimme', 'opitte', 'oppivat'],
    'opi',
    [
      'усваиваю',
      'усваиваешь',
      'усваивает',
      'усваиваем',
      'усваиваете',
      'усваивают',
    ],
    'ambitransitive',
  ),
  verb(
    'opettaa',
    'обучать',
    ['opetan', 'opetat', 'opettaa', 'opetamme', 'opetatte', 'opettavat'],
    'opeta',
    ['обучаю', 'обучаешь', 'обучает', 'обучаем', 'обучаете', 'обучают'],
    'transitive',
  ),
  verb(
    'ymmärtää',
    'понимать',
    [
      'ymmärrän',
      'ymmärrät',
      'ymmärtää',
      'ymmärrämme',
      'ymmärrätte',
      'ymmärtävät',
    ],
    'ymmärrä',
    ['понимаю', 'понимаешь', 'понимает', 'понимаем', 'понимаете', 'понимают'],
    'transitive',
  ),
  verb(
    'muistaa',
    'помнить',
    ['muistan', 'muistat', 'muistaa', 'muistamme', 'muistatte', 'muistavat'],
    'muista',
    ['помню', 'помнишь', 'помнит', 'помним', 'помните', 'помнят'],
    'transitive',
  ),
  verb(
    'unohtaa',
    'забывать',
    ['unohdan', 'unohdat', 'unohtaa', 'unohdamme', 'unohdatte', 'unohtavat'],
    'unohda',
    ['забываю', 'забываешь', 'забывает', 'забываем', 'забываете', 'забывают'],
    'transitive',
  ),
  verb(
    'auttaa',
    'помогать',
    ['autan', 'autat', 'auttaa', 'autamme', 'autatte', 'auttavat'],
    'auta',
    ['помогаю', 'помогаешь', 'помогает', 'помогаем', 'помогаете', 'помогают'],
    'ambitransitive',
  ),
  verb(
    'odottaa',
    'ждать',
    ['odotan', 'odotat', 'odottaa', 'odotamme', 'odotatte', 'odottavat'],
    'odota',
    ['жду', 'ждёшь', 'ждёт', 'ждём', 'ждёте', 'ждут'],
    'ambitransitive',
  ),
  verb(
    'ottaa',
    'брать',
    ['otan', 'otat', 'ottaa', 'otamme', 'otatte', 'ottavat'],
    'ota',
    ['беру', 'берёшь', 'берёт', 'берём', 'берёте', 'берут'],
    'transitive',
  ),
  verb(
    'antaa',
    'давать',
    ['annan', 'annat', 'antaa', 'annamme', 'annatte', 'antavat'],
    'anna',
    ['даю', 'даёшь', 'даёт', 'даём', 'даёте', 'дают'],
    'transitive',
  ),
  verb(
    'löytää',
    'находить',
    ['löydän', 'löydät', 'löytää', 'löydämme', 'löydätte', 'löytävät'],
    'löydä',
    ['нахожу', 'находишь', 'находит', 'находим', 'находите', 'находят'],
    'transitive',
  ),
  verb(
    'käyttää',
    'использовать',
    ['käytän', 'käytät', 'käyttää', 'käytämme', 'käytätte', 'käyttävät'],
    'käytä',
    [
      'использую',
      'используешь',
      'использует',
      'используем',
      'используете',
      'используют',
    ],
    'transitive',
  ),
  verb(
    'maksaa',
    'платить',
    ['maksan', 'maksat', 'maksaa', 'maksamme', 'maksatte', 'maksavat'],
    'maksa',
    ['плачу', 'платишь', 'платит', 'платим', 'платите', 'платят'],
    'ambitransitive',
  ),
  verb(
    'ostaa',
    'покупать',
    ['ostan', 'ostat', 'ostaa', 'ostamme', 'ostatte', 'ostavat'],
    'osta',
    ['покупаю', 'покупаешь', 'покупает', 'покупаем', 'покупаете', 'покупают'],
    'ambitransitive',
  ),
  verb(
    'sulkea',
    'закрывать',
    ['suljen', 'suljet', 'sulkee', 'suljemme', 'suljette', 'sulkevat'],
    'sulje',
    [
      'закрываю',
      'закрываешь',
      'закрывает',
      'закрываем',
      'закрываете',
      'закрывают',
    ],
    'transitive',
  ),
  verb(
    'selittää',
    'объяснять',
    ['selitän', 'selität', 'selittää', 'selitämme', 'selitätte', 'selittävät'],
    'selitä',
    [
      'объясняю',
      'объясняешь',
      'объясняет',
      'объясняем',
      'объясняете',
      'объясняют',
    ],
    'ambitransitive',
  ),
  verb(
    'näyttää',
    'показывать',
    ['näytän', 'näytät', 'näyttää', 'näytämme', 'näytätte', 'näyttävät'],
    'näytä',
    [
      'показываю',
      'показываешь',
      'показывает',
      'показываем',
      'показываете',
      'показывают',
    ],
    'ambitransitive',
  ),
  verb(
    'tarkistaa',
    'проверять',
    [
      'tarkistan',
      'tarkistat',
      'tarkistaa',
      'tarkistamme',
      'tarkistatte',
      'tarkistavat',
    ],
    'tarkista',
    [
      'проверяю',
      'проверяешь',
      'проверяет',
      'проверяем',
      'проверяете',
      'проверяют',
    ],
    'transitive',
  ),
  verb(
    'hoitaa',
    'заниматься; ухаживать',
    ['hoidan', 'hoidat', 'hoitaa', 'hoidamme', 'hoidatte', 'hoitavat'],
    'hoida',
    [
      'занимаюсь',
      'занимаешься',
      'занимается',
      'занимаемся',
      'занимаетесь',
      'занимаются',
    ],
    'ambitransitive',
  ),
]

const pronouns = [
  ['minä', 'я'],
  ['sinä', 'ты'],
  ['hän', 'он или она'],
  ['me', 'мы'],
  ['te', 'вы'],
  ['he', 'они'],
] as const

export const presentCommonContent = {
  version: 6,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'present-overview',
      title: { ru: 'Настоящее время целиком' },
      paragraphs: [
        {
          ru: 'Личная форма состоит из основы глагола и окончания, которое показывает участника. На примере puhua видно сразу всю систему: puhun, puhut, puhuu, puhumme, puhutte, puhuvat.',
        },
        {
          ru: 'Сначала выбирается основа, затем личное окончание. В третьем лице единственного числа вместо отдельного окончания последняя гласная основы обычно удлиняется.',
        },
      ],
      table: {
        headers: [{ ru: 'Кто' }, { ru: 'Окончание' }, { ru: 'puhua' }],
        rows: pronouns.map(([target, source], index) => [
          { ru: `${target} — ${source}` },
          {
            ru: ['-n', '-t', 'долгая гласная', '-mme', '-tte', '-vat/-vät'][
              index
            ]!,
          },
          { ru: verbs[0]!.forms[index]! },
        ]),
      },
      examples: [
        { target: 'Minä puhun suomea.', source: { ru: 'Я говорю по-фински.' } },
        {
          target: 'Sinä puhut suomea.',
          source: { ru: 'Ты говоришь по-фински.' },
        },
        {
          target: 'Hän puhuu suomea.',
          source: { ru: 'Он или она говорит по-фински.' },
        },
        {
          target: 'Me puhumme suomea.',
          source: { ru: 'Мы говорим по-фински.' },
        },
      ],
    },
    {
      id: 'type-one-stem',
      title: { ru: 'Как получить основу глагола первого типа' },
      paragraphs: [
        {
          ru: 'Глагол первого типа в словарной форме оканчивается на -a или -ä, перед которыми стоит гласная: puhua, lukea, kysyä. Чтобы получить основу, убери последнюю -a/-ä.',
        },
        {
          ru: 'После выделения основы проверь, не меняются ли k, p или t. Поэтому puhua даёт puhun, но lukea — luen. Полная система таких чередований будет разобрана в уроке 6.',
        },
      ],
      table: {
        headers: [{ ru: 'Инфинитив' }, { ru: 'Основа' }, { ru: 'Форма minä' }],
        rows: [
          [{ ru: 'puhua' }, { ru: 'puhu-' }, { ru: 'puhun' }],
          [{ ru: 'kysyä' }, { ru: 'kysy-' }, { ru: 'kysyn' }],
          [{ ru: 'lukea' }, { ru: 'luke- → lue-' }, { ru: 'luen' }],
          [{ ru: 'kertoa' }, { ru: 'kerto- → kerro-' }, { ru: 'kerron' }],
        ],
      },
      examples: [
        { target: 'Minä kysyn.', source: { ru: 'Я спрашиваю.' } },
        { target: 'Minä luen.', source: { ru: 'Я читаю.' } },
        { target: 'Minä kerron.', source: { ru: 'Я рассказываю.' } },
      ],
    },
    {
      id: 'gradation-in-present',
      title: { ru: 'Почему согласная иногда меняется' },
      paragraphs: [
        {
          ru: 'В формах minä, sinä, me и te сильная ступень часто меняется на слабую: ottaa → otan, antaa → annan, käyttää → käytän.',
        },
        {
          ru: 'Формы hän и he обычно сохраняют сильную ступень: hän ottaa, he ottavat. Полная система чередования будет разобрана отдельно в уроке 6.',
        },
      ],
      table: {
        headers: [
          { ru: 'Изменение' },
          { ru: 'Инфинитив' },
          { ru: 'minä' },
          { ru: 'hän' },
        ],
        rows: [
          [{ ru: 'tt → t' }, { ru: 'ottaa' }, { ru: 'otan' }, { ru: 'ottaa' }],
          [
            { ru: 'nt → nn' },
            { ru: 'antaa' },
            { ru: 'annan' },
            { ru: 'antaa' },
          ],
          [
            { ru: 't → d' },
            { ru: 'löytää' },
            { ru: 'löydän' },
            { ru: 'löytää' },
          ],
          [{ ru: 'k → ∅' }, { ru: 'lukea' }, { ru: 'luen' }, { ru: 'lukee' }],
        ],
      },
      examples: [
        { target: 'Minä otan.', source: { ru: 'Я беру.' } },
        { target: 'Hän ottaa.', source: { ru: 'Он или она берёт.' } },
      ],
    },
    {
      id: 'subject-omission',
      title: { ru: 'Когда местоимение можно опустить' },
      paragraphs: [
        {
          ru: 'В первом и втором лице окончание уже показывает действующее лицо, поэтому minä, sinä, me и te часто опускаются. Asun здесь значит «я живу», а puhut — «ты говоришь».',
        },
        {
          ru: 'Hän и he в нейтральном письменном языке не опускаются: hän lukee, he kirjoittavat.',
        },
      ],
      examples: [
        { target: 'Asun Suomessa.', source: { ru: 'Я живу в Финляндии.' } },
        {
          target: 'Hän asuu Suomessa.',
          source: { ru: 'Он или она живёт в Финляндии.' },
        },
        { target: 'Kirjoitamme.', source: { ru: 'Мы пишем.' } },
      ],
    },
    {
      id: 'spoken-present',
      title: { ru: 'Kirjakieli и puhekieli' },
      paragraphs: [
        {
          ru: 'В puhekieli местоимения minä и sinä обычно превращаются в mä и sä, а окончания первого лица множественного часто заменяются пассивной формой. На этом этапе такие формы нужно узнавать, но писать ответы следует на kirjakieli.',
        },
        {
          ru: 'Нейтральное minä puhun в разговоре часто звучит как mä puhun. Форма глагола в первом лице при этом остаётся узнаваемой.',
        },
      ],
      examples: [
        {
          target: 'Mä puhun suomea.',
          source: { ru: 'Я говорю по-фински.' },
        },
        {
          target: 'Sä asut täällä.',
          source: { ru: 'Ты живёшь здесь.' },
        },
      ],
    },
    {
      id: 'present-errors',
      title: { ru: 'Типичные ошибки' },
      paragraphs: [
        {
          ru: 'Не добавляй личное окончание к полной словарной форме: не puhuan, а puhun. Не используй -n с hän: не hän puhun, а hän puhuu.',
        },
        {
          ru: 'Сначала выбери основу и ступень согласных, затем добавь окончание. Такой порядок предотвращает формы вроде otten вместо otan.',
        },
      ],
      examples: [
        {
          target: 'Minä ymmärrän.',
          source: { ru: 'Я понимаю.' },
        },
        {
          target: 'He käyttävät.',
          source: { ru: 'Они используют.' },
        },
        {
          target: 'Hän sulkee.',
          source: { ru: 'Он или она закрывает.' },
        },
      ],
      callout: {
        ru: 'Алгоритм: инфинитив → основа → сильная или слабая ступень → личное окончание.',
      },
    },
  ],
} as const

export const presentCommonVocabulary: LessonVocabularySeed[] = verbs.map(
  (item, index) => {
    const serial = `02.${String(index + 1).padStart(2, '0')}`
    return {
      key: `present-${item.key}`,
      itemId: `word.fi.m1.${serial}`,
      conceptId: `concept.fi.m1.${serial}`,
      lexicalEntryId: `lex.fi.${item.lemma}`,
      lemma: item.lemma,
      partOfSpeech: 'verb',
      gloss: item.gloss,
      example: {
        target: `Minä ${item.forms[0]}.`,
        source: { ru: item.source[0] },
      },
      semanticTypes: ['action', `valency:${item.valency}`, 'verb-type:1'],
      singular: item.forms[0],
      plural: item.forms[3],
      sourceSingular: item.source[0],
      sourcePlural: `мы: ${item.gloss}`,
      forms: [
        lexicalForm(serial, 'infinitive', item.lemma, {
          form: 'infinitive',
          verbType: '1',
        }),
        lexicalForm(serial, 'present-1sg', item.forms[0], {
          mood: 'indicative',
          tense: 'present',
          person: 'first',
          number: 'singular',
        }),
        lexicalForm(serial, 'present-3sg', item.forms[2], {
          mood: 'indicative',
          tense: 'present',
          person: 'third',
          number: 'singular',
        }),
        lexicalForm(serial, 'present-3pl', item.forms[5], {
          mood: 'indicative',
          tense: 'present',
          person: 'third',
          number: 'plural',
        }),
        lexicalForm(serial, 'connegative', item.connegative, {
          mood: 'indicative',
          tense: 'present',
          form: 'connegative',
        }),
      ],
    }
  },
)

export const presentCommonExercises: PreparedExerciseSeed[] = buildExercises()

export const presentCommonGoldenExerciseIds = [
  'exercise.fi.present.common.first.001',
  'exercise.fi.present.common.first.006',
  'exercise.fi.present.common.second-now.001',
  'exercise.fi.present.common.third.001',
  'exercise.fi.present.common.first-plural-now.001',
  'exercise.fi.present.common.third-plural-now.001',
] as const

function buildExercises(): PreparedExerciseSeed[] {
  const exercises: PreparedExerciseSeed[] = []

  verbs.slice(0, 18).forEach((item, index) => {
    const vocabulary = presentCommonVocabulary[index]!
    const targetText = `Minä ${item.forms[0]}.`
    exercises.push(
      exercise({
        id: `exercise.fi.present.common.first.${serial(index)}`,
        selectionOrder: exercises.length + 1,
        prompt: `Я ${item.source[0]}.`,
        targetText,
        acceptedVariants: [targetText, `${capitalize(item.forms[0])}.`],
        slots: [
          grammarSlot('subject', ['minä'], true),
          vocabularySlot('mainVerb', [item.forms[0]], vocabulary.itemId),
        ],
        vocabularyItemId: vocabulary.itemId,
      }),
    )
  })

  takeVerbs(18, 10).forEach(({ item, vocabularyIndex }, index) => {
    const vocabulary = presentCommonVocabulary[vocabularyIndex]!
    exercises.push(
      exercise({
        id: `exercise.fi.present.common.second-now.${serial(index)}`,
        selectionOrder: exercises.length + 1,
        prompt: `Ты сейчас ${item.source[1]}.`,
        targetText: `Sinä ${item.forms[1]} nyt.`,
        acceptedVariants: [
          `Sinä ${item.forms[1]} nyt.`,
          `${capitalize(item.forms[1])} nyt.`,
          `Nyt sinä ${item.forms[1]}.`,
          `Nyt ${item.forms[1]}.`,
        ],
        slots: [
          grammarSlot('subject', ['sinä'], true),
          vocabularySlot('mainVerb', [item.forms[1]], vocabulary.itemId),
          grammarSlot('adverb', ['nyt']),
        ],
        vocabularyItemId: vocabulary.itemId,
      }),
    )
  })

  takeVerbs(2, 8).forEach(({ item, vocabularyIndex }, index) => {
    const vocabulary = presentCommonVocabulary[vocabularyIndex]!
    exercises.push(
      exercise({
        id: `exercise.fi.present.common.third.${serial(index)}`,
        selectionOrder: exercises.length + 1,
        prompt: `Он или она ${item.source[2]}.`,
        targetText: `Hän ${item.forms[2]}.`,
        acceptedVariants: [`Hän ${item.forms[2]}.`],
        slots: [
          grammarSlot('subject', ['hän']),
          vocabularySlot('mainVerb', [item.forms[2]], vocabulary.itemId),
        ],
        vocabularyItemId: vocabulary.itemId,
      }),
    )
  })

  takeVerbs(10, 8).forEach(({ item, vocabularyIndex }, index) => {
    const vocabulary = presentCommonVocabulary[vocabularyIndex]!
    exercises.push(
      exercise({
        id: `exercise.fi.present.common.first-plural-now.${serial(index)}`,
        selectionOrder: exercises.length + 1,
        prompt: `Сейчас мы ${item.source[3]}.`,
        targetText: `Nyt me ${item.forms[3]}.`,
        acceptedVariants: [`Nyt me ${item.forms[3]}.`, `Nyt ${item.forms[3]}.`],
        slots: [
          grammarSlot('adverb', ['nyt']),
          grammarSlot('subject', ['me'], true),
          vocabularySlot('mainVerb', [item.forms[3]], vocabulary.itemId),
        ],
        vocabularyItemId: vocabulary.itemId,
      }),
    )
  })

  takeVerbs(18, 8).forEach(({ item, vocabularyIndex }, index) => {
    const vocabulary = presentCommonVocabulary[vocabularyIndex]!
    exercises.push(
      exercise({
        id: `exercise.fi.present.common.second-plural.${serial(index)}`,
        selectionOrder: exercises.length + 1,
        prompt: `Вы ${item.source[4]}.`,
        targetText: `Te ${item.forms[4]}.`,
        acceptedVariants: [
          `Te ${item.forms[4]}.`,
          `${capitalize(item.forms[4])}.`,
        ],
        slots: [
          grammarSlot('subject', ['te'], true),
          vocabularySlot('mainVerb', [item.forms[4]], vocabulary.itemId),
        ],
        vocabularyItemId: vocabulary.itemId,
      }),
    )
  })

  takeVerbs(0, 8).forEach(({ item, vocabularyIndex }, index) => {
    const vocabulary = presentCommonVocabulary[vocabularyIndex]!
    exercises.push(
      exercise({
        id: `exercise.fi.present.common.third-plural-now.${serial(index)}`,
        selectionOrder: exercises.length + 1,
        prompt: `Они сейчас ${item.source[5]}.`,
        targetText: `He ${item.forms[5]} nyt.`,
        acceptedVariants: [
          `He ${item.forms[5]} nyt.`,
          `Nyt he ${item.forms[5]}.`,
        ],
        slots: [
          grammarSlot('subject', ['he']),
          vocabularySlot('mainVerb', [item.forms[5]], vocabulary.itemId),
          grammarSlot('adverb', ['nyt']),
        ],
        vocabularyItemId: vocabulary.itemId,
      }),
    )
  })

  if (exercises.length !== 60) {
    throw new Error(
      `Present common lesson must contain 60 exercises, received ${exercises.length}`,
    )
  }
  return exercises
}

function verb(
  lemma: string,
  gloss: string,
  forms: TypeOneVerbSeed['forms'],
  connegative: string,
  source: TypeOneVerbSeed['source'],
  valency: TypeOneVerbSeed['valency'],
): TypeOneVerbSeed {
  return { key: lemma, lemma, gloss, forms, connegative, source, valency }
}

function takeVerbs(start: number, count: number) {
  return Array.from({ length: count }, (_, offset) => {
    const vocabularyIndex = (start + offset) % verbs.length
    return { item: verbs[vocabularyIndex]!, vocabularyIndex }
  })
}

function lexicalForm(
  serialValue: string,
  key: string,
  surface: string,
  features: Record<string, string>,
) {
  return {
    id: `form.fi.m1.${serialValue}.${key}`,
    surface,
    features,
  }
}

function exercise(
  input: Omit<PreparedExerciseSeed, 'primaryItemId' | 'secondaryItemIds'>,
): PreparedExerciseSeed {
  return { ...input, primaryItemId: SKILL_ID, secondaryItemIds: [] }
}

function grammarSlot(role: string, accepted: string[], optional = false) {
  return {
    role,
    accepted,
    itemIds: [SKILL_ID],
    ...(optional ? { optional } : {}),
  }
}

function vocabularySlot(role: string, accepted: string[], itemId: string) {
  return { role, accepted, itemIds: [SKILL_ID, itemId] }
}

function serial(index: number) {
  return String(index + 1).padStart(3, '0')
}

function capitalize(value: string) {
  return `${value.charAt(0).toLocaleUpperCase('fi')}${value.slice(1)}`
}
