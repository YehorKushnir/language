import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './fi.olla.basics.js'

export const PARTITIVE_FORMATION_SKILL_ID = 'grammar.fi.partitive.formation'
export const PARTITIVE_A_SKILL_ID = 'grammar.fi.partitive.formation.a'
export const PARTITIVE_TA_SKILL_ID = 'grammar.fi.partitive.formation.ta'
export const PARTITIVE_STEM_SKILL_ID = 'grammar.fi.partitive.formation.stem'

export const partitiveFormationSkills: CourseSkillSeed[] = [
  {
    id: PARTITIVE_FORMATION_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Образование партитива' },
    description: {
      ru: 'Выбор основы и окончания партитива единственного числа.',
    },
    prerequisiteSkillIds: ['grammar.fi.nouns.gradation'],
  },
  {
    id: PARTITIVE_A_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Партитив на -a/-ä' },
    description: { ru: 'Окончание после основы на одну краткую гласную.' },
    prerequisiteSkillIds: [PARTITIVE_FORMATION_SKILL_ID],
  },
  {
    id: PARTITIVE_TA_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Партитив на -ta/-tä' },
    description: {
      ru: 'Окончание после долгой гласной, дифтонга или согласного.',
    },
    prerequisiteSkillIds: [PARTITIVE_FORMATION_SKILL_ID],
  },
  {
    id: PARTITIVE_STEM_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Особая основа партитива' },
    description: { ru: 'Частотные изменения основы: vesi → vettä.' },
    prerequisiteSkillIds: [PARTITIVE_FORMATION_SKILL_ID],
  },
]

export const partitiveFormationContent: CourseLessonContentSeed = {
  version: 3,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'partitive-formation-overview',
      title: { ru: 'Как выбрать окончание партитива' },
      paragraphs: [
        {
          ru: 'У партитива нет одного окончания для всех слов. Выбор зависит от конца словарной формы и иногда требует другой основы. Таблица показывает основные модели этого урока.',
        },
        {
          ru: 'С едой и напитками партитив часто обозначает некоторое количество вещества: haluan leipää, juon vettä. Сначала выбери модель формы, затем проверь гармонию гласных.',
        },
      ],
      table: {
        headers: [{ ru: 'Конец слова' }, { ru: 'Модель' }, { ru: 'Пример' }],
        rows: [
          [
            { ru: 'одна гласная, кроме e' },
            { ru: '-a/-ä' },
            { ru: 'kala → kalaa' },
          ],
          [
            { ru: 'долгая гласная или дифтонг' },
            { ru: '-ta/-tä' },
            { ru: 'tee → teetä' },
          ],
          [
            { ru: 'согласная или -e' },
            { ru: 'основа + -ta/-tä' },
            { ru: 'huone → huonetta' },
          ],
          [{ ru: '-nen' }, { ru: '-sta/-stä' }, { ru: 'nainen → naista' }],
          [
            { ru: 'особая основа' },
            { ru: 'учить отдельно' },
            { ru: 'vesi → vettä' },
          ],
        ],
      },
      examples: [
        { target: 'Haluan leipää.', source: { ru: 'Я хочу хлеба.' } },
        { target: 'Juon vettä.', source: { ru: 'Я пью воду.' } },
        { target: 'Ostan kalaa.', source: { ru: 'Я покупаю рыбу.' } },
      ],
    },
    {
      id: 'partitive-endings',
      title: { ru: 'Когда добавлять -a/-ä и -ta/-tä' },
      paragraphs: [
        {
          ru: 'После одной конечной гласной, кроме e, обычно добавляется -a/-ä: kala + a → kalaa, leipä + ä → leipää. Две одинаковые гласные на границе основы и окончания принадлежат разным частям формы.',
        },
        {
          ru: 'После долгой гласной или дифтонга используется -ta/-tä. Слова на согласную и -e часто меняют основу, поэтому их лучше учить вместе с готовым партитивом.',
        },
      ],
      table: {
        headers: [{ ru: 'Конец слова' }, { ru: 'Окончание' }, { ru: 'Пример' }],
        rows: [
          [
            { ru: 'краткая гласная' },
            { ru: '-a/-ä' },
            { ru: 'maito → maitoa' },
          ],
          [{ ru: 'долгая гласная' }, { ru: '-ta/-tä' }, { ru: 'tee → teetä' }],
          [{ ru: 'дифтонг' }, { ru: '-ta/-tä' }, { ru: 'voi → voita' }],
          [{ ru: '-e' }, { ru: '-tta/-ttä' }, { ru: 'huone → huonetta' }],
          [
            { ru: 'согласная' },
            { ru: 'основа + -ta/-tä' },
            { ru: 'olut → olutta' },
          ],
        ],
      },
      examples: [
        { target: 'maitoa', source: { ru: 'молока' } },
        { target: 'teetä', source: { ru: 'чая' } },
      ],
    },
    {
      id: 'vowel-harmony',
      title: { ru: 'Гласные выбирают передний или задний вариант' },
      paragraphs: [
        {
          ru: 'Если в слове есть a, o или u, используется задний вариант -a/-ta. С ä, ö и y без задних гласных выбирается -ä/-tä.',
        },
      ],
      examples: [
        { target: 'kalaa', source: { ru: 'рыбы' } },
        { target: 'leipää', source: { ru: 'хлеба' } },
      ],
    },
    {
      id: 'partitive-stems',
      title: { ru: 'Частотные слова меняют основу' },
      paragraphs: [
        {
          ru: 'У vesi партитив vettä нельзя получить простым добавлением окончания. Подобные частотные формы нужно хранить как часть словарной парадигмы.',
        },
      ],
      examples: [
        { target: 'vesi → vettä', source: { ru: 'вода → воды' } },
        {
          target: 'appelsiini → appelsiinia',
          source: { ru: 'апельсин → апельсина' },
        },
      ],
    },
    {
      id: 'partitive-learning',
      title: { ru: 'Учи форму внутри короткой фразы' },
      paragraphs: [
        {
          ru: 'Фраза haluan + партитив одновременно закрепляет значение слова и его форму. После образования формы отдельно проверь гармонию гласных.',
        },
      ],
      examples: [
        { target: 'Ostan juustoa.', source: { ru: 'Я покупаю сыра.' } },
        { target: 'Haluatko kahvia?', source: { ru: 'Хочешь кофе?' } },
      ],
    },
    {
      id: 'partitive-formation-errors-register',
      title: { ru: 'Типичные ошибки и puhekieli' },
      paragraphs: [
        {
          ru: 'Типичные ошибки — выбрать -ta после краткой гласной или нарушить гармонию: maitoa, не maitota; leipää, не leipaa.',
        },
        {
          ru: 'В puhekieli некоторые конечные гласные звучат короче, но в письменной форме kirjakieli партитивное окончание сохраняется полностью.',
        },
      ],
      examples: [
        {
          target: 'Haluutsä kahvii?',
          source: { ru: 'Хочешь кофе?' },
        },
        {
          target: 'Mä ostan maitoa.',
          source: { ru: 'Я покупаю молоко.' },
        },
      ],
      callout: { ru: 'Проверяй: основа → тип окончания → гармония гласных.' },
    },
  ],
}

const nouns = [
  ['leipä', 'хлеб', 'хлеба', 'leipää', 'a'],
  ['maito', 'молоко', 'молока', 'maitoa', 'a'],
  ['vesi', 'вода', 'воды', 'vettä', 'stem'],
  ['kahvi', 'кофе', 'кофе', 'kahvia', 'a'],
  ['tee', 'чай', 'чая', 'teetä', 'ta'],
  ['mehu', 'сок', 'сока', 'mehua', 'a'],
  ['juusto', 'сыр', 'сыра', 'juustoa', 'a'],
  ['voi', 'масло', 'масла', 'voita', 'ta'],
  ['muna', 'яйцо', 'яйца', 'munaa', 'a'],
  ['kala', 'рыба', 'рыбы', 'kalaa', 'a'],
  ['liha', 'мясо', 'мяса', 'lihaa', 'a'],
  ['kana', 'курица', 'курицы', 'kanaa', 'a'],
  ['riisi', 'рис', 'риса', 'riisiä', 'a'],
  ['pasta', 'макароны', 'макарон', 'pastaa', 'a'],
  ['peruna', 'картофель', 'картофеля', 'perunaa', 'a'],
  ['tomaatti', 'помидор', 'помидора', 'tomaattia', 'a'],
  ['kurkku', 'огурец', 'огурца', 'kurkkua', 'a'],
  ['porkkana', 'морковь', 'моркови', 'porkkanaa', 'a'],
  ['sipuli', 'лук', 'лука', 'sipulia', 'a'],
  ['omena', 'яблоко', 'яблока', 'omenaa', 'a'],
  ['banaani', 'банан', 'банана', 'banaania', 'a'],
  ['appelsiini', 'апельсин', 'апельсина', 'appelsiinia', 'a'],
  ['mansikka', 'клубника', 'клубники', 'mansikkaa', 'a'],
  ['keitto', 'суп', 'супа', 'keittoa', 'a'],
  ['salaatti', 'салат', 'салата', 'salaattia', 'a'],
  ['kakku', 'торт', 'торта', 'kakkua', 'a'],
] as const

interface PartitiveVocabulary extends LessonVocabularySeed {
  partitive: string
  sourcePartitive: string
  pattern: string
}

export const partitiveFormationVocabulary: PartitiveVocabulary[] = nouns.map(
  ([lemma, gloss, sourcePartitive, partitive, pattern], index) => {
    const serial = `10.${String(index + 1).padStart(2, '0')}`
    return {
      key: `partitive-form-${lemma}`,
      itemId: `word.fi.m1.${serial}`,
      conceptId: `concept.fi.m1.${serial}`,
      lexicalEntryId: `lex.fi.${lemma}`,
      lemma,
      partOfSpeech: 'noun',
      gloss,
      partitive,
      sourcePartitive,
      pattern,
      example: {
        target: `Haluan ${partitive}.`,
        source: { ru: `Я хочу ${sourcePartitive}.` },
      },
      semanticTypes: [
        'food-or-drink',
        'partitive-compatible',
        `pattern:${pattern}`,
      ],
      singular: lemma,
      plural: partitive,
      sourceSingular: gloss,
      sourcePlural: sourcePartitive,
      forms: [
        form(serial, 'nominative-sg', lemma, {
          case: 'nominative',
          number: 'singular',
        }),
        form(serial, 'partitive-sg', partitive, {
          case: 'partitive',
          number: 'singular',
        }),
      ],
    }
  },
)

export const partitiveFormationExercises: PreparedExerciseSeed[] = [
  ...group('word', 0, 26, (index) => build(index, 'want')),
  ...group('context', 26, 10, (index) => build(index + 5, 'buy')),
  ...group('context', 36, 8, (index) => build(index + 12, 'negative')),
  ...group('context', 44, 8, (index) => build(index + 18, 'temporal')),
  ...group('pair', 52, 8, (index) => build(index + 3, 'question')),
]

export const partitiveFormationGoldenExerciseIds = [
  'exercise.fi.partitive.formation.word.1',
  'exercise.fi.partitive.formation.word.3',
  'exercise.fi.partitive.formation.context.1',
  'exercise.fi.partitive.formation.context.11',
  'exercise.fi.partitive.formation.pair.1',
] as const

type Frame = 'want' | 'buy' | 'negative' | 'temporal' | 'question'

function build(index: number, frame: Frame) {
  const vocabulary = partitiveFormationVocabulary[index % nouns.length]!
  const secondary =
    vocabulary.pattern === 'ta'
      ? PARTITIVE_TA_SKILL_ID
      : vocabulary.pattern === 'stem'
        ? PARTITIVE_STEM_SKILL_ID
        : PARTITIVE_A_SKILL_ID
  const frames: Record<
    Frame,
    {
      prompt: string
      target: string
      slots: PreparedExerciseSeed['slots']
      variants?: string[]
    }
  > = {
    want: {
      prompt: `Я хочу ${vocabulary.sourcePartitive}.`,
      target: `Minä haluan ${vocabulary.partitive}.`,
      variants: [`Haluan ${vocabulary.partitive}.`],
      slots: [
        grammarSlot('subject', ['minä'], secondary, true),
        grammarSlot('mainVerb', ['haluan'], secondary),
      ],
    },
    buy: {
      prompt: `Сегодня я покупаю ${vocabulary.sourcePartitive}.`,
      target: `Minä ostan tänään ${vocabulary.partitive}.`,
      variants: [`Ostan tänään ${vocabulary.partitive}.`],
      slots: [
        grammarSlot('subject', ['minä'], secondary, true),
        grammarSlot('mainVerb', ['ostan'], secondary),
        grammarSlot('adverb', ['tänään'], secondary),
      ],
    },
    negative: {
      prompt: `Я не хочу ${vocabulary.sourcePartitive}.`,
      target: `Minä en halua ${vocabulary.partitive}.`,
      variants: [`En halua ${vocabulary.partitive}.`],
      slots: [
        grammarSlot('subject', ['minä'], secondary, true),
        grammarSlot('negativeVerb', ['en'], secondary),
        grammarSlot('mainVerb', ['halua'], secondary),
      ],
    },
    temporal: {
      prompt: `Сейчас я хочу ${vocabulary.sourcePartitive}.`,
      target: `Nyt minä haluan ${vocabulary.partitive}.`,
      variants: [`Nyt haluan ${vocabulary.partitive}.`],
      slots: [
        grammarSlot('adverb', ['nyt'], secondary),
        grammarSlot('subject', ['minä'], secondary, true),
        grammarSlot('mainVerb', ['haluan'], secondary),
      ],
    },
    question: {
      prompt: `Ты хочешь ${vocabulary.sourcePartitive}?`,
      target: `Haluatko sinä ${vocabulary.partitive}?`,
      variants: [`Haluatko ${vocabulary.partitive}?`],
      slots: [
        grammarSlot('questionVerb', ['haluatko'], secondary),
        grammarSlot('subject', ['sinä'], secondary, true),
      ],
    },
  }
  const selected = frames[frame]
  return {
    prompt: selected.prompt,
    targetText: selected.target,
    acceptedVariants: [selected.target, ...(selected.variants ?? [])],
    slots: [...selected.slots, partitiveSlot(vocabulary, secondary)],
    primaryItemId: PARTITIVE_FORMATION_SKILL_ID,
    secondaryItemIds: [secondary],
    vocabularyItemId: vocabulary.itemId,
  }
}

function grammarSlot(
  role: string,
  accepted: string[],
  secondary: string,
  optional = false,
) {
  return {
    role,
    accepted,
    itemIds: [PARTITIVE_FORMATION_SKILL_ID, secondary],
    ...(optional ? { optional: true } : {}),
  }
}

function partitiveSlot(item: PartitiveVocabulary, secondary: string) {
  return {
    role: 'partitiveObject',
    accepted: [item.partitive],
    itemIds: [PARTITIVE_FORMATION_SKILL_ID, secondary, item.itemId],
  }
}

function group(
  category: 'word' | 'context' | 'pair',
  start: number,
  count: number,
  create: (
    index: number,
  ) => Omit<PreparedExerciseSeed, 'id' | 'selectionOrder'>,
) {
  const base = category === 'word' ? 0 : category === 'context' ? 26 : 52
  return Array.from({ length: count }, (_, index) => ({
    id: `exercise.fi.partitive.formation.${category}.${start + index - base + 1}`,
    selectionOrder: start + index + 1,
    ...create(index),
  }))
}

function form(
  serial: string,
  key: string,
  surface: string,
  features: Record<string, string>,
) {
  return { id: `form.fi.m1.${serial}.${key}`, surface, features }
}
