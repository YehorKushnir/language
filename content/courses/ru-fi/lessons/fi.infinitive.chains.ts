import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './fi.olla.basics.js'

export const INFINITIVE_CHAINS_SKILL_ID = 'grammar.fi.infinitive.chains'
export const INFINITIVE_CHAINS_NEGATIVE_SKILL_ID =
  'grammar.fi.infinitive.chains.negative'
export const INFINITIVE_CHAINS_QUESTION_SKILL_ID =
  'grammar.fi.infinitive.chains.question'

export const infinitiveChainsSkills: CourseSkillSeed[] = [
  {
    id: INFINITIVE_CHAINS_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Цепочки с A-инфинитивом' },
    description: {
      ru: 'Личная форма модального глагола и неизменяемый A-инфинитив действия.',
    },
    prerequisiteSkillIds: ['grammar.fi.consonant-gradation'],
  },
  {
    id: INFINITIVE_CHAINS_NEGATIVE_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Отрицание в глагольной цепочке' },
    description: { ru: 'Отрицание первого глагола при неизменном инфинитиве.' },
    prerequisiteSkillIds: [INFINITIVE_CHAINS_SKILL_ID],
  },
  {
    id: INFINITIVE_CHAINS_QUESTION_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Вопрос о возможности и желании' },
    description: { ru: 'Вопросительная частица на первом глаголе цепочки.' },
    prerequisiteSkillIds: [INFINITIVE_CHAINS_SKILL_ID],
  },
]

export const infinitiveChainsContent: CourseLessonContentSeed = {
  version: 3,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'a-infinitive-role',
      title: { ru: 'Как устроена цепочка из двух глаголов' },
      paragraphs: [
        {
          ru: 'После haluta, voida и osata второе действие ставится в словарную форму — A-инфинитив. Лицо, число, отрицание и вопрос выражает первый глагол; второй называет само действие.',
        },
        {
          ru: 'В таблице меняется только левый глагол: haluan, voit, osaa. Правый глагол остаётся в форме lukea, tulla или laulaa.',
        },
      ],
      table: {
        headers: [
          { ru: 'Значение' },
          { ru: 'Первый глагол' },
          { ru: 'A-инфинитив' },
          { ru: 'Вместе' },
        ],
        rows: [
          [
            { ru: 'хотеть' },
            { ru: 'haluan' },
            { ru: 'lukea' },
            { ru: 'haluan lukea' },
          ],
          [
            { ru: 'мочь' },
            { ru: 'voit' },
            { ru: 'tulla' },
            { ru: 'voit tulla' },
          ],
          [
            { ru: 'уметь' },
            { ru: 'hän osaa' },
            { ru: 'laulaa' },
            { ru: 'hän osaa laulaa' },
          ],
        ],
      },
      examples: [
        { target: 'Haluan lukea.', source: { ru: 'Я хочу читать.' } },
        { target: 'Voimme tulla.', source: { ru: 'Мы можем прийти.' } },
        {
          target: 'Hän osaa laulaa.',
          source: { ru: 'Он или она умеет петь.' },
        },
      ],
    },
    {
      id: 'modal-table',
      title: { ru: 'Кто получает личное окончание' },
      paragraphs: [
        {
          ru: 'В цепочке спрягается левый глагол. У второго глагола нельзя добавлять личное окончание.',
        },
      ],
      table: {
        headers: [
          { ru: 'Лицо' },
          { ru: 'haluta' },
          { ru: 'voida' },
          { ru: 'osata' },
        ],
        rows: [
          [{ ru: 'minä' }, { ru: 'haluan' }, { ru: 'voin' }, { ru: 'osaan' }],
          [{ ru: 'sinä' }, { ru: 'haluat' }, { ru: 'voit' }, { ru: 'osaat' }],
          [{ ru: 'hän' }, { ru: 'haluaa' }, { ru: 'voi' }, { ru: 'osaa' }],
          [
            { ru: 'me' },
            { ru: 'haluamme' },
            { ru: 'voimme' },
            { ru: 'osaamme' },
          ],
        ],
      },
      examples: [
        { target: 'Osaan laulaa.', source: { ru: 'Я умею петь.' } },
        {
          target: 'Hän voi matkustaa.',
          source: { ru: 'Он может путешествовать.' },
        },
      ],
    },
    {
      id: 'chain-negation',
      title: { ru: 'Отрицается первый глагол' },
      paragraphs: [
        {
          ru: 'Отрицательный глагол согласуется с подлежащим, первый смысловой глагол принимает отрицательную форму, а A-инфинитив не меняется: en voi tulla.',
        },
      ],
      examples: [
        { target: 'En voi tulla.', source: { ru: 'Я не могу прийти.' } },
        {
          target: 'He eivät halua lähteä.',
          source: { ru: 'Они не хотят уходить.' },
        },
      ],
    },
    {
      id: 'chain-questions',
      title: { ru: 'Частица -ko/-kö ставится на первый глагол' },
      paragraphs: [
        {
          ru: 'В общем вопросе в начало переходит личная форма первого глагола с -ko/-kö. Инфинитив остаётся после подлежащего или сразу после вопросительной формы.',
        },
      ],
      examples: [
        {
          target: 'Haluatko sinä tanssia?',
          source: { ru: 'Ты хочешь танцевать?' },
        },
        { target: 'Voiko hän auttaa?', source: { ru: 'Он может помочь?' } },
      ],
    },
    {
      id: 'chain-semantics',
      title: { ru: 'Не каждый первый глагол допускает A-инфинитив' },
      paragraphs: [
        {
          ru: 'Модель нужно связывать с конкретным первым глаголом: haluta tehdä, voida tehdä, osata tehdä, yrittää tehdä. Нельзя автоматически ставить A-инфинитив после любого глагола только потому, что в русском рядом стоят два действия.',
        },
        {
          ru: 'Например, aloittaa в базовой модели соединяется с предметом: aloitan työn. Другие способы присоединить к нему действие будут изучаться позднее.',
        },
      ],
      examples: [
        { target: 'Yritän oppia.', source: { ru: 'Я пытаюсь научиться.' } },
        {
          target: 'Aloitan työn.',
          source: { ru: 'Я начинаю работу.' },
        },
      ],
    },
    {
      id: 'chain-register-errors',
      title: { ru: 'Типичные ошибки и puhekieli' },
      paragraphs: [
        {
          ru: 'Типичная ошибка — спрягать оба глагола: haluan luen. Правильно haluan lukea. Ещё одна ошибка — поставить частицу вопроса на инфинитив вместо первого глагола.',
        },
        {
          ru: 'В puhekieli местоимение и первый глагол часто сокращаются: mä voin tulla, sä haluut lähteä. A-инфинитив при этом сохраняет ту же функцию. В kirjakieli пиши minä voin и sinä haluat.',
        },
      ],
      examples: [
        {
          target: 'Mä voin tulla.',
          source: { ru: 'Я могу прийти.' },
        },
        {
          target: 'Sä haluut lähteä.',
          source: { ru: 'Ты хочешь уйти.' },
        },
      ],
      callout: {
        ru: 'В каждой цепочке найди единственный глагол, который несёт лицо.',
      },
    },
  ],
}

const verbs = [
  ['voida', 'мочь', 'voin'],
  ['tietää', 'знать', 'tiedän'],
  ['tuntea', 'знать человека', 'tunnen'],
  ['yrittää', 'пытаться', 'yritän'],
  ['alkaa', 'начинать', 'alan'],
  ['lopettaa', 'заканчивать', 'lopetan'],
  ['jatkaa', 'продолжать', 'jatkan'],
  ['ehtiä', 'успевать', 'ehdin'],
  ['pitää', 'держать', 'pidän'],
  ['sopia', 'подходить', 'sovin'],
  ['päättää', 'решать', 'päätän'],
  ['toivoa', 'желать', 'toivon'],
  ['suunnitella', 'планировать', 'suunnittelen'],
  ['matkustaa', 'путешествовать', 'matkustan'],
  ['lentää', 'летать', 'lennän'],
  ['ajaa', 'водить', 'ajan'],
  ['pyöräillä', 'ездить на велосипеде', 'pyöräilen'],
  ['tanssia', 'танцевать', 'tanssin'],
  ['laulaa', 'петь', 'laulan'],
  ['piirtää', 'рисовать', 'piirrän'],
  ['kokata', 'готовить', 'kokkaan'],
  ['leipoa', 'печь', 'leivon'],
  ['siirtyä', 'перемещаться', 'siirryn'],
  ['muuttua', 'изменяться', 'muutun'],
  ['seurata', 'следовать', 'seuraan'],
  ['onnistua', 'добиваться успеха', 'onnistun'],
] as const

const chainContexts: readonly {
  source: string
  target: string
  negativeTarget?: string
}[] = [
  { source: 'иметь возможность помочь', target: 'auttaa' },
  { source: 'знать ответ', target: 'vastauksen' },
  { source: 'знать тебя лучше', target: 'sinut paremmin' },
  { source: 'попытаться ещё раз', target: 'uudelleen' },
  { source: 'начать учиться', target: 'opiskella' },
  { source: 'закончить работу', target: 'työn' },
  { source: 'продолжить работу', target: 'työtä' },
  { source: 'успеть на автобус', target: 'bussiin' },
  { source: 'держать дверь открытой', target: 'oven auki' },
  { source: 'договориться о встрече', target: 'tapaamisen' },
  { source: 'решить этот вопрос', target: 'asian' },
  { source: 'пожелать тебе удачи', target: 'sinulle onnea' },
  { source: 'спланировать поездку', target: 'matkan' },
  { source: 'путешествовать самостоятельно', target: 'yksin' },
  { source: 'лететь в Хельсинки', target: 'Helsinkiin' },
  { source: 'водить машину', target: 'autoa' },
  { source: 'ездить на велосипеде на работу', target: 'töihin' },
  { source: 'хорошо танцевать', target: 'hyvin' },
  { source: 'петь песню', target: 'laulun', negativeTarget: 'laulua' },
  { source: 'нарисовать дом', target: 'talon', negativeTarget: 'taloa' },
  { source: 'готовить ужин', target: 'päivällistä' },
  { source: 'испечь торт', target: 'kakun' },
  { source: 'перейти в следующую комнату', target: 'seuraavaan huoneeseen' },
  { source: 'измениться к лучшему', target: 'paremmaksi' },
  { source: 'следить за новостями', target: 'uutisia' },
  { source: 'добиться успеха в этот раз', target: 'tällä kertaa' },
] as const

export const infinitiveChainsVocabulary: LessonVocabularySeed[] = verbs.map(
  ([lemma, gloss, firstPerson], index) => {
    const serial = `07.${String(index + 1).padStart(2, '0')}`
    const context = chainContexts[index]!
    return {
      key: `chain-${lemma}`,
      itemId: `word.fi.m1.${serial}`,
      conceptId: `concept.fi.m1.${serial}`,
      lexicalEntryId: `lex.fi.${lemma}`,
      lemma,
      partOfSpeech: 'verb',
      gloss,
      example: {
        target: `Haluan ${lemma} ${context.target}.`,
        source: { ru: `Я хочу ${context.source}.` },
      },
      semanticTypes: ['action', 'a-infinitive', 'chain-compatible'],
      singular: firstPerson,
      plural: lemma,
      sourceSingular: `я: ${gloss}`,
      sourcePlural: gloss,
      forms: [
        lexicalForm(serial, 'infinitive', lemma, { form: 'infinitive' }),
        lexicalForm(serial, 'present-1sg', firstPerson, {
          mood: 'indicative',
          tense: 'present',
          person: 'first',
          number: 'singular',
        }),
      ],
    }
  },
)

interface ChainFrame {
  key: string
  prompt: string
  modal: string
  subject: string
  prefix?: string
}

const frames: readonly ChainFrame[] = [
  { key: 'haluan', prompt: 'Я хочу', modal: 'haluan', subject: 'minä' },
  {
    key: 'voin',
    prompt: 'Я могу',
    modal: 'voin',
    subject: 'minä',
    prefix: 'Nyt',
  },
  {
    key: 'osaan',
    prompt: 'Я умею',
    modal: 'osaan',
    subject: 'minä',
  },
]

export const infinitiveChainsExercises: PreparedExerciseSeed[] = [
  ...group('word', 0, 26, (index) => affirmative(index, 0)),
  ...group('context', 26, 10, (index) => affirmative(index + 4, 1)),
  ...group('context', 36, 8, (index) =>
    affirmative([13, 15, 16, 17, 18, 19, 20, 21][index]!, 2),
  ),
  ...group('context', 44, 8, (index) => negative(index + 13)),
  ...group('pair', 52, 8, (index) => question(index + 18)),
]

export const infinitiveChainsGoldenExerciseIds = [
  'exercise.fi.infinitive.chains.word.1',
  'exercise.fi.infinitive.chains.word.2',
  'exercise.fi.infinitive.chains.context.11',
  'exercise.fi.infinitive.chains.context.19',
  'exercise.fi.infinitive.chains.pair.1',
] as const

function affirmative(vocabularyIndex: number, frameIndex: number) {
  const vocabulary = infinitiveChainsVocabulary[vocabularyIndex % verbs.length]!
  const context = chainContexts[vocabularyIndex % verbs.length]!
  const frame = frames[frameIndex]!
  const targetText = [
    frame.prefix,
    frame.prefix ? 'minä' : 'Minä',
    frame.modal,
    vocabulary.lemma,
    context.target,
  ]
    .filter(Boolean)
    .join(' ')
    .concat('.')
  const withoutSubject = [
    frame.prefix,
    capitalize(frame.modal),
    vocabulary.lemma,
    context.target,
  ]
    .filter(Boolean)
    .join(' ')
    .concat('.')
  return exercise(vocabulary, {
    prompt: `${frame.prefix ? 'Сейчас я могу' : frame.prompt} ${context.source}.`,
    targetText,
    acceptedVariants: [targetText, withoutSubject],
    slots: [
      ...(frame.prefix ? [grammarSlot('adverb', ['nyt'])] : []),
      grammarSlot('subject', [frame.subject], true),
      grammarSlot('modalVerb', [frame.modal]),
      vocabularySlot('infinitive', vocabulary.lemma, vocabulary.itemId),
      ...contextSlots(context.target),
    ],
  })
}

function negative(vocabularyIndex: number) {
  const vocabulary = infinitiveChainsVocabulary[vocabularyIndex % verbs.length]!
  const context = chainContexts[vocabularyIndex % verbs.length]!
  const negativeTarget = context.negativeTarget ?? context.target
  const targetText = `Minä en voi ${vocabulary.lemma} ${negativeTarget}.`
  return exercise(vocabulary, {
    prompt: `Я не могу ${context.source}.`,
    targetText,
    acceptedVariants: [
      targetText,
      `En voi ${vocabulary.lemma} ${negativeTarget}.`,
    ],
    slots: [
      grammarSlot(
        'subject',
        ['minä'],
        true,
        INFINITIVE_CHAINS_NEGATIVE_SKILL_ID,
      ),
      grammarSlot(
        'negativeVerb',
        ['en'],
        false,
        INFINITIVE_CHAINS_NEGATIVE_SKILL_ID,
      ),
      grammarSlot(
        'modalVerb',
        ['voi'],
        false,
        INFINITIVE_CHAINS_NEGATIVE_SKILL_ID,
      ),
      vocabularySlot('infinitive', vocabulary.lemma, vocabulary.itemId),
      ...contextSlots(negativeTarget, INFINITIVE_CHAINS_NEGATIVE_SKILL_ID),
    ],
    secondaryItemIds: [INFINITIVE_CHAINS_NEGATIVE_SKILL_ID],
  })
}

function question(vocabularyIndex: number) {
  const vocabulary = infinitiveChainsVocabulary[vocabularyIndex % verbs.length]!
  const context = chainContexts[vocabularyIndex % verbs.length]!
  const targetText = `Haluatko sinä ${vocabulary.lemma} ${context.target}?`
  return exercise(vocabulary, {
    prompt: `Ты хочешь ${context.source}?`,
    targetText,
    acceptedVariants: [
      targetText,
      `Haluatko ${vocabulary.lemma} ${context.target}?`,
    ],
    slots: [
      grammarSlot(
        'questionVerb',
        ['haluatko'],
        false,
        INFINITIVE_CHAINS_QUESTION_SKILL_ID,
      ),
      grammarSlot(
        'subject',
        ['sinä'],
        true,
        INFINITIVE_CHAINS_QUESTION_SKILL_ID,
      ),
      vocabularySlot('infinitive', vocabulary.lemma, vocabulary.itemId),
      ...contextSlots(context.target, INFINITIVE_CHAINS_QUESTION_SKILL_ID),
    ],
    secondaryItemIds: [INFINITIVE_CHAINS_QUESTION_SKILL_ID],
  })
}

function contextSlots(value: string, secondarySkillId?: string) {
  return value
    .split(' ')
    .map((token, index) =>
      grammarSlot(`context${index + 1}`, [token], false, secondarySkillId),
    )
}

function exercise(
  vocabulary: LessonVocabularySeed,
  input: {
    prompt: string
    targetText: string
    acceptedVariants: string[]
    slots: PreparedExerciseSeed['slots']
    secondaryItemIds?: string[]
  },
): Omit<PreparedExerciseSeed, 'id' | 'selectionOrder'> {
  return {
    ...input,
    primaryItemId: INFINITIVE_CHAINS_SKILL_ID,
    secondaryItemIds: input.secondaryItemIds ?? [],
    vocabularyItemId: vocabulary.itemId,
  }
}

function grammarSlot(
  role: string,
  accepted: string[],
  optional = false,
  secondarySkillId?: string,
) {
  return {
    role,
    accepted,
    itemIds: [
      INFINITIVE_CHAINS_SKILL_ID,
      ...(secondarySkillId ? [secondarySkillId] : []),
    ],
    ...(optional ? { optional: true } : {}),
  }
}

function vocabularySlot(role: string, accepted: string, itemId: string) {
  return { role, accepted: [accepted], itemIds: [itemId] }
}

function group(
  category: 'word' | 'context' | 'pair',
  start: number,
  count: number,
  create: (
    index: number,
  ) => Omit<PreparedExerciseSeed, 'id' | 'selectionOrder'>,
) {
  const categoryOffset =
    category === 'word' ? 0 : category === 'context' ? 26 : 52
  return Array.from({ length: count }, (_, offset) => ({
    id: `exercise.fi.infinitive.chains.${category}.${start + offset - categoryOffset + 1}`,
    selectionOrder: start + offset + 1,
    ...create(offset),
  }))
}

function lexicalForm(
  serial: string,
  key: string,
  surface: string,
  features: Record<string, string>,
) {
  return { id: `form.fi.m1.${serial}.${key}`, surface, features }
}

function capitalize(value: string) {
  return `${value.charAt(0).toLocaleUpperCase('fi')}${value.slice(1)}`
}
