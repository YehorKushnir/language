import { moduleOneVocabularyByLemma } from '../module-one.js'

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
  avaimen: 'avain',
  asun: 'asua',
  asuu: 'asua',
  auttoi: 'auttaa',
  bussilla: 'bussi',
  elokuvan: 'elokuva',
  haluan: 'haluta',
  haluamme: 'haluta',
  heräsimme: 'herätä',
  hotellissa: 'hotelli',
  hotellin: 'hotelli',
  järven: 'järvi',
  juon: 'juoda',
  kahvia: 'kahvi',
  kahvilassa: 'kahvila',
  katsoimme: 'katsoa',
  kaupungissa: 'kaupunki',
  kertoo: 'kertoa',
  kirjastossa: 'kirjasto',
  kirjaa: 'kirja',
  keskustelemme: 'keskustelu',
  kirjoitan: 'kirjoittaa',
  kysyy: 'kysyä',
  laukun: 'laukku',
  leipää: 'leipä',
  lipun: 'lippu',
  luen: 'lukea',
  lukemisesta: 'lukeminen',
  lähdimme: 'lähteä',
  maksoin: 'maksaa',
  matkaa: 'matka',
  matkusti: 'matkustaa',
  meren: 'meri',
  menemme: 'mennä',
  menin: 'mennä',
  metsän: 'metsä',
  museossa: 'museo',
  musiikista: 'musiikki',
  omenoita: 'omena',
  odotimme: 'odottaa',
  opimme: 'oppia',
  opin: 'oppia',
  ostamme: 'ostaa',
  ostin: 'ostaa',
  oven: 'ovi',
  palasimme: 'palata',
  perunoita: 'peruna',
  puistossa: 'puisto',
  puhuimme: 'puhua',
  ruoka: 'ruoka',
  ruokaa: 'ruoka',
  suunnittelemme: 'suunnitella',
  söimme: 'syödä',
  teetä: 'tee',
  torilla: 'tori',
  torille: 'tori',
  tulimme: 'tulla',
  uutisia: 'uutinen',
  uuden: 'uusi',
  vastaa: 'vastata',
  viestin: 'viesti',
  vuoren: 'vuori',
  ymmärrä: 'ymmärtää',
  yliopistoon: 'yliopisto',
  ystäväni: 'ystävä',
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
  const inflectedLemma = inflectedVocabularyReferences[normalized]
  return (
    grammarReferences[normalized] ??
    vocabularyReference(inflectedLemma ?? normalized)
  )
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
    level: 'A1',
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
    level: 'A1',
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
    level: 'A1',
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
