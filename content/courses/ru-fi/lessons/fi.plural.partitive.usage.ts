import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type { LessonVocabularySeed } from './fi.olla.basics.js'
import { PLURAL_PARTITIVE_FORMATION_SKILL_ID } from './fi.plural.partitive.formation.js'

export const PLURAL_PARTITIVE_USAGE_SKILL_ID =
  'grammar.fi.plural.partitive.usage'
export const PLURAL_PARTITIVE_EXISTENTIAL_SKILL_ID =
  'grammar.fi.plural.partitive.usage.existential'
export const PLURAL_PARTITIVE_OBJECT_SKILL_ID =
  'grammar.fi.plural.partitive.usage.object'
export const PLURAL_PARTITIVE_NEGATIVE_SKILL_ID =
  'grammar.fi.plural.partitive.usage.negative'
export const PLURAL_PARTITIVE_QUANTITY_SKILL_ID =
  'grammar.fi.plural.partitive.usage.quantity'
export const PLURAL_PARTITIVE_USAGE_CONTRAST_SKILL_ID =
  'grammar.fi.plural.partitive.usage.contrast'

export const pluralPartitiveUsageSkills: CourseSkillSeed[] = [
  {
    id: PLURAL_PARTITIVE_USAGE_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Употребление партитива множественного числа' },
    description: {
      ru: 'Неопределённые группы, незавершённый или частичный объект, отрицание и количество.',
    },
    prerequisiteSkillIds: [PLURAL_PARTITIVE_FORMATION_SKILL_ID],
  },
  {
    id: PLURAL_PARTITIVE_EXISTENTIAL_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Неопределённая группа в наличии' },
    description: {
      ru: 'Партитив множественного числа в предложениях типа Kaupassa on tuotteita.',
    },
    prerequisiteSkillIds: [PLURAL_PARTITIVE_USAGE_SKILL_ID],
  },
  {
    id: PLURAL_PARTITIVE_OBJECT_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Процесс или часть группы' },
    description: {
      ru: 'Партитив множественного числа для незавершённого действия и неопределённой части предметов.',
    },
    prerequisiteSkillIds: [PLURAL_PARTITIVE_USAGE_SKILL_ID],
  },
  {
    id: PLURAL_PARTITIVE_NEGATIVE_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Множественный объект в отрицании' },
    description: {
      ru: 'Отрицательное предложение требует партитива: En osta lahjoja.',
    },
    prerequisiteSkillIds: [PLURAL_PARTITIVE_USAGE_SKILL_ID],
  },
  {
    id: PLURAL_PARTITIVE_QUANTITY_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Неопределённое количество предметов' },
    description: {
      ru: 'Paljon, vähän, tarpeeksi и liikaa с партитивом множественного числа считаемых предметов.',
    },
    prerequisiteSkillIds: [PLURAL_PARTITIVE_USAGE_SKILL_ID],
  },
  {
    id: PLURAL_PARTITIVE_USAGE_CONTRAST_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Часть группы или вся группа' },
    description: {
      ru: 'Сопоставление неопределённой группы в партитиве с полной известной группой на -t и точным количеством.',
    },
    prerequisiteSkillIds: [PLURAL_PARTITIVE_USAGE_SKILL_ID],
  },
]

export const pluralPartitiveUsageContent: CourseLessonContentSeed = {
  version: 1,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'indefinite-plural-existential',
      title: { ru: 'Когда важно наличие, а не полный список' },
      paragraphs: [
        {
          ru: 'В предложении места или наличия партитив множественного числа показывает неопределённую группу: в магазине есть какие-то товары, но мы не называем весь известный набор.',
        },
        {
          ru: 'Такая группа обычно стоит после места, а olla остаётся в единственном числе: Kaupassa on tuotteita. То же правило действует в конструкции обладания: Minulla on vaihtoehtoja.',
        },
      ],
      table: {
        headers: [{ ru: 'Смысл' }, { ru: 'Форма' }, { ru: 'Пример' }],
        rows: [
          [
            { ru: 'неопределённая группа' },
            { ru: 'партитив мн. ч.' },
            { ru: 'Kaupassa on tuotteita.' },
          ],
          [
            { ru: 'точно три предмета' },
            { ru: 'число + партитив ед. ч.' },
            { ru: 'Kaupassa on kolme tuotetta.' },
          ],
          [
            { ru: 'известная полная группа' },
            { ru: 'номинатив мн. ч.' },
            { ru: 'Tuotteet ovat kaupassa.' },
          ],
        ],
      },
      examples: [
        {
          target: 'Kaupassa on tavaroita.',
          source: { ru: 'В магазине есть товары.' },
        },
        {
          target: 'Järvellä on veneitä.',
          source: { ru: 'На озере есть лодки.' },
        },
        {
          target: 'Minulla on vaihtoehtoja.',
          source: { ru: 'У меня есть варианты.' },
        },
        {
          target: 'Toimistossa on työntekijöitä.',
          source: { ru: 'В офисе есть сотрудники.' },
        },
      ],
    },
    {
      id: 'plural-partitive-object',
      title: { ru: 'Действие как процесс или часть группы' },
      paragraphs: [
        {
          ru: 'Множественный объект ставится в партитив, если действие идёт как процесс: Pesen astioita. Результат для всей группы ещё не утверждается.',
        },
        {
          ru: 'Та же форма обозначает неопределённую часть: Ostan lahjoja сообщает о подарках вообще. Слушатель не должен знать, сколько их и какие именно подарки выбраны.',
        },
        {
          ru: 'У знакомых глаголов с постоянным партитивным управлением правило сохраняется и во множественном числе: autan asiakasta → autan asiakkaita.',
        },
      ],
      table: {
        headers: [{ ru: 'Объект' }, { ru: 'Форма' }, { ru: 'Смысл' }],
        rows: [
          [
            { ru: 'astioita' },
            { ru: 'партитив мн. ч.' },
            { ru: 'мою посуду, процесс' },
          ],
          [
            { ru: 'astiat' },
            { ru: 'номинатив мн. ч.' },
            { ru: 'вымою всю известную посуду' },
          ],
          [
            { ru: 'lahjoja' },
            { ru: 'партитив мн. ч.' },
            { ru: 'покупаю какие-то подарки' },
          ],
        ],
      },
      examples: [
        {
          target: 'Pesen astioita.',
          source: { ru: 'Я мою посуду.' },
        },
        {
          target: 'Hän ostaa lahjoja.',
          source: { ru: 'Она покупает подарки.' },
        },
        {
          target: 'Me valitsemme huonekaluja.',
          source: { ru: 'Мы выбираем мебель.' },
        },
        {
          target: 'Autamme asiakkaita.',
          source: { ru: 'Мы помогаем клиентам.' },
        },
      ],
    },
    {
      id: 'negative-plural-object',
      title: { ru: 'Отрицание отменяет полный результат' },
      paragraphs: [
        {
          ru: 'В отрицательном предложении объект ставится в партитив независимо от того, шла ли речь обо всей группе. Поэтому En osta lahjoja, а не en osta lahjat.',
        },
        {
          ru: 'В отрицательном предложении наличия также используется партитив: Kaupassa ei ole peittoja. Глагол остаётся в форме ei ole.',
        },
      ],
      examples: [
        {
          target: 'En tarvitse työkaluja.',
          source: { ru: 'Мне не нужны инструменты.' },
        },
        {
          target: 'Kaupassa ei ole peittoja.',
          source: { ru: 'В магазине нет одеял.' },
        },
        {
          target: 'Me emme osta maljakoita.',
          source: { ru: 'Мы не покупаем вазы.' },
        },
        {
          target: 'Minulla ei ole vaihtoehtoja.',
          source: { ru: 'У меня нет вариантов.' },
        },
      ],
    },
    {
      id: 'plural-indefinite-quantity',
      title: { ru: 'Paljon предметов, но monta предмета' },
      paragraphs: [
        {
          ru: 'С много, мало, достаточно и слишком много считаемых предметов используется партитив множественного числа: paljon rakennuksia, vähän lintuja, tarpeeksi palveluja.',
        },
        {
          ru: 'Monta ведёт себя как числительное и требует партитива единственного числа: monta rakennusta. Поэтому paljon rakennuksia и monta rakennusta передают близкий смысл, но строятся по-разному.',
        },
      ],
      table: {
        headers: [
          { ru: 'Количество' },
          { ru: 'Число существительного' },
          { ru: 'Пример' },
        ],
        rows: [
          [
            { ru: 'paljon / vähän' },
            { ru: 'партитив мн. ч.' },
            { ru: 'paljon rakennuksia' },
          ],
          [
            { ru: 'tarpeeksi / liikaa' },
            { ru: 'партитив мн. ч.' },
            { ru: 'liikaa huonekaluja' },
          ],
          [
            { ru: 'monta / точное число' },
            { ru: 'партитив ед. ч.' },
            { ru: 'monta rakennusta' },
          ],
        ],
      },
      examples: [
        {
          target: 'Kaupungissa on paljon rakennuksia.',
          source: { ru: 'В городе много зданий.' },
        },
        {
          target: 'Puistossa on vähän lintuja.',
          source: { ru: 'В парке мало птиц.' },
        },
        {
          target: 'Huoneessa on liikaa huonekaluja.',
          source: { ru: 'В комнате слишком много мебели.' },
        },
        {
          target: 'Kuinka monta venettä järvellä on?',
          source: { ru: 'Сколько лодок на озере?' },
        },
      ],
    },
    {
      id: 'plural-object-contrast',
      title: { ru: 'Как выбрать между -t и партитивом' },
      paragraphs: [
        {
          ru: 'Форма на -t представляет известную группу как целое и обещает результат: Ostan verhot — куплю выбранные шторы. Партитив Ostan verhoja — покупаю какие-то шторы или занят их выбором.',
        },
        {
          ru: 'После точного числа снова нужен партитив единственного числа: kolme tyynyä. Не смешивай три модели: verhot, verhoja и kolme verhoa.',
        },
      ],
      table: {
        headers: [{ ru: 'Форма' }, { ru: 'Пример' }, { ru: 'Смысл' }],
        rows: [
          [
            { ru: 'номинатив мн. ч.' },
            { ru: 'Ostan verhot.' },
            { ru: 'все выбранные шторы' },
          ],
          [
            { ru: 'партитив мн. ч.' },
            { ru: 'Ostan verhoja.' },
            { ru: 'какие-то шторы / процесс' },
          ],
          [
            { ru: 'партитив ед. ч.' },
            { ru: 'Ostan kolme verhoa.' },
            { ru: 'точно три шторы' },
          ],
        ],
      },
      examples: [
        {
          target: 'Ostan verhot huomenna.',
          source: { ru: 'Я куплю выбранные шторы завтра.' },
        },
        {
          target: 'Ostan peittoja tänään.',
          source: { ru: 'Я покупаю сегодня одеяла.' },
        },
        {
          target: 'Hän pesee astiat.',
          source: { ru: 'Она вымоет всю посуду.' },
        },
        {
          target: 'Kaupassa on kolme tuotetta.',
          source: { ru: 'В магазине три товара.' },
        },
      ],
      callout: {
        ru: 'Неопределённая группа или процесс → партитив множественного числа. Вся известная группа → форма на -t. Точное число → партитив единственного числа.',
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
  semanticType: string
}

const nouns: NounSeed[] = [
  noun(
    'tavara',
    'товар, вещь',
    'товары, вещи',
    'tavaran',
    'tavaraa',
    'tavarat',
    'tavaroita',
    'Kaupassa on tavaroita.',
    'В магазине есть товары.',
    'item',
  ),
  noun(
    'tuote',
    'товар, продукт',
    'товары, продукты',
    'tuotteen',
    'tuotetta',
    'tuotteet',
    'tuotteita',
    'He katsovat tuotteita.',
    'Они рассматривают товары.',
    'item',
  ),
  noun(
    'lahja',
    'подарок',
    'подарки',
    'lahjan',
    'lahjaa',
    'lahjat',
    'lahjoja',
    'Hän ostaa lahjoja.',
    'Она покупает подарки.',
    'item',
  ),
  noun(
    'työkalu',
    'инструмент',
    'инструменты',
    'työkalun',
    'työkalua',
    'työkalut',
    'työkaluja',
    'En tarvitse työkaluja.',
    'Мне не нужны инструменты.',
    'item',
  ),
  noun(
    'astia',
    'посуда, ёмкость',
    'посуда, ёмкости',
    'astian',
    'astiaa',
    'astiat',
    'astioita',
    'Pesen astioita.',
    'Я мою посуду.',
    'household-item',
  ),
  noun(
    'huonekalu',
    'предмет мебели',
    'мебель',
    'huonekalun',
    'huonekalua',
    'huonekalut',
    'huonekaluja',
    'Me valitsemme huonekaluja.',
    'Мы выбираем мебель.',
    'household-item',
  ),
  noun(
    'verho',
    'штора',
    'шторы',
    'verhon',
    'verhoa',
    'verhot',
    'verhoja',
    'Katson verhoja.',
    'Я рассматриваю шторы.',
    'household-item',
  ),
  noun(
    'tyyny',
    'подушка',
    'подушки',
    'tyynyn',
    'tyynyä',
    'tyynyt',
    'tyynyjä',
    'Huoneessa on tyynyjä.',
    'В комнате есть подушки.',
    'household-item',
  ),
  noun(
    'peitto',
    'одеяло',
    'одеяла',
    'peiton',
    'peittoa',
    'peitot',
    'peittoja',
    'Kaupassa ei ole peittoja.',
    'В магазине нет одеял.',
    'household-item',
  ),
  noun(
    'kynttilä',
    'свеча',
    'свечи',
    'kynttilän',
    'kynttilää',
    'kynttilät',
    'kynttilöitä',
    'Pöydällä on paljon kynttilöitä.',
    'На столе много свечей.',
    'household-item',
  ),
  noun(
    'maljakko',
    'ваза',
    'вазы',
    'maljakon',
    'maljakkoa',
    'maljakot',
    'maljakoita',
    'Pöydällä on maljakoita.',
    'На столе есть вазы.',
    'household-item',
  ),
  noun(
    'kasvi',
    'растение',
    'растения',
    'kasvin',
    'kasvia',
    'kasvit',
    'kasveja',
    'Hän hoitaa kasveja.',
    'Она ухаживает за растениями.',
    'nature',
  ),
  noun(
    'asiakas',
    'клиент, покупатель',
    'клиенты, покупатели',
    'asiakkaan',
    'asiakasta',
    'asiakkaat',
    'asiakkaita',
    'Autamme asiakkaita.',
    'Мы помогаем клиентам.',
    'person',
  ),
  noun(
    'työntekijä',
    'сотрудник, работник',
    'сотрудники, работники',
    'työntekijän',
    'työntekijää',
    'työntekijät',
    'työntekijöitä',
    'Toimistossa on työntekijöitä.',
    'В офисе есть сотрудники.',
    'person',
  ),
  noun(
    'matkustaja',
    'пассажир, путешественник',
    'пассажиры, путешественники',
    'matkustajan',
    'matkustajaa',
    'matkustajat',
    'matkustajia',
    'Bussi tuo matkustajia asemalle.',
    'Автобус привозит пассажиров на станцию.',
    'person',
  ),
  noun(
    'vierailija',
    'посетитель',
    'посетители',
    'vierailijan',
    'vierailijaa',
    'vierailijat',
    'vierailijoita',
    'Hotellissa on paljon vierailijoita.',
    'В отеле много посетителей.',
    'person',
  ),
  noun(
    'lintu',
    'птица',
    'птицы',
    'linnun',
    'lintua',
    'linnut',
    'lintuja',
    'Puistossa on vähän lintuja.',
    'В парке мало птиц.',
    'animal',
  ),
  noun(
    'hevonen',
    'лошадь',
    'лошади',
    'hevosen',
    'hevosta',
    'hevoset',
    'hevosia',
    'Pellolla on hevosia.',
    'На поле есть лошади.',
    'animal',
  ),
  noun(
    'lammas',
    'овца',
    'овцы',
    'lampaan',
    'lammasta',
    'lampaat',
    'lampaita',
    'Pellolla on lampaita.',
    'На поле есть овцы.',
    'animal',
  ),
  noun(
    'hyönteinen',
    'насекомое',
    'насекомые',
    'hyönteisen',
    'hyönteistä',
    'hyönteiset',
    'hyönteisiä',
    'Puistossa on hyönteisiä.',
    'В парке есть насекомые.',
    'animal',
  ),
  noun(
    'vene',
    'лодка',
    'лодки',
    'veneen',
    'venettä',
    'veneet',
    'veneitä',
    'Järvellä on veneitä.',
    'На озере есть лодки.',
    'transport',
  ),
  noun(
    'rakennus',
    'здание',
    'здания',
    'rakennuksen',
    'rakennusta',
    'rakennukset',
    'rakennuksia',
    'Kaupungissa on paljon rakennuksia.',
    'В городе много зданий.',
    'place',
  ),
  noun(
    'huoneisto',
    'квартира, жилое помещение',
    'квартиры, жилые помещения',
    'huoneiston',
    'huoneistoa',
    'huoneistot',
    'huoneistoja',
    'Rakennamme huoneistoja.',
    'Мы строим квартиры.',
    'place',
  ),
  noun(
    'palvelu',
    'услуга, сервис',
    'услуги, сервисы',
    'palvelun',
    'palvelua',
    'palvelut',
    'palveluja',
    'Meillä on tarpeeksi palveluja.',
    'У нас достаточно услуг.',
    'service',
  ),
  noun(
    'vaihtoehto',
    'вариант, альтернатива',
    'варианты, альтернативы',
    'vaihtoehdon',
    'vaihtoehtoa',
    'vaihtoehdot',
    'vaihtoehtoja',
    'Minulla ei ole vaihtoehtoja.',
    'У меня нет вариантов.',
    'abstract',
  ),
  noun(
    'mahdollisuus',
    'возможность',
    'возможности',
    'mahdollisuuden',
    'mahdollisuutta',
    'mahdollisuudet',
    'mahdollisuuksia',
    'Sinulla on paljon mahdollisuuksia.',
    'У тебя много возможностей.',
    'abstract',
  ),
]

export const pluralPartitiveUsageVocabulary: LessonVocabularySeed[] = nouns.map(
  (item, index) => nounVocabulary(item, index + 1),
)

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
  semanticType: string,
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
    semanticType,
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
    semanticTypes: ['module-two', 'plural-partitive-usage', item.semanticType],
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
  return `05.${String(position).padStart(2, '0')}`
}

function form(
  serial: string,
  key: string,
  surface: string,
  features: Record<string, string>,
) {
  return { id: `form.fi.m2.${serial}.${key}`, surface, features }
}
