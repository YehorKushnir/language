import {
  buildPresentVerbExercises,
  buildPresentVerbVocabulary,
  type CuratedPresentVerb,
} from './present-verb-builder.js'

export const VERB_TYPE_TWO_SKILL_ID = 'grammar.fi.verb-type.2'
export const VERB_TYPE_THREE_SKILL_ID = 'grammar.fi.verb-type.3'
export const VERB_TYPES_TWO_THREE_SKILL_ID = 'grammar.fi.verb-types.two-three'

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
  version: 4,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'types-two-three-overview',
      title: { ru: 'Глаголы второго и третьего типов' },
      paragraphs: [
        {
          ru: 'Тип глагола определяется концом словарной формы. У второго типа убирается -da/-dä. У третьего типа окончания -la/-lä, -na/-nä, -ra/-rä и -sta/-stä заменяются основой на -e-.',
        },
        {
          ru: 'После построения основы добавляются уже знакомые личные окончания. Поэтому главное новое действие урока — сначала правильно распознать тип и получить основу.',
        },
      ],
      table: {
        headers: [
          { ru: 'Тип' },
          { ru: 'Конец' },
          { ru: 'Основа' },
          { ru: 'Пример' },
        ],
        rows: [
          [
            { ru: '2' },
            { ru: '-da/-dä' },
            { ru: 'убрать -da/-dä' },
            { ru: 'juoda → juon' },
          ],
          [
            { ru: '3' },
            { ru: '-la/-lä' },
            { ru: '-le-' },
            { ru: 'tulla → tulen' },
          ],
          [
            { ru: '3' },
            { ru: '-na/-nä' },
            { ru: '-ne-' },
            { ru: 'mennä → menen' },
          ],
          [
            { ru: '3' },
            { ru: '-ra/-rä' },
            { ru: '-re-' },
            { ru: 'purra → puren' },
          ],
          [
            { ru: '3' },
            { ru: '-sta/-stä' },
            { ru: '-se-' },
            { ru: 'pestä → pesen' },
          ],
        ],
      },
      examples: [
        { target: 'Minä juon.', source: { ru: 'Я пью.' } },
        { target: 'Sinä tulet.', source: { ru: 'Ты приходишь.' } },
        { target: 'Hän menee.', source: { ru: 'Он или она идёт.' } },
      ],
    },
    {
      id: 'type-two',
      title: { ru: 'Как спрягается второй тип' },
      paragraphs: [
        {
          ru: 'У обычного глагола второго типа убери -da/-dä и добавь личное окончание: juoda → juo- → juon. В третьем лице основа с долгой гласной или дифтонгом дополнительно не удлиняется: hän saa, hän syö.',
        },
        {
          ru: 'Tehdä и nähdä относятся к тому же типу, но меняют основу. Эти частые исключения запоминай сразу парами minä + hän: teen/tekee и näen/näkee.',
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
          [{ ru: 'juoda' }, { ru: 'juon' }, { ru: 'juo' }, { ru: 'juovat' }],
          [{ ru: 'syödä' }, { ru: 'syön' }, { ru: 'syö' }, { ru: 'syövät' }],
          [{ ru: 'tehdä' }, { ru: 'teen' }, { ru: 'tekee' }, { ru: 'tekevät' }],
          [{ ru: 'nähdä' }, { ru: 'näen' }, { ru: 'näkee' }, { ru: 'näkevät' }],
        ],
      },
      examples: [
        { target: 'Me juomme.', source: { ru: 'Мы пьём.' } },
        { target: 'Te syötte.', source: { ru: 'Вы едите.' } },
        { target: 'Me teemme.', source: { ru: 'Мы делаем.' } },
        { target: 'Hän näkee.', source: { ru: 'Он или она видит.' } },
      ],
    },
    {
      id: 'type-three',
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
    },
    {
      id: 'long-type-three',
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
    },
    {
      id: 'spoken-types-two-three',
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
        },
        {
          target: 'Mä tuun nyt.',
          source: { ru: 'Я сейчас приду.' },
        },
      ],
    },
    {
      id: 'type-two-three-errors',
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
        },
        {
          target: 'Minä tulen.',
          source: { ru: 'Я прихожу.' },
        },
        {
          target: 'Hän tekee.',
          source: { ru: 'Он или она делает.' },
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
  umbrellaSkillId: VERB_TYPES_TWO_THREE_SKILL_ID,
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
