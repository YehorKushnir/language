import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type { LessonVocabularySeed } from './fi.olla.basics.js'
import { NUMERALS_QUANTITIES_SKILL_ID } from './fi.numerals.quantities.js'

export const PLURAL_PARTITIVE_FORMATION_SKILL_ID =
  'grammar.fi.plural.partitive.formation'
export const PLURAL_PARTITIVE_VOWEL_SKILL_ID =
  'grammar.fi.plural.partitive.formation.vowel'
export const PLURAL_PARTITIVE_STEM_SKILL_ID =
  'grammar.fi.plural.partitive.formation.stem'
export const PLURAL_PARTITIVE_DERIVED_SKILL_ID =
  'grammar.fi.plural.partitive.formation.derived'
export const PLURAL_PARTITIVE_SPECIAL_SKILL_ID =
  'grammar.fi.plural.partitive.formation.special'
export const PLURAL_PARTITIVE_CONTRAST_SKILL_ID =
  'grammar.fi.plural.partitive.formation.contrast'

export const pluralPartitiveFormationSkills: CourseSkillSeed[] = [
  {
    id: PLURAL_PARTITIVE_FORMATION_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Образование партитива множественного числа' },
    description: {
      ru: 'Формы taloja, koiria, vaatteita, ihmisiä и основные чередования основы.',
    },
    prerequisiteSkillIds: [NUMERALS_QUANTITIES_SKILL_ID],
  },
  {
    id: PLURAL_PARTITIVE_VOWEL_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Слова с гласной в конце' },
    description: {
      ru: 'Партитив множественного числа у слов типа talo, kissa, koira и hedelmä.',
    },
    prerequisiteSkillIds: [PLURAL_PARTITIVE_FORMATION_SKILL_ID],
  },
  {
    id: PLURAL_PARTITIVE_STEM_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Изменение основы перед -i-' },
    description: {
      ru: 'Формы типа mökkejä, eläimiä, vaatteita, lääkkeitä и keksejä.',
    },
    prerequisiteSkillIds: [PLURAL_PARTITIVE_FORMATION_SKILL_ID],
  },
  {
    id: PLURAL_PARTITIVE_DERIVED_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Производные основы' },
    description: {
      ru: 'Формы слов на -nen, -as/-äs, -us/-ys и -es: ihmisiä, vieraita, sormuksia.',
    },
    prerequisiteSkillIds: [PLURAL_PARTITIVE_FORMATION_SKILL_ID],
  },
  {
    id: PLURAL_PARTITIVE_SPECIAL_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Короткие особые основы' },
    description: {
      ru: 'Частотные формы miehiä, töitä и maita, которые удобно запомнить целиком.',
    },
    prerequisiteSkillIds: [PLURAL_PARTITIVE_FORMATION_SKILL_ID],
  },
  {
    id: PLURAL_PARTITIVE_CONTRAST_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Единственное или множественное число' },
    description: {
      ru: 'Сопоставление партитива единственного числа после точного количества и партитива множественного числа без точного числа.',
    },
    prerequisiteSkillIds: [PLURAL_PARTITIVE_FORMATION_SKILL_ID],
  },
]

export const pluralPartitiveFormationContent: CourseLessonContentSeed = {
  version: 1,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'plural-partitive-overview',
      title: { ru: 'Один падеж — две формы числа' },
      paragraphs: [
        {
          ru: 'У партитива есть единственное и множественное число. Kirjaa означает «книгу / книги» после точного числа, а kirjoja — неопределённое множество книг.',
        },
        {
          ru: 'Главный признак множественного числа внутри формы — элемент -i-. Он может менять соседние гласные и основу слова, поэтому форму лучше учить вместе со словом.',
        },
      ],
      table: {
        headers: [{ ru: 'Контекст' }, { ru: 'Форма' }, { ru: 'Пример' }],
        rows: [
          [
            { ru: 'точно два' },
            { ru: 'партитив ед. ч.' },
            { ru: 'kaksi kirjaa' },
          ],
          [
            { ru: 'неопределённые предметы' },
            { ru: 'партитив мн. ч.' },
            { ru: 'kirjoja' },
          ],
          [
            { ru: 'много предметов' },
            { ru: 'партитив мн. ч.' },
            { ru: 'paljon kirjoja' },
          ],
        ],
      },
      examples: [
        {
          target: 'Pöydällä on kaksi keksiä.',
          source: { ru: 'На столе два печенья.' },
        },
        {
          target: 'Pöydällä on keksejä.',
          source: { ru: 'На столе есть печенье.' },
        },
        {
          target: 'Hän ostaa paljon hedelmiä.',
          source: { ru: 'Она покупает много фруктов.' },
        },
      ],
    },
    {
      id: 'plural-partitive-vowel-stems',
      title: { ru: 'Гласная основа: taloja, koiria, hedelmiä' },
      paragraphs: [
        {
          ru: 'У многих слов на -o/-ö, -u/-y появляется -ja/-jä: talo → taloja, lelu → leluja. У слов на -a/-ä перед показателем множественного числа гласная может исчезнуть или измениться.',
        },
        {
          ru: 'Сравни kissa → kissoja, koira → koiria, sukka → sukkia и hedelmä → hedelmiä. Одного окончания недостаточно: важно видеть всю изменившуюся основу.',
        },
      ],
      table: {
        headers: [
          { ru: 'Слово' },
          { ru: 'Множественная основа' },
          { ru: 'Форма' },
        ],
        rows: [
          [{ ru: 'talo' }, { ru: 'talo-i-' }, { ru: 'taloja' }],
          [{ ru: 'kissa' }, { ru: 'kisso-i-' }, { ru: 'kissoja' }],
          [{ ru: 'koira' }, { ru: 'koir-i-' }, { ru: 'koiria' }],
          [{ ru: 'hedelmä' }, { ru: 'hedelm-i-' }, { ru: 'hedelmiä' }],
        ],
      },
      examples: [
        { target: 'Näen taloja.', source: { ru: 'Я вижу дома.' } },
        {
          target: 'Puistossa on koiria.',
          source: { ru: 'В парке есть собаки.' },
        },
        {
          target: 'He syövät marjoja.',
          source: { ru: 'Они едят ягоды.' },
        },
        {
          target: 'Huoneessa on leluja.',
          source: { ru: 'В комнате есть игрушки.' },
        },
      ],
    },
    {
      id: 'plural-partitive-changing-stems',
      title: { ru: 'Основы на -i и -e меняются по-разному' },
      paragraphs: [
        {
          ru: 'У слов на -i результат зависит от типа основы: lehti → lehtiä, mökki → mökkejä, eläin → eläimiä, keksi → keksejä. Эти пары нужно запоминать как модели.',
        },
        {
          ru: 'Слова на -e обычно имеют сильную основу: vaate → vaatteita, lääke → lääkkeitä. У hame форма hameita сохраняет одну согласную.',
        },
      ],
      table: {
        headers: [
          { ru: 'Тип' },
          { ru: 'Единственное число' },
          { ru: 'Партитив мн. ч.' },
        ],
        rows: [
          [{ ru: '-i' }, { ru: 'mökki' }, { ru: 'mökkejä' }],
          [{ ru: '-i' }, { ru: 'keksi' }, { ru: 'keksejä' }],
          [{ ru: '-e' }, { ru: 'vaate' }, { ru: 'vaatteita' }],
          [{ ru: '-e' }, { ru: 'lääke' }, { ru: 'lääkkeitä' }],
        ],
      },
      examples: [
        {
          target: 'Kuvassa on mökkejä.',
          source: { ru: 'На картинке есть дачи.' },
        },
        {
          target: 'Meillä on vaatteita.',
          source: { ru: 'У нас есть одежда.' },
        },
        {
          target: 'Tarvitsen lääkkeitä.',
          source: { ru: 'Мне нужны лекарства.' },
        },
        {
          target: 'Luen lehtiä kotona.',
          source: { ru: 'Я читаю газеты дома.' },
        },
      ],
    },
    {
      id: 'plural-partitive-derived-stems',
      title: { ru: 'Слова на -nen, -s и -es' },
      paragraphs: [
        {
          ru: 'У слов на -nen используется основа на -si-: nainen → naisia, ihminen → ihmisiä, makeinen → makeisia.',
        },
        {
          ru: 'У слов с -s форма раскрывает основу: vieras → vieraita, hansikas → hansikkaita, sormus → sormuksia, vihannes → vihanneksia.',
        },
      ],
      table: {
        headers: [{ ru: 'Слово' }, { ru: 'Основа' }, { ru: 'Партитив мн. ч.' }],
        rows: [
          [{ ru: 'ihminen' }, { ru: 'ihmis-' }, { ru: 'ihmisiä' }],
          [{ ru: 'vieras' }, { ru: 'vierai-' }, { ru: 'vieraita' }],
          [{ ru: 'sormus' }, { ru: 'sormuks-' }, { ru: 'sormuksia' }],
          [{ ru: 'vihannes' }, { ru: 'vihanneks-' }, { ru: 'vihanneksia' }],
        ],
      },
      examples: [
        {
          target: 'Täällä on ihmisiä.',
          source: { ru: 'Здесь есть люди.' },
        },
        {
          target: 'Hotellissa on vieraita.',
          source: { ru: 'В отеле есть гости.' },
        },
        {
          target: 'Kaupassa on vihanneksia.',
          source: { ru: 'В магазине есть овощи.' },
        },
        {
          target: 'He syövät makeisia.',
          source: { ru: 'Они едят конфеты.' },
        },
      ],
    },
    {
      id: 'plural-partitive-special-stems',
      title: { ru: 'Частотные особые формы' },
      paragraphs: [
        {
          ru: 'Короткие частотные слова могут сильно менять основу: mies → miehiä, työ → töitä, maa → maita. Их полезно сразу запомнить целиком.',
        },
        {
          ru: 'Не подставляй -t из номинатива множественного числа: miehet и työt называют определённую целую группу, а miehiä и töitä являются партитивом.',
        },
      ],
      table: {
        headers: [
          { ru: 'Слово' },
          { ru: 'Номинатив мн. ч.' },
          { ru: 'Партитив мн. ч.' },
        ],
        rows: [
          [{ ru: 'mies' }, { ru: 'miehet' }, { ru: 'miehiä' }],
          [{ ru: 'työ' }, { ru: 'työt' }, { ru: 'töitä' }],
          [{ ru: 'maa' }, { ru: 'maat' }, { ru: 'maita' }],
        ],
      },
      examples: [
        {
          target: 'Näen miehiä asemalla.',
          source: { ru: 'Я вижу мужчин на станции.' },
        },
        {
          target: 'Minulla on paljon töitä.',
          source: { ru: 'У меня много работы.' },
        },
        {
          target: 'Kartalla on maita.',
          source: { ru: 'На карте есть страны.' },
        },
      ],
      callout: {
        ru: 'Точное число от двух: kaksi keksiä. Неопределённая группа или paljon: keksejä, paljon keksejä.',
      },
    },
  ],
}

interface NounSeed {
  lemma: string
  gloss: string
  sourcePlural: string
  genitiveSingular: string
  partitiveSingular: string
  nominativePlural: string
  partitivePlural: string
  exampleTarget: string
  exampleSource: string
  formationType: string
}

const nouns: NounSeed[] = [
  noun(
    'talo',
    'дом',
    'дома',
    'talon',
    'taloa',
    'talot',
    'taloja',
    'Näen taloja ikkunasta.',
    'Из окна я вижу дома.',
    'vowel-stem',
  ),
  noun(
    'mökki',
    'дача, коттедж',
    'дачи, коттеджи',
    'mökin',
    'mökkiä',
    'mökit',
    'mökkejä',
    'Kuvassa on mökkejä.',
    'На картинке есть дачи.',
    'changing-stem',
  ),
  noun(
    'kissa',
    'кошка',
    'кошки',
    'kissan',
    'kissaa',
    'kissat',
    'kissoja',
    'Lapset katsovat kissoja.',
    'Дети смотрят на кошек.',
    'vowel-stem',
  ),
  noun(
    'koira',
    'собака',
    'собаки',
    'koiran',
    'koiraa',
    'koirat',
    'koiria',
    'Puistossa on koiria.',
    'В парке есть собаки.',
    'vowel-stem',
  ),
  noun(
    'eläin',
    'животное',
    'животные',
    'eläimen',
    'eläintä',
    'eläimet',
    'eläimiä',
    'Näen eläimiä metsässä.',
    'Я вижу животных в лесу.',
    'changing-stem',
  ),
  noun(
    'nainen',
    'женщина',
    'женщины',
    'naisen',
    'naista',
    'naiset',
    'naisia',
    'Tapaan naisia täällä.',
    'Я встречаю здесь женщин.',
    'derived-stem',
  ),
  noun(
    'mies',
    'мужчина',
    'мужчины',
    'miehen',
    'miestä',
    'miehet',
    'miehiä',
    'Näen miehiä asemalla.',
    'Я вижу мужчин на станции.',
    'special-stem',
  ),
  noun(
    'ihminen',
    'человек',
    'люди',
    'ihmisen',
    'ihmistä',
    'ihmiset',
    'ihmisiä',
    'Täällä on ihmisiä.',
    'Здесь есть люди.',
    'derived-stem',
  ),
  noun(
    'vieras',
    'гость',
    'гости',
    'vieraan',
    'vierasta',
    'vieraat',
    'vieraita',
    'Hotellissa on vieraita.',
    'В отеле есть гости.',
    'derived-stem',
  ),
  noun(
    'työ',
    'работа',
    'работы',
    'työn',
    'työtä',
    'työt',
    'töitä',
    'Minulla on paljon töitä.',
    'У меня много работы.',
    'special-stem',
  ),
  noun(
    'maa',
    'страна, земля',
    'страны, земли',
    'maan',
    'maata',
    'maat',
    'maita',
    'Kartalla on maita.',
    'На карте есть страны.',
    'special-stem',
  ),
  noun(
    'vaate',
    'предмет одежды',
    'одежда',
    'vaatteen',
    'vaatetta',
    'vaatteet',
    'vaatteita',
    'Meillä on vaatteita.',
    'У нас есть одежда.',
    'changing-stem',
  ),
  noun(
    'mekko',
    'платье',
    'платья',
    'mekon',
    'mekkoa',
    'mekot',
    'mekkoja',
    'Kaupassa on mekkoja.',
    'В магазине есть платья.',
    'vowel-stem',
  ),
  noun(
    'hame',
    'юбка',
    'юбки',
    'hameen',
    'hametta',
    'hameet',
    'hameita',
    'Kaupassa on hameita.',
    'В магазине есть юбки.',
    'changing-stem',
  ),
  noun(
    'sukka',
    'носок',
    'носки',
    'sukan',
    'sukkaa',
    'sukat',
    'sukkia',
    'Ostan sukkia kaupasta.',
    'Я покупаю носки в магазине.',
    'vowel-stem',
  ),
  noun(
    'hansikas',
    'перчатка',
    'перчатки',
    'hansikkaan',
    'hansikasta',
    'hansikkaat',
    'hansikkaita',
    'Tarvitsemme hansikkaita.',
    'Нам нужны перчатки.',
    'derived-stem',
  ),
  noun(
    'sormus',
    'кольцо',
    'кольца',
    'sormuksen',
    'sormusta',
    'sormukset',
    'sormuksia',
    'Kaupassa on sormuksia.',
    'В магазине есть кольца.',
    'derived-stem',
  ),
  noun(
    'lehti',
    'газета, лист',
    'газеты, листья',
    'lehden',
    'lehteä',
    'lehdet',
    'lehtiä',
    'Luen lehtiä kotona.',
    'Я читаю газеты дома.',
    'changing-stem',
  ),
  noun(
    'lelu',
    'игрушка',
    'игрушки',
    'lelun',
    'lelua',
    'lelut',
    'leluja',
    'Huoneessa on leluja.',
    'В комнате есть игрушки.',
    'vowel-stem',
  ),
  noun(
    'lääke',
    'лекарство',
    'лекарства',
    'lääkkeen',
    'lääkettä',
    'lääkkeet',
    'lääkkeitä',
    'Tarvitsen lääkkeitä.',
    'Мне нужны лекарства.',
    'changing-stem',
  ),
  noun(
    'hedelmä',
    'фрукт',
    'фрукты',
    'hedelmän',
    'hedelmää',
    'hedelmät',
    'hedelmiä',
    'Pöydällä on hedelmiä.',
    'На столе есть фрукты.',
    'vowel-stem',
  ),
  noun(
    'vihannes',
    'овощ',
    'овощи',
    'vihanneksen',
    'vihannesta',
    'vihannekset',
    'vihanneksia',
    'Kaupassa on vihanneksia.',
    'В магазине есть овощи.',
    'derived-stem',
  ),
  noun(
    'marja',
    'ягода',
    'ягоды',
    'marjan',
    'marjaa',
    'marjat',
    'marjoja',
    'He syövät marjoja.',
    'Они едят ягоды.',
    'vowel-stem',
  ),
  noun(
    'makeinen',
    'конфета',
    'конфеты',
    'makeisen',
    'makeista',
    'makeiset',
    'makeisia',
    'Hän ei osta makeisia.',
    'Она не покупает конфеты.',
    'derived-stem',
  ),
  noun(
    'keksi',
    'печенье',
    'печенье',
    'keksin',
    'keksiä',
    'keksit',
    'keksejä',
    'Hän syö keksejä.',
    'Она ест печенье.',
    'changing-stem',
  ),
  noun(
    'ateria',
    'приём пищи',
    'приёмы пищи',
    'aterian',
    'ateriaa',
    'ateriat',
    'aterioita',
    'Valmistan aterioita kotona.',
    'Я готовлю дома еду.',
    'vowel-stem',
  ),
]

export const pluralPartitiveFormationVocabulary: LessonVocabularySeed[] =
  nouns.map((item, index) => nounVocabulary(item, index + 1))

function noun(
  lemma: string,
  gloss: string,
  sourcePlural: string,
  genitiveSingular: string,
  partitiveSingular: string,
  nominativePlural: string,
  partitivePlural: string,
  exampleTarget: string,
  exampleSource: string,
  formationType: string,
): NounSeed {
  return {
    lemma,
    gloss,
    sourcePlural,
    genitiveSingular,
    partitiveSingular,
    nominativePlural,
    partitivePlural,
    exampleTarget,
    exampleSource,
    formationType,
  }
}

function nounVocabulary(
  item: NounSeed,
  position: number,
): LessonVocabularySeed {
  const serial = serialFor(position)
  return {
    ...identity(serial, item.lemma),
    lemma: item.lemma,
    partOfSpeech: 'noun',
    gloss: item.gloss,
    example: {
      target: item.exampleTarget,
      source: { ru: item.exampleSource },
    },
    semanticTypes: ['module-two', 'plural-partitive', item.formationType],
    singular: item.lemma,
    plural: item.partitivePlural,
    sourceSingular: item.gloss,
    sourcePlural: item.sourcePlural,
    forms: [
      form(serial, 'nominative-singular', item.lemma, {
        case: 'nominative',
        number: 'singular',
      }),
      form(serial, 'genitive-singular', item.genitiveSingular, {
        case: 'genitive',
        number: 'singular',
      }),
      form(serial, 'partitive-singular', item.partitiveSingular, {
        case: 'partitive',
        number: 'singular',
      }),
      form(serial, 'nominative-plural', item.nominativePlural, {
        case: 'nominative',
        number: 'plural',
      }),
      form(serial, 'partitive-plural', item.partitivePlural, {
        case: 'partitive',
        number: 'plural',
      }),
    ],
  }
}

function identity(serial: string, lemma: string) {
  return {
    key: `m2-${serial.replace('.', '-')}`,
    itemId: `word.fi.m2.${serial}`,
    conceptId: `concept.fi.m2.${serial}`,
    lexicalEntryId: `lex.fi.${lemma}`,
  }
}

function serialFor(position: number) {
  return `04.${String(position).padStart(2, '0')}`
}

function form(
  serial: string,
  key: string,
  surface: string,
  features: Record<string, string>,
) {
  return { id: `form.fi.m2.${serial}.${key}`, surface, features }
}
