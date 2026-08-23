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
  version: 4,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'sentence-types-overview',
      title: { ru: 'Четыре основные модели предложения' },
      paragraphs: [
        {
          ru: 'Сначала определи задачу предложения: сообщить факт, отрицать его, задать общий вопрос или запросить конкретную информацию. У каждой задачи своя опорная модель.',
        },
        {
          ru: 'В утверждении сохраняется прямой порядок. В отрицании появляется личная форма ei. Общий вопрос начинается с формы на -ko/-kö, а специальный — с вопросительного слова.',
        },
      ],
      table: {
        headers: [{ ru: 'Задача' }, { ru: 'Модель' }, { ru: 'Пример' }],
        rows: [
          [{ ru: 'утверждение' }, { ru: 'кто + глагол' }, { ru: 'Hän puhuu.' }],
          [
            { ru: 'отрицание' },
            { ru: 'кто + ei + глагол' },
            { ru: 'Hän ei puhu.' },
          ],
          [
            { ru: 'общий вопрос' },
            { ru: 'глагол-ko/-kö + кто' },
            { ru: 'Puhuuko hän?' },
          ],
          [
            { ru: 'специальный вопрос' },
            { ru: 'вопросительное слово + фраза' },
            { ru: 'Kuka hän on?' },
          ],
        ],
      },
      examples: [
        { target: 'Tämä on vastaus.', source: { ru: 'Это ответ.' } },
        { target: 'Tämä ei ole vastaus.', source: { ru: 'Это не ответ.' } },
        { target: 'Onko tämä vastaus?', source: { ru: 'Это ответ?' } },
        { target: 'Mikä tämä on?', source: { ru: 'Что это?' } },
      ],
    },
    {
      id: 'present-negative',
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
        headers: [{ ru: 'Лицо' }, { ru: 'puhua' }, { ru: 'olla' }],
        rows: [
          [{ ru: 'minä' }, { ru: 'en puhu' }, { ru: 'en ole' }],
          [{ ru: 'sinä' }, { ru: 'et puhu' }, { ru: 'et ole' }],
          [{ ru: 'hän' }, { ru: 'ei puhu' }, { ru: 'ei ole' }],
          [{ ru: 'me' }, { ru: 'emme puhu' }, { ru: 'emme ole' }],
          [{ ru: 'te' }, { ru: 'ette puhu' }, { ru: 'ette ole' }],
          [{ ru: 'he' }, { ru: 'eivät puhu' }, { ru: 'eivät ole' }],
        ],
      },
      examples: [
        { target: 'Minä en puhu.', source: { ru: 'Я не говорю.' } },
        { target: 'Hän ei kirjoita.', source: { ru: 'Он или она не пишет.' } },
        { target: 'Me emme ole kotona.', source: { ru: 'Мы не дома.' } },
      ],
    },
    {
      id: 'yes-no-question',
      title: { ru: 'Общий вопрос начинается с -ko/-kö' },
      paragraphs: [
        {
          ru: 'Чтобы спросить, верно ли всё предложение, перенеси личную форму глагола в начало и присоедини к ней -ko/-kö: Sinä puhut → Puhutko sinä?',
        },
        {
          ru: 'Если в слове есть a, o или u, выбирай -ko. Если есть только ä, ö, y и нейтральные e, i, выбирай -kö. Частица является частью первого слова и не добавляется второй раз.',
        },
      ],
      table: {
        headers: [
          { ru: 'Утверждение' },
          { ru: 'Вопрос' },
          { ru: 'Почему частица' },
        ],
        rows: [
          [{ ru: 'Sinä puhut.' }, { ru: 'Puhutko sinä?' }, { ru: 'u → -ko' }],
          [{ ru: 'Hän kysyy.' }, { ru: 'Kysyykö hän?' }, { ru: 'y → -kö' }],
          [
            { ru: 'Tämä on vastaus.' },
            { ru: 'Onko tämä vastaus?' },
            { ru: 'o → -ko' },
          ],
        ],
      },
      examples: [
        { target: 'Puhutko suomea?', source: { ru: 'Ты говоришь по-фински?' } },
        { target: 'Kysyykö hän?', source: { ru: 'Он или она спрашивает?' } },
        { target: 'Onko tämä viesti?', source: { ru: 'Это сообщение?' } },
      ],
    },
    {
      id: 'question-words',
      title: { ru: 'Вопросительное слово уже обозначает вопрос' },
      paragraphs: [
        {
          ru: 'Mitä, mikä, kuka, missä, milloin и miksi сами показывают, какую информацию нужно назвать. Поэтому дополнительная частица -ko/-kö не требуется.',
        },
        {
          ru: 'После вопросительного слова используется обычный порядок членов фразы. Не копируй русскую инверсию механически: Missä puhelin on? — буквально «где телефон находится?».',
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
    },
    {
      id: 'spoken-questions',
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
        },
        {
          target: 'Ook sä kotona?',
          source: { ru: 'Ты дома?' },
        },
      ],
    },
    {
      id: 'negative-question-errors',
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
        },
        {
          target: 'Onko tämä virhe?',
          source: { ru: 'Это ошибка?' },
        },
        {
          target: 'Missä vastaus on?',
          source: { ru: 'Где ответ?' },
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
