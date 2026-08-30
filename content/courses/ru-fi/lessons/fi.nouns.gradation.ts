import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './fi.olla.basics.js'

export const NOUNS_GRADATION_SKILL_ID = 'grammar.fi.nouns.gradation'
export const NOUNS_GRADATION_QUANTITATIVE_SKILL_ID =
  'grammar.fi.nouns.gradation.quantitative'
export const NOUNS_GRADATION_STEM_SKILL_ID = 'grammar.fi.nouns.gradation.stem'

export const nounsGradationSkills: CourseSkillSeed[] = [
  {
    id: NOUNS_GRADATION_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Падежная основа существительного' },
    description: { ru: 'Генитивная основа и чередование k, p, t в именах.' },
    prerequisiteSkillIds: ['grammar.fi.genitive.possession'],
  },
  {
    id: NOUNS_GRADATION_QUANTITATIVE_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Количественное чередование в именах' },
    description: { ru: 'Пары kk → k, pp → p и tt → t перед -n.' },
    prerequisiteSkillIds: [NOUNS_GRADATION_SKILL_ID],
  },
  {
    id: NOUNS_GRADATION_STEM_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Изменение именной основы' },
    description: { ru: 'Формы типа lautanen → lautasen и pyyhe → pyyhkeen.' },
    prerequisiteSkillIds: [NOUNS_GRADATION_SKILL_ID],
  },
]

export const nounsGradationContent: CourseLessonContentSeed = {
  version: 3,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'noun-stem-overview',
      title: { ru: 'Какие изменения происходят перед окончанием' },
      paragraphs: [
        {
          ru: 'Падежное окончание присоединяется не всегда к словарной форме, а к падежной основе. Генитив на -n помогает увидеть эту основу и основные типы изменений.',
        },
        {
          ru: 'Слово может остаться прозрачным, перейти в слабую ступень, изменить конец основы или измениться только в последней части сложного слова. Поэтому полезная словарная пара — nominatiivi + genetiivi.',
        },
      ],
      table: {
        headers: [
          { ru: 'Модель' },
          { ru: 'Словарная форма' },
          { ru: 'Генитив' },
          { ru: 'Что изменилось' },
        ],
        rows: [
          [
            { ru: 'прозрачная' },
            { ru: 'kirja' },
            { ru: 'kirjan' },
            { ru: '+ n' },
          ],
          [
            { ru: 'чередование' },
            { ru: 'lamppu' },
            { ru: 'lampun' },
            { ru: 'pp → p' },
          ],
          [
            { ru: 'новая основа' },
            { ru: 'lautanen' },
            { ru: 'lautasen' },
            { ru: '-nen → -se-' },
          ],
          [
            { ru: 'сложное слово' },
            { ru: 'tietokone' },
            { ru: 'tietokoneen' },
            { ru: 'изменяется kone' },
          ],
        ],
      },
      examples: [
        { target: 'kirja → kirjan', source: { ru: 'книга → книги' } },
        { target: 'lamppu → lampun', source: { ru: 'лампа → лампы' } },
        { target: 'lautanen → lautasen', source: { ru: 'тарелка → тарелки' } },
      ],
    },
    {
      id: 'noun-gradation-table',
      title: { ru: 'Сильная ступень становится слабой' },
      paragraphs: [
        {
          ru: 'В генитиве закрытый конечный слог часто вызывает слабую ступень. Двойной согласный сокращается, а некоторые одиночные согласные меняются качественно.',
        },
      ],
      table: {
        headers: [{ ru: 'Сильная' }, { ru: 'Слабая' }, { ru: 'Пара' }],
        rows: [
          [{ ru: 'pp' }, { ru: 'p' }, { ru: 'lamppu → lampun' }],
          [{ ru: 'kk' }, { ru: 'k' }, { ru: 'kaappi → kaapin' }],
          [{ ru: 'p' }, { ru: 'v' }, { ru: 'leipä → leivän' }],
          [{ ru: 't' }, { ru: 'd' }, { ru: 'pöytä → pöydän' }],
        ],
      },
      examples: [
        { target: 'lampun valo', source: { ru: 'свет лампы' } },
        { target: 'kaapin ovi', source: { ru: 'дверь шкафа' } },
      ],
    },
    {
      id: 'stem-changes',
      title: { ru: 'Не каждое изменение — чередование k, p, t' },
      paragraphs: [
        {
          ru: 'У слов на -nen появляется основа -se-: lautanen → lautasen. У некоторых слов на -e основа удлиняется: pyyhe → pyyhkeen. Эти модели нужно отличать от ступенчатого чередования.',
        },
      ],
      examples: [
        { target: 'lautanen → lautasen', source: { ru: 'тарелка → тарелки' } },
        { target: 'pyyhe → pyyhkeen', source: { ru: 'полотенце → полотенца' } },
      ],
    },
    {
      id: 'compound-nouns',
      title: { ru: 'Изменяется последняя часть сложного слова' },
      paragraphs: [
        {
          ru: 'В сложном существительном падежную форму получает последний компонент: tietokone → tietokoneen. Первая часть сохраняется.',
        },
      ],
      examples: [
        { target: 'tietokoneen näyttö', source: { ru: 'экран компьютера' } },
        { target: 'jääkaapin ovi', source: { ru: 'дверь холодильника' } },
      ],
    },
    {
      id: 'noun-form-strategy',
      title: { ru: 'Как выбирать основу без угадывания' },
      paragraphs: [
        {
          ru: 'Сначала найди знакомую модель окончания, затем проверь возможное чередование и только после этого добавляй -n. Если слово новое, запоминай его вместе с готовым генитивом.',
        },
      ],
      examples: [
        { target: 'kuppi → kupin', source: { ru: 'чашка → чашки' } },
        { target: 'laatikko → laatikon', source: { ru: 'коробка → коробки' } },
      ],
    },
    {
      id: 'noun-gradation-errors-register',
      title: { ru: 'Типичные ошибки и разговорная речь' },
      paragraphs: [
        {
          ru: 'Типичная ошибка — добавить -n прямо к сильной форме: lamppun вместо lampun, kaappin вместо kaapin. Обратная ошибка — ослабить согласный у слова, где чередования нет.',
        },
        {
          ru: 'В puhekieli отдельные окончания могут сокращаться, но основа остаётся узнаваемой. Для активного ответа используй формы kirjakieli: lampun, kaapin, lautasen.',
        },
      ],
      examples: [
        {
          target: 'tietsikan näyttö',
          source: { ru: 'экран компьютера' },
        },
        {
          target: 'telkkarin ääni',
          source: { ru: 'звук телевизора' },
        },
      ],
      callout: { ru: 'Учи не правило для буквы, а пару конкретных основ.' },
    },
  ],
}

const nouns = [
  ['kirja', 'книга', 'книги', 'kirjan', 'regular'],
  ['vihko', 'тетрадь', 'тетради', 'vihkon', 'regular'],
  ['kynä', 'ручка', 'ручки', 'kynän', 'regular'],
  ['paperi', 'бумага', 'бумаги', 'paperin', 'regular'],
  ['lamppu', 'лампа', 'лампы', 'lampun', 'quantitative'],
  ['kello', 'часы', 'часов', 'kellon', 'regular'],
  ['kuva', 'картина', 'картины', 'kuvan', 'regular'],
  ['peili', 'зеркало', 'зеркала', 'peilin', 'regular'],
  ['kaappi', 'шкаф', 'шкафа', 'kaapin', 'quantitative'],
  ['laatikko', 'коробка', 'коробки', 'laatikon', 'quantitative'],
  ['pullo', 'бутылка', 'бутылки', 'pullon', 'regular'],
  ['lasi', 'стакан', 'стакана', 'lasin', 'regular'],
  ['kuppi', 'чашка', 'чашки', 'kupin', 'quantitative'],
  ['lautanen', 'тарелка', 'тарелки', 'lautasen', 'stem'],
  ['lusikka', 'ложка', 'ложки', 'lusikan', 'quantitative'],
  ['haarukka', 'вилка', 'вилки', 'haarukan', 'quantitative'],
  ['veitsi', 'нож', 'ножа', 'veitsen', 'stem'],
  ['kattila', 'кастрюля', 'кастрюли', 'kattilan', 'regular'],
  ['pannu', 'сковорода', 'сковороды', 'pannun', 'regular'],
  ['pyyhe', 'полотенце', 'полотенца', 'pyyhkeen', 'stem'],
  ['saippua', 'мыло', 'мыла', 'saippuan', 'regular'],
  ['harja', 'щётка', 'щётки', 'harjan', 'regular'],
  ['kone', 'машина', 'машины', 'koneen', 'stem'],
  ['tietokone', 'компьютер', 'компьютера', 'tietokoneen', 'stem'],
  ['televisio', 'телевизор', 'телевизора', 'television', 'regular'],
  ['radio', 'радио', 'радио', 'radion', 'regular'],
] as const

interface NounGradationVocabulary extends LessonVocabularySeed {
  genitive: string
  sourceGenitive: string
  pattern: string
}

export const nounsGradationVocabulary: NounGradationVocabulary[] = nouns.map(
  ([lemma, gloss, sourceGenitive, genitive, pattern], index) => {
    const serial = `09.${String(index + 1).padStart(2, '0')}`
    return {
      key: `noun-stem-${lemma}`,
      itemId: `word.fi.m1.${serial}`,
      conceptId: `concept.fi.m1.${serial}`,
      lexicalEntryId: `lex.fi.${lemma}`,
      lemma,
      partOfSpeech: 'noun',
      gloss,
      genitive,
      sourceGenitive,
      pattern,
      example: { target: `Tämä on ${lemma}.`, source: { ru: `Это ${gloss}.` } },
      semanticTypes: ['object', 'noun-stem', `pattern:${pattern}`],
      singular: lemma,
      plural: genitive,
      sourceSingular: gloss,
      sourcePlural: sourceGenitive,
      forms: [
        form(serial, 'nominative-sg', lemma, {
          case: 'nominative',
          number: 'singular',
        }),
        form(serial, 'genitive-sg', genitive, {
          case: 'genitive',
          number: 'singular',
        }),
      ],
    }
  },
)

export const nounsGradationGoldenExerciseIds = [
  'exercise.fi.nouns.gradation.word.1',
  'exercise.fi.nouns.gradation.word.5',
  'exercise.fi.nouns.gradation.context.1',
  'exercise.fi.nouns.gradation.context.19',
  'exercise.fi.nouns.gradation.pair.1',
] as const

type Frame =
  'demonstrative' | 'possessive' | 'temporal' | 'negative' | 'question'

function phrase(index: number, frame: Frame) {
  const owner = nounsGradationVocabulary[index % nouns.length]!
  const possessed = nounComplements[index % nouns.length]!
  const grammarSkill =
    owner.pattern === 'quantitative'
      ? NOUNS_GRADATION_QUANTITATIVE_SKILL_ID
      : owner.pattern === 'stem'
        ? NOUNS_GRADATION_STEM_SKILL_ID
        : undefined
  const nounPhrase = `${owner.genitive} ${possessed.target}`
  const sourcePhrase = `${possessed.source} ${owner.sourceGenitive}`
  const frames: Record<
    Frame,
    {
      prompt: string
      target: string
      prefixSlots: PreparedExerciseSeed['slots']
      variants?: string[]
    }
  > = {
    demonstrative: {
      prompt: `Это ${sourcePhrase}.`,
      target: `Tämä on ${nounPhrase}.`,
      variants: [`Se on ${nounPhrase}.`],
      prefixSlots: [
        grammarSlot('demonstrative', ['tämä', 'se'], grammarSkill),
        grammarSlot('copula', ['on'], grammarSkill),
      ],
    },
    possessive: {
      prompt: `У меня есть ${sourcePhrase}.`,
      target: `Minulla on ${nounPhrase}.`,
      prefixSlots: [
        grammarSlot('possessor', ['minulla'], grammarSkill),
        grammarSlot('copula', ['on'], grammarSkill),
      ],
    },
    temporal: {
      prompt: `У меня также есть ${sourcePhrase}.`,
      target: `Minulla on myös ${nounPhrase}.`,
      prefixSlots: [
        grammarSlot('possessor', ['minulla'], grammarSkill),
        grammarSlot('copula', ['on'], grammarSkill),
        grammarSlot('adverb', ['myös'], grammarSkill),
      ],
    },
    negative: {
      prompt: `Это не ${sourcePhrase}.`,
      target: `Tämä ei ole ${nounPhrase}.`,
      prefixSlots: [
        grammarSlot('demonstrative', ['tämä'], grammarSkill),
        grammarSlot('negativeVerb', ['ei'], grammarSkill),
        grammarSlot('copula', ['ole'], grammarSkill),
      ],
    },
    question: {
      prompt: `Это ${sourcePhrase}?`,
      target: `Onko tämä ${nounPhrase}?`,
      variants: [`Onko se ${nounPhrase}?`],
      prefixSlots: [
        grammarSlot('questionCopula', ['onko'], grammarSkill),
        grammarSlot('demonstrative', ['tämä', 'se'], grammarSkill),
      ],
    },
  }
  const selected = frames[frame]
  return {
    prompt: selected.prompt,
    targetText: selected.target,
    acceptedVariants: [selected.target, ...(selected.variants ?? [])],
    slots: [
      ...selected.prefixSlots,
      vocabularySlot('genitiveOwner', owner.genitive, owner.itemId),
      grammarSlot('possessed', [possessed.target], grammarSkill),
    ],
    primaryItemId: NOUNS_GRADATION_SKILL_ID,
    secondaryItemIds: [...(grammarSkill ? [grammarSkill] : [])],
    vocabularyItemId: owner.itemId,
  }
}

const nounComplements = [
  { target: 'kansi', source: 'обложка' },
  { target: 'sivu', source: 'страница' },
  { target: 'väri', source: 'цвет' },
  { target: 'reuna', source: 'край' },
  { target: 'valo', source: 'свет' },
  { target: 'viisari', source: 'стрелка' },
  { target: 'väri', source: 'цвет' },
  { target: 'pinta', source: 'поверхность' },
  { target: 'ovi', source: 'дверь' },
  { target: 'kansi', source: 'крышка' },
  { target: 'korkki', source: 'пробка' },
  { target: 'reuna', source: 'край' },
  { target: 'kahva', source: 'ручка' },
  { target: 'reuna', source: 'край' },
  { target: 'varsi', source: 'ручка' },
  { target: 'piikki', source: 'зубец' },
  { target: 'terä', source: 'лезвие' },
  { target: 'kansi', source: 'крышка' },
  { target: 'kahva', source: 'ручка' },
  { target: 'väri', source: 'цвет' },
  { target: 'tuoksu', source: 'запах' },
  { target: 'varsi', source: 'ручка' },
  { target: 'osa', source: 'деталь' },
  { target: 'näyttö', source: 'экран' },
  { target: 'kaukosäädin', source: 'пульт' },
  { target: 'ääni', source: 'звук' },
] as const

export const nounsGradationExercises: PreparedExerciseSeed[] = [
  ...group('word', 0, 26, (index) => phrase(index, 'demonstrative')),
  ...group('context', 26, 10, (index) =>
    phrase([1, 5, 8, 9, 10, 12, 14, 16, 22, 24][index]!, 'possessive'),
  ),
  ...group('context', 36, 8, (index) => phrase(index + 11, 'temporal')),
  ...group('context', 44, 8, (index) => phrase(index + 17, 'negative')),
  ...group('pair', 52, 8, (index) => phrase(index + 2, 'question')),
]

function grammarSlot(role: string, accepted: string[], secondary?: string) {
  return {
    role,
    accepted,
    itemIds: [NOUNS_GRADATION_SKILL_ID, ...(secondary ? [secondary] : [])],
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
  const base = category === 'word' ? 0 : category === 'context' ? 26 : 52
  return Array.from({ length: count }, (_, index) => ({
    id: `exercise.fi.nouns.gradation.${category}.${start + index - base + 1}`,
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
