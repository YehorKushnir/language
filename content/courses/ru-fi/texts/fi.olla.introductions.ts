import { moduleOneVocabularyByLemma } from '../module-one.js'
import {
  finnishLearnerDictionaryItemId,
  getFinnishLearnerDictionaryEntry,
} from '../../../../packages/language-fi/src/learner-dictionary.js'

interface TokenReference {
  lemma: string
  lexicalSenseId?: string
  analysis: Record<string, string>
}

interface PreparedTextSeed {
  id: string
  courseId: string
  title: Record<string, string>
  level: string
  topics: string[]
  body: string
  knowledgeItemIds: string[]
  tokens: Array<{
    position: number
    surface: string
    lemma: string
    lexicalSenseId?: string
    analysis: Record<string, string>
    charStart: number
    charEnd: number
  }>
}

interface TextDefinition {
  id: string
  title: Record<string, string>
  level: string
  topics: string[]
  body: string
  skillItemIds: string[]
}

const grammarReferences: Record<string, TokenReference> = {
  minä: pronoun('minä', 'first', 'singular'),
  sinä: pronoun('sinä', 'second', 'singular'),
  hän: pronoun('hän', 'third', 'singular'),
  me: pronoun('me', 'first', 'plural'),
  te: pronoun('te', 'second', 'plural'),
  he: pronoun('he', 'third', 'plural'),
  se: { lemma: 'se', analysis: { partOfSpeech: 'pronoun' } },
  olen: finiteVerb('olla', 'first', 'singular'),
  olet: finiteVerb('olla', 'second', 'singular'),
  on: finiteVerb('olla', 'third', 'singular'),
  olemme: finiteVerb('olla', 'first', 'plural'),
  olette: finiteVerb('olla', 'second', 'plural'),
  ovat: finiteVerb('olla', 'third', 'plural'),
  en: negativeVerb('first', 'singular'),
  et: negativeVerb('second', 'singular'),
  ei: negativeVerb('third', 'singular'),
  emme: negativeVerb('first', 'plural'),
  ette: negativeVerb('second', 'plural'),
  eivät: negativeVerb('third', 'plural'),
  ole: {
    lemma: 'olla',
    analysis: { partOfSpeech: 'verb', form: 'connegative' },
  },
  ja: { lemma: 'ja', analysis: { partOfSpeech: 'conjunction' } },
  mutta: { lemma: 'mutta', analysis: { partOfSpeech: 'conjunction' } },
  että: { lemma: 'että', analysis: { partOfSpeech: 'conjunction' } },
  kun: { lemma: 'kun', analysis: { partOfSpeech: 'conjunction' } },
}

const inflectedVocabularyReferences: Record<string, string> = {
  aamulla: 'aamu',
  aluksi: 'alku',
  avaimen: 'avain',
  asun: 'asua',
  asuu: 'asua',
  asumme: 'asua',
  auttoi: 'auttaa',
  bussilla: 'bussi',
  eikä: 'ei',
  enemmän: 'enemmän',
  esiin: 'esiin',
  elokuvan: 'elokuva',
  haluan: 'haluta',
  haluaa: 'haluta',
  haluamme: 'haluta',
  heräsimme: 'herätä',
  hotellissa: 'hotelli',
  hotellin: 'hotelli',
  hotelliin: 'hotelli',
  illalla: 'ilta',
  iltapäivällä: 'iltapäivä',
  iloa: 'ilo',
  ikkunasta: 'ikkuna',
  järven: 'järvi',
  joen: 'joki',
  jossa: 'joka',
  juon: 'juoda',
  juustoa: 'juusto',
  kahvia: 'kahvi',
  kahvilassa: 'kahvila',
  kalaa: 'kala',
  katsoimme: 'katsoa',
  kaikkea: 'kaikki',
  kaupungissa: 'kaupunki',
  kerran: 'kerta',
  kertoo: 'kertoa',
  kirjastossa: 'kirjasto',
  kirjaa: 'kirja',
  keskustelemme: 'keskustelu',
  kirjoitin: 'kirjoittaa',
  kirjoitan: 'kirjoittaa',
  kotiin: 'koti',
  kuukausi: 'kuukausi',
  kävelimme: 'kävellä',
  käymme: 'käydä',
  kysyy: 'kysyä',
  junalla: 'juna',
  lauantaina: 'lauantai',
  laukun: 'laukku',
  leipää: 'leipä',
  lipun: 'lippu',
  luen: 'lukea',
  lukemisesta: 'lukeminen',
  lähdimme: 'lähteä',
  lämmitti: 'lämmittää',
  maitoa: 'maito',
  maksoin: 'maksaa',
  matkaa: 'matka',
  matkustin: 'matkustaa',
  matkusti: 'matkustaa',
  meren: 'meri',
  menemme: 'mennä',
  menin: 'mennä',
  metsän: 'metsä',
  minulla: 'minä',
  museossa: 'museo',
  musiikista: 'musiikki',
  näin: 'nähdä',
  nyt: 'nyt',
  omenoita: 'omena',
  odotimme: 'odottaa',
  oli: 'olla',
  olin: 'olla',
  olivat: 'olla',
  opiskelin: 'opiskella',
  opiskelua: 'opiskelu',
  opimme: 'oppia',
  opin: 'oppia',
  osaa: 'osata',
  ostamme: 'ostaa',
  ostin: 'ostaa',
  oven: 'ovi',
  palasimme: 'palata',
  pidän: 'pitää',
  päivänä: 'päivä',
  päivässä: 'päivä',
  perunoita: 'peruna',
  puistossa: 'puisto',
  puhuimme: 'puhua',
  rannalle: 'ranta',
  rautatieasemalta: 'rautatieasema',
  ravintolassa: 'ravintola',
  ruoka: 'ruoka',
  ruokaa: 'ruoka',
  sanan: 'sana',
  seuraavana: 'seuraava',
  sen: 'se',
  suomeen: 'Suomi',
  suomea: 'Suomi',
  suuren: 'suuri',
  suunnittelemme: 'suunnitella',
  sää: 'sää',
  söimme: 'syödä',
  tarvitsemme: 'tarvita',
  teetä: 'tee',
  torilta: 'tori',
  torilla: 'tori',
  torille: 'tori',
  tuli: 'tulla',
  tulimme: 'tulla',
  tulin: 'tulla',
  tullut: 'tulla',
  uutisia: 'uutinen',
  uuden: 'uusi',
  vastaa: 'vastata',
  vastaan: 'vastata',
  viestin: 'viesti',
  viikonloppuna: 'viikonloppu',
  voimakas: 'voimakas',
  voin: 'voida',
  vuoren: 'vuori',
  ymmärrä: 'ymmärtää',
  ymmärrän: 'ymmärtää',
  yliopistoon: 'yliopisto',
  ystävälle: 'ystävä',
  ystäväni: 'ystävä',
}

const tokenAnalysisOverrides: Record<string, Record<string, string>> = {
  esiin: { partOfSpeech: 'adverb', form: 'invariable' },
  lukemisesta: {
    partOfSpeech: 'noun',
    case: 'elative',
    number: 'singular',
  },
  tullut: {
    partOfSpeech: 'verb',
    form: 'past_participle',
    number: 'singular',
  },
}

function pronoun(
  lemma: string,
  person: string,
  number: string,
): TokenReference {
  return { lemma, analysis: { partOfSpeech: 'pronoun', person, number } }
}

function finiteVerb(
  lemma: string,
  person: string,
  number: string,
): TokenReference {
  return {
    lemma,
    analysis: {
      partOfSpeech: 'verb',
      person,
      number,
      polarity: 'affirmative',
    },
  }
}

function negativeVerb(person: string, number: string): TokenReference {
  return {
    lemma: 'ei',
    analysis: { partOfSpeech: 'verb', person, number, polarity: 'negative' },
  }
}

function vocabularyReference(lemma: string): TokenReference | undefined {
  const item = moduleOneVocabularyByLemma.get(lemma)
  if (!item) return undefined
  return {
    lemma: item.lemma,
    lexicalSenseId: item.itemId,
    analysis: { partOfSpeech: item.partOfSpeech },
  }
}

function resolveReference(surface: string): TokenReference | undefined {
  const normalized = surface.toLocaleLowerCase('fi')
  const lemma = inflectedVocabularyReferences[normalized] ?? normalized
  const grammarReference = grammarReferences[normalized]
  const dictionary = getFinnishLearnerDictionaryEntry(
    grammarReference?.lemma ?? lemma,
  )
  const resolvedReference =
    grammarReference ??
    vocabularyReference(lemma) ??
    (dictionary
      ? {
          lemma: dictionary.lemma,
          lexicalSenseId: finnishLearnerDictionaryItemId(dictionary.lemma),
          analysis: { partOfSpeech: dictionary.partOfSpeech },
        }
      : undefined)
  const reference =
    resolvedReference && dictionary && !resolvedReference.lexicalSenseId
      ? {
          ...resolvedReference,
          lexicalSenseId: finnishLearnerDictionaryItemId(dictionary.lemma),
        }
      : resolvedReference
  const analysisOverride = tokenAnalysisOverrides[normalized]
  return reference && analysisOverride
    ? { ...reference, analysis: analysisOverride }
    : reference
}

function tokenize(body: string): PreparedTextSeed['tokens'] {
  return [...body.matchAll(/[\p{L}\p{M}]+/gu)].map((match, position) => {
    const surface = match[0]
    const charStart = match.index
    const reference = resolveReference(surface)

    return {
      position,
      surface,
      lemma: reference?.lemma ?? surface.toLocaleLowerCase('fi'),
      lexicalSenseId: reference?.lexicalSenseId,
      analysis: reference?.analysis ?? { partOfSpeech: 'unknown' },
      charStart,
      charEnd: charStart + surface.length,
    }
  })
}

function createText(definition: TextDefinition): PreparedTextSeed {
  const tokens = tokenize(definition.body)
  return {
    id: definition.id,
    courseId: 'course.ru-fi',
    title: definition.title,
    level: definition.level,
    topics: definition.topics,
    body: definition.body,
    tokens,
    knowledgeItemIds: [
      ...new Set([
        ...definition.skillItemIds,
        ...tokens.flatMap((token) =>
          token.lexicalSenseId ? [token.lexicalSenseId] : [],
        ),
      ]),
    ],
  }
}

export const preparedTexts: PreparedTextSeed[] = [
  createText({
    id: 'text.fi.module-one.04.study-day',
    title: { ru: 'Учебный день' },
    level: 'A1',
    topics: ['уроки 1–4', 'учёба', 'общение'],
    body: 'Minä olen opiskelija. Ystäväni on opettaja. Aamulla luen kirjaa ja kirjoitan viestin. Minulla on kysymys, opettaja kysyy ja minä vastaan. Illalla haluan mennä kotiin, syödä ja kuunnella uutisia. En vielä ymmärrä kaikkea, mutta opin joka päivä.',
    skillItemIds: [
      'grammar.fi.olla.affirmative',
      'grammar.fi.olla.negative',
      'grammar.fi.present.common',
      'grammar.fi.questions.word-order',
      'grammar.fi.verb-types.two-three',
    ],
  }),
  createText({
    id: 'text.fi.module-one.08.home-plan',
    title: { ru: 'Планы семьи' },
    level: 'A1',
    topics: ['уроки 5–8', 'семья', 'дом', 'планы'],
    body: 'Me olemme perhe, ja asumme kaupungissa. Koti on asunto, jossa on keittiö, olohuone ja parveke. Äiti haluaa siivota ja isä yrittää korjata oven. Minä voin auttaa ja sisko osaa kokata. Illalla suunnittelemme matkaa. Tarvitsemme lipun, laukun ja avaimen.',
    skillItemIds: [
      'grammar.fi.verb-types.four-six',
      'grammar.fi.consonant-gradation',
      'grammar.fi.infinitive.chains',
      'grammar.fi.genitive.possession',
    ],
  }),
  createText({
    id: 'text.fi.module-one.12.market-day',
    title: { ru: 'День на рынке' },
    level: 'A1+',
    topics: ['уроки 9–12', 'еда', 'город', 'свободное время'],
    body: 'Lauantaina menemme torille. Ostamme leipää, maitoa, juustoa, kalaa, perunoita ja omenoita. Sen jälkeen juon kahvia kahvilassa ja ystävä ottaa teetä. Iltapäivällä käymme kirjastossa ja museossa. Minä pidän musiikista ja lukemisesta. Päivässä on iloa, vaikka kaupungissa on kiire.',
    skillItemIds: [
      'grammar.fi.nouns.gradation',
      'grammar.fi.partitive.formation',
      'grammar.fi.partitive.usage',
      'grammar.fi.local-cases.internal',
    ],
  }),
  createText({
    id: 'text.fi.module-one.16.journey',
    title: { ru: 'Поездка к морю' },
    level: 'A2',
    topics: ['уроки 13–16', 'транспорт', 'природа', 'прошедшее время'],
    body: 'Eilen lähdimme rautatieasemalta. Minulla oli matkalaukku, passi, matkalippu ja kartta. Juna oli nopea, mutta matka oli pitkä. Ikkunasta näin metsän, järven, joen ja suuren vuoren. Illalla tulimme hotelliin ja söimme ravintolassa. Seuraavana päivänä aurinko lämmitti, eikä sade tullut.',
    skillItemIds: [
      'grammar.fi.local-cases.external',
      'grammar.fi.plural.agreement',
      'grammar.fi.imperfect.affirmative',
      'grammar.fi.imperfect.negative-question',
    ],
  }),
  createText({
    id: 'text.fi.module-one.final.new-life',
    title: { ru: 'Первый месяц в Финляндии' },
    level: 'A2',
    topics: ['финал модуля 1', 'повседневная жизнь', 'повторение'],
    body: 'Kuukausi sitten tulin Suomeen. Aluksi olin väsynyt, mutta uusi koti ja kaupunki olivat hyvä alku. Aamulla menin yliopistoon bussilla ja illalla opiskelin kirjastossa. Opin uuden sanan joka päivä, puhuimme suomea ja kirjoitin viestin ystävälle. Viikonloppuna ostin ruokaa torilta, katsoimme elokuvan ja kävelimme puistossa. Kerran matkustin junalla meren rannalle. Sää oli kylmä ja tuuli oli voimakas, mutta aurinko tuli esiin. Nyt ymmärrän enemmän ja haluan jatkaa opiskelua.',
    skillItemIds: [
      'grammar.fi.olla.affirmative',
      'grammar.fi.present.common',
      'grammar.fi.infinitive.chains',
      'grammar.fi.genitive.possession',
      'grammar.fi.partitive.usage',
      'grammar.fi.local-cases.internal',
      'grammar.fi.local-cases.external',
      'grammar.fi.plural.agreement',
      'grammar.fi.imperfect.affirmative',
      'grammar.fi.imperfect.negative-question',
    ],
  }),
]
