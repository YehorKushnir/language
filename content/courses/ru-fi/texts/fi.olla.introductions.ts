import { moduleOneLessons, moduleOneVocabularyByLemma } from '../module-one.js'
import {
  finnishLearnerDictionaryEntries,
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
  aamuna: 'aamu',
  asuntoonsa: 'asunto',
  asuntonsa: 'asunto',
  auttamaan: 'auttaa',
  halunneet: 'haluta',
  hitaasti: 'hidas',
  kerralla: 'kerta',
  laukustaan: 'laukku',
  löytäneet: 'löytää',
  nimensä: 'nimi',
  nopeasti: 'nopea',
  opiskelemaan: 'opiskella',
  perheensä: 'perhe',
  perheistään: 'perhe',
  puhelimensa: 'puhelin',
  seuraavalla: 'seuraava',
  voimakkaasti: 'voimakas',
  ystävälleen: 'ystävä',
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

const moduleVocabularyBySurface = new Map(
  [...moduleOneVocabularyByLemma.values()].flatMap((item) =>
    item.forms.map(
      (form) => [form.surface.toLocaleLowerCase('fi'), item] as const,
    ),
  ),
)

const learnerDictionaryBySurface = new Map(
  finnishLearnerDictionaryEntries.flatMap((entry) =>
    entry.forms.map(
      (form) => [form.surface.toLocaleLowerCase('fi'), entry] as const,
    ),
  ),
)

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

function vocabularyFormReference(surface: string): TokenReference | undefined {
  const item = moduleVocabularyBySurface.get(surface)
  return item
    ? {
        lemma: item.lemma,
        lexicalSenseId: item.itemId,
        analysis: { partOfSpeech: item.partOfSpeech },
      }
    : undefined
}

function dictionaryFormReference(surface: string): TokenReference | undefined {
  const entry = learnerDictionaryBySurface.get(surface)
  return entry
    ? {
        lemma: entry.lemma,
        lexicalSenseId: finnishLearnerDictionaryItemId(entry.lemma),
        analysis: { partOfSpeech: entry.partOfSpeech },
      }
    : undefined
}

function encliticReference(surface: string): TokenReference | undefined {
  for (const suffix of ['kin', 'kaan', 'kään', 'ko', 'kö']) {
    if (!surface.endsWith(suffix)) continue
    const base = surface.slice(0, -suffix.length)
    const reference =
      vocabularyFormReference(base) ?? dictionaryFormReference(base)
    if (reference) return reference
  }
  return undefined
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
    vocabularyFormReference(normalized) ??
    dictionaryFormReference(normalized) ??
    encliticReference(normalized) ??
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

function skillItemIdsForLessons(from: number, to: number): string[] {
  return moduleOneLessons
    .filter(
      (lesson) => lesson.lessonPosition >= from && lesson.lessonPosition <= to,
    )
    .flatMap((lesson) => lesson.skills.map((skill) => skill.id))
}

export const preparedTexts: PreparedTextSeed[] = [
  createText({
    id: 'text.fi.module-one.04.study-day',
    title: { ru: 'Первый день на курсах' },
    level: 'A1',
    topics: ['уроки 1–4', 'учёба', 'общение'],
    body: [
      'Minä olen Anna, ja olen uusi opiskelija. Tänään tulen ensimmäistä kertaa suomen kurssille. Olen vähän väsynyt, koska aamu alkaa aikaisin, mutta olen myös iloinen. Oven vieressä odottaa nuori mies. Hän hymyilee ja sanoo:',
      '– Hei! Minä olen Mika. Oletko sinäkin opiskelija?\n– Kyllä olen. Olen Anna. Oletko sinä suomalainen?\n– En ole. Olen venäläinen, mutta asun Suomessa ja työskentelen täällä.',
      'Opettaja tulee luokkaan ja sulkee oven. Opettaja on Laura. Hän puhuu hitaasti, kirjoittaa taululle sanoja ja kysyy helppoja kysymyksiä. Me kuuntelemme, luemme lyhyen keskustelun ja kirjoitamme vastaukset vihkoon. Mika ymmärtää melkein kaiken, mutta minä en muista yhtä sanaa. Laura näyttää kuvan ja selittää sanan uudelleen. Nyt ymmärrän merkityksen.',
      'Tauolla menemme pieneen kahvilaan. Mika juo kahvia ja syö leipää. Minä juon teetä, mutta en syö, koska en ole nälkäinen. Pöydässä istuu myös Sofia. Hän on lääkäri ja opiskelee suomea.',
      '– Puhutteko te jo hyvin suomea? Sofia kysyy.\n– Emme puhu hyvin, mutta harjoittelemme joka päivä, Mika vastaa.',
      'Sitten sanomme puhelinnumeromme. Mika kirjoittaa yhden numeron väärin, ja minä tarkistan sen.',
      'Tauon jälkeen Laura antaa meille uuden tehtävän. Teemme sen yhdessä. Minä kysyn, Mika vastaa, ja sitten vaihdamme osia. Kun kurssi loppuu, kirjoitan lyhyen viestin uudelle ystävälle: ”Hei Mika! Kiitos keskustelusta. Nähdään huomenna.”',
      'Hetken kuluttua puhelin soi. Mika vastaa: ”Kiitos, Anna. Huomenna jatkamme suomen opiskelua yhdessä.”',
      'Nyt en ole enää väsynyt. Ensimmäinen kurssipäivä on hyvä alku.',
    ].join('\n\n'),
    skillItemIds: skillItemIdsForLessons(1, 4),
  }),
  createText({
    id: 'text.fi.module-one.08.home-plan',
    title: { ru: 'Потерянный ключ' },
    level: 'A1',
    topics: ['уроки 5–8', 'семья', 'дом', 'планы'],
    body: [
      'Lauantaiaamuna Emilia muuttaa uuteen asuntoon. Hänen perheensä tulee auttamaan aikaisin. Emilian uusi koti on pieni, mutta valoisa. Siellä on keittiö, olohuone, makuuhuone ja parveke. Liisalla, Emilian siskolla, on auto. Isä kantaa sänkyä ja suurta pöytää. Äiti haluaa siivota keittiön ennen kuin tavarat tulevat sisään. Pikkuveli Oskari yrittää kantaa laatikkoa, vaikka laatikko on melkein yhtä suuri kuin hän.',
      'Kaikki ovat valmiita aloittamaan, mutta Emilia ei voi avata ovea. Avain ei ole laukussa.',
      '– Onko avain äidin takissa? Liisa kysyy.\n– Ei ole. Minä tarkistan kaikki taskut, äiti vastaa.\n– Onko se isän laukussa?\n– Ei ole sielläkään.',
      'Emilia alkaa pelätä, että avain on vanhassa kodissa. Hän yrittää soittaa vuokranantajalle, mutta tämä ei vastaa. Perhe etsii avainta autosta, laukkujen alta ja tavaralaatikoista. Lopulta Oskari muistaa jotain.',
      '– Minä panin avaimen siniseen kuppiin, hän sanoo. – En halunnut pudottaa sitä.',
      'Sininen kuppi löytyy keittiötavaroiden laatikosta. Emilia avaa oven, ja kaikki nauravat helpottuneina.',
      'Sisällä työt jatkuvat. Isä yrittää korjata parvekkeen ovea. Äiti alkaa pestä kaappeja. Liisa pakkaa vaatteet hyllyille, ja Oskari saa avata pienet laatikot. Emilia haluaa maalata yhden seinän, mutta tänään siihen ei ole aikaa.',
      'Iltapäivällä naapuri tulee tervehtimään. Hänen nimensä on Aino. Ainolla on kaksi ylimääräistä tuolia, ja hän lupaa lainata ne Emilialle. Illalla perhe istuu vielä lattialla, koska pöytä ei ole valmis. He syövät pizzaa, katsovat uutta asuntoa ja suunnittelevat huomista.',
      'Emilia on väsynyt mutta onnellinen. Nyt hänellä on uusi koti — ja avain on turvallisesti hänen taskussaan.',
    ].join('\n\n'),
    skillItemIds: skillItemIdsForLessons(5, 8),
  }),
  createText({
    id: 'text.fi.module-one.12.market-day',
    title: { ru: 'Ужин-сюрприз' },
    level: 'A1+',
    topics: ['уроки 9–12', 'еда', 'город', 'свободное время'],
    body: [
      'Aino haluaa järjestää yllätysillallisen ystävälleen Leolle. Leolla on syntymäpäivä, mutta hän luulee, että illalla ei tapahdu mitään erityistä. Aino kutsuu muutaman ystävän asuntoonsa ja suunnittelee yksinkertaisen ruoan.',
      'Aamulla Aino tarkistaa keittiön. Kaapissa on riisiä, pastaa ja yksi pullo mehua. Jääkaapissa on kaksi munaa ja vähän juustoa, mutta siellä ei ole maitoa, voita eikä vihanneksia. Aino kirjoittaa ostoslistan paperille ja panee paperin pöydälle. Sitten hän ottaa laukun ja lähtee kauppaan.',
      'Kaupassa Aino huomaa, että ostoslista on edelleen keittiön pöydällä. Hän ei halua palata kotiin, joten hän yrittää muistaa kaiken. Hän ostaa leipää, maitoa, voita, perunoita, porkkanoita ja tomaatteja. Hän ottaa myös kolme omenaa ja kaksi appelsiinia. Lihaa hän ei osta, koska Leo ei syö lihaa.',
      'Kassalla Aino ei löydä lompakkoa. Hän etsii sitä laukusta, kirjan alta ja pienestä taskusta. Lopulta lompakko löytyy vihkon välistä. Kaupasta Aino menee kahvilaan. Kahvilasta hän hakee pienen kakun, jonka hän tilasi eilen. Sen jälkeen hän käy kirjastossa ja palauttaa Leon kirjan.',
      'Kotona ystävät auttavat ruoan kanssa. Mira tekee salaattia, Olli keittää perunakeittoa ja Aino kattaa pöydän. Yksi veitsi puuttuu, mutta se löytyy laatikosta pyyhkeen alta. Pian keittiössä tuoksuu hyvältä.',
      'Kun Leo tulee asuntoon, kaikki huutavat: ”Paljon onnea!”',
      'Leo yllättyy täysin. Ystävät syövät keittoa, salaattia ja kakkua. He kuuntelevat musiikkia, katsovat valokuvia ja puhuvat pitkään. Illan lopussa Leo sanoo, että paras lahja ei ole kakku eikä kirja. Paras lahja on yhteinen ilta ystävien kanssa.',
    ].join('\n\n'),
    skillItemIds: skillItemIdsForLessons(9, 12),
  }),
  createText({
    id: 'text.fi.module-one.16.journey',
    title: { ru: 'Потерянный телефон на острове' },
    level: 'A2',
    topics: ['уроки 13–16', 'транспорт', 'природа', 'прошедшее время'],
    body: [
      'Viime lauantaina neljä ystävää lähti pienelle retkelle. Aino, Leo, Mira ja Olli matkustivat junalla kaupungista satamaan. Asemalla oli paljon ihmisiä, ja suuret junat olivat täynnä matkustajia. Ystävillä oli raskaat laukut, lämpimät takit ja uusi kartta.',
      'Junassa Mira kysyi Ollilta:',
      '– Otitko sinä varmasti matkaliput?\n– Otin, mutta en ottanut paperikarttaa, Olli vastasi.\n– Ei hätää. Minulla on kartta puhelimessa.',
      'Satamasta ystävät matkustivat lautalla pienelle saarelle. Merellä tuuli voimakkaasti, mutta aurinko paistoi. Saarella korkeat puut liikkuivat tuulessa, ja kapeat polut kulkivat metsän läpi. Ystävät kävelivät rannalta vanhalle näköalapaikalle. Sieltä he näkivät meren, pieniä saaria ja kaukana kulkevia laivoja.',
      'Iltapäivällä pilvet muuttuivat tummiksi. Kun ystävät palasivat rannalle, Olli huomasi, että hänen puhelimensa ei ollut taskussa.',
      '– Pudotitko sen näköalapaikalla? Aino kysyi.\n– En tiedä. Käytin sitä viimeksi metsässä.',
      'He eivät halunneet lähteä ilman puhelinta. Ystävät palasivat samaa polkua pitkin. He katsoivat kivien taakse, märkään ruohoon ja vanhojen puiden alle, mutta eivät löytäneet mitään. Sitten Mira soitti Ollin numeroon. Ensin he eivät kuulleet ääntä. Toisella kerralla metsästä kuului hiljainen soittoääni.',
      'Puhelin löytyi keltaisten lehtien alta. Sen näyttö ei ollut rikki, ja kaikki hymyilivät helpottuneina.',
      'Sade alkoi juuri, kun ystävät juoksivat takaisin rannalle. He eivät myöhästyneet viimeiseltä lautalta, mutta heidän vaatteensa olivat märät ja kengät likaiset. Junassa he olivat väsyneitä mutta iloisia.',
      '– Oliko retki hyvä? Leo kysyi.\n– Oli, Olli vastasi. – Mutta seuraavalla kerralla puhelin pysyy laukussa.',
    ].join('\n\n'),
    skillItemIds: skillItemIdsForLessons(13, 16),
  }),
  createText({
    id: 'text.fi.module-one.final.new-life',
    title: { ru: 'Первый месяц в Финляндии' },
    level: 'A2',
    topics: ['финал модуля 1', 'повседневная жизнь', 'повторение'],
    body: [
      'Kuukausi sitten Anna tuli Suomeen opiskelemaan. Hän ei tuntenut kaupungissa ketään, eikä hän puhunut hyvin suomea. Ensimmäisenä aamuna hän oli väsynyt mutta iloinen. Hänen uusi asuntonsa oli pieni ja valoisa. Asunnossa oli keittiö, makuuhuone ja parveke. Annalla ei ollut vielä pöytää eikä tuoleja, mutta naapuri lainasi hänelle yhden tuolin. Naapurin nimi oli Mika.',
      'Seuraavana päivänä Anna meni suomen kurssille bussilla. Opettaja puhui hitaasti, kirjoitti taululle ja näytti kuvia. Anna kuunteli tarkasti ja yritti vastata jokaiseen kysymykseen. Kun hän ei ymmärtänyt sanan merkitystä, hän kysyi: ”Voitko selittää tämän uudelleen?” Opettaja selitti, ja Anna kirjoitti vastauksen vihkoon. Tauolla opiskelijat joivat kahvia ja teetä. He kertoivat perheistään, työstään ja kotimaistaan. Anna sai uusia ystäviä ja alkoi harjoitella suomea heidän kanssaan joka päivä.',
      'Viikonloppuna Mika halusi auttaa Annaa uudessa kodissa. He tapasivat aamulla kaupassa. Anna tarvitsi lampun, maton, kaksi kuppia ja pienen kattilan. Tavarat eivät olleet halpoja, joten hän tarkisti hinnat huolellisesti. Kassalla Anna ei ensin löytänyt lompakkoa laukustaan. Lopulta se löytyi kirjan alta. Kotona Mika korjasi parvekkeen ovea, ja Anna siivosi keittiön. Sitten he päättivät kokata yhdessä. He tekivät perunakeittoa ja salaattia. Keittoon tuli vettä, perunoita, porkkanaa ja sipulia. Jälkiruoaksi he söivät omenoita ja pienen kakun.',
      'Sunnuntaina Anna ja kurssin muut opiskelijat lähtivät retkelle. He matkustivat junalla satamaan ja jatkoivat matkaa lautalla saarelle. Päivä oli kylmä, mutta kauniit metsät, korkeat puut ja pienet rannat näyttivät upeilta. Saarella ystävät kävelivät pitkää polkua, ottivat valokuvia ja söivät eväitä. Iltapäivällä taivaalle tuli tummia pilviä. Tuuli voimistui, ja pian alkoi sataa.',
      'Kun ryhmä palasi rannalle, Anna huomasi, ettei hänen puhelimensa ollut taskussa. Hän etsi sitä laukusta, mutta ei löytänyt sitä. Mika kysyi: ”Käytitkö puhelinta metsässä?” Anna vastasi: ”Käytin, mutta en muista, mihin panin sen.” He palasivat polulle ja katsoivat kivien sekä puiden alle. Puhelin löytyi lopulta märästä ruohosta. Se ei ollut rikki, mutta viimeinen lautta oli jo lähdössä. Ystävät juoksivat nopeasti ja ehtivät mukaan.',
      'Illalla Anna istui kotona naapurin tuolilla ja katsoi päivän valokuvia. Ensimmäinen kuukausi ei ollut helppo: hän teki virheitä, unohti sanoja ja kerran melkein kadotti puhelimensa. Hän ei kuitenkaan halunnut lopettaa. Nyt hän osasi kysyä, vastata, hoitaa tavallisia asioita ja puhua ystävien kanssa. Seuraavana aamuna Mika lähetti viestin: ”Oletko valmis uuteen viikkoon?” Anna hymyili ja kirjoitti: ”Olen. Nähdään kurssilla!”',
    ].join('\n\n'),
    skillItemIds: skillItemIdsForLessons(1, 16),
  }),
]
