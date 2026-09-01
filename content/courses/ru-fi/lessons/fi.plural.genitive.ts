import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type { LessonVocabularySeed } from './fi.olla.basics.js'
import { PLURAL_LOCAL_CASES_SKILL_ID } from './fi.plural.local-cases.js'

export const PLURAL_GENITIVE_SKILL_ID = 'grammar.fi.plural.genitive'
export const PLURAL_GENITIVE_JEN_SKILL_ID = 'grammar.fi.plural.genitive.jen'
export const PLURAL_GENITIVE_IEN_SKILL_ID = 'grammar.fi.plural.genitive.ien'
export const PLURAL_GENITIVE_IDEN_SKILL_ID = 'grammar.fi.plural.genitive.iden'
export const PLURAL_GENITIVE_TEN_SKILL_ID = 'grammar.fi.plural.genitive.ten'
export const PLURAL_GENITIVE_USAGE_SKILL_ID = 'grammar.fi.plural.genitive.usage'

export const pluralGenitiveSkills: CourseSkillSeed[] = [
  {
    id: PLURAL_GENITIVE_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Генитив множественного числа' },
    description: {
      ru: 'Отношение к нескольким людям или предметам и основные окончания -jen, -ien, -iden/-itten и -ten.',
    },
    prerequisiteSkillIds: [PLURAL_LOCAL_CASES_SKILL_ID],
  },
  {
    id: PLURAL_GENITIVE_JEN_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Формы на -jen' },
    description: {
      ru: 'Модель aamuja → aamujen, iltoja → iltojen, viikkoja → viikkojen.',
    },
    prerequisiteSkillIds: [PLURAL_GENITIVE_SKILL_ID],
  },
  {
    id: PLURAL_GENITIVE_IEN_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Формы на -ien' },
    description: {
      ru: 'Модель vuosia → vuosien, ruokia → ruokien, oikeuksia → oikeuksien.',
    },
    prerequisiteSkillIds: [PLURAL_GENITIVE_SKILL_ID],
  },
  {
    id: PLURAL_GENITIVE_IDEN_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Формы на -iden/-itten' },
    description: {
      ru: 'Равноправные варианты литературного языка: tavoitteiden и tavoitteitten.',
    },
    prerequisiteSkillIds: [PLURAL_GENITIVE_SKILL_ID],
  },
  {
    id: PLURAL_GENITIVE_TEN_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Формы на -ten' },
    description: {
      ru: 'Частотные модели lasten, naisten, tutkimusten и их допустимые варианты.',
    },
    prerequisiteSkillIds: [PLURAL_GENITIVE_SKILL_ID],
  },
  {
    id: PLURAL_GENITIVE_USAGE_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Связь между двумя существительными' },
    description: {
      ru: 'Генитив множественного числа стоит перед главным словом: lasten lelut, yritysten työntekijät.',
    },
    prerequisiteSkillIds: [PLURAL_GENITIVE_SKILL_ID],
  },
]

export const pluralGenitiveContent: CourseLessonContentSeed = {
  version: 1,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'plural-genitive-purpose',
      title: { ru: 'Кому или чему принадлежат предметы' },
      paragraphs: [
        {
          ru: 'Генитив множественного числа связывает главное слово сразу с несколькими людьми, предметами или явлениями. Lasten lelut — «игрушки детей», yritysten työntekijät — «сотрудники компаний».',
        },
        {
          ru: 'Форма генитива всегда стоит перед главным словом. Главное слово получает ту форму, которую требует всё предложение: lasten lelut, lasten leluja, lasten lelut ovat lattialla.',
        },
      ],
      examples: [
        {
          target: 'Lasten lelut ovat lattialla.',
          source: { ru: 'Игрушки детей находятся на полу.' },
        },
        {
          target: 'Yritysten työntekijät ovat kokouksessa.',
          source: { ru: 'Сотрудники компаний находятся на совещании.' },
        },
        {
          target: 'Rautatieasemien palvelut ovat tärkeitä.',
          source: { ru: 'Услуги железнодорожных вокзалов важны.' },
        },
      ],
    },
    {
      id: 'plural-genitive-jen',
      title: { ru: 'Партитив на -ja/-jä часто ведёт к -jen' },
      paragraphs: [
        {
          ru: 'У многих слов удобно отталкиваться от уже знакомого партитива множественного числа. Если он заканчивается на -ja/-jä, генитив часто получает -jen: aamuja → aamujen, iltoja → iltojen.',
        },
        {
          ru: 'Показатель множественного числа сохраняется внутри формы. Чередование согласных остаётся знакомым: työpaikkoja → työpaikkojen.',
        },
      ],
      table: {
        headers: [
          { ru: 'Слово' },
          { ru: 'Партитив мн. ч.' },
          { ru: 'Генитив мн. ч.' },
        ],
        rows: [
          [{ ru: 'aamu' }, { ru: 'aamuja' }, { ru: 'aamujen' }],
          [{ ru: 'ilta' }, { ru: 'iltoja' }, { ru: 'iltojen' }],
          [{ ru: 'viikko' }, { ru: 'viikkoja' }, { ru: 'viikkojen' }],
          [{ ru: 'etu' }, { ru: 'etuja' }, { ru: 'etujen' }],
        ],
      },
      examples: [
        {
          target: 'Tarkistan eri aamujen sään.',
          source: { ru: 'Я проверю погоду для разных утр.' },
        },
        {
          target: 'Viikkojen määrä kasvaa.',
          source: { ru: 'Количество недель растёт.' },
        },
        {
          target: 'Työpaikkojen osoitteet ovat listassa.',
          source: { ru: 'Адреса рабочих мест находятся в списке.' },
        },
      ],
    },
    {
      id: 'plural-genitive-ien',
      title: { ru: 'Партитив на -ia/-iä часто ведёт к -ien' },
      paragraphs: [
        {
          ru: 'Если партитив множественного числа заканчивается на -ia/-iä, генитив часто оканчивается на -ien: vuosia → vuosien, ruokia → ruokien.',
        },
        {
          ru: 'Основа может отличаться от словарной формы, поэтому полезно запоминать пару «партитив — генитив»: kuukausia — kuukausien, oikeuksia — oikeuksien.',
        },
      ],
      table: {
        headers: [
          { ru: 'Слово' },
          { ru: 'Партитив мн. ч.' },
          { ru: 'Генитив мн. ч.' },
        ],
        rows: [
          [{ ru: 'vuosi' }, { ru: 'vuosia' }, { ru: 'vuosien' }],
          [{ ru: 'ruoka' }, { ru: 'ruokia' }, { ru: 'ruokien' }],
          [{ ru: 'kuukausi' }, { ru: 'kuukausia' }, { ru: 'kuukausien' }],
          [{ ru: 'oikeus' }, { ru: 'oikeuksia' }, { ru: 'oikeuksien' }],
        ],
      },
      examples: [
        {
          target: 'Muistan vuosien tapahtumat.',
          source: { ru: 'Я помню события тех лет.' },
        },
        {
          target: 'Ruokien kuvat ovat kauniita.',
          source: { ru: 'Фотографии блюд красивые.' },
        },
        {
          target: 'Kuukausien nimet ovat listassa.',
          source: { ru: 'Названия месяцев находятся в списке.' },
        },
      ],
    },
    {
      id: 'plural-genitive-iden',
      title: { ru: 'Окончания -iden и -itten равноправны' },
      paragraphs: [
        {
          ru: 'После партитива множественного числа на -ita/-itä часто появляется генитив на -iden: tavoitteita → tavoitteiden, säitä → säiden.',
        },
        {
          ru: 'В литературном языке окончание -tten является таким же правильным: tavoitteitten, säitten. В упражнениях принимаются оба варианта, но основной ответ показывает более частое в нейтральном письменном стиле -den.',
        },
      ],
      table: {
        headers: [
          { ru: 'Слово' },
          { ru: 'Основная форма' },
          { ru: 'Допустимый вариант' },
        ],
        rows: [
          [{ ru: 'lauantai' }, { ru: 'lauantaiden' }, { ru: 'lauantaitten' }],
          [{ ru: 'sää' }, { ru: 'säiden' }, { ru: 'säitten' }],
          [{ ru: 'tavoite' }, { ru: 'tavoitteiden' }, { ru: 'tavoitteitten' }],
          [{ ru: 'laite' }, { ru: 'laitteiden' }, { ru: 'laitteitten' }],
        ],
      },
      examples: [
        {
          target: 'Lauantaiden junat saapuvat asemalle.',
          source: { ru: 'Субботние поезда прибывают на станцию.' },
        },
        {
          target: 'Tavoitteiden määrä on kolme.',
          source: { ru: 'Количество целей — три.' },
        },
        {
          target: 'Eri laitteiden numerot ovat listassa.',
          source: { ru: 'Номера разных устройств находятся в списке.' },
        },
      ],
    },
    {
      id: 'plural-genitive-ten',
      title: { ru: 'Частотные формы на -ten лучше узнавать семьями' },
      paragraphs: [
        {
          ru: 'У слов на -nen часто встречается форма на -sten: nainen → naisten, ihminen → ihmisten. У многих слов на -us/-ys работает похожая модель: tutkimus → tutkimusten, kysymys → kysymysten.',
        },
        {
          ru: 'У этих слов возможны и более длинные варианты: naisien, tutkimuksien, kysymyksien. В нейтральных заданиях основной ответ использует частотную краткую форму.',
        },
      ],
      table: {
        headers: [
          { ru: 'Слово' },
          { ru: 'Основная форма' },
          { ru: 'Допустимый вариант' },
        ],
        rows: [
          [{ ru: 'lapsi' }, { ru: 'lasten' }, { ru: 'lapsien' }],
          [{ ru: 'nainen' }, { ru: 'naisten' }, { ru: 'naisien' }],
          [{ ru: 'tutkimus' }, { ru: 'tutkimusten' }, { ru: 'tutkimuksien' }],
          [{ ru: 'muutos' }, { ru: 'muutosten' }, { ru: 'muutoksien' }],
        ],
      },
      examples: [
        {
          target: 'Lasten lelut ovat lattialla.',
          source: { ru: 'Игрушки детей находятся на полу.' },
        },
        {
          target: 'Naisten vaatteet ovat kaapissa.',
          source: { ru: 'Одежда женщин находится в шкафу.' },
        },
        {
          target: 'Tutkimusten tulokset ovat tärkeitä.',
          source: { ru: 'Результаты исследований важны.' },
        },
      ],
    },
    {
      id: 'plural-genitive-boundary',
      title: { ru: 'Генитив — определение, а не полный объект' },
      paragraphs: [
        {
          ru: 'Не путай генитив множественного числа с полным объектом. В Luen kirjat слово kirjat — полный объект. В Luen kirjojen nimet форма kirjojen только определяет, чьи или какие это названия.',
        },
        {
          ru: 'Практический порядок: найди связь между двумя существительными, поставь зависимое слово перед главным и выбери его модель генитива множественного числа. Форму главного слова определяй отдельно по роли во всём предложении.',
        },
      ],
      examples: [
        {
          target: 'Luen kirjat.',
          source: { ru: 'Я прочитаю книги.' },
        },
        {
          target: 'Luen kirjojen nimet.',
          source: { ru: 'Я читаю названия книг.' },
        },
        {
          target: 'Opettaja tarkistaa opiskelijoiden vastaukset.',
          source: { ru: 'Преподаватель проверяет ответы студентов.' },
        },
      ],
      callout: {
        ru: 'Сначала определи связь «кого или чего?», затем выбери форму -jen, -ien, -iden/-itten или -ten. Главное слово изменяется независимо.',
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
  genitivePlural: string
  alternateGenitivePlurals: string[]
  exampleTarget: string
  exampleSource: string
  formationType: 'jen' | 'ien' | 'iden' | 'ten'
}

const nouns: NounSeed[] = [
  noun(
    'aamu',
    'утро',
    'утра',
    'aamun',
    'aamua',
    'aamut',
    'aamuja',
    'aamujen',
    [],
    'Tarkistan eri aamujen sään.',
    'Я проверю погоду для разных утр.',
    'jen',
  ),
  noun(
    'ilta',
    'вечер',
    'вечера',
    'illan',
    'iltaa',
    'illat',
    'iltoja',
    'iltojen',
    [],
    'Kuuntelen iltojen musiikkia.',
    'Я слушаю музыку по вечерам.',
    'jen',
  ),
  noun(
    'lauantai',
    'суббота',
    'субботы',
    'lauantain',
    'lauantaita',
    'lauantait',
    'lauantaita',
    'lauantaiden',
    ['lauantaitten'],
    'Lauantaiden junat saapuvat asemalle.',
    'Субботние поезда прибывают на станцию.',
    'iden',
  ),
  noun(
    'iltapäivä',
    'вторая половина дня',
    'вторые половины дня',
    'iltapäivän',
    'iltapäivää',
    'iltapäivät',
    'iltapäiviä',
    'iltapäivien',
    [],
    'Muistan iltapäivien kokoukset.',
    'Я помню дневные совещания.',
    'ien',
  ),
  noun(
    'rautatieasema',
    'железнодорожный вокзал',
    'железнодорожные вокзалы',
    'rautatieaseman',
    'rautatieasemaa',
    'rautatieasemat',
    'rautatieasemia',
    'rautatieasemien',
    [],
    'Rautatieasemien palvelut ovat tärkeitä.',
    'Услуги железнодорожных вокзалов важны.',
    'ien',
  ),
  noun(
    'kuukausi',
    'месяц',
    'месяцы',
    'kuukauden',
    'kuukautta',
    'kuukaudet',
    'kuukausia',
    'kuukausien',
    [],
    'Kuukausien nimet ovat listassa.',
    'Названия месяцев находятся в списке.',
    'ien',
  ),
  noun(
    'alku',
    'начало',
    'начала',
    'alun',
    'alkua',
    'alut',
    'alkuja',
    'alkujen',
    [],
    'Tarinoiden alut ovat lyhyitä.',
    'Начала рассказов короткие.',
    'jen',
  ),
  noun(
    'viikonloppu',
    'выходные',
    'выходные',
    'viikonlopun',
    'viikonloppua',
    'viikonloput',
    'viikonloppuja',
    'viikonloppujen',
    [],
    'Viikonloppujen matkat ovat lyhyitä.',
    'Поездки на выходных короткие.',
    'jen',
  ),
  noun(
    'ruoka',
    'еда, блюдо',
    'блюда',
    'ruuan',
    'ruokaa',
    'ruuat',
    'ruokia',
    'ruokien',
    [],
    'Ruokien kuvat ovat kauniita.',
    'Фотографии блюд красивые.',
    'ien',
  ),
  noun(
    'kerta',
    'раз, случай',
    'разы',
    'kerran',
    'kertaa',
    'kerrat',
    'kertoja',
    'kertojen',
    [],
    'Kertojen määrä on viisi.',
    'Количество раз — пять.',
    'jen',
  ),
  noun(
    'sää',
    'погода',
    'погодные условия',
    'sään',
    'säätä',
    'säät',
    'säitä',
    'säiden',
    ['säitten'],
    'Säiden merkitys on suuri.',
    'Значение погодных условий велико.',
    'iden',
  ),
  noun(
    'viikko',
    'неделя',
    'недели',
    'viikon',
    'viikkoa',
    'viikot',
    'viikkoja',
    'viikkojen',
    [],
    'Viikkojen määrä kasvaa.',
    'Количество недель растёт.',
    'jen',
  ),
  noun(
    'vuosi',
    'год',
    'годы',
    'vuoden',
    'vuotta',
    'vuodet',
    'vuosia',
    'vuosien',
    [],
    'Muistan vuosien tapahtumat.',
    'Я помню события тех лет.',
    'ien',
  ),
  noun(
    'tunti',
    'час, занятие',
    'часы, занятия',
    'tunnin',
    'tuntia',
    'tunnit',
    'tunteja',
    'tuntien',
    [],
    'Tuntien alut ovat vaikeita.',
    'Начала занятий трудные.',
    'ien',
  ),
  noun(
    'minuutti',
    'минута',
    'минуты',
    'minuutin',
    'minuuttia',
    'minuutit',
    'minuutteja',
    'minuuttien',
    [],
    'Minuuttien määrä on pieni.',
    'Количество минут небольшое.',
    'ien',
  ),
  noun(
    'sääntö',
    'правило',
    'правила',
    'säännön',
    'sääntöä',
    'säännöt',
    'sääntöjä',
    'sääntöjen',
    [],
    'Sääntöjen määrä kasvaa.',
    'Количество правил растёт.',
    'jen',
  ),
  noun(
    'oikeus',
    'право',
    'права',
    'oikeuden',
    'oikeutta',
    'oikeudet',
    'oikeuksia',
    'oikeuksien',
    [],
    'Oikeuksien merkitys on suuri.',
    'Значение прав велико.',
    'ien',
  ),
  noun(
    'etu',
    'преимущество, льгота',
    'преимущества',
    'edun',
    'etua',
    'edut',
    'etuja',
    'etujen',
    [],
    'Etujen määrä kasvaa.',
    'Количество преимуществ растёт.',
    'jen',
  ),
  noun(
    'määrä',
    'количество',
    'количества',
    'määrän',
    'määrää',
    'määrät',
    'määriä',
    'määrien',
    [],
    'Määrien merkitys on tärkeä.',
    'Значение количеств важно.',
    'ien',
  ),
  noun(
    'työpaikka',
    'рабочее место',
    'рабочие места',
    'työpaikan',
    'työpaikkaa',
    'työpaikat',
    'työpaikkoja',
    'työpaikkojen',
    [],
    'Työpaikkojen osoitteet ovat listassa.',
    'Адреса рабочих мест находятся в списке.',
    'jen',
  ),
  noun(
    'tutkimus',
    'исследование',
    'исследования',
    'tutkimuksen',
    'tutkimusta',
    'tutkimukset',
    'tutkimuksia',
    'tutkimusten',
    ['tutkimuksien'],
    'Tutkimusten tulokset ovat tärkeitä.',
    'Результаты исследований важны.',
    'ten',
  ),
  noun(
    'muutos',
    'изменение',
    'изменения',
    'muutoksen',
    'muutosta',
    'muutokset',
    'muutoksia',
    'muutosten',
    ['muutoksien'],
    'Muutosten määrä on pieni.',
    'Количество изменений небольшое.',
    'ten',
  ),
  noun(
    'kokemus',
    'опыт, впечатление',
    'опыты, впечатления',
    'kokemuksen',
    'kokemusta',
    'kokemukset',
    'kokemuksia',
    'kokemusten',
    ['kokemuksien'],
    'Kokemusten merkitys on suuri.',
    'Значение опыта велико.',
    'ten',
  ),
  noun(
    'tavoite',
    'цель',
    'цели',
    'tavoitteen',
    'tavoitetta',
    'tavoitteet',
    'tavoitteita',
    'tavoitteiden',
    ['tavoitteitten'],
    'Tavoitteiden määrä on kolme.',
    'Количество целей — три.',
    'iden',
  ),
  noun(
    'toiminta',
    'деятельность, функция',
    'виды деятельности, функции',
    'toiminnan',
    'toimintaa',
    'toiminnat',
    'toimintoja',
    'toimintojen',
    [],
    'Toimintojen nimet ovat listassa.',
    'Названия функций находятся в списке.',
    'jen',
  ),
]

export const pluralGenitiveVocabulary: LessonVocabularySeed[] = nouns.map(
  (item, index) => nounVocabulary(item, index + 1),
)

pluralGenitiveVocabulary.push(invariantVocabulary(nouns.length + 1))

function noun(
  lemma: string,
  gloss: string,
  sourcePlural: string,
  genitiveSingular: string,
  partitiveSingular: string,
  nominativePlural: string,
  partitivePlural: string,
  genitivePlural: string,
  alternateGenitivePlurals: string[],
  exampleTarget: string,
  exampleSource: string,
  formationType: NounSeed['formationType'],
): NounSeed {
  return {
    lemma,
    gloss,
    sourcePlural,
    genitiveSingular,
    partitiveSingular,
    nominativePlural,
    partitivePlural,
    genitivePlural,
    alternateGenitivePlurals,
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
    semanticTypes: [
      'module-two',
      'plural-genitive',
      `plural-genitive:${item.formationType}`,
    ],
    singular: item.lemma,
    plural: item.genitivePlural,
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
      form(serial, 'genitive-plural', item.genitivePlural, {
        case: 'genitive',
        number: 'plural',
      }),
      ...item.alternateGenitivePlurals.map((surface, index) =>
        form(serial, `genitive-plural-alternate-${index + 1}`, surface, {
          case: 'genitive',
          number: 'plural',
          variant: 'alternate',
        }),
      ),
    ],
  }
}

function invariantVocabulary(position: number): LessonVocabularySeed {
  const serial = serialFor(position)
  return {
    ...identity(serial, 'eri'),
    lemma: 'eri',
    partOfSpeech: 'adjective',
    gloss: 'разный, различный',
    example: {
      target: 'Eri maiden nimet ovat listassa.',
      source: { ru: 'Названия разных стран находятся в списке.' },
    },
    semanticTypes: ['module-two', 'plural-genitive', 'invariant-modifier'],
    singular: 'eri',
    plural: 'eri',
    sourceSingular: 'разный',
    sourcePlural: 'разные',
    forms: [form(serial, 'invariant', 'eri', { form: 'invariant' })],
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
  return `07.${String(position).padStart(2, '0')}`
}

function form(
  serial: string,
  key: string,
  surface: string,
  features: Record<string, string>,
) {
  return { id: `form.fi.m2.${serial}.${key}`, surface, features }
}
