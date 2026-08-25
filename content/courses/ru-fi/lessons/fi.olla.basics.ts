import {
  finnishLearnerDictionaryConceptId,
  finnishLearnerDictionaryItemId,
  finnishLearnerDictionaryLexicalEntryId,
  getFinnishLearnerDictionaryEntry,
} from '../../../../packages/language-fi/src/learner-dictionary.js'
import { sequenceExercisesByConstruction } from './exercise-sequencing.js'

export interface LessonVocabularyFormSeed {
  id: string
  surface: string
  features: Record<string, string>
}

export interface LessonVocabularySeed {
  key: string
  itemId: string
  conceptId: string
  lexicalEntryId: string
  lemma: string
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun'
  gloss: string
  example: {
    target: string
    source: { ru: string }
  }
  semanticTypes: string[]
  singular: string
  plural: string
  sourceSingular: string
  sourcePlural: string
  forms: LessonVocabularyFormSeed[]
}

interface ExerciseSlotSeed {
  role: string
  accepted: string[]
  itemIds: string[]
  optional?: boolean
}

export interface PreparedExerciseSeed {
  id: string
  selectionOrder: number
  prompt: string
  targetText: string
  acceptedVariants: string[]
  slots: ExerciseSlotSeed[]
  primaryItemId: string
  secondaryItemIds: string[]
  vocabularyItemId: string
}

export const lessonContent = {
  version: 3,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'pronouns-and-olla',
      title: { ru: 'Личные местоимения и формы olla' },
      paragraphs: [
        {
          ru: 'Minä означает «я», а olen — форма глагола olla для minä. Поэтому Minä olen opiskelija значит «Я студент».',
        },
        {
          ru: 'Olla означает «быть». Его форма меняется вместе с лицом: minä olen, sinä olet, hän on и так далее. Таблица выше показывает всю систему настоящего времени.',
        },
        {
          ru: 'Hän означает и «он», и «она»: род становится понятен из контекста. He означает «они».',
        },
        {
          ru: 'В первом и втором лице форма глагола уже указывает на действующее лицо, поэтому местоимение часто опускают: Olen täällä значит «Я здесь», а Olemme täällä — «Мы здесь».',
        },
      ],
      table: {
        headers: [
          { ru: 'Кто?' },
          { ru: 'Местоимение' },
          { ru: 'Olla' },
          { ru: 'Вместе' },
        ],
        rows: [
          [{ ru: 'я' }, { ru: 'minä' }, { ru: 'olen' }, { ru: 'minä olen' }],
          [{ ru: 'ты' }, { ru: 'sinä' }, { ru: 'olet' }, { ru: 'sinä olet' }],
          [{ ru: 'он / она' }, { ru: 'hän' }, { ru: 'on' }, { ru: 'hän on' }],
          [{ ru: 'мы' }, { ru: 'me' }, { ru: 'olemme' }, { ru: 'me olemme' }],
          [{ ru: 'вы' }, { ru: 'te' }, { ru: 'olette' }, { ru: 'te olette' }],
          [{ ru: 'они' }, { ru: 'he' }, { ru: 'ovat' }, { ru: 'he ovat' }],
        ],
      },
      examples: [
        { target: 'Minä olen opiskelija.', source: { ru: 'Я студент.' } },
        { target: 'Sinä olet lääkäri.', source: { ru: 'Ты врач.' } },
        {
          target: 'Hän on opettaja.',
          source: { ru: 'Он или она — преподаватель.' },
        },
        {
          target: 'Olemme täällä.',
          source: { ru: 'Мы здесь.' },
        },
      ],
      callout: {
        ru: 'Не используй одну форму olla со всеми местоимениями. Сравни: minä olen, hän on, he ovat.',
      },
    },
    {
      id: 'predicative-complements',
      title: { ru: 'Что ставить после olla' },
      paragraphs: [
        {
          ru: 'После olla можно назвать профессию, национальность, состояние или место. В базовых фразах с одним человеком профессия и признак стоят в словарной форме.',
        },
        {
          ru: 'В этом уроке профессии и признаки активно отрабатываются только с одним человеком. С me, te и he пока используй неизменяемые слова места: täällä «здесь» и kotona «дома».',
        },
      ],
      examples: [
        { target: 'Hän on suomalainen.', source: { ru: 'Он — финн.' } },
        { target: 'Me olemme täällä.', source: { ru: 'Мы здесь.' } },
        { target: 'He ovat kotona.', source: { ru: 'Они дома.' } },
      ],
      callout: {
        ru: 'Формы профессий и признаков для нескольких людей появятся позже. Сейчас не нужно их угадывать.',
      },
    },
    {
      id: 'olla-negative',
      title: { ru: 'Как построить отрицание' },
      paragraphs: [
        {
          ru: 'В отрицании по лицу изменяется отрицательный глагол ei, а olla всегда принимает форму ole.',
        },
        {
          ru: 'Не говори en olen или hän ei on: личное окончание уже находится в en, et, ei, emme, ette или eivät.',
        },
      ],
      table: {
        headers: [{ ru: 'Лицо' }, { ru: 'Отрицание' }],
        rows: [
          [{ ru: 'minä' }, { ru: 'en ole' }],
          [{ ru: 'sinä' }, { ru: 'et ole' }],
          [{ ru: 'hän' }, { ru: 'ei ole' }],
          [{ ru: 'me' }, { ru: 'emme ole' }],
          [{ ru: 'te' }, { ru: 'ette ole' }],
          [{ ru: 'he' }, { ru: 'eivät ole' }],
        ],
      },
      examples: [
        {
          target: 'Hän ei ole opiskelija.',
          source: { ru: 'Он или она не студент.' },
        },
        { target: 'En ole väsynyt.', source: { ru: 'Я не устал.' } },
        { target: 'He eivät ole kotona.', source: { ru: 'Они не дома.' } },
      ],
    },
    {
      id: 'olla-questions',
      title: { ru: 'Общие вопросы с -ko/-kö' },
      paragraphs: [
        {
          ru: 'Общий вопрос образуется частицей -ko/-kö, которая присоединяется к личной форме olla. Глагол перемещается в начало.',
        },
        {
          ru: 'Выбор ko или kö подчиняется гармонии гласных. У olla во всех формах этого урока используется -ko.',
        },
      ],
      examples: [
        {
          target: 'Oletko sinä opiskelija?',
          source: { ru: 'Ты студент?' },
        },
        { target: 'Onko hän lääkäri?', source: { ru: 'Он врач?' } },
        { target: 'Ovatko he täällä?', source: { ru: 'Они здесь?' } },
      ],
    },
    {
      id: 'spoken-olla-and-errors',
      title: { ru: 'Разговорные формы и типичные ошибки' },
      paragraphs: [
        {
          ru: 'В разговорном финском minä olen и sinä olet часто звучат как mä oon и sä oot. Hän и he нередко заменяются на se и ne.',
        },
        {
          ru: 'В нейтральном письме используй полные формы. Следи за тремя вещами: согласованием olla, формой ole после отрицания и глаголом с -ko в начале вопроса.',
        },
      ],
      examples: [
        {
          target: 'Mä oon täällä.',
          source: { ru: 'Я здесь.' },
        },
        {
          target: 'Sä oot kotona.',
          source: { ru: 'Ты дома.' },
        },
        {
          target: 'Se on väsynyt.',
          source: { ru: 'Он или она устал(а).' },
        },
        {
          target: 'Ne on täällä.',
          source: { ru: 'Они здесь.' },
        },
      ],
      callout: {
        ru: 'Не смешивай стили внутри одной фразы: для начала выбирай либо нейтральное minä olen, либо разговорное mä oon.',
      },
    },
  ],
} as const

export const lessonVocabulary: LessonVocabularySeed[] = [
  createPersonalPronounVocabulary({
    key: 'pronoun-mina',
    lemma: 'minä',
    example: { target: 'Minä olen opiskelija.', source: 'Я студент.' },
  }),
  createPersonalPronounVocabulary({
    key: 'pronoun-sina',
    lemma: 'sinä',
    example: { target: 'Sinä olet lääkäri.', source: 'Ты врач.' },
  }),
  createPersonalPronounVocabulary({
    key: 'pronoun-han',
    lemma: 'hän',
    example: {
      target: 'Hän on opettaja.',
      source: 'Он или она — преподаватель.',
    },
  }),
  createPersonalPronounVocabulary({
    key: 'pronoun-me',
    lemma: 'me',
    example: { target: 'Me olemme täällä.', source: 'Мы здесь.' },
  }),
  createPersonalPronounVocabulary({
    key: 'pronoun-te',
    lemma: 'te',
    example: { target: 'Te olette valmiita.', source: 'Вы готовы.' },
  }),
  createPersonalPronounVocabulary({
    key: 'pronoun-he',
    lemma: 'he',
    example: { target: 'He ovat kotona.', source: 'Они дома.' },
  }),
  createNominalVocabulary({
    key: 'student',
    itemId: 'word.fi.opiskelija.person',
    conceptId: 'person.student',
    lemma: 'opiskelija',
    gloss: 'студент, студентка',
    singular: 'opiskelija',
    plural: 'opiskelijoita',
    sourceSingular: 'студент',
    sourcePlural: 'студенты',
    semanticTypes: ['person', 'occupation-or-role'],
  }),
  createNominalVocabulary({
    key: 'teacher',
    itemId: 'word.fi.opettaja.person',
    conceptId: 'person.teacher',
    lemma: 'opettaja',
    gloss: 'преподаватель, преподавательница',
    singular: 'opettaja',
    plural: 'opettajia',
    sourceSingular: 'преподаватель',
    sourcePlural: 'преподаватели',
    semanticTypes: ['person', 'occupation-or-role'],
  }),
  createNominalVocabulary({
    key: 'doctor',
    itemId: 'word.fi.laakari.person',
    conceptId: 'person.doctor',
    lemma: 'lääkäri',
    gloss: 'врач',
    singular: 'lääkäri',
    plural: 'lääkäreitä',
    sourceSingular: 'врач',
    sourcePlural: 'врачи',
    semanticTypes: ['person', 'occupation-or-role'],
  }),
  createNominalVocabulary({
    key: 'friend',
    itemId: 'word.fi.ystava.person',
    conceptId: 'person.friend',
    lemma: 'ystävä',
    gloss: 'друг, подруга',
    singular: 'ystävä',
    plural: 'ystäviä',
    sourceSingular: 'друг',
    sourcePlural: 'друзья',
    semanticTypes: ['person', 'social-role'],
  }),
  createNominalVocabulary({
    key: 'finnish',
    itemId: 'word.fi.suomalainen.nationality',
    conceptId: 'nationality.finnish',
    lemma: 'suomalainen',
    gloss: 'финн, финка; финский',
    singular: 'suomalainen',
    plural: 'suomalaisia',
    sourceSingular: 'финн',
    sourcePlural: 'финны',
    semanticTypes: ['person', 'nationality'],
  }),
  createNominalVocabulary({
    key: 'russian',
    itemId: 'word.fi.venalainen.nationality',
    conceptId: 'nationality.russian',
    lemma: 'venäläinen',
    gloss: 'русский, русская',
    singular: 'venäläinen',
    plural: 'venäläisiä',
    sourceSingular: 'русский',
    sourcePlural: 'русские',
    semanticTypes: ['person', 'nationality'],
  }),
  createAdjectiveVocabulary({
    key: 'ready',
    itemId: 'word.fi.valmis.state',
    conceptId: 'state.ready',
    lemma: 'valmis',
    gloss: 'готовый',
    plural: 'valmiita',
    sourceSingular: 'готов',
    sourcePlural: 'готовы',
  }),
  createAdjectiveVocabulary({
    key: 'tired',
    itemId: 'word.fi.vasynyt.state',
    conceptId: 'state.tired',
    lemma: 'väsynyt',
    gloss: 'уставший',
    plural: 'väsyneitä',
    sourceSingular: 'устал',
    sourcePlural: 'устали',
  }),
  createAdjectiveVocabulary({
    key: 'happy',
    itemId: 'word.fi.iloinen.state',
    conceptId: 'state.happy',
    lemma: 'iloinen',
    gloss: 'радостный, счастливый',
    plural: 'iloisia',
    sourceSingular: 'рад',
    sourcePlural: 'рады',
  }),
  createInvariantVocabulary({
    key: 'home',
    itemId: 'word.fi.kotona.location',
    conceptId: 'place.home',
    lemma: 'kotona',
    gloss: 'дома',
    source: 'дома',
    semanticTypes: ['place', 'location'],
  }),
  createInvariantVocabulary({
    key: 'here',
    itemId: 'word.fi.taalla.location',
    conceptId: 'place.here',
    lemma: 'täällä',
    gloss: 'здесь',
    source: 'здесь',
    semanticTypes: ['place', 'deictic'],
  }),
]

type PersonKey = '1sg' | '2sg' | '3sg' | '1pl' | '2pl' | '3pl'

interface PersonSeed {
  key: PersonKey
  pronoun: string
  affirmative: string
  negative: string
  question: string
  sourceSubject: string
  plural: boolean
  canOmitSubject: boolean
  itemId: string
}

const persons: PersonSeed[] = [
  {
    key: '1sg',
    pronoun: 'minä',
    affirmative: 'olen',
    negative: 'en',
    question: 'olenko',
    sourceSubject: 'Я',
    plural: false,
    canOmitSubject: true,
    itemId: finnishLearnerDictionaryItemId('minä'),
  },
  {
    key: '2sg',
    pronoun: 'sinä',
    affirmative: 'olet',
    negative: 'et',
    question: 'oletko',
    sourceSubject: 'Ты',
    plural: false,
    canOmitSubject: true,
    itemId: finnishLearnerDictionaryItemId('sinä'),
  },
  {
    key: '3sg',
    pronoun: 'hän',
    affirmative: 'on',
    negative: 'ei',
    question: 'onko',
    sourceSubject: 'Он',
    plural: false,
    canOmitSubject: false,
    itemId: finnishLearnerDictionaryItemId('hän'),
  },
  {
    key: '1pl',
    pronoun: 'me',
    affirmative: 'olemme',
    negative: 'emme',
    question: 'olemmeko',
    sourceSubject: 'Мы',
    plural: true,
    canOmitSubject: true,
    itemId: finnishLearnerDictionaryItemId('me'),
  },
  {
    key: '2pl',
    pronoun: 'te',
    affirmative: 'olette',
    negative: 'ette',
    question: 'oletteko',
    sourceSubject: 'Вы',
    plural: true,
    canOmitSubject: true,
    itemId: finnishLearnerDictionaryItemId('te'),
  },
  {
    key: '3pl',
    pronoun: 'he',
    affirmative: 'ovat',
    negative: 'eivät',
    question: 'ovatko',
    sourceSubject: 'Они',
    plural: true,
    canOmitSubject: false,
    itemId: finnishLearnerDictionaryItemId('he'),
  },
]

export const lessonIdentityTemplateDefinition = {
  schemaVersion: 1 as const,
  frame: 'identity' as const,
  lessonId: 'fi.olla.basics',
  sourceLanguage: 'ru' as const,
  targetLanguage: 'fi' as const,
  personKeys: persons.map((person) => person.key),
  grammarItems: {
    affirmative: 'grammar.fi.olla.affirmative',
    negative: 'grammar.fi.olla.negative',
    question: 'grammar.fi.olla.question',
  },
  complements: lessonVocabulary
    .filter((item) => item.partOfSpeech !== 'pronoun')
    .map((item) => ({
      key: item.key,
      itemId: item.itemId,
      singular: item.singular,
      plural: item.plural,
      sourceSingular: item.sourceSingular,
      sourcePlural: item.sourcePlural,
    })),
}

const exerciseMatrix = {
  affirmative: [
    ['student', 'teacher', 'doctor', 'home', 'ready'],
    ['finnish', 'russian', 'ready', 'here', 'happy'],
    ['student', 'friend', 'happy', 'doctor'],
    ['home', 'here'],
    ['home', 'here'],
    ['home', 'here'],
  ],
  negative: [
    ['student', 'finnish', 'tired', 'doctor'],
    ['teacher', 'russian', 'ready', 'happy'],
    ['student', 'doctor', 'happy', 'finnish'],
    ['home', 'here'],
    ['home', 'here'],
    ['home', 'here'],
  ],
  question: [
    ['doctor', 'ready', 'home', 'student'],
    ['student', 'happy', 'here', 'russian'],
    ['student', 'teacher', 'finnish', 'friend'],
    ['home', 'here'],
    ['home', 'here'],
    ['home', 'here'],
  ],
} as const

const legacyExercises = new Map<string, { id: string; selectionOrder: number }>(
  [
    [
      exerciseSignature('negative', '3sg', 'student'),
      { id: 'exercise.fi.olla.negative.001', selectionOrder: 1 },
    ],
    [
      exerciseSignature('affirmative', '1sg', 'student'),
      { id: 'exercise.fi.olla.affirmative.001', selectionOrder: 2 },
    ],
    [
      exerciseSignature('question', '2sg', 'student'),
      { id: 'exercise.fi.olla.question.001', selectionOrder: 3 },
    ],
    [
      exerciseSignature('negative', '1sg', 'student'),
      { id: 'exercise.fi.olla.negative.002', selectionOrder: 4 },
    ],
    [
      exerciseSignature('question', '3sg', 'student'),
      { id: 'exercise.fi.olla.question.002', selectionOrder: 5 },
    ],
  ],
)

export const lessonExercises = sequenceExercisesByConstruction(buildExercises())

export function validateLessonOneContent(): string[] {
  const errors: string[] = []
  const exerciseIds = new Set(lessonExercises.map((exercise) => exercise.id))
  const selectionOrders = new Set(
    lessonExercises.map((exercise) => exercise.selectionOrder),
  )

  if (lessonExercises.length !== 60) {
    errors.push(`expected 60 exercises, received ${lessonExercises.length}`)
  }
  if (exerciseIds.size !== lessonExercises.length) {
    errors.push('exercise ids must be unique')
  }
  if (selectionOrders.size !== lessonExercises.length) {
    errors.push('exercise selectionOrder values must be unique')
  }
  if (
    Math.min(...selectionOrders) !== 1 ||
    Math.max(...selectionOrders) !== lessonExercises.length
  ) {
    errors.push('exercise selectionOrder must form a continuous 1..60 range')
  }

  const vocabularyIds = new Set(lessonVocabulary.map((item) => item.itemId))
  for (const exercise of lessonExercises) {
    if (!exercise.acceptedVariants.includes(exercise.targetText)) {
      errors.push(`${exercise.id} does not accept its targetText`)
    }
    if (exercise.slots.length === 0) {
      errors.push(`${exercise.id} has no answer slots`)
    }
    if (!vocabularyIds.has(exercise.vocabularyItemId)) {
      errors.push(`${exercise.id} references unknown vocabulary`)
    }
  }

  for (const item of lessonVocabulary) {
    if (
      !lessonExercises.some((exercise) =>
        exercise.slots.some((slot) => slot.itemIds.includes(item.itemId)),
      )
    ) {
      errors.push(`${item.itemId} is not covered by an exercise`)
    }
  }

  const expectedSkillCoverage = new Map([
    ['grammar.fi.olla.affirmative', 20],
    ['grammar.fi.olla.negative', 18],
    ['grammar.fi.olla.question', 18],
    ['register.fi.puhekieli.olla', 4],
  ])
  for (const [itemId, expectedCount] of expectedSkillCoverage) {
    const actualCount = lessonExercises.filter(
      (exercise) => exercise.primaryItemId === itemId,
    ).length
    if (actualCount !== expectedCount) {
      errors.push(
        `${itemId} expected ${expectedCount}, received ${actualCount}`,
      )
    }
  }

  const exampleCount = lessonContent.explanationScreens.reduce(
    (count, screen) => count + (screen.examples?.length ?? 0),
    0,
  )
  if (exampleCount < 12) {
    errors.push(`expected at least 12 examples, received ${exampleCount}`)
  }

  return errors
}

export function assertLessonOneContent(): void {
  const errors = validateLessonOneContent()
  if (errors.length > 0) {
    throw new Error(`Invalid lesson one content:\n- ${errors.join('\n- ')}`)
  }
}

function buildExercises(): PreparedExerciseSeed[] {
  const standardExercises: Omit<PreparedExerciseSeed, 'selectionOrder'>[] = []

  for (const [personIndex, person] of persons.entries()) {
    for (const category of ['affirmative', 'negative', 'question'] as const) {
      const complementKeys = exerciseMatrix[category][personIndex]
      if (!complementKeys) {
        throw new Error(`Exercise matrix is missing person ${person.key}`)
      }

      for (const complementKey of complementKeys) {
        standardExercises.push(
          createStandardExercise(
            category,
            person,
            getVocabulary(complementKey),
          ),
        )
      }
    }
  }

  const spokenExercises: Omit<PreparedExerciseSeed, 'selectionOrder'>[] = [
    createSpokenExercise({
      id: 'exercise.fi.olla.register.001',
      prompt: 'Переведи на разговорный финский: Я здесь.',
      targetText: 'Mä oon täällä.',
      slots: [
        { role: 'spokenSubject', accepted: ['mä'] },
        { role: 'spokenVerb', accepted: ['oon'] },
        { role: 'complement', accepted: ['täällä'] },
      ],
      vocabularyKey: 'here',
    }),
    createSpokenExercise({
      id: 'exercise.fi.olla.register.002',
      prompt: 'Переведи на разговорный финский: Ты дома.',
      targetText: 'Sä oot kotona.',
      slots: [
        { role: 'spokenSubject', accepted: ['sä'] },
        { role: 'spokenVerb', accepted: ['oot'] },
        { role: 'complement', accepted: ['kotona'] },
      ],
      vocabularyKey: 'home',
    }),
    createSpokenExercise({
      id: 'exercise.fi.olla.register.003',
      prompt: 'Переведи разговорно: Он устал.',
      targetText: 'Se on väsynyt.',
      slots: [
        { role: 'spokenSubject', accepted: ['se'] },
        { role: 'spokenVerb', accepted: ['on'] },
        { role: 'complement', accepted: ['väsynyt'] },
      ],
      vocabularyKey: 'tired',
    }),
    createSpokenExercise({
      id: 'exercise.fi.olla.register.004',
      prompt: 'Переведи разговорно: Они здесь.',
      targetText: 'Ne on täällä.',
      slots: [
        { role: 'spokenSubject', accepted: ['ne'] },
        { role: 'spokenVerb', accepted: ['on'] },
        { role: 'complement', accepted: ['täällä'] },
      ],
      vocabularyKey: 'here',
    }),
  ]

  const allExercises = [...standardExercises, ...spokenExercises]
  const reserved = allExercises.flatMap((exercise) => {
    const signature = signatureFromExercise(exercise)
    const legacy = signature ? legacyExercises.get(signature) : undefined
    return legacy ? [{ ...exercise, ...legacy }] : []
  })
  let nextSelectionOrder = legacyExercises.size + 1
  const remaining = allExercises
    .filter((exercise) => {
      const signature = signatureFromExercise(exercise)
      return !signature || !legacyExercises.has(signature)
    })
    .map((exercise) => ({
      ...exercise,
      selectionOrder: nextSelectionOrder++,
    }))

  return [...reserved, ...remaining].sort(
    (left, right) => left.selectionOrder - right.selectionOrder,
  )
}

function createStandardExercise(
  category: keyof typeof exerciseMatrix,
  person: PersonSeed,
  vocabulary: LessonVocabularySeed,
): Omit<PreparedExerciseSeed, 'selectionOrder'> {
  const complement = person.plural ? vocabulary.plural : vocabulary.singular
  const sourceComplement = person.plural
    ? vocabulary.sourcePlural
    : vocabulary.sourceSingular
  const capitalizedPronoun = capitalize(person.pronoun)
  const id = `exercise.fi.olla.${category}.${person.key}.${vocabulary.key}`

  if (category === 'affirmative') {
    const targetText = `${capitalizedPronoun} ${person.affirmative} ${complement}.`
    return {
      id,
      prompt: `Переведи на финский: ${person.sourceSubject} ${sourceComplement}.`,
      targetText,
      acceptedVariants: [
        targetText,
        ...(person.canOmitSubject
          ? [`${capitalize(person.affirmative)} ${complement}.`]
          : []),
      ],
      slots: attachEvidenceItems(
        [
          {
            role: 'subject',
            accepted: [person.pronoun],
            optional: person.canOmitSubject,
          },
          { role: 'mainVerb', accepted: [person.affirmative] },
          { role: 'complement', accepted: [complement] },
        ],
        ['grammar.fi.olla.affirmative'],
        vocabulary.itemId,
        person.itemId,
      ),
      primaryItemId: 'grammar.fi.olla.affirmative',
      secondaryItemIds: [person.itemId],
      vocabularyItemId: vocabulary.itemId,
    }
  }

  if (category === 'negative') {
    const targetText = `${capitalizedPronoun} ${person.negative} ole ${complement}.`
    return {
      id,
      prompt: `Переведи на финский: ${person.sourceSubject} не ${sourceComplement}.`,
      targetText,
      acceptedVariants: [
        targetText,
        ...(person.canOmitSubject
          ? [`${capitalize(person.negative)} ole ${complement}.`]
          : []),
      ],
      slots: attachEvidenceItems(
        [
          {
            role: 'subject',
            accepted: [person.pronoun],
            optional: person.canOmitSubject,
          },
          { role: 'negativeVerb', accepted: [person.negative] },
          { role: 'mainVerb', accepted: ['ole'] },
          { role: 'complement', accepted: [complement] },
        ],
        ['grammar.fi.olla.negative'],
        vocabulary.itemId,
        person.itemId,
      ),
      primaryItemId: 'grammar.fi.olla.negative',
      secondaryItemIds: [person.itemId],
      vocabularyItemId: vocabulary.itemId,
    }
  }

  const targetText = `${capitalize(person.question)} ${person.pronoun} ${complement}?`
  return {
    id,
    prompt: `Переведи на финский: ${person.sourceSubject} ${sourceComplement}?`,
    targetText,
    acceptedVariants: [
      targetText,
      ...(person.canOmitSubject
        ? [`${capitalize(person.question)} ${complement}?`]
        : []),
    ],
    slots: attachEvidenceItems(
      [
        { role: 'questionVerb', accepted: [person.question] },
        {
          role: 'subject',
          accepted: [person.pronoun],
          optional: person.canOmitSubject,
        },
        { role: 'complement', accepted: [complement] },
      ],
      ['grammar.fi.olla.question'],
      vocabulary.itemId,
      person.itemId,
    ),
    primaryItemId: 'grammar.fi.olla.question',
    secondaryItemIds: [person.itemId],
    vocabularyItemId: vocabulary.itemId,
  }
}

function createSpokenExercise(input: {
  id: string
  prompt: string
  targetText: string
  slots: Array<Omit<ExerciseSlotSeed, 'itemIds'>>
  vocabularyKey: string
}): Omit<PreparedExerciseSeed, 'selectionOrder'> {
  const vocabulary = getVocabulary(input.vocabularyKey)
  return {
    id: input.id,
    prompt: input.prompt,
    targetText: input.targetText,
    acceptedVariants: [input.targetText],
    slots: attachEvidenceItems(
      input.slots,
      ['register.fi.puhekieli.olla', 'grammar.fi.olla.affirmative'],
      vocabulary.itemId,
    ),
    primaryItemId: 'register.fi.puhekieli.olla',
    secondaryItemIds: ['grammar.fi.olla.affirmative'],
    vocabularyItemId: vocabulary.itemId,
  }
}

function attachEvidenceItems(
  slots: Array<Omit<ExerciseSlotSeed, 'itemIds'>>,
  grammarItemIds: string[],
  vocabularyItemId: string,
  subjectItemId?: string,
): ExerciseSlotSeed[] {
  return slots.map((slot) => ({
    ...slot,
    itemIds:
      slot.role === 'complement'
        ? [vocabularyItemId]
        : slot.role === 'subject' && subjectItemId
          ? [...grammarItemIds, subjectItemId]
          : grammarItemIds,
  }))
}

function signatureFromExercise(
  exercise: Omit<PreparedExerciseSeed, 'selectionOrder'>,
): string | null {
  const match = exercise.id.match(
    /^exercise\.fi\.olla\.(affirmative|negative|question)\.([^.]+)\.([^.]+)$/u,
  )
  return match?.[1] && match[2] && match[3]
    ? exerciseSignature(match[1], match[2], match[3])
    : null
}

function exerciseSignature(
  category: string,
  personKey: string,
  vocabularyKey: string,
): string {
  return `${category}:${personKey}:${vocabularyKey}`
}

function getVocabulary(key: string): LessonVocabularySeed {
  const vocabulary = lessonVocabulary.find((item) => item.key === key)
  if (!vocabulary) {
    throw new Error(`Unknown lesson vocabulary key: ${key}`)
  }
  return vocabulary
}

function capitalize(value: string): string {
  return `${value.charAt(0).toLocaleUpperCase('fi-FI')}${value.slice(1)}`
}

function createPersonalPronounVocabulary(input: {
  key: string
  lemma: 'minä' | 'sinä' | 'hän' | 'me' | 'te' | 'he'
  example: { target: string; source: string }
}): LessonVocabularySeed {
  const entry = getFinnishLearnerDictionaryEntry(input.lemma)
  if (!entry) {
    throw new Error(`Missing learner dictionary entry for ${input.lemma}`)
  }

  return {
    key: input.key,
    itemId: finnishLearnerDictionaryItemId(input.lemma),
    conceptId: finnishLearnerDictionaryConceptId(input.lemma),
    lexicalEntryId: finnishLearnerDictionaryLexicalEntryId(input.lemma),
    lemma: input.lemma,
    partOfSpeech: 'pronoun',
    gloss: entry.gloss,
    example: {
      target: input.example.target,
      source: { ru: input.example.source },
    },
    semanticTypes: ['personal-pronoun'],
    singular: input.lemma,
    plural: input.lemma,
    sourceSingular: entry.gloss,
    sourcePlural: entry.gloss,
    forms: entry.forms.map((form, index) => ({
      id: `form.fi.reader.${input.lemma}.${index + 1}`,
      surface: form.surface,
      features: form.features,
    })),
  }
}

function createNominalVocabulary(input: {
  key: string
  itemId: string
  conceptId: string
  lemma: string
  gloss: string
  singular: string
  plural: string
  sourceSingular: string
  sourcePlural: string
  semanticTypes: string[]
}): LessonVocabularySeed {
  const lexicalEntryId = `lex.fi.${input.lemma}`
  return {
    ...input,
    lexicalEntryId,
    partOfSpeech: 'noun',
    example: {
      target: `Hän on ${input.singular}.`,
      source: { ru: `Он или она — ${input.sourceSingular}.` },
    },
    forms: [
      {
        id: `form.fi.${input.key}.nominative.sg`,
        surface: input.singular,
        features: { case: 'nominative', number: 'singular' },
      },
      {
        id: `form.fi.${input.key}.partitive.pl`,
        surface: input.plural,
        features: { case: 'partitive', number: 'plural' },
      },
    ],
  }
}

function createAdjectiveVocabulary(input: {
  key: string
  itemId: string
  conceptId: string
  lemma: string
  gloss: string
  plural: string
  sourceSingular: string
  sourcePlural: string
}): LessonVocabularySeed {
  return {
    ...input,
    lexicalEntryId: `lex.fi.${input.lemma}`,
    partOfSpeech: 'adjective',
    example: {
      target: `Hän on ${input.lemma}.`,
      source: { ru: `Он или она ${input.sourceSingular}.` },
    },
    singular: input.lemma,
    semanticTypes: ['state', 'quality'],
    forms: [
      {
        id: `form.fi.${input.key}.nominative.sg`,
        surface: input.lemma,
        features: { case: 'nominative', number: 'singular' },
      },
      {
        id: `form.fi.${input.key}.partitive.pl`,
        surface: input.plural,
        features: { case: 'partitive', number: 'plural' },
      },
    ],
  }
}

function createInvariantVocabulary(input: {
  key: string
  itemId: string
  conceptId: string
  lemma: string
  gloss: string
  source: string
  semanticTypes: string[]
}): LessonVocabularySeed {
  return {
    key: input.key,
    itemId: input.itemId,
    conceptId: input.conceptId,
    lexicalEntryId: `lex.fi.${input.lemma}`,
    lemma: input.lemma,
    partOfSpeech: 'adverb',
    gloss: input.gloss,
    example: {
      target: `Hän on ${input.lemma}.`,
      source: { ru: `Он или она ${input.source}.` },
    },
    semanticTypes: input.semanticTypes,
    singular: input.lemma,
    plural: input.lemma,
    sourceSingular: input.source,
    sourcePlural: input.source,
    forms: [
      {
        id: `form.fi.${input.key}.invariant`,
        surface: input.lemma,
        features: { inflection: 'invariant' },
      },
    ],
  }
}
