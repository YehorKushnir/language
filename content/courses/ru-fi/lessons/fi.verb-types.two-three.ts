import {
  buildPresentVerbExercises,
  buildPresentVerbVocabulary,
  type CuratedPresentVerb,
} from './present-verb-builder.js'

export const VERB_TYPE_TWO_SKILL_ID = 'grammar.fi.verb-type.2'
export const VERB_TYPE_THREE_SKILL_ID = 'grammar.fi.verb-type.3'

const verbs: CuratedPresentVerb[] = [
  v(
    'saada',
    'получать',
    ['saan', 'saat', 'saa', 'saamme', 'saatte', 'saavat'],
    'saa',
    '2',
    'transfer',
  ),
  v(
    'syödä',
    'есть',
    ['syön', 'syöt', 'syö', 'syömme', 'syötte', 'syövät'],
    'syö',
    '2',
    'consumption',
  ),
  v(
    'juoda',
    'пить',
    ['juon', 'juot', 'juo', 'juomme', 'juotte', 'juovat'],
    'juo',
    '2',
    'consumption',
  ),
  v(
    'uida',
    'плавать',
    ['uin', 'uit', 'ui', 'uimme', 'uitte', 'uivat'],
    'ui',
    '2',
    'motion',
  ),
  v(
    'tupakoida',
    'курить',
    [
      'tupakoin',
      'tupakoit',
      'tupakoi',
      'tupakoimme',
      'tupakoitte',
      'tupakoivat',
    ],
    'tupakoi',
    '2',
    'habit',
  ),
  v(
    'imuroida',
    'пылесосить',
    ['imuroin', 'imuroit', 'imuroi', 'imuroimme', 'imuroitte', 'imuroivat'],
    'imuroi',
    '2',
    'household',
  ),
  v(
    'pysäköidä',
    'парковать',
    [
      'pysäköin',
      'pysäköit',
      'pysäköi',
      'pysäköimme',
      'pysäköitte',
      'pysäköivät',
    ],
    'pysäköi',
    '2',
    'motion',
  ),
  v(
    'viedä',
    'относить',
    ['vien', 'viet', 'vie', 'viemme', 'viette', 'vievät'],
    'vie',
    '2',
    'transfer',
  ),
  v(
    'tuoda',
    'приносить',
    ['tuon', 'tuot', 'tuo', 'tuomme', 'tuotte', 'tuovat'],
    'tuo',
    '2',
    'transfer',
  ),
  v(
    'myydä',
    'продавать',
    ['myyn', 'myyt', 'myy', 'myymme', 'myytte', 'myyvät'],
    'myy',
    '2',
    'commerce',
  ),
  v(
    'tehdä',
    'делать',
    ['teen', 'teet', 'tekee', 'teemme', 'teette', 'tekevät'],
    'tee',
    '2',
    'creation',
  ),
  v(
    'nähdä',
    'видеть',
    ['näen', 'näet', 'näkee', 'näemme', 'näette', 'näkevät'],
    'näe',
    '2',
    'perception',
  ),
  v(
    'käydä',
    'посещать',
    ['käyn', 'käyt', 'käy', 'käymme', 'käytte', 'käyvät'],
    'käy',
    '2',
    'motion',
  ),
  v(
    'pestä',
    'мыть',
    ['pesen', 'peset', 'pesee', 'pesemme', 'pesette', 'pesevät'],
    'pese',
    '3',
    'household',
  ),
  v(
    'nousta',
    'вставать',
    ['nousen', 'nouset', 'nousee', 'nousemme', 'nousette', 'nousevat'],
    'nouse',
    '3',
    'motion',
  ),
  v(
    'purra',
    'кусать',
    ['puren', 'puret', 'puree', 'puremme', 'purette', 'purevat'],
    'pure',
    '3',
    'physical-action',
  ),
  v(
    'kuunnella',
    'слушать',
    [
      'kuuntelen',
      'kuuntelet',
      'kuuntelee',
      'kuuntelemme',
      'kuuntelette',
      'kuuntelevat',
    ],
    'kuuntele',
    '3',
    'perception',
  ),
  v(
    'mennä',
    'идти',
    ['menen', 'menet', 'menee', 'menemme', 'menette', 'menevät'],
    'mene',
    '3',
    'motion',
  ),
  v(
    'tulla',
    'приходить',
    ['tulen', 'tulet', 'tulee', 'tulemme', 'tulette', 'tulevat'],
    'tule',
    '3',
    'motion',
  ),
  v(
    'kuolla',
    'умирать',
    ['kuolen', 'kuolet', 'kuolee', 'kuolemme', 'kuolette', 'kuolevat'],
    'kuole',
    '3',
    'change-of-state',
  ),
  v(
    'panna',
    'класть',
    ['panen', 'panet', 'panee', 'panemme', 'panette', 'panevat'],
    'pane',
    '3',
    'placement',
  ),
  v(
    'juosta',
    'бежать',
    ['juoksen', 'juokset', 'juoksee', 'juoksemme', 'juoksette', 'juoksevat'],
    'juokse',
    '3',
    'motion',
  ),
  v(
    'ajatella',
    'думать',
    [
      'ajattelen',
      'ajattelet',
      'ajattelee',
      'ajattelemme',
      'ajattelette',
      'ajattelevat',
    ],
    'ajattele',
    '3',
    'cognition',
  ),
  v(
    'opiskella',
    'учиться',
    [
      'opiskelen',
      'opiskelet',
      'opiskelee',
      'opiskelemme',
      'opiskelette',
      'opiskelevat',
    ],
    'opiskele',
    '3',
    'learning',
  ),
  v(
    'harjoitella',
    'тренироваться',
    [
      'harjoittelen',
      'harjoittelet',
      'harjoittelee',
      'harjoittelemme',
      'harjoittelette',
      'harjoittelevat',
    ],
    'harjoittele',
    '3',
    'learning',
  ),
  v(
    'työskennellä',
    'работать',
    [
      'työskentelen',
      'työskentelet',
      'työskentelee',
      'työskentelemme',
      'työskentelette',
      'työskentelevät',
    ],
    'työskentele',
    '3',
    'work',
  ),
]

export const verbTypesTwoThreeContent = {
  version: 3,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'type-two',
      eyebrow: { ru: 'Тип 2' },
      title: { ru: 'Убери -da/-dä' },
      paragraphs: [
        {
          ru: 'У глаголов второго типа словарная форма заканчивается на -da/-dä. Убери это окончание и добавь личное: juoda → juo- → juon.',
        },
        {
          ru: 'В третьем лице единственного числа основа остаётся без дополнительного удлинения, если гласная уже долгая или является дифтонгом: hän saa, hän syö.',
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
          [{ ru: 'saada' }, { ru: 'saa-' }, { ru: 'saan' }, { ru: 'saa' }],
          [{ ru: 'syödä' }, { ru: 'syö-' }, { ru: 'syön' }, { ru: 'syö' }],
          [{ ru: 'juoda' }, { ru: 'juo-' }, { ru: 'juon' }, { ru: 'juo' }],
          [{ ru: 'myydä' }, { ru: 'myy-' }, { ru: 'myyn' }, { ru: 'myy' }],
        ],
      },
      examples: [
        { target: 'Minä juon.', source: { ru: 'Я пью.' } },
        { target: 'He uivat.', source: { ru: 'Они плавают.' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Образуй minä от syödä.' },
          answer: 'minä syön',
          explanation: { ru: 'Убери -dä и добавь -n к основе syö-.' },
        },
      ],
    },
    {
      id: 'type-two-irregular',
      eyebrow: { ru: 'Частотные формы' },
      title: { ru: 'Tehdä и nähdä нужно выучить отдельно' },
      paragraphs: [
        {
          ru: 'Tehdä и nähdä относятся ко второму типу, но их основа меняется: teen/tekee и näen/näkee.',
        },
        {
          ru: 'Эти глаголы очень частотны, поэтому запоминай сразу пары minä + hän, а не пытайся каждый раз восстановить их механически.',
        },
      ],
      table: {
        headers: [
          { ru: 'Глагол' },
          { ru: 'minä' },
          { ru: 'hän' },
          { ru: 'he' },
        ],
        rows: [
          [{ ru: 'tehdä' }, { ru: 'teen' }, { ru: 'tekee' }, { ru: 'tekevät' }],
          [{ ru: 'nähdä' }, { ru: 'näen' }, { ru: 'näkee' }, { ru: 'näkevät' }],
        ],
      },
      examples: [
        { target: 'Me teemme.', source: { ru: 'Мы делаем.' } },
        { target: 'Hän näkee.', source: { ru: 'Он или она видит.' } },
      ],
    },
    {
      id: 'type-three',
      eyebrow: { ru: 'Тип 3' },
      title: { ru: 'Замени окончание на -e-' },
      paragraphs: [
        {
          ru: 'У третьего типа окончания -la/-lä, -na/-nä, -ra/-rä и -sta/-stä заменяются на -e-. После этого добавляется личное окончание: tulla → tule- → tulen.',
        },
        {
          ru: 'В третьем лице единственного числа -e- удваивается: tulee, menee, pesee.',
        },
      ],
      table: {
        headers: [
          { ru: 'Конец инфинитива' },
          { ru: 'Пример' },
          { ru: 'Основа' },
          { ru: 'minä' },
        ],
        rows: [
          [{ ru: '-lla' }, { ru: 'tulla' }, { ru: 'tule-' }, { ru: 'tulen' }],
          [{ ru: '-nnä' }, { ru: 'mennä' }, { ru: 'mene-' }, { ru: 'menen' }],
          [{ ru: '-rrä' }, { ru: 'purra' }, { ru: 'pure-' }, { ru: 'puren' }],
          [{ ru: '-stä' }, { ru: 'pestä' }, { ru: 'pese-' }, { ru: 'pesen' }],
        ],
      },
      examples: [
        { target: 'Sinä tulet.', source: { ru: 'Ты приходишь.' } },
        { target: 'Hän pesee.', source: { ru: 'Он или она моет.' } },
        { target: 'Me menemme.', source: { ru: 'Мы идём.' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Какая основа у tulla?' },
          answer: 'tule-',
          explanation: { ru: '-lla заменяется на -le-.' },
        },
      ],
    },
    {
      id: 'long-type-three',
      eyebrow: { ru: 'Длинные основы' },
      title: { ru: 'Kuunnella и opiskella следуют тому же правилу' },
      paragraphs: [
        {
          ru: 'Длина слова не меняет модель: kuunnella → kuuntele-, opiskella → opiskele-, työskennellä → työskentele-.',
        },
        {
          ru: 'В некоторых словах вместе с заменой окончания видно чередование согласных. Форму основы лучше хранить рядом с инфинитивом.',
        },
      ],
      examples: [
        { target: 'Minä kuuntelen.', source: { ru: 'Я слушаю.' } },
        { target: 'Te opiskelette.', source: { ru: 'Вы учитесь.' } },
        { target: 'He työskentelevät.', source: { ru: 'Они работают.' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Образуй hän от opiskella.' },
          answer: 'hän opiskelee',
          explanation: {
            ru: 'Основа opiskele- получает долгую -ee в третьем лице.',
          },
        },
      ],
    },
    {
      id: 'spoken-types-two-three',
      eyebrow: { ru: 'Регистр' },
      title: { ru: 'Kirjakieli и puhekieli' },
      paragraphs: [
        {
          ru: 'В puhekieli местоимения сокращаются, а некоторые звуки ослабляются, но основа глагола остаётся узнаваемой: minä menen → mä meen, minä tulen → mä tuun.',
        },
        {
          ru: 'Практика требует kirjakieli: menen, tulen, teen. Разговорные варианты пока тренируются только на узнавание.',
        },
      ],
      examples: [
        {
          target: 'Mä meen kotiin.',
          source: { ru: 'Я иду домой.' },
          note: { ru: 'Kirjakieli: Minä menen kotiin.' },
        },
        {
          target: 'Mä tuun nyt.',
          source: { ru: 'Я сейчас приду.' },
          note: { ru: 'Kirjakieli: Minä tulen nyt.' },
        },
      ],
    },
    {
      id: 'type-two-three-errors',
      eyebrow: { ru: 'Самопроверка' },
      title: { ru: 'Типичные ошибки' },
      paragraphs: [
        {
          ru: 'Не применяй правило третьего типа к -da/-dä: juoda даёт juon, а не juoden. И наоборот, у tulla нельзя просто убрать -a: нужна основа tule-.',
        },
        {
          ru: 'Проверяй отдельно tehdä и nähdä. Формы *tehän и *nähän являются ошибками; правильно teen и näen.',
        },
      ],
      examples: [
        {
          target: 'Hän juo.',
          source: { ru: 'Он или она пьёт.' },
          note: { ru: 'Не: juoo.' },
        },
        {
          target: 'Minä tulen.',
          source: { ru: 'Я прихожу.' },
          note: { ru: 'Не: tullan.' },
        },
        {
          target: 'Hän tekee.',
          source: { ru: 'Он или она делает.' },
          note: { ru: 'Не: tehdä + окончание.' },
        },
      ],
      callout: {
        ru: 'Сначала определи окончание инфинитива: -da/-dä означает тип 2; -la/-lä, -na/-nä, -ra/-rä, -sta/-stä — тип 3.',
      },
    },
  ],
} as const

export const verbTypesTwoThreeVocabulary = buildPresentVerbVocabulary({
  lessonPosition: 4,
  keyPrefix: 'verb-types-two-three',
  verbs,
})

export const verbTypesTwoThreeExercises = buildPresentVerbExercises({
  idPrefix: 'exercise.fi.verb-types.two-three',
  verbs,
  vocabulary: verbTypesTwoThreeVocabulary,
  skillIdFor: (item) =>
    item.verbType === '2' ? VERB_TYPE_TWO_SKILL_ID : VERB_TYPE_THREE_SKILL_ID,
})

export const verbTypesTwoThreeGoldenExerciseIds = [
  'exercise.fi.verb-types.two-three.first.001',
  'exercise.fi.verb-types.two-three.first.011',
  'exercise.fi.verb-types.two-three.second-now.001',
  'exercise.fi.verb-types.two-three.third.001',
  'exercise.fi.verb-types.two-three.first-plural-now.001',
  'exercise.fi.verb-types.two-three.third-plural-now.001',
] as const

function v(
  lemma: string,
  gloss: string,
  forms: CuratedPresentVerb['forms'],
  connegative: string,
  verbType: '2' | '3',
  semanticType: string,
): CuratedPresentVerb {
  return { lemma, gloss, forms, connegative, verbType, semanticType }
}
