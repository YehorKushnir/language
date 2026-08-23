import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './fi.olla.basics.js'

export const PRESENT_NEGATIVE_SKILL_ID = 'grammar.fi.present.negative'
export const PRESENT_QUESTION_SKILL_ID = 'grammar.fi.present.question'
export const WORD_ORDER_SKILL_ID = 'grammar.fi.questions.word-order'

interface CommunicationNounSeed {
  lemma: string
  gloss: string
  genitive: string
  partitive: string
  semanticType: string
}

const nouns: CommunicationNounSeed[] = [
  noun('kysymys', 'вопрос', 'kysymyksen', 'kysymystä', 'communication'),
  noun('vastaus', 'ответ', 'vastauksen', 'vastausta', 'communication'),
  noun('nimi', 'имя', 'nimen', 'nimeä', 'identity'),
  noun('osoite', 'адрес', 'osoitteen', 'osoitetta', 'contact-data'),
  noun('numero', 'номер', 'numeron', 'numeroa', 'contact-data'),
  noun('kieli', 'язык', 'kielen', 'kieltä', 'language'),
  noun('sana', 'слово', 'sanan', 'sanaa', 'language'),
  noun('lause', 'предложение', 'lauseen', 'lausetta', 'language'),
  noun('ääni', 'голос', 'äänen', 'ääntä', 'communication'),
  noun('keskustelu', 'разговор', 'keskustelun', 'keskustelua', 'communication'),
  noun('viesti', 'сообщение', 'viestin', 'viestiä', 'communication'),
  noun('kirje', 'письмо', 'kirjeen', 'kirjettä', 'communication'),
  noun('puhelin', 'телефон', 'puhelimen', 'puhelinta', 'device'),
  noun(
    'sähköposti',
    'электронная почта',
    'sähköpostin',
    'sähköpostia',
    'communication',
  ),
  noun('asia', 'дело', 'asian', 'asiaa', 'abstract'),
  noun('ongelma', 'проблема', 'ongelman', 'ongelmaa', 'abstract'),
  noun('esimerkki', 'пример', 'esimerkin', 'esimerkkiä', 'information'),
  noun('syy', 'причина', 'syyn', 'syytä', 'abstract'),
  noun('tapa', 'способ', 'tavan', 'tapaa', 'abstract'),
  noun('mielipide', 'мнение', 'mielipiteen', 'mielipidettä', 'abstract'),
  noun('ajatus', 'мысль', 'ajatuksen', 'ajatusta', 'abstract'),
  noun('tieto', 'информация', 'tiedon', 'tietoa', 'information'),
  noun('uutinen', 'новость', 'uutisen', 'uutista', 'information'),
  noun('tarina', 'история', 'tarinan', 'tarinaa', 'information'),
  noun('merkitys', 'значение', 'merkityksen', 'merkitystä', 'language'),
  noun('virhe', 'ошибка', 'virheen', 'virhettä', 'language'),
]

export const questionsWordOrderContent = {
  version: 3,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'present-negative',
      eyebrow: { ru: 'Отрицание' },
      title: { ru: 'Личное окончание переходит к ei' },
      paragraphs: [
        {
          ru: 'В отрицательном настоящем времени изменяется глагол ei: en, et, ei, emme, ette, eivät. Смысловой глагол теряет личное окончание и принимает отрицательную форму: puhun → en puhu.',
        },
        {
          ru: 'У olla действует та же модель: olen → en ole, hän on → hän ei ole. Нельзя одновременно изменять оба глагола.',
        },
      ],
      table: {
        headers: [
          { ru: 'Лицо' },
          { ru: 'ei' },
          { ru: 'puhua' },
          { ru: 'olla' },
        ],
        rows: [
          [{ ru: 'minä' }, { ru: 'en' }, { ru: 'en puhu' }, { ru: 'en ole' }],
          [{ ru: 'sinä' }, { ru: 'et' }, { ru: 'et puhu' }, { ru: 'et ole' }],
          [{ ru: 'hän' }, { ru: 'ei' }, { ru: 'ei puhu' }, { ru: 'ei ole' }],
          [
            { ru: 'me' },
            { ru: 'emme' },
            { ru: 'emme puhu' },
            { ru: 'emme ole' },
          ],
          [
            { ru: 'te' },
            { ru: 'ette' },
            { ru: 'ette puhu' },
            { ru: 'ette ole' },
          ],
          [
            { ru: 'he' },
            { ru: 'eivät' },
            { ru: 'eivät puhu' },
            { ru: 'eivät ole' },
          ],
        ],
      },
      examples: [
        { target: 'Minä en puhu.', source: { ru: 'Я не говорю.' } },
        {
          target: 'Hän ei ole opettaja.',
          source: { ru: 'Он или она не преподаватель.' },
        },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Исправь ошибку: Hän ei puhuu.' },
          answer: 'Hän ei puhu.',
          explanation: {
            ru: 'После ei используется отрицательная форма без личного окончания.',
          },
        },
      ],
    },
    {
      id: 'yes-no-question',
      eyebrow: { ru: 'Общий вопрос' },
      title: { ru: 'Частица -ko/-kö на первом слове' },
      paragraphs: [
        {
          ru: 'Общий вопрос начинается с того слова, которое проверяется. К нему присоединяется -ko или -kö: Puhutko sinä? Onko tämä kysymys?',
        },
        {
          ru: 'Если в слове есть a, o или u, выбирай -ko. Если есть только передние ä, ö, y и нейтральные e, i — выбирай -kö.',
        },
      ],
      table: {
        headers: [{ ru: 'Утверждение' }, { ru: 'Вопрос' }],
        rows: [
          [{ ru: 'Sinä puhut.' }, { ru: 'Puhutko sinä?' }],
          [{ ru: 'Hän kysyy.' }, { ru: 'Kysyykö hän?' }],
          [{ ru: 'Tämä on vastaus.' }, { ru: 'Onko tämä vastaus?' }],
        ],
      },
      examples: [
        { target: 'Puhutko suomea?', source: { ru: 'Ты говоришь по-фински?' } },
        { target: 'Onko tämä viesti?', source: { ru: 'Это сообщение?' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Добавь правильную частицу: kysyy___' },
          answer: 'kysyykö',
          explanation: { ru: 'В слове нет a, o, u, поэтому используется -kö.' },
        },
      ],
    },
    {
      id: 'question-words',
      eyebrow: { ru: 'Специальный вопрос' },
      title: { ru: 'Вопросительное слово уже занимает первое место' },
      paragraphs: [
        {
          ru: 'После mitä, mikä, kuka, missä, milloin и miksi порядок обычно остаётся прямым: вопросительное слово, затем сказуемое и подлежащее.',
        },
        {
          ru: 'К сказуемому не добавляется -ko/-kö, если вопрос уже начинается с вопросительного слова: Mikä tämä on?',
        },
      ],
      examples: [
        { target: 'Mikä tämä on?', source: { ru: 'Что это?' } },
        { target: 'Missä puhelin on?', source: { ru: 'Где телефон?' } },
        {
          target: 'Miksi hän kysyy?',
          source: { ru: 'Почему он или она спрашивает?' },
        },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Нужна ли частица -ko в вопросе Missä puhelin on?' },
          answer: 'Нет.',
          explanation: { ru: 'Missä уже обозначает вопрос и стоит в начале.' },
        },
      ],
    },
    {
      id: 'neutral-word-order',
      eyebrow: { ru: 'Порядок слов' },
      title: { ru: 'Нейтральная модель и тема в начале' },
      paragraphs: [
        {
          ru: 'Нейтральное утверждение обычно следует порядку подлежащее → сказуемое → дополнение. Обстоятельство времени или места можно поставить первым, если оно задаёт тему: Tässä on vastaus.',
        },
        {
          ru: 'Перенос в начало меняет информационный акцент, а не только оформление. Поэтому переставлять слова без причины не следует.',
        },
      ],
      examples: [
        { target: 'Tämä on vastaus.', source: { ru: 'Это ответ.' } },
        { target: 'Tässä on vastaus.', source: { ru: 'Здесь есть ответ.' } },
        {
          target: 'Puhelin ei ole tässä.',
          source: { ru: 'Телефон не здесь.' },
        },
      ],
    },
    {
      id: 'spoken-questions',
      eyebrow: { ru: 'Регистр' },
      title: { ru: 'Вопросы в puhekieli' },
      paragraphs: [
        {
          ru: 'В puhekieli местоимение может сливаться с вопросительной формой: puhutko sinä → puhutsä, oletko sinä → ooksä. Эти формы важно узнавать на слух и в переписке.',
        },
        {
          ru: 'В kirjakieli сохраняй полную форму с -ko/-kö и отдельное местоимение. Практика этого урока принимает нейтральный письменный вариант.',
        },
      ],
      examples: [
        {
          target: 'Puhutsä suomea?',
          source: { ru: 'Ты говоришь по-фински?' },
          note: { ru: 'Kirjakieli: Puhutko sinä suomea?' },
        },
        {
          target: 'Ook sä kotona?',
          source: { ru: 'Ты дома?' },
          note: { ru: 'Kirjakieli: Oletko sinä kotona?' },
        },
      ],
    },
    {
      id: 'negative-question-errors',
      eyebrow: { ru: 'Самопроверка' },
      title: { ru: 'Типичные ошибки' },
      paragraphs: [
        {
          ru: 'Не оставляй личное окончание после ei: правильно hän ei kirjoita, а не hän ei kirjoittaa. Не добавляй -ko дважды и не сохраняй утвердительный порядок в общем вопросе.',
        },
        {
          ru: 'Различай tämä «это» и вопросительное mikä «что/какой»: Onko tämä vastaus? — общий вопрос; Mikä tämä on? — специальный.',
        },
      ],
      examples: [
        {
          target: 'Hän ei kirjoita.',
          source: { ru: 'Он или она не пишет.' },
          note: { ru: 'Не: hän ei kirjoittaa.' },
        },
        {
          target: 'Onko tämä virhe?',
          source: { ru: 'Это ошибка?' },
          note: { ru: 'Не: tämä onko virhe?' },
        },
        {
          target: 'Missä vastaus on?',
          source: { ru: 'Где ответ?' },
          note: { ru: 'После missä частица -ko не нужна.' },
        },
      ],
      callout: {
        ru: 'Сначала определи тип предложения: утверждение, отрицание, общий вопрос или специальный вопрос. Затем выбирай порядок слов.',
      },
    },
  ],
} as const

export const questionsWordOrderVocabulary: LessonVocabularySeed[] = nouns.map(
  (item, index) => {
    const lessonSerial = `03.${String(index + 1).padStart(2, '0')}`
    return {
      key: `question-${item.lemma}`,
      itemId: `word.fi.m1.${lessonSerial}`,
      conceptId: `concept.fi.m1.${lessonSerial}`,
      lexicalEntryId: `lex.fi.${item.lemma}`,
      lemma: item.lemma,
      partOfSpeech: 'noun',
      gloss: item.gloss,
      example: {
        target: `Tämä on ${item.lemma}.`,
        source: { ru: `Это ${item.gloss}.` },
      },
      semanticTypes: ['communication-domain', item.semanticType, 'countable'],
      singular: item.lemma,
      plural: item.partitive,
      sourceSingular: item.gloss,
      sourcePlural: item.gloss,
      forms: [
        lexicalForm(lessonSerial, 'nominative-sg', item.lemma, {
          case: 'nominative',
          number: 'singular',
        }),
        lexicalForm(lessonSerial, 'genitive-sg', item.genitive, {
          case: 'genitive',
          number: 'singular',
        }),
        lexicalForm(lessonSerial, 'partitive-sg', item.partitive, {
          case: 'partitive',
          number: 'singular',
        }),
      ],
    }
  },
)

export const questionsWordOrderExercises = buildExercises()

export const questionsWordOrderGoldenExerciseIds = [
  'exercise.fi.questions.yes-no.001',
  'exercise.fi.questions.negative.001',
  'exercise.fi.questions.existential.001',
  'exercise.fi.questions.absent.001',
  'exercise.fi.questions.location.001',
] as const

function buildExercises(): PreparedExerciseSeed[] {
  const exercises: PreparedExerciseSeed[] = []

  addGroup(0, PRESENT_QUESTION_SKILL_ID, 'yes-no', (item) => ({
    prompt: `Это ${item.gloss}?`,
    targetText: `Onko tämä ${item.lemma}?`,
    acceptedVariants: [`Onko tämä ${item.lemma}?`],
    slots: [
      skillSlot('questionVerb', ['onko'], PRESENT_QUESTION_SKILL_ID),
      skillSlot('subject', ['tämä'], PRESENT_QUESTION_SKILL_ID),
      vocabularySlot('predicate', [item.lemma], PRESENT_QUESTION_SKILL_ID),
    ],
  }))
  addGroup(12, PRESENT_NEGATIVE_SKILL_ID, 'negative', (item) => ({
    prompt: `Это не ${item.gloss}.`,
    targetText: `Tämä ei ole ${item.lemma}.`,
    acceptedVariants: [
      `Tämä ei ole ${item.lemma}.`,
      `Se ei ole ${item.lemma}.`,
    ],
    slots: [
      skillSlot('subject', ['tämä', 'se'], PRESENT_NEGATIVE_SKILL_ID),
      skillSlot('negativeVerb', ['ei'], PRESENT_NEGATIVE_SKILL_ID),
      skillSlot('mainVerb', ['ole'], PRESENT_NEGATIVE_SKILL_ID),
      vocabularySlot('predicate', [item.lemma], PRESENT_NEGATIVE_SKILL_ID),
    ],
  }))
  addGroup(24, WORD_ORDER_SKILL_ID, 'existential', (item) => ({
    prompt: `Здесь есть ${item.gloss}.`,
    targetText: `Tässä on ${item.lemma}.`,
    acceptedVariants: [`Tässä on ${item.lemma}.`, `Täällä on ${item.lemma}.`],
    slots: [
      skillSlot('place', ['tässä', 'täällä'], WORD_ORDER_SKILL_ID),
      skillSlot('mainVerb', ['on'], WORD_ORDER_SKILL_ID),
      vocabularySlot('subject', [item.lemma], WORD_ORDER_SKILL_ID),
    ],
  }))
  addGroup(10, PRESENT_NEGATIVE_SKILL_ID, 'absent', (item) => ({
    prompt: `${capitalize(item.gloss)} не здесь.`,
    targetText: `${capitalize(item.lemma)} ei ole tässä.`,
    acceptedVariants: [
      `${capitalize(item.lemma)} ei ole tässä.`,
      `${capitalize(item.lemma)} ei ole täällä.`,
    ],
    slots: [
      vocabularySlot('subject', [item.lemma], PRESENT_NEGATIVE_SKILL_ID),
      skillSlot('negativeVerb', ['ei'], PRESENT_NEGATIVE_SKILL_ID),
      skillSlot('mainVerb', ['ole'], PRESENT_NEGATIVE_SKILL_ID),
      skillSlot('place', ['tässä', 'täällä'], PRESENT_NEGATIVE_SKILL_ID),
    ],
  }))
  addGroup(22, PRESENT_QUESTION_SKILL_ID, 'location', (item) => ({
    prompt: `${capitalize(item.gloss)} здесь?`,
    targetText: `Onko ${item.lemma} tässä?`,
    acceptedVariants: [
      `Onko ${item.lemma} tässä?`,
      `Onko ${item.lemma} täällä?`,
    ],
    slots: [
      skillSlot('questionVerb', ['onko'], PRESENT_QUESTION_SKILL_ID),
      vocabularySlot('subject', [item.lemma], PRESENT_QUESTION_SKILL_ID),
      skillSlot('place', ['tässä', 'täällä'], PRESENT_QUESTION_SKILL_ID),
    ],
  }))

  if (exercises.length !== 60) {
    throw new Error(
      `Questions lesson must contain 60 exercises, received ${exercises.length}`,
    )
  }
  return exercises

  function addGroup(
    start: number,
    skillId: string,
    category: string,
    create: (
      item: CommunicationNounSeed,
    ) => Pick<
      PreparedExerciseSeed,
      'prompt' | 'targetText' | 'acceptedVariants' | 'slots'
    >,
  ) {
    Array.from({ length: 12 }, (_, offset) => {
      const vocabularyIndex = (start + offset) % nouns.length
      const item = nouns[vocabularyIndex]!
      const vocabulary = questionsWordOrderVocabulary[vocabularyIndex]!
      const values = create(item)
      exercises.push({
        id: `exercise.fi.questions.${category}.${serial(offset)}`,
        selectionOrder: exercises.length + 1,
        ...values,
        primaryItemId: skillId,
        secondaryItemIds: [],
        vocabularyItemId: vocabulary.itemId,
        slots: values.slots.map((slot) =>
          slot.role === 'predicate' || slot.role === 'subject'
            ? {
                ...slot,
                itemIds: slot.itemIds.includes(vocabulary.itemId)
                  ? slot.itemIds
                  : slot.itemIds,
              }
            : slot,
        ),
      })
    })
  }
}

function noun(
  lemma: string,
  gloss: string,
  genitive: string,
  partitive: string,
  semanticType: string,
): CommunicationNounSeed {
  return { lemma, gloss, genitive, partitive, semanticType }
}

function lexicalForm(
  lessonSerial: string,
  key: string,
  surface: string,
  features: Record<string, string>,
) {
  return { id: `form.fi.m1.${lessonSerial}.${key}`, surface, features }
}

function skillSlot(role: string, accepted: string[], skillId: string) {
  return { role, accepted, itemIds: [skillId] }
}

function vocabularySlot(role: string, accepted: string[], skillId: string) {
  const item = nouns.find((candidate) => accepted.includes(candidate.lemma))
  if (!item)
    throw new Error(`Vocabulary slot has no noun for ${accepted.join(', ')}`)
  const vocabularyIndex = nouns.indexOf(item)
  return {
    role,
    accepted,
    itemIds: [skillId, questionsWordOrderVocabulary[vocabularyIndex]!.itemId],
  }
}

function serial(index: number) {
  return String(index + 1).padStart(3, '0')
}

function capitalize(value: string) {
  return `${value.charAt(0).toLocaleUpperCase('ru')}${value.slice(1)}`
}
