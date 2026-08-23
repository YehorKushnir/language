import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './fi.olla.basics.js'

export const GENITIVE_POSSESSION_SKILL_ID = 'grammar.fi.genitive.possession'
export const MINULLA_ON_SKILL_ID = 'grammar.fi.possession.minulla-on'
export const POSSESSION_NEGATIVE_SKILL_ID = 'grammar.fi.possession.negative'

export const genitivePossessionSkills: CourseSkillSeed[] = [
  {
    id: GENITIVE_POSSESSION_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Генитив и принадлежность' },
    description: { ru: 'Владелец в генитиве перед принадлежащим предметом.' },
    prerequisiteSkillIds: ['grammar.fi.infinitive.chains'],
  },
  {
    id: MINULLA_ON_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Конструкция minulla on' },
    description: { ru: 'Обладание через адессив владельца и olla.' },
    prerequisiteSkillIds: [GENITIVE_POSSESSION_SKILL_ID],
  },
  {
    id: POSSESSION_NEGATIVE_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Отрицание обладания' },
    description: { ru: 'Minulla ei ole и предмет в партитиве.' },
    prerequisiteSkillIds: [MINULLA_ON_SKILL_ID],
  },
]

export const genitivePossessionContent: CourseLessonContentSeed = {
  version: 2,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'genitive-owner',
      eyebrow: { ru: 'Принадлежность' },
      title: { ru: 'Владелец получает окончание -n' },
      paragraphs: [
        {
          ru: 'Финский генитив отвечает на вопрос kenen — «чей». Владелец стоит перед предметом: äidin koti, naapurin asunto.',
        },
        {
          ru: 'Окончание добавляется к падежной основе, поэтому форма не всегда равна lemma + n: lapsi → lapsen, veli → veljen.',
        },
      ],
      examples: [
        { target: 'äidin koti', source: { ru: 'дом матери' } },
        { target: 'veljen huone', source: { ru: 'комната брата' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Образуй генитив: isä → ___' },
          answer: 'isän',
          explanation: { ru: 'К основе isä- добавляется -n.' },
        },
      ],
    },
    {
      id: 'genitive-forms',
      eyebrow: { ru: 'Формы' },
      title: { ru: 'Частые модели генитива' },
      paragraphs: [
        {
          ru: 'Прозрачные слова получают -n напрямую, но чередование и изменение основы нужно учитывать. Учи lemma вместе с генитивом.',
        },
      ],
      table: {
        headers: [{ ru: 'Модель' }, { ru: 'Nominatiivi' }, { ru: 'Genetiivi' }],
        rows: [
          [{ ru: '+ n' }, { ru: 'isä' }, { ru: 'isän' }],
          [{ ru: 'слабая ступень' }, { ru: 'koti' }, { ru: 'kodin' }],
          [{ ru: 'основа e' }, { ru: 'huone' }, { ru: 'huoneen' }],
          [{ ru: 'изменение основы' }, { ru: 'lapsi' }, { ru: 'lapsen' }],
        ],
      },
      examples: [
        { target: 'kodin avain', source: { ru: 'ключ от дома' } },
        { target: 'lapsen huone', source: { ru: 'комната ребёнка' } },
      ],
    },
    {
      id: 'minulla-on',
      eyebrow: { ru: 'Обладание' },
      title: { ru: '«У меня есть» — minulla on' },
      paragraphs: [
        {
          ru: 'В финском нет отдельного глагола «иметь». Владелец ставится в форме на -lla/-llä, затем используется on: minulla on asunto.',
        },
        {
          ru: 'Форма on остаётся одинаковой даже с meillä, teillä и heillä: meillä on koti.',
        },
      ],
      table: {
        headers: [{ ru: 'Кто' }, { ru: 'Форма владельца' }, { ru: 'Пример' }],
        rows: [
          [{ ru: 'я' }, { ru: 'minulla' }, { ru: 'Minulla on avain.' }],
          [{ ru: 'ты' }, { ru: 'sinulla' }, { ru: 'Sinulla on asunto.' }],
          [{ ru: 'он / она' }, { ru: 'hänellä' }, { ru: 'Hänellä on perhe.' }],
          [{ ru: 'мы' }, { ru: 'meillä' }, { ru: 'Meillä on koti.' }],
        ],
      },
      examples: [
        { target: 'Minulla on avain.', source: { ru: 'У меня есть ключ.' } },
        { target: 'Heillä on asunto.', source: { ru: 'У них есть квартира.' } },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Вставь владельца: ___ on koti. (у нас)' },
          answer: 'Meillä',
          explanation: { ru: 'Местоимению me соответствует форма meillä.' },
        },
      ],
    },
    {
      id: 'possession-negative-question',
      eyebrow: { ru: 'Отрицание и вопрос' },
      title: { ru: 'Minulla ei ole и onko sinulla' },
      paragraphs: [
        {
          ru: 'В отрицании используется ei ole, а предмет обычно переходит в партитив: minulla ei ole autoa. В вопросе on получает частицу -ko и ставится первым.',
        },
      ],
      examples: [
        {
          target: 'Minulla ei ole avainta.',
          source: { ru: 'У меня нет ключа.' },
        },
        {
          target: 'Onko sinulla parveke?',
          source: { ru: 'У тебя есть балкон?' },
        },
      ],
      quickChecks: [
        {
          prompt: { ru: 'Заверши отрицание: Minulla ei ole ___ (ключ).' },
          answer: 'avainta',
          explanation: {
            ru: 'В отрицании предмет стоит в партитиве: avainta.',
          },
        },
      ],
    },
    {
      id: 'possession-meaning',
      eyebrow: { ru: 'Смысл' },
      title: { ru: 'Принадлежность и наличие — разные модели' },
      paragraphs: [
        {
          ru: 'Генитив называет связь между двумя существительными: äidin koti. Конструкция minulla on сообщает, что у кого-то что-то есть: äidillä on koti.',
        },
      ],
      examples: [
        { target: 'Tämä on äidin koti.', source: { ru: 'Это дом матери.' } },
        { target: 'Äidillä on koti.', source: { ru: 'У матери есть дом.' } },
      ],
    },
    {
      id: 'possession-register-errors',
      eyebrow: { ru: 'Контроль' },
      title: { ru: 'Типичные ошибки и puhekieli' },
      paragraphs: [
        {
          ru: 'Типичная ошибка — переводить русский глагол буквально: minä olen asunto. Для обладания нужен владелец на -lla/-llä: minulla on asunto.',
        },
        {
          ru: 'В puhekieli minulla и sinulla часто сокращаются до mulla и sulla: mul on, sul on. В kirjakieli используй полные minulla on и sinulla on.',
        },
      ],
      examples: [
        {
          target: 'Mul on avain.',
          source: { ru: 'У меня есть ключ.' },
          note: { ru: 'Kirjakieli: Minulla on avain.' },
        },
        {
          target: 'Sul ei oo parveketta.',
          source: { ru: 'У тебя нет балкона.' },
          note: { ru: 'Kirjakieli: Sinulla ei ole parveketta.' },
        },
      ],
      callout: {
        ru: 'Сначала реши: ты называешь владельца предмета или сообщаешь о наличии.',
      },
    },
  ],
}

const nouns = [
  ['perhe', 'семья', 'семьи', 'perheen', 'perhettä'],
  ['äiti', 'мать', 'матери', 'äidin', 'äitiä'],
  ['isä', 'отец', 'отца', 'isän', 'isää'],
  ['veli', 'брат', 'брата', 'veljen', 'veljeä'],
  ['sisko', 'сестра', 'сестры', 'siskon', 'siskoa'],
  ['lapsi', 'ребёнок', 'ребёнка', 'lapsen', 'lasta'],
  ['vauva', 'младенец', 'младенца', 'vauvan', 'vauvaa'],
  ['vanhempi', 'родитель', 'родителя', 'vanhemman', 'vanhempaa'],
  ['isoäiti', 'бабушка', 'бабушки', 'isoäidin', 'isoäitiä'],
  ['isoisä', 'дедушка', 'дедушки', 'isoisän', 'isoisää'],
  ['aviomies', 'муж', 'мужа', 'aviomiehen', 'aviomiestä'],
  ['vaimo', 'жена', 'жены', 'vaimon', 'vaimoa'],
  ['naapuri', 'сосед', 'соседа', 'naapurin', 'naapuria'],
  ['koti', 'дом', 'дома', 'kodin', 'kotia'],
  ['asunto', 'квартира', 'квартиры', 'asunnon', 'asuntoa'],
  ['huone', 'комната', 'комнаты', 'huoneen', 'huonetta'],
  ['keittiö', 'кухня', 'кухни', 'keittiön', 'keittiötä'],
  ['makuuhuone', 'спальня', 'спальни', 'makuuhuoneen', 'makuuhuonetta'],
  ['kylpyhuone', 'ванная', 'ванной', 'kylpyhuoneen', 'kylpyhuonetta'],
  ['olohuone', 'гостиная', 'гостиной', 'olohuoneen', 'olohuonetta'],
  ['parveke', 'балкон', 'балкона', 'parvekkeen', 'parveketta'],
  ['piha', 'двор', 'двора', 'pihan', 'pihaa'],
  ['avain', 'ключ', 'ключа', 'avaimen', 'avainta'],
  ['ovi', 'дверь', 'двери', 'oven', 'ovea'],
  ['ikkuna', 'окно', 'окна', 'ikkunan', 'ikkunaa'],
  ['vuokra', 'аренда', 'аренды', 'vuokran', 'vuokraa'],
] as const

interface PossessionVocabulary extends LessonVocabularySeed {
  sourceGenitive: string
  genitive: string
  partitive: string
}

export const genitivePossessionVocabulary: PossessionVocabulary[] = nouns.map(
  ([lemma, gloss, sourceGenitive, genitive, partitive], index) => {
    const serial = `08.${String(index + 1).padStart(2, '0')}`
    return {
      key: `possession-${lemma}`,
      itemId: `word.fi.m1.${serial}`,
      conceptId: `concept.fi.m1.${serial}`,
      lexicalEntryId: `lex.fi.${lemma}`,
      lemma,
      partOfSpeech: 'noun',
      gloss,
      sourceGenitive,
      genitive,
      partitive,
      example: {
        target: `Minulla on ${lemma}.`,
        source: { ru: `У меня есть ${gloss}.` },
      },
      semanticTypes: ['noun', 'possession-domain', 'countable'],
      singular: lemma,
      plural: genitive,
      sourceSingular: gloss,
      sourcePlural: sourceGenitive,
      forms: [
        lexicalForm(serial, 'nominative-sg', lemma, {
          case: 'nominative',
          number: 'singular',
        }),
        lexicalForm(serial, 'genitive-sg', genitive, {
          case: 'genitive',
          number: 'singular',
        }),
        lexicalForm(serial, 'partitive-sg', partitive, {
          case: 'partitive',
          number: 'singular',
        }),
      ],
    }
  },
)

export const genitivePossessionExercises: PreparedExerciseSeed[] = [
  ...group('word', 0, 26, genitivePhrase),
  ...group('context', 26, 12, (index) => possession(index, 'minulla')),
  ...group('context', 38, 8, (index) =>
    possession(index + 12, 'sinulla', true),
  ),
  ...group('context', 46, 8, (index) => negativePossession(index + 4)),
  ...group('pair', 54, 6, (index) => possessionQuestion(index + 15)),
]

export const genitivePossessionGoldenExerciseIds = [
  'exercise.fi.genitive.possession.word.1',
  'exercise.fi.genitive.possession.word.2',
  'exercise.fi.genitive.possession.context.1',
  'exercise.fi.genitive.possession.context.21',
  'exercise.fi.genitive.possession.pair.1',
] as const

function genitivePhrase(index: number) {
  const owner = genitivePossessionVocabulary[index]!
  const possessed = genitivePossessionVocabulary[(index + 5) % nouns.length]!
  const targetText = `Tämä on ${owner.genitive} ${possessed.lemma}.`
  return exercise(owner, {
    prompt: `Это ${possessed.gloss} ${owner.sourceGenitive}.`,
    targetText,
    acceptedVariants: [
      targetText,
      `Se on ${owner.genitive} ${possessed.lemma}.`,
    ],
    slots: [
      grammarSlot('demonstrative', ['tämä', 'se']),
      grammarSlot('copula', ['on']),
      vocabularySlot('genitiveOwner', owner.genitive, owner.itemId),
      vocabularySlot('possessed', possessed.lemma, possessed.itemId),
    ],
    secondaryItemIds: [possessed.itemId],
  })
}

function possession(
  index: number,
  possessor: 'minulla' | 'sinulla',
  withAdverb = false,
) {
  const vocabulary = genitivePossessionVocabulary[index % nouns.length]!
  const subject = possessor === 'minulla' ? 'меня' : 'тебя'
  const targetText = `${withAdverb ? 'Nyt ' : ''}${capitalize(possessor)} on ${vocabulary.lemma}.`
  return exercise(vocabulary, {
    prompt: `${withAdverb ? 'Сейчас у' : 'У'} ${subject} есть ${vocabulary.gloss}.`,
    targetText,
    acceptedVariants: [targetText],
    slots: [
      ...(withAdverb
        ? [grammarSlot('adverb', ['nyt'], MINULLA_ON_SKILL_ID)]
        : []),
      grammarSlot('possessor', [possessor], MINULLA_ON_SKILL_ID),
      grammarSlot('copula', ['on'], MINULLA_ON_SKILL_ID),
      vocabularySlot('possessed', vocabulary.lemma, vocabulary.itemId),
    ],
    secondaryItemIds: [MINULLA_ON_SKILL_ID],
  })
}

function negativePossession(index: number) {
  const vocabulary = genitivePossessionVocabulary[index % nouns.length]!
  const targetText = `Minulla ei ole ${vocabulary.partitive}.`
  return exercise(vocabulary, {
    prompt: `У меня нет ${vocabulary.sourceGenitive}.`,
    targetText,
    acceptedVariants: [targetText, `Ei ole ${vocabulary.partitive}.`],
    slots: [
      grammarSlot('possessor', ['minulla'], POSSESSION_NEGATIVE_SKILL_ID, true),
      grammarSlot('negativeVerb', ['ei'], POSSESSION_NEGATIVE_SKILL_ID),
      grammarSlot('copula', ['ole'], POSSESSION_NEGATIVE_SKILL_ID),
      vocabularySlot(
        'partitivePossessed',
        vocabulary.partitive,
        vocabulary.itemId,
      ),
    ],
    secondaryItemIds: [POSSESSION_NEGATIVE_SKILL_ID],
  })
}

function possessionQuestion(index: number) {
  const vocabulary = genitivePossessionVocabulary[index % nouns.length]!
  const targetText = `Onko sinulla ${vocabulary.lemma}?`
  return exercise(vocabulary, {
    prompt: `У тебя есть ${vocabulary.gloss}?`,
    targetText,
    acceptedVariants: [targetText],
    slots: [
      grammarSlot('questionCopula', ['onko'], MINULLA_ON_SKILL_ID),
      grammarSlot('possessor', ['sinulla'], MINULLA_ON_SKILL_ID),
      vocabularySlot('possessed', vocabulary.lemma, vocabulary.itemId),
    ],
    secondaryItemIds: [MINULLA_ON_SKILL_ID],
  })
}

function exercise(
  vocabulary: PossessionVocabulary,
  input: {
    prompt: string
    targetText: string
    acceptedVariants: string[]
    slots: PreparedExerciseSeed['slots']
    secondaryItemIds: string[]
  },
): Omit<PreparedExerciseSeed, 'id' | 'selectionOrder'> {
  return {
    ...input,
    primaryItemId: GENITIVE_POSSESSION_SKILL_ID,
    vocabularyItemId: vocabulary.itemId,
  }
}

function grammarSlot(
  role: string,
  accepted: string[],
  secondarySkillId?: string,
  optional = false,
) {
  return {
    role,
    accepted,
    itemIds: [
      GENITIVE_POSSESSION_SKILL_ID,
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
  const offset = category === 'word' ? 0 : category === 'context' ? 26 : 54
  return Array.from({ length: count }, (_, index) => ({
    id: `exercise.fi.genitive.possession.${category}.${start + index - offset + 1}`,
    selectionOrder: start + index + 1,
    ...create(index),
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
