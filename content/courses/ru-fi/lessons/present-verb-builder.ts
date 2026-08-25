import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './fi.olla.basics.js'

export interface CuratedPresentVerb {
  lemma: string
  gloss: string
  forms: [string, string, string, string, string, string]
  connegative: string
  verbType: string
  semanticType: string
}

type RussianPresentForms = [string, string, string, string, string, string]

export function buildPresentVerbVocabulary(input: {
  lessonPosition: number
  keyPrefix: string
  verbs: readonly CuratedPresentVerb[]
}): LessonVocabularySeed[] {
  return input.verbs.map((item, index) => {
    const source = getRussianPresentForms(item.lemma)
    const serial = `${String(input.lessonPosition).padStart(2, '0')}.${String(index + 1).padStart(2, '0')}`
    return {
      key: `${input.keyPrefix}-${item.lemma}`,
      itemId: `word.fi.m1.${serial}`,
      conceptId: `concept.fi.m1.${serial}`,
      lexicalEntryId: `lex.fi.${item.lemma}`,
      lemma: item.lemma,
      partOfSpeech: 'verb',
      gloss: item.gloss,
      example: {
        target: `Minä ${item.forms[0]}.`,
        source: { ru: `Я ${source[0]}.` },
      },
      semanticTypes: [
        'action',
        item.semanticType,
        `verb-type:${item.verbType}`,
      ],
      singular: item.forms[0],
      plural: item.forms[3],
      sourceSingular: source[0],
      sourcePlural: source[3],
      forms: [
        lexicalForm(serial, 'infinitive', item.lemma, {
          form: 'infinitive',
          verbType: item.verbType,
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
        lexicalForm(serial, 'present-2sg', item.forms[1], {
          mood: 'indicative',
          tense: 'present',
          person: 'second',
          number: 'singular',
        }),
        lexicalForm(serial, 'present-1pl', item.forms[3], {
          mood: 'indicative',
          tense: 'present',
          person: 'first',
          number: 'plural',
        }),
        lexicalForm(serial, 'present-2pl', item.forms[4], {
          mood: 'indicative',
          tense: 'present',
          person: 'second',
          number: 'plural',
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
        ...supplementalVerbForms(serial, item.lemma),
      ],
    }
  })
}

function supplementalVerbForms(
  serial: string,
  lemma: string,
): LessonVocabularySeed['forms'] {
  if (lemma !== 'tavata') return []

  return [
    lexicalForm(serial, 'imperfect-1sg', 'tapasin', {
      mood: 'indicative',
      tense: 'imperfect',
      person: 'first',
      number: 'singular',
    }),
    lexicalForm(serial, 'past-participle', 'tavannut', {
      form: 'past_participle',
      voice: 'active',
    }),
    lexicalForm(serial, 'passive-present', 'tavataan', {
      mood: 'indicative',
      tense: 'present',
      voice: 'passive',
    }),
    lexicalForm(serial, 'conditional-1sg', 'tapaisin', {
      mood: 'conditional',
      person: 'first',
      number: 'singular',
    }),
    lexicalForm(serial, 'imperative-2sg', 'tapaa', {
      mood: 'imperative',
      person: 'second',
      number: 'singular',
    }),
  ]
}

export function buildPresentVerbExercises(input: {
  idPrefix: string
  verbs: readonly CuratedPresentVerb[]
  vocabulary: readonly LessonVocabularySeed[]
  skillIdFor: (verb: CuratedPresentVerb) => string
  umbrellaSkillId?: string
}): PreparedExerciseSeed[] {
  const exercises: PreparedExerciseSeed[] = []

  addGroup(0, 18, 'first', ({ item, skillId, vocabulary }) => ({
    prompt: `Я ${getRussianPresentForms(item.lemma)[0]}.`,
    targetText: `Minä ${item.forms[0]}.`,
    acceptedVariants: [
      `Minä ${item.forms[0]}.`,
      `${capitalize(item.forms[0])}.`,
    ],
    slots: [
      skillSlot('subject', ['minä'], skillId, true),
      vocabularySlot('mainVerb', [item.forms[0]], skillId, vocabulary.itemId),
    ],
  }))
  addGroup(18, 10, 'second-now', ({ item, skillId, vocabulary }) => ({
    prompt: `Ты сейчас ${getRussianPresentForms(item.lemma)[1]}.`,
    targetText: `Sinä ${item.forms[1]} nyt.`,
    acceptedVariants: [
      `Sinä ${item.forms[1]} nyt.`,
      `${capitalize(item.forms[1])} nyt.`,
      `Nyt sinä ${item.forms[1]}.`,
      `Nyt ${item.forms[1]}.`,
    ],
    slots: [
      skillSlot('subject', ['sinä'], skillId, true),
      vocabularySlot('mainVerb', [item.forms[1]], skillId, vocabulary.itemId),
      skillSlot('adverb', ['nyt'], skillId),
    ],
  }))
  addGroup(2, 8, 'third', ({ item, skillId, vocabulary }) => ({
    prompt: `Он или она ${getRussianPresentForms(item.lemma)[2]}.`,
    targetText: `Hän ${item.forms[2]}.`,
    acceptedVariants: [`Hän ${item.forms[2]}.`],
    slots: [
      skillSlot('subject', ['hän'], skillId),
      vocabularySlot('mainVerb', [item.forms[2]], skillId, vocabulary.itemId),
    ],
  }))
  addGroup(10, 8, 'first-plural-now', ({ item, skillId, vocabulary }) => ({
    prompt: `Сейчас мы ${getRussianPresentForms(item.lemma)[3]}.`,
    targetText: `Nyt me ${item.forms[3]}.`,
    acceptedVariants: [`Nyt me ${item.forms[3]}.`, `Nyt ${item.forms[3]}.`],
    slots: [
      skillSlot('adverb', ['nyt'], skillId),
      skillSlot('subject', ['me'], skillId, true),
      vocabularySlot('mainVerb', [item.forms[3]], skillId, vocabulary.itemId),
    ],
  }))
  addGroup(18, 8, 'second-plural', ({ item, skillId, vocabulary }) => ({
    prompt: `Вы ${getRussianPresentForms(item.lemma)[4]}.`,
    targetText: `Te ${item.forms[4]}.`,
    acceptedVariants: [`Te ${item.forms[4]}.`, `${capitalize(item.forms[4])}.`],
    slots: [
      skillSlot('subject', ['te'], skillId, true),
      vocabularySlot('mainVerb', [item.forms[4]], skillId, vocabulary.itemId),
    ],
  }))
  addGroup(0, 8, 'third-plural-now', ({ item, skillId, vocabulary }) => ({
    prompt: `Они сейчас ${getRussianPresentForms(item.lemma)[5]}.`,
    targetText: `He ${item.forms[5]} nyt.`,
    acceptedVariants: [`He ${item.forms[5]} nyt.`, `Nyt he ${item.forms[5]}.`],
    slots: [
      skillSlot('subject', ['he'], skillId),
      vocabularySlot('mainVerb', [item.forms[5]], skillId, vocabulary.itemId),
      skillSlot('adverb', ['nyt'], skillId),
    ],
  }))

  if (exercises.length !== 60) {
    throw new Error(
      `${input.idPrefix} must contain 60 exercises, received ${exercises.length}`,
    )
  }
  return exercises

  function addGroup(
    start: number,
    count: number,
    category: string,
    create: (context: {
      item: CuratedPresentVerb
      vocabulary: LessonVocabularySeed
      skillId: string
    }) => Pick<
      PreparedExerciseSeed,
      'prompt' | 'targetText' | 'acceptedVariants' | 'slots'
    >,
  ) {
    Array.from({ length: count }, (_, offset) => {
      const vocabularyIndex = (start + offset) % input.verbs.length
      const item = input.verbs[vocabularyIndex]!
      const vocabulary = input.vocabulary[vocabularyIndex]!
      const skillId = input.skillIdFor(item)
      const values = create({ item, vocabulary, skillId })
      const umbrellaSkillId = input.umbrellaSkillId
      exercises.push({
        id: `${input.idPrefix}.${category}.${serial(offset)}`,
        selectionOrder: exercises.length + 1,
        ...values,
        slots: values.slots.map((slot) => ({
          ...slot,
          itemIds:
            umbrellaSkillId && !slot.itemIds.includes(umbrellaSkillId)
              ? [...slot.itemIds, umbrellaSkillId]
              : slot.itemIds,
        })),
        primaryItemId: skillId,
        secondaryItemIds:
          umbrellaSkillId && umbrellaSkillId !== skillId
            ? [umbrellaSkillId]
            : [],
        vocabularyItemId: vocabulary.itemId,
      })
    })
  }
}

function lexicalForm(
  serial: string,
  key: string,
  surface: string,
  features: Record<string, string>,
) {
  return { id: `form.fi.m1.${serial}.${key}`, surface, features }
}

function skillSlot(
  role: string,
  accepted: string[],
  skillId: string,
  optional = false,
) {
  return {
    role,
    accepted,
    itemIds: [skillId],
    ...(optional ? { optional } : {}),
  }
}

function vocabularySlot(
  role: string,
  accepted: string[],
  skillId: string,
  vocabularyItemId: string,
) {
  return { role, accepted, itemIds: [skillId, vocabularyItemId] }
}

function serial(index: number) {
  return String(index + 1).padStart(3, '0')
}

function capitalize(value: string) {
  return `${value.charAt(0).toLocaleUpperCase('fi')}${value.slice(1)}`
}

function getRussianPresentForms(lemma: string): RussianPresentForms {
  const forms = russianPresentFormsByLemma[lemma]
  if (!forms) throw new Error(`Russian present forms are missing for ${lemma}`)
  return forms
}

const russianPresentFormsByLemma: Record<string, RussianPresentForms> = {
  saada: [
    'получаю',
    'получаешь',
    'получает',
    'получаем',
    'получаете',
    'получают',
  ],
  syödä: ['ем', 'ешь', 'ест', 'едим', 'едите', 'едят'],
  juoda: ['пью', 'пьёшь', 'пьёт', 'пьём', 'пьёте', 'пьют'],
  uida: ['плаваю', 'плаваешь', 'плавает', 'плаваем', 'плаваете', 'плавают'],
  tupakoida: ['курю', 'куришь', 'курит', 'курим', 'курите', 'курят'],
  imuroida: [
    'пылесошу',
    'пылесосишь',
    'пылесосит',
    'пылесосим',
    'пылесосите',
    'пылесосят',
  ],
  pysäköidä: [
    'паркуюсь',
    'паркуешься',
    'паркуется',
    'паркуемся',
    'паркуетесь',
    'паркуются',
  ],
  viedä: ['отношу', 'относишь', 'относит', 'относим', 'относите', 'относят'],
  tuoda: [
    'приношу',
    'приносишь',
    'приносит',
    'приносим',
    'приносите',
    'приносят',
  ],
  myydä: ['продаю', 'продаёшь', 'продаёт', 'продаём', 'продаёте', 'продают'],
  tehdä: ['делаю', 'делаешь', 'делает', 'делаем', 'делаете', 'делают'],
  nähdä: ['вижу', 'видишь', 'видит', 'видим', 'видите', 'видят'],
  käydä: ['хожу', 'ходишь', 'ходит', 'ходим', 'ходите', 'ходят'],
  pestä: ['мою', 'моешь', 'моет', 'моем', 'моете', 'моют'],
  nousta: ['встаю', 'встаёшь', 'встаёт', 'встаём', 'встаёте', 'встают'],
  purra: ['кусаю', 'кусаешь', 'кусает', 'кусаем', 'кусаете', 'кусают'],
  kuunnella: [
    'слушаю',
    'слушаешь',
    'слушает',
    'слушаем',
    'слушаете',
    'слушают',
  ],
  mennä: ['иду', 'идёшь', 'идёт', 'идём', 'идёте', 'идут'],
  tulla: [
    'прихожу',
    'приходишь',
    'приходит',
    'приходим',
    'приходите',
    'приходят',
  ],
  kuolla: ['умираю', 'умираешь', 'умирает', 'умираем', 'умираете', 'умирают'],
  panna: ['кладу', 'кладёшь', 'кладёт', 'кладём', 'кладёте', 'кладут'],
  juosta: ['бегу', 'бежишь', 'бежит', 'бежим', 'бежите', 'бегут'],
  ajatella: ['думаю', 'думаешь', 'думает', 'думаем', 'думаете', 'думают'],
  opiskella: ['учусь', 'учишься', 'учится', 'учимся', 'учитесь', 'учатся'],
  harjoitella: [
    'тренируюсь',
    'тренируешься',
    'тренируется',
    'тренируемся',
    'тренируетесь',
    'тренируются',
  ],
  työskennellä: [
    'работаю',
    'работаешь',
    'работает',
    'работаем',
    'работаете',
    'работают',
  ],
  haluta: ['хочу', 'хочешь', 'хочет', 'хотим', 'хотите', 'хотят'],
  herätä: [
    'просыпаюсь',
    'просыпаешься',
    'просыпается',
    'просыпаемся',
    'просыпаетесь',
    'просыпаются',
  ],
  tavata: [
    'встречаю',
    'встречаешь',
    'встречает',
    'встречаем',
    'встречаете',
    'встречают',
  ],
  osata: ['умею', 'умеешь', 'умеет', 'умеем', 'умеете', 'умеют'],
  pelata: ['играю', 'играешь', 'играет', 'играем', 'играете', 'играют'],
  siivota: ['убираю', 'убираешь', 'убирает', 'убираем', 'убираете', 'убирают'],
  lainata: [
    'беру взаймы',
    'берёшь взаймы',
    'берёт взаймы',
    'берём взаймы',
    'берёте взаймы',
    'берут взаймы',
  ],
  tykätä: ['люблю', 'любишь', 'любит', 'любим', 'любите', 'любят'],
  vihata: [
    'ненавижу',
    'ненавидишь',
    'ненавидит',
    'ненавидим',
    'ненавидите',
    'ненавидят',
  ],
  tarvita: [
    'нуждаюсь',
    'нуждаешься',
    'нуждается',
    'нуждаемся',
    'нуждаетесь',
    'нуждаются',
  ],
  pakata: [
    'упаковываю',
    'упаковываешь',
    'упаковывает',
    'упаковываем',
    'упаковываете',
    'упаковывают',
  ],
  korjata: ['чиню', 'чинишь', 'чинит', 'чиним', 'чините', 'чинят'],
  maalata: ['крашу', 'красишь', 'красит', 'красим', 'красите', 'красят'],
  tilata: [
    'заказываю',
    'заказываешь',
    'заказывает',
    'заказываем',
    'заказываете',
    'заказывают',
  ],
  pudota: ['падаю', 'падаешь', 'падает', 'падаем', 'падаете', 'падают'],
  levätä: [
    'отдыхаю',
    'отдыхаешь',
    'отдыхает',
    'отдыхаем',
    'отдыхаете',
    'отдыхают',
  ],
  häiritä: ['мешаю', 'мешаешь', 'мешает', 'мешаем', 'мешаете', 'мешают'],
  luvata: ['обещаю', 'обещаешь', 'обещает', 'обещаем', 'обещаете', 'обещают'],
  palata: [
    'возвращаюсь',
    'возвращаешься',
    'возвращается',
    'возвращаемся',
    'возвращаетесь',
    'возвращаются',
  ],
  pelätä: ['боюсь', 'боишься', 'боится', 'боимся', 'боитесь', 'боятся'],
  lämmetä: [
    'согреваюсь',
    'согреваешься',
    'согревается',
    'согреваемся',
    'согреваетесь',
    'согреваются',
  ],
  kylmetä: [
    'остываю',
    'остываешь',
    'остывает',
    'остываем',
    'остываете',
    'остывают',
  ],
  vanheta: ['старею', 'стареешь', 'стареет', 'стареем', 'стареете', 'стареют'],
  valita: [
    'выбираю',
    'выбираешь',
    'выбирает',
    'выбираем',
    'выбираете',
    'выбирают',
  ],
  avata: [
    'открываю',
    'открываешь',
    'открывает',
    'открываем',
    'открываете',
    'открывают',
  ],
  vastata: [
    'отвечаю',
    'отвечаешь',
    'отвечает',
    'отвечаем',
    'отвечаете',
    'отвечают',
  ],
}
