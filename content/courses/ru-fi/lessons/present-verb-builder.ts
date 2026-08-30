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
    const context = getPresentVerbContext(item.lemma)
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
        target: `Minä ${item.forms[0]} ${context.target}.`,
        source: { ru: `Я ${source[0]} ${context.source}.` },
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

  addGroup(0, 18, 'first', ({ item, skillId, vocabulary }) => {
    const context = getPresentVerbContext(item.lemma)
    return {
      prompt: `Я ${getRussianPresentForms(item.lemma)[0]} ${context.source}.`,
      targetText: `Minä ${item.forms[0]} ${context.target}.`,
      acceptedVariants: [
        `Minä ${item.forms[0]} ${context.target}.`,
        `${capitalize(item.forms[0])} ${context.target}.`,
      ],
      slots: [
        skillSlot('subject', ['minä'], skillId, true),
        vocabularySlot('mainVerb', [item.forms[0]], skillId, vocabulary.itemId),
        ...contextSlots(context.target, skillId),
      ],
    }
  })
  addGroup(18, 10, 'second-now', ({ item, skillId, vocabulary }) => {
    const context = getPresentVerbContext(item.lemma)
    return {
      prompt: `Ты сейчас ${getRussianPresentForms(item.lemma)[1]} ${context.source}.`,
      targetText: `Sinä ${item.forms[1]} nyt ${context.target}.`,
      acceptedVariants: [
        `Sinä ${item.forms[1]} nyt ${context.target}.`,
        `${capitalize(item.forms[1])} nyt ${context.target}.`,
        `Nyt sinä ${item.forms[1]} ${context.target}.`,
        `Nyt ${item.forms[1]} ${context.target}.`,
      ],
      slots: [
        skillSlot('subject', ['sinä'], skillId, true),
        vocabularySlot('mainVerb', [item.forms[1]], skillId, vocabulary.itemId),
        skillSlot('adverb', ['nyt'], skillId),
        ...contextSlots(context.target, skillId),
      ],
    }
  })
  addGroup(2, 8, 'third', ({ item, skillId, vocabulary }) => {
    const context = getPresentVerbContext(item.lemma)
    return {
      prompt: `Он или она ${getRussianPresentForms(item.lemma)[2]} ${context.source}.`,
      targetText: `Hän ${item.forms[2]} ${context.target}.`,
      acceptedVariants: [`Hän ${item.forms[2]} ${context.target}.`],
      slots: [
        skillSlot('subject', ['hän'], skillId),
        vocabularySlot('mainVerb', [item.forms[2]], skillId, vocabulary.itemId),
        ...contextSlots(context.target, skillId),
      ],
    }
  })
  addGroup(10, 8, 'first-plural-now', ({ item, skillId, vocabulary }) => {
    const context = getPresentVerbContext(item.lemma)
    return {
      prompt: `Сейчас мы ${getRussianPresentForms(item.lemma)[3]} ${context.source}.`,
      targetText: `Nyt me ${item.forms[3]} ${context.target}.`,
      acceptedVariants: [
        `Nyt me ${item.forms[3]} ${context.target}.`,
        `Nyt ${item.forms[3]} ${context.target}.`,
      ],
      slots: [
        skillSlot('adverb', ['nyt'], skillId),
        skillSlot('subject', ['me'], skillId, true),
        vocabularySlot('mainVerb', [item.forms[3]], skillId, vocabulary.itemId),
        ...contextSlots(context.target, skillId),
      ],
    }
  })
  addGroup(18, 8, 'second-plural', ({ item, skillId, vocabulary }) => {
    const context = getPresentVerbContext(item.lemma)
    return {
      prompt: `Вы ${getRussianPresentForms(item.lemma)[4]} ${context.source}.`,
      targetText: `Te ${item.forms[4]} ${context.target}.`,
      acceptedVariants: [
        `Te ${item.forms[4]} ${context.target}.`,
        `${capitalize(item.forms[4])} ${context.target}.`,
      ],
      slots: [
        skillSlot('subject', ['te'], skillId, true),
        vocabularySlot('mainVerb', [item.forms[4]], skillId, vocabulary.itemId),
        ...contextSlots(context.target, skillId),
      ],
    }
  })
  addGroup(0, 8, 'third-plural-now', ({ item, skillId, vocabulary }) => {
    const context = getPresentVerbContext(item.lemma)
    return {
      prompt: `Они сейчас ${getRussianPresentForms(item.lemma)[5]} ${context.source}.`,
      targetText: `He ${item.forms[5]} nyt ${context.target}.`,
      acceptedVariants: [
        `He ${item.forms[5]} nyt ${context.target}.`,
        `Nyt he ${item.forms[5]} ${context.target}.`,
      ],
      slots: [
        skillSlot('subject', ['he'], skillId),
        vocabularySlot('mainVerb', [item.forms[5]], skillId, vocabulary.itemId),
        skillSlot('adverb', ['nyt'], skillId),
        ...contextSlots(context.target, skillId),
      ],
    }
  })

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
      let vocabularyIndex = (start + offset) % input.verbs.length
      if (
        category === 'second-now' &&
        input.verbs[vocabularyIndex]?.lemma === 'vanheta'
      ) {
        vocabularyIndex = 15
      }
      if (
        category === 'first-plural-now' &&
        input.verbs[vocabularyIndex]?.lemma === 'pudota'
      ) {
        vocabularyIndex = 23
      }
      if (
        category === 'second-plural' &&
        input.verbs[vocabularyIndex]?.lemma === 'kuolla'
      ) {
        vocabularyIndex = 15
      }
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

function contextSlots(value: string, skillId: string) {
  return value
    .split(' ')
    .map((token, index) => skillSlot(`context${index + 1}`, [token], skillId))
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

function getPresentVerbContext(lemma: string) {
  const context = presentVerbContexts[lemma]
  if (!context) throw new Error(`Present verb context is missing for ${lemma}`)
  return context
}

const presentVerbContexts: Record<string, { target: string; source: string }> =
  {
    saada: { target: 'viestin', source: 'сообщение' },
    syödä: { target: 'aamiaista', source: 'завтрак' },
    juoda: { target: 'vettä', source: 'воду' },
    uida: { target: 'altaassa', source: 'в бассейне' },
    tupakoida: { target: 'ulkona', source: 'на улице' },
    imuroida: { target: 'olohuonetta', source: 'гостиную' },
    pysäköidä: { target: 'pihalle', source: 'во дворе' },
    viedä: { target: 'roskat ulos', source: 'мусор на улицу' },
    tuoda: { target: 'kahvia', source: 'кофе' },
    myydä: { target: 'auton', source: 'машину' },
    tehdä: { target: 'ruokaa', source: 'еду' },
    nähdä: { target: 'ystävän', source: 'друга' },
    käydä: { target: 'kaupassa', source: 'в магазин' },
    pestä: { target: 'kädet', source: 'руки' },
    nousta: { target: 'aikaisin', source: 'рано' },
    purra: { target: 'omenaa', source: 'яблоко' },
    kuunnella: { target: 'musiikkia', source: 'музыку' },
    mennä: { target: 'kotiin', source: 'домой' },
    tulla: { target: 'ajoissa', source: 'вовремя' },
    kuolla: { target: 'nauruun', source: 'со смеху' },
    panna: { target: 'kirjan pöydälle', source: 'книгу на стол' },
    juosta: { target: 'puistossa', source: 'в парке' },
    ajatella: { target: 'asiaa', source: 'об этом' },
    opiskella: { target: 'suomea', source: 'финский язык' },
    harjoitella: { target: 'ääntämistä', source: 'произношение' },
    työskennellä: { target: 'toimistossa', source: 'в офисе' },
    haluta: { target: 'kahvia', source: 'кофе' },
    herätä: { target: 'aikaisin', source: 'рано' },
    tavata: { target: 'ystävän', source: 'друга' },
    osata: { target: 'kokata', source: 'готовить' },
    pelata: { target: 'jalkapalloa', source: 'в футбол' },
    siivota: { target: 'keittiötä', source: 'кухню' },
    lainata: { target: 'kirjan', source: 'книгу' },
    tykätä: { target: 'kahvista', source: 'кофе' },
    vihata: { target: 'kiirettä', source: 'спешку' },
    tarvita: { target: 'apua', source: 'в помощи' },
    pakata: { target: 'laukun', source: 'сумку' },
    korjata: { target: 'pyörän', source: 'велосипед' },
    maalata: { target: 'seinän', source: 'стену' },
    tilata: { target: 'ruokaa', source: 'еду' },
    pudota: { target: 'portaissa', source: 'на лестнице' },
    levätä: { target: 'kotona', source: 'дома' },
    häiritä: { target: 'naapuria', source: 'соседу' },
    luvata: { target: 'auttaa', source: 'помочь' },
    palata: { target: 'kotiin', source: 'домой' },
    pelätä: { target: 'pimeää', source: 'темноты' },
    lämmetä: { target: 'nopeasti', source: 'быстро' },
    kylmetä: { target: 'ulkona', source: 'на улице' },
    vanheta: { target: 'vähitellen', source: 'постепенно' },
    valita: { target: 'jälkiruoan', source: 'десерт' },
    avata: { target: 'oven', source: 'дверь' },
    vastata: { target: 'kysymykseen', source: 'на вопрос' },
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
  tehdä: ['готовлю', 'готовишь', 'готовит', 'готовим', 'готовите', 'готовят'],
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
  opiskella: [
    'изучаю',
    'изучаешь',
    'изучает',
    'изучаем',
    'изучаете',
    'изучают',
  ],
  harjoitella: [
    'отрабатываю',
    'отрабатываешь',
    'отрабатывает',
    'отрабатываем',
    'отрабатываете',
    'отрабатывают',
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
  kylmetä: ['мёрзну', 'мёрзнешь', 'мёрзнет', 'мёрзнем', 'мёрзнете', 'мёрзнут'],
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
