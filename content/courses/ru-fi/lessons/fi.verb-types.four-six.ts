import {
  buildPresentVerbExercises,
  buildPresentVerbVocabulary,
  type CuratedPresentVerb,
} from './present-verb-builder.js'

export const VERB_TYPE_FOUR_SKILL_ID = 'grammar.fi.verb-type.4'
export const VERB_TYPE_FIVE_SKILL_ID = 'grammar.fi.verb-type.5'
export const VERB_TYPE_SIX_SKILL_ID = 'grammar.fi.verb-type.6'

const verbs: CuratedPresentVerb[] = [
  v(
    'haluta',
    'хотеть',
    ['haluan', 'haluat', 'haluaa', 'haluamme', 'haluatte', 'haluavat'],
    'halua',
    '4',
    'desire',
  ),
  v(
    'herätä',
    'просыпаться',
    ['herään', 'heräät', 'herää', 'heräämme', 'heräätte', 'heräävät'],
    'herää',
    '4',
    'change-of-state',
  ),
  v(
    'tavata',
    'встречать',
    ['tapaan', 'tapaat', 'tapaa', 'tapaamme', 'tapaatte', 'tapaavat'],
    'tapaa',
    '4',
    'social-action',
  ),
  v(
    'osata',
    'уметь',
    ['osaan', 'osaat', 'osaa', 'osaamme', 'osaatte', 'osaavat'],
    'osaa',
    '4',
    'ability',
  ),
  v(
    'pelata',
    'играть',
    ['pelaan', 'pelaat', 'pelaa', 'pelaamme', 'pelaatte', 'pelaavat'],
    'pelaa',
    '4',
    'leisure',
  ),
  v(
    'siivota',
    'убирать',
    ['siivoan', 'siivoat', 'siivoaa', 'siivoamme', 'siivoatte', 'siivoavat'],
    'siivoa',
    '4',
    'household',
  ),
  v(
    'lainata',
    'одалживать',
    ['lainaan', 'lainaat', 'lainaa', 'lainaamme', 'lainaatte', 'lainaavat'],
    'lainaa',
    '4',
    'transfer',
  ),
  v(
    'tykätä',
    'нравиться',
    ['tykkään', 'tykkäät', 'tykkää', 'tykkäämme', 'tykkäätte', 'tykkäävät'],
    'tykkää',
    '4',
    'emotion',
  ),
  v(
    'vihata',
    'ненавидеть',
    ['vihaan', 'vihaat', 'vihaa', 'vihaamme', 'vihaatte', 'vihaavat'],
    'vihaa',
    '4',
    'emotion',
  ),
  v(
    'tarvita',
    'нуждаться',
    [
      'tarvitsen',
      'tarvitset',
      'tarvitsee',
      'tarvitsemme',
      'tarvitsette',
      'tarvitsevat',
    ],
    'tarvitse',
    '5',
    'need',
  ),
  v(
    'pakata',
    'упаковывать',
    ['pakkaan', 'pakkaat', 'pakkaa', 'pakkaamme', 'pakkaatte', 'pakkaavat'],
    'pakkaa',
    '4',
    'household',
  ),
  v(
    'korjata',
    'чинить',
    ['korjaan', 'korjaat', 'korjaa', 'korjaamme', 'korjaatte', 'korjaavat'],
    'korjaa',
    '4',
    'repair',
  ),
  v(
    'maalata',
    'красить',
    ['maalaan', 'maalaat', 'maalaa', 'maalaamme', 'maalaatte', 'maalaavat'],
    'maalaa',
    '4',
    'creation',
  ),
  v(
    'tilata',
    'заказывать',
    ['tilaan', 'tilaat', 'tilaa', 'tilaamme', 'tilaatte', 'tilaavat'],
    'tilaa',
    '4',
    'commerce',
  ),
  v(
    'pudota',
    'падать',
    ['putoan', 'putoat', 'putoaa', 'putoamme', 'putoatte', 'putoavat'],
    'putoa',
    '4',
    'motion',
  ),
  v(
    'levätä',
    'отдыхать',
    ['lepään', 'lepäät', 'lepää', 'lepäämme', 'lepäätte', 'lepäävät'],
    'lepää',
    '4',
    'state',
  ),
  v(
    'häiritä',
    'мешать',
    [
      'häiritsen',
      'häiritset',
      'häiritsee',
      'häiritsemme',
      'häiritsette',
      'häiritsevät',
    ],
    'häiritse',
    '5',
    'interaction',
  ),
  v(
    'luvata',
    'обещать',
    ['lupaan', 'lupaat', 'lupaa', 'lupaamme', 'lupaatte', 'lupaavat'],
    'lupaa',
    '4',
    'communication',
  ),
  v(
    'palata',
    'возвращаться',
    ['palaan', 'palaat', 'palaa', 'palaamme', 'palaatte', 'palaavat'],
    'palaa',
    '4',
    'motion',
  ),
  v(
    'pelätä',
    'бояться',
    ['pelkään', 'pelkäät', 'pelkää', 'pelkäämme', 'pelkäätte', 'pelkäävät'],
    'pelkää',
    '4',
    'emotion',
  ),
  v(
    'lämmetä',
    'теплеть',
    [
      'lämpenen',
      'lämpenet',
      'lämpenee',
      'lämpenemme',
      'lämpenette',
      'lämpenevät',
    ],
    'lämpene',
    '6',
    'change-of-state',
  ),
  v(
    'kylmetä',
    'холодать',
    [
      'kylmenen',
      'kylmenet',
      'kylmenee',
      'kylmenemme',
      'kylmenette',
      'kylmenevät',
    ],
    'kylmene',
    '6',
    'change-of-state',
  ),
  v(
    'vanheta',
    'стареть',
    [
      'vanhenen',
      'vanhenet',
      'vanhenee',
      'vanhenemme',
      'vanhenette',
      'vanhenevat',
    ],
    'vanhene',
    '6',
    'change-of-state',
  ),
  v(
    'valita',
    'выбирать',
    [
      'valitsen',
      'valitset',
      'valitsee',
      'valitsemme',
      'valitsette',
      'valitsevat',
    ],
    'valitse',
    '5',
    'decision',
  ),
  v(
    'avata',
    'открывать',
    ['avaan', 'avaat', 'avaa', 'avaamme', 'avaatte', 'avaavat'],
    'avaa',
    '4',
    'physical-action',
  ),
  v(
    'vastata',
    'отвечать',
    ['vastaan', 'vastaat', 'vastaa', 'vastaamme', 'vastaatte', 'vastaavat'],
    'vastaa',
    '4',
    'communication',
  ),
]

export const verbTypesFourSixContent = {
  version: 3,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'type-four',
      eyebrow: { ru: 'Тип 4' },
      title: { ru: 'Убери -t- и удлини гласную' },
      paragraphs: [
        {
          ru: 'У глаголов четвёртого типа окончания -ata/-ätä, -ota/-ötä и -uta/-ytä превращаются в основу на долгую гласную: haluta → halua-, pelata → pelaa-.',
        },
        {
          ru: 'После основы добавляется личное окончание. В третьем лице единственного числа дополнительного удлинения уже не происходит: hän haluaa.',
        },
      ],
      table: {
        headers: [
          { ru: 'Инфинитив' },
          { ru: 'Основа' },
          { ru: 'minä' },
          { ru: 'hän' },
        ],
        rows: [
          [
            { ru: 'haluta' },
            { ru: 'halua-' },
            { ru: 'haluan' },
            { ru: 'haluaa' },
          ],
          [
            { ru: 'pelata' },
            { ru: 'pelaa-' },
            { ru: 'pelaan' },
            { ru: 'pelaa' },
          ],
          [
            { ru: 'siivota' },
            { ru: 'siivoa-' },
            { ru: 'siivoan' },
            { ru: 'siivoaa' },
          ],
          [
            { ru: 'herätä' },
            { ru: 'herää-' },
            { ru: 'herään' },
            { ru: 'herää' },
          ],
        ],
      },
      examples: [
        { target: 'Minä haluan.', source: { ru: 'Я хочу.' } },
        { target: 'He pelaavat.', source: { ru: 'Они играют.' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Образуй minä от osata.' },
          answer: 'minä osaan',
          explanation: { ru: 'Основа osaa- получает окончание -n.' },
        },
      ],
    },
    {
      id: 'type-four-gradation',
      eyebrow: { ru: 'Чередование' },
      title: { ru: 'Tavata → tapaan, pakata → pakkaan' },
      paragraphs: [
        {
          ru: 'У части глаголов четвёртого типа при образовании сильной основы появляется сильная ступень: tavata → tapaa-, pakata → pakkaa-, levätä → lepää-.',
        },
        {
          ru: 'Эти пары нужно учить вместе. Одного удаления -t- недостаточно, если согласная основы чередуется.',
        },
      ],
      table: {
        headers: [{ ru: 'Изменение' }, { ru: 'Инфинитив' }, { ru: 'minä' }],
        rows: [
          [{ ru: 'v → p' }, { ru: 'tavata' }, { ru: 'tapaan' }],
          [{ ru: 'k → kk' }, { ru: 'pakata' }, { ru: 'pakkaan' }],
          [{ ru: 'v → p' }, { ru: 'levätä' }, { ru: 'lepään' }],
          [{ ru: '∅ → k' }, { ru: 'pelätä' }, { ru: 'pelkään' }],
        ],
      },
      examples: [
        { target: 'Me tapaamme.', source: { ru: 'Мы встречаем.' } },
        { target: 'Sinä pakkaat.', source: { ru: 'Ты упаковываешь.' } },
        { target: 'Hän pelkää.', source: { ru: 'Он или она боится.' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Исправь форму: minä tavan.' },
          answer: 'minä tapaan',
          explanation: { ru: 'У tavata сильная основа tapaa-.' },
        },
      ],
    },
    {
      id: 'type-five',
      eyebrow: { ru: 'Тип 5' },
      title: { ru: 'Добавь -itse-' },
      paragraphs: [
        {
          ru: 'У пятого типа перед личным окончанием появляется -itse-: tarvita → tarvitse-, valita → valitse-, häiritä → häiritse-.',
        },
        {
          ru: 'Третье лицо получает долгую -ee: tarvitsee, valitsee, häiritsee.',
        },
      ],
      table: {
        headers: [
          { ru: 'Инфинитив' },
          { ru: 'Основа' },
          { ru: 'minä' },
          { ru: 'hän' },
        ],
        rows: [
          [
            { ru: 'tarvita' },
            { ru: 'tarvitse-' },
            { ru: 'tarvitsen' },
            { ru: 'tarvitsee' },
          ],
          [
            { ru: 'valita' },
            { ru: 'valitse-' },
            { ru: 'valitsen' },
            { ru: 'valitsee' },
          ],
          [
            { ru: 'häiritä' },
            { ru: 'häiritse-' },
            { ru: 'häiritsen' },
            { ru: 'häiritsee' },
          ],
        ],
      },
      examples: [
        { target: 'Minä tarvitsen.', source: { ru: 'Мне нужно.' } },
        { target: 'Hän valitsee.', source: { ru: 'Он или она выбирает.' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Какая основа у tarvita?' },
          answer: 'tarvitse-',
          explanation: { ru: 'Тип 5 добавляет элемент -itse-.' },
        },
      ],
    },
    {
      id: 'type-six',
      eyebrow: { ru: 'Тип 6' },
      title: { ru: 'Основа на -ne-' },
      paragraphs: [
        {
          ru: 'У шестого типа -eta/-etä превращается в -ene-: vanheta → vanhene-, lämmetä → lämpene-, kylmetä → kylmene-.',
        },
        {
          ru: 'Эти глаголы часто обозначают постепенное изменение состояния: стареть, теплеть, холодать.',
        },
      ],
      table: {
        headers: [
          { ru: 'Инфинитив' },
          { ru: 'Основа' },
          { ru: 'minä' },
          { ru: 'hän' },
        ],
        rows: [
          [
            { ru: 'vanheta' },
            { ru: 'vanhene-' },
            { ru: 'vanhenen' },
            { ru: 'vanhenee' },
          ],
          [
            { ru: 'lämmetä' },
            { ru: 'lämpene-' },
            { ru: 'lämpenen' },
            { ru: 'lämpenee' },
          ],
          [
            { ru: 'kylmetä' },
            { ru: 'kylmene-' },
            { ru: 'kylmenen' },
            { ru: 'kylmenee' },
          ],
        ],
      },
      examples: [
        { target: 'Sää lämpenee.', source: { ru: 'Погода теплеет.' } },
        { target: 'Ihminen vanhenee.', source: { ru: 'Человек стареет.' } },
      ],
    },
    {
      id: 'spoken-four-six',
      eyebrow: { ru: 'Регистр' },
      title: { ru: 'Kirjakieli и puhekieli' },
      paragraphs: [
        {
          ru: 'В puhekieli личные местоимения сокращаются, а конечные звуки могут ослабляться: minä haluan → mä haluun, sinä tarvitset → sä tarviit.',
        },
        {
          ru: 'Для ответов используй kirjakieli: haluan, tarvitset, valitsee. Разговорные формы пока нужны для узнавания.',
        },
      ],
      examples: [
        {
          target: 'Mä haluun levätä.',
          source: { ru: 'Я хочу отдохнуть.' },
          note: { ru: 'Kirjakieli: Minä haluan levätä.' },
        },
        {
          target: 'Sä tarviit apua.',
          source: { ru: 'Тебе нужна помощь.' },
          note: { ru: 'Kirjakieli: Sinä tarvitset apua.' },
        },
      ],
    },
    {
      id: 'type-four-six-errors',
      eyebrow: { ru: 'Самопроверка' },
      title: { ru: 'Типичные ошибки' },
      paragraphs: [
        {
          ru: 'Не смешивай основы: у haluta правильно haluan, не halutan; у tarvita — tarvitsen, не tarvian; у vanheta — vanhenen, не vanhetan.',
        },
        {
          ru: 'Перед окончанием сначала построй основу соответствующего типа, затем проверь чередование и только после этого добавляй лицо.',
        },
      ],
      examples: [
        {
          target: 'Minä avaan.',
          source: { ru: 'Я открываю.' },
          note: { ru: 'Не: avatan.' },
        },
        {
          target: 'Hän tarvitsee.',
          source: { ru: 'Ему или ей нужно.' },
          note: { ru: 'Не: hän tarvitee — в основе пропущено s.' },
        },
        {
          target: 'Me vanhenemme.',
          source: { ru: 'Мы стареем.' },
          note: { ru: 'Основа vanhene- сохраняется перед -mme.' },
        },
      ],
      callout: {
        ru: 'Тип 4: -a/-ä после удаления t; тип 5: -itse-; тип 6: -ne-.',
      },
    },
  ],
} as const

export const verbTypesFourSixVocabulary = buildPresentVerbVocabulary({
  lessonPosition: 5,
  keyPrefix: 'verb-types-four-six',
  verbs,
})

export const verbTypesFourSixExercises = buildPresentVerbExercises({
  idPrefix: 'exercise.fi.verb-types.four-six',
  verbs,
  vocabulary: verbTypesFourSixVocabulary,
  skillIdFor: (item) =>
    item.verbType === '4'
      ? VERB_TYPE_FOUR_SKILL_ID
      : item.verbType === '5'
        ? VERB_TYPE_FIVE_SKILL_ID
        : VERB_TYPE_SIX_SKILL_ID,
})

export const verbTypesFourSixGoldenExerciseIds = [
  'exercise.fi.verb-types.four-six.first.001',
  'exercise.fi.verb-types.four-six.first.010',
  'exercise.fi.verb-types.four-six.second-now.001',
  'exercise.fi.verb-types.four-six.third.001',
  'exercise.fi.verb-types.four-six.first-plural-now.001',
  'exercise.fi.verb-types.four-six.third-plural-now.001',
] as const

function v(
  lemma: string,
  gloss: string,
  forms: CuratedPresentVerb['forms'],
  connegative: string,
  verbType: '4' | '5' | '6',
  semanticType: string,
): CuratedPresentVerb {
  return { lemma, gloss, forms, connegative, verbType, semanticType }
}
