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
  partOfSpeech: 'noun' | 'adjective' | 'adverb'
  gloss: string
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
  version: 2,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'personal-pronouns',
      eyebrow: { ru: 'Шаг 1 из 6' },
      title: { ru: 'Личные местоимения' },
      paragraphs: [
        {
          ru: 'В финском местоимение hän означает и «он», и «она». Род становится понятен из контекста.',
        },
        {
          ru: 'Глагол olla — «быть». В настоящем времени его форма меняется вместе с лицом.',
        },
      ],
      examples: [
        { target: 'Minä olen opiskelija.', source: { ru: 'Я студент.' } },
        { target: 'Sinä olet lääkäri.', source: { ru: 'Ты врач.' } },
        {
          target: 'Hän on opettaja.',
          source: { ru: 'Он или она — преподаватель.' },
        },
      ],
    },
    {
      id: 'olla-forms',
      eyebrow: { ru: 'Шаг 2 из 6' },
      title: { ru: 'Шесть форм olla' },
      paragraphs: [
        {
          ru: 'Запомни пары местоимение + глагол. У hän и he формы отличаются от остальных.',
        },
        {
          ru: 'В первом и втором лице местоимение часто можно опустить: olen готово сообщить, что речь идёт о minä.',
        },
      ],
      table: {
        headers: [{ ru: 'Местоимение' }, { ru: 'Olla' }, { ru: 'Перевод' }],
        rows: [
          [{ ru: 'minä' }, { ru: 'olen' }, { ru: 'я есть' }],
          [{ ru: 'sinä' }, { ru: 'olet' }, { ru: 'ты есть' }],
          [{ ru: 'hän' }, { ru: 'on' }, { ru: 'он / она есть' }],
          [{ ru: 'me' }, { ru: 'olemme' }, { ru: 'мы есть' }],
          [{ ru: 'te' }, { ru: 'olette' }, { ru: 'вы есть' }],
          [{ ru: 'he' }, { ru: 'ovat' }, { ru: 'они есть' }],
        ],
      },
      examples: [
        {
          target: 'Olemme täällä.',
          source: { ru: 'Мы здесь.' },
          note: { ru: 'Me можно опустить: форма olemme уже указывает лицо.' },
        },
        { target: 'He ovat kotona.', source: { ru: 'Они дома.' } },
      ],
    },
    {
      id: 'predicative-complements',
      eyebrow: { ru: 'Шаг 3 из 6' },
      title: { ru: 'Что ставить после olla' },
      paragraphs: [
        {
          ru: 'После olla можно назвать профессию, национальность, состояние или место. В единственном числе используется словарная форма.',
        },
        {
          ru: 'После me, te и he профессии и признаки в этих примерах получают форму партитива множественного числа: opiskelijoita, valmiita.',
        },
      ],
      examples: [
        { target: 'Hän on suomalainen.', source: { ru: 'Он — финн.' } },
        { target: 'Me olemme opiskelijoita.', source: { ru: 'Мы студенты.' } },
        { target: 'He ovat valmiita.', source: { ru: 'Они готовы.' } },
      ],
      callout: {
        ru: 'Kotona «дома» и täällä «здесь» не изменяются: olen kotona, he ovat kotona.',
      },
    },
    {
      id: 'olla-negative',
      eyebrow: { ru: 'Шаг 4 из 6' },
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
      eyebrow: { ru: 'Шаг 5 из 6' },
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
          note: {
            ru: 'В обычной речи sinä часто опускают: Oletko opiskelija?',
          },
        },
        { target: 'Onko hän lääkäri?', source: { ru: 'Он врач?' } },
        { target: 'Ovatko he täällä?', source: { ru: 'Они здесь?' } },
      ],
    },
    {
      id: 'spoken-olla-and-errors',
      eyebrow: { ru: 'Шаг 6 из 6' },
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
          note: { ru: 'Нейтрально: Minä olen täällä.' },
        },
        {
          target: 'Sä oot kotona.',
          source: { ru: 'Ты дома.' },
          note: { ru: 'Нейтрально: Sinä olet kotona.' },
        },
        {
          target: 'Se on väsynyt.',
          source: { ru: 'Он или она устал(а).' },
          note: { ru: 'Нейтрально о человеке: Hän on väsynyt.' },
        },
        {
          target: 'Ne on valmiita.',
          source: { ru: 'Они готовы.' },
          note: { ru: 'Нейтрально: He ovat valmiita.' },
        },
      ],
      callout: {
        ru: 'Не смешивай стили внутри одной фразы: для начала выбирай либо нейтральное minä olen, либо разговорное mä oon.',
      },
    },
  ],
} as const

export const lessonVocabulary: LessonVocabularySeed[] = [
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

interface PersonSeed {
  key: string
  pronoun: string
  affirmative: string
  negative: string
  question: string
  sourceSubject: string
  plural: boolean
  canOmitSubject: boolean
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
  },
]

const exerciseMatrix = {
  affirmative: [
    ['student', 'teacher', 'doctor', 'home'],
    ['finnish', 'russian', 'ready', 'here'],
    ['student', 'friend', 'happy'],
    ['home', 'here', 'ready'],
    ['teacher', 'doctor', 'russian'],
    ['student', 'tired', 'finnish'],
  ],
  negative: [
    ['student', 'finnish', 'tired'],
    ['teacher', 'russian', 'ready'],
    ['student', 'doctor', 'happy'],
    ['home', 'here', 'student'],
    ['teacher', 'ready', 'tired'],
    ['doctor', 'finnish', 'russian'],
  ],
  question: [
    ['doctor', 'ready', 'home'],
    ['student', 'happy', 'here'],
    ['student', 'teacher', 'finnish'],
    ['russian', 'friend', 'here'],
    ['doctor', 'home', 'ready'],
    ['student', 'tired', 'happy'],
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

export const lessonExercises = buildExercises()

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
      !lessonExercises.some(
        (exercise) => exercise.vocabularyItemId === item.itemId,
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
      prompt: 'Переведи разговорно: Они готовы.',
      targetText: 'Ne on valmiita.',
      slots: [
        { role: 'spokenSubject', accepted: ['ne'] },
        { role: 'spokenVerb', accepted: ['on'] },
        { role: 'complement', accepted: ['valmiita'] },
      ],
      vocabularyKey: 'ready',
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
      slots: [
        { role: 'subject', accepted: [person.pronoun] },
        { role: 'mainVerb', accepted: [person.affirmative] },
        { role: 'complement', accepted: [complement] },
      ],
      primaryItemId: 'grammar.fi.olla.affirmative',
      secondaryItemIds: [],
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
      slots: [
        { role: 'subject', accepted: [person.pronoun] },
        { role: 'negativeVerb', accepted: [person.negative] },
        { role: 'mainVerb', accepted: ['ole'] },
        { role: 'complement', accepted: [complement] },
      ],
      primaryItemId: 'grammar.fi.olla.negative',
      secondaryItemIds: [],
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
    slots: [
      { role: 'questionVerb', accepted: [person.question] },
      { role: 'subject', accepted: [person.pronoun] },
      { role: 'complement', accepted: [complement] },
    ],
    primaryItemId: 'grammar.fi.olla.question',
    secondaryItemIds: [],
    vocabularyItemId: vocabulary.itemId,
  }
}

function createSpokenExercise(input: {
  id: string
  prompt: string
  targetText: string
  slots: ExerciseSlotSeed[]
  vocabularyKey: string
}): Omit<PreparedExerciseSeed, 'selectionOrder'> {
  return {
    id: input.id,
    prompt: input.prompt,
    targetText: input.targetText,
    acceptedVariants: [input.targetText],
    slots: input.slots,
    primaryItemId: 'register.fi.puhekieli.olla',
    secondaryItemIds: ['grammar.fi.olla.affirmative'],
    vocabularyItemId: getVocabulary(input.vocabularyKey).itemId,
  }
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
