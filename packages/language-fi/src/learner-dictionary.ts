import type { FinnishPartOfSpeech } from './types.js'

export interface FinnishLearnerDictionaryForm {
  surface: string
  features: Record<string, string>
}

export interface FinnishLearnerDictionaryEntry {
  lemma: string
  partOfSpeech: FinnishPartOfSpeech
  gloss: string
  forms: FinnishLearnerDictionaryForm[]
}

type FormInput = readonly [surface: string, features?: Record<string, string>]

function entry(
  lemma: string,
  partOfSpeech: FinnishPartOfSpeech,
  gloss: string,
  forms: FormInput[],
): FinnishLearnerDictionaryEntry {
  return {
    lemma,
    partOfSpeech,
    gloss,
    forms: forms.map(([surface, features = {}]) => ({ surface, features })),
  }
}

function fixed(
  lemma: string,
  partOfSpeech: FinnishPartOfSpeech,
  gloss: string,
): FinnishLearnerDictionaryEntry {
  return entry(lemma, partOfSpeech, gloss, [[lemma, { form: 'invariable' }]])
}

const entries = [
  entry('minä', 'pronoun', 'я', [
    ['minä', { case: 'nominative', number: 'singular' }],
    ['minun', { case: 'genitive', number: 'singular' }],
    ['minua', { case: 'partitive', number: 'singular' }],
    ['minussa', { case: 'inessive', number: 'singular' }],
    ['minusta', { case: 'elative', number: 'singular' }],
    ['minuun', { case: 'illative', number: 'singular' }],
    ['minulla', { case: 'adessive', number: 'singular' }],
    ['minulta', { case: 'ablative', number: 'singular' }],
    ['minulle', { case: 'allative', number: 'singular' }],
    ['minuna', { case: 'essive', number: 'singular' }],
    ['minuksi', { case: 'translative', number: 'singular' }],
  ]),
  entry('sinä', 'pronoun', 'ты', [
    ['sinä', { case: 'nominative', number: 'singular' }],
    ['sinun', { case: 'genitive', number: 'singular' }],
    ['sinua', { case: 'partitive', number: 'singular' }],
    ['sinussa', { case: 'inessive', number: 'singular' }],
    ['sinusta', { case: 'elative', number: 'singular' }],
    ['sinuun', { case: 'illative', number: 'singular' }],
    ['sinulla', { case: 'adessive', number: 'singular' }],
    ['sinulta', { case: 'ablative', number: 'singular' }],
    ['sinulle', { case: 'allative', number: 'singular' }],
    ['sinuna', { case: 'essive', number: 'singular' }],
    ['sinuksi', { case: 'translative', number: 'singular' }],
  ]),
  entry('hän', 'pronoun', 'он, она', [
    ['hän', { case: 'nominative', number: 'singular' }],
    ['hänen', { case: 'genitive', number: 'singular' }],
    ['häntä', { case: 'partitive', number: 'singular' }],
    ['hänessä', { case: 'inessive', number: 'singular' }],
    ['hänestä', { case: 'elative', number: 'singular' }],
    ['häneen', { case: 'illative', number: 'singular' }],
    ['hänellä', { case: 'adessive', number: 'singular' }],
    ['häneltä', { case: 'ablative', number: 'singular' }],
    ['hänelle', { case: 'allative', number: 'singular' }],
    ['hänenä', { case: 'essive', number: 'singular' }],
    ['häneksi', { case: 'translative', number: 'singular' }],
  ]),
  entry('me', 'pronoun', 'мы', [
    ['me', { case: 'nominative', number: 'plural' }],
    ['meidän', { case: 'genitive', number: 'plural' }],
    ['meitä', { case: 'partitive', number: 'plural' }],
    ['meissä', { case: 'inessive', number: 'plural' }],
    ['meistä', { case: 'elative', number: 'plural' }],
    ['meihin', { case: 'illative', number: 'plural' }],
    ['meillä', { case: 'adessive', number: 'plural' }],
    ['meiltä', { case: 'ablative', number: 'plural' }],
    ['meille', { case: 'allative', number: 'plural' }],
    ['meinä', { case: 'essive', number: 'plural' }],
    ['meiksi', { case: 'translative', number: 'plural' }],
  ]),
  entry('te', 'pronoun', 'вы', [
    ['te', { case: 'nominative', number: 'plural' }],
    ['teidän', { case: 'genitive', number: 'plural' }],
    ['teitä', { case: 'partitive', number: 'plural' }],
    ['teissä', { case: 'inessive', number: 'plural' }],
    ['teistä', { case: 'elative', number: 'plural' }],
    ['teihin', { case: 'illative', number: 'plural' }],
    ['teillä', { case: 'adessive', number: 'plural' }],
    ['teiltä', { case: 'ablative', number: 'plural' }],
    ['teille', { case: 'allative', number: 'plural' }],
    ['teinä', { case: 'essive', number: 'plural' }],
    ['teiksi', { case: 'translative', number: 'plural' }],
  ]),
  entry('he', 'pronoun', 'они', [
    ['he', { case: 'nominative', number: 'plural' }],
    ['heidän', { case: 'genitive', number: 'plural' }],
    ['heitä', { case: 'partitive', number: 'plural' }],
    ['heissä', { case: 'inessive', number: 'plural' }],
    ['heistä', { case: 'elative', number: 'plural' }],
    ['heihin', { case: 'illative', number: 'plural' }],
    ['heillä', { case: 'adessive', number: 'plural' }],
    ['heiltä', { case: 'ablative', number: 'plural' }],
    ['heille', { case: 'allative', number: 'plural' }],
    ['heinä', { case: 'essive', number: 'plural' }],
    ['heiksi', { case: 'translative', number: 'plural' }],
  ]),
  entry('se', 'pronoun', 'он, она, оно; это', [
    ['se', { case: 'nominative', number: 'singular' }],
    ['sen', { case: 'genitive', number: 'singular' }],
    ['sitä', { case: 'partitive', number: 'singular' }],
    ['siinä', { case: 'inessive', number: 'singular' }],
    ['siitä', { case: 'elative', number: 'singular' }],
    ['siihen', { case: 'illative', number: 'singular' }],
    ['sillä', { case: 'adessive', number: 'singular' }],
    ['siltä', { case: 'ablative', number: 'singular' }],
    ['sille', { case: 'allative', number: 'singular' }],
    ['ne', { case: 'nominative', number: 'plural' }],
    ['niiden', { case: 'genitive', number: 'plural' }],
    ['niitä', { case: 'partitive', number: 'plural' }],
  ]),
  entry('joka', 'pronoun', 'который; каждый', [
    ['joka', { case: 'nominative', number: 'singular' }],
    ['jonka', { case: 'genitive', number: 'singular' }],
    ['jota', { case: 'partitive', number: 'singular' }],
    ['jossa', { case: 'inessive', number: 'singular' }],
    ['josta', { case: 'elative', number: 'singular' }],
    ['johon', { case: 'illative', number: 'singular' }],
    ['jolla', { case: 'adessive', number: 'singular' }],
    ['jolta', { case: 'ablative', number: 'singular' }],
    ['jolle', { case: 'allative', number: 'singular' }],
    ['jotka', { case: 'nominative', number: 'plural' }],
    ['joiden', { case: 'genitive', number: 'plural' }],
    ['joita', { case: 'partitive', number: 'plural' }],
    ['joissa', { case: 'inessive', number: 'plural' }],
    ['joista', { case: 'elative', number: 'plural' }],
    ['joihin', { case: 'illative', number: 'plural' }],
  ]),
  entry('olla', 'verb', 'быть, находиться', [
    ['olla', { form: 'infinitive' }],
    ['olen', { tense: 'present_simple', person: 'first', number: 'singular' }],
    ['olet', { tense: 'present_simple', person: 'second', number: 'singular' }],
    ['on', { tense: 'present_simple', person: 'third', number: 'singular' }],
    ['olemme', { tense: 'present_simple', person: 'first', number: 'plural' }],
    ['olette', { tense: 'present_simple', person: 'second', number: 'plural' }],
    ['ovat', { tense: 'present_simple', person: 'third', number: 'plural' }],
    [
      'olin',
      { tense: 'past_imperfective', person: 'first', number: 'singular' },
    ],
    [
      'olit',
      { tense: 'past_imperfective', person: 'second', number: 'singular' },
    ],
    [
      'oli',
      { tense: 'past_imperfective', person: 'third', number: 'singular' },
    ],
    [
      'olimme',
      { tense: 'past_imperfective', person: 'first', number: 'plural' },
    ],
    [
      'olitte',
      { tense: 'past_imperfective', person: 'second', number: 'plural' },
    ],
    [
      'olivat',
      { tense: 'past_imperfective', person: 'third', number: 'plural' },
    ],
    ['ole', { form: 'connegative' }],
    ['ollut', { form: 'past_participle', number: 'singular' }],
    ['olleet', { form: 'past_participle', number: 'plural' }],
  ]),
  entry('ei', 'negativeVerb', 'не; отрицательный глагол', [
    ['en', { person: 'first', number: 'singular' }],
    ['et', { person: 'second', number: 'singular' }],
    ['ei', { person: 'third', number: 'singular' }],
    ['emme', { person: 'first', number: 'plural' }],
    ['ette', { person: 'second', number: 'plural' }],
    ['eivät', { person: 'third', number: 'plural' }],
  ]),
  entry('aamu', 'noun', 'утро', [
    ['aamu', { case: 'nominative', number: 'singular' }],
    ['aamun', { case: 'genitive', number: 'singular' }],
    ['aamua', { case: 'partitive', number: 'singular' }],
    ['aamulla', { case: 'adessive', number: 'singular' }],
  ]),
  entry('ilta', 'noun', 'вечер', [
    ['ilta', { case: 'nominative', number: 'singular' }],
    ['illan', { case: 'genitive', number: 'singular' }],
    ['iltaa', { case: 'partitive', number: 'singular' }],
    ['illalla', { case: 'adessive', number: 'singular' }],
  ]),
  entry('kaikki', 'pronoun', 'всё; все', [
    ['kaikki', { case: 'nominative', number: 'singular' }],
    ['kaiken', { case: 'genitive', number: 'singular' }],
    ['kaikkea', { case: 'partitive', number: 'singular' }],
    ['kaikkien', { case: 'genitive', number: 'plural' }],
    ['kaikkia', { case: 'partitive', number: 'plural' }],
  ]),
  entry('lauantai', 'noun', 'суббота', [
    ['lauantai', { case: 'nominative', number: 'singular' }],
    ['lauantain', { case: 'genitive', number: 'singular' }],
    ['lauantaita', { case: 'partitive', number: 'singular' }],
    ['lauantaina', { case: 'essive', number: 'singular' }],
  ]),
  entry('iltapäivä', 'noun', 'вторая половина дня', [
    ['iltapäivä', { case: 'nominative', number: 'singular' }],
    ['iltapäivän', { case: 'genitive', number: 'singular' }],
    ['iltapäivää', { case: 'partitive', number: 'singular' }],
    ['iltapäivällä', { case: 'adessive', number: 'singular' }],
  ]),
  entry('rautatieasema', 'noun', 'железнодорожный вокзал', [
    ['rautatieasema', { case: 'nominative', number: 'singular' }],
    ['rautatieaseman', { case: 'genitive', number: 'singular' }],
    ['rautatieasemaa', { case: 'partitive', number: 'singular' }],
    ['rautatieasemalta', { case: 'ablative', number: 'singular' }],
  ]),
  entry('seuraava', 'adjective', 'следующий', [
    ['seuraava', { case: 'nominative', number: 'singular' }],
    ['seuraavan', { case: 'genitive', number: 'singular' }],
    ['seuraavaa', { case: 'partitive', number: 'singular' }],
    ['seuraavana', { case: 'essive', number: 'singular' }],
  ]),
  entry('lämmittää', 'verb', 'согревать', [
    ['lämmittää', { form: 'infinitive' }],
    [
      'lämmitän',
      { tense: 'present_simple', person: 'first', number: 'singular' },
    ],
    [
      'lämmittää',
      { tense: 'present_simple', person: 'third', number: 'singular' },
    ],
    [
      'lämmitti',
      { tense: 'past_imperfective', person: 'third', number: 'singular' },
    ],
  ]),
  entry('kuukausi', 'noun', 'месяц', [
    ['kuukausi', { case: 'nominative', number: 'singular' }],
    ['kuukauden', { case: 'genitive', number: 'singular' }],
    ['kuukautta', { case: 'partitive', number: 'singular' }],
  ]),
  entry('Suomi', 'properNoun', 'Финляндия; финский язык', [
    ['Suomi', { case: 'nominative', number: 'singular' }],
    ['Suomen', { case: 'genitive', number: 'singular' }],
    ['Suomea', { case: 'partitive', number: 'singular' }],
    ['Suomessa', { case: 'inessive', number: 'singular' }],
    ['Suomesta', { case: 'elative', number: 'singular' }],
    ['Suomeen', { case: 'illative', number: 'singular' }],
  ]),
  entry('alku', 'noun', 'начало', [
    ['alku', { case: 'nominative', number: 'singular' }],
    ['alun', { case: 'genitive', number: 'singular' }],
    ['alkua', { case: 'partitive', number: 'singular' }],
    ['aluksi', { case: 'translative', number: 'singular' }],
  ]),
  entry('viikonloppu', 'noun', 'выходные', [
    ['viikonloppu', { case: 'nominative', number: 'singular' }],
    ['viikonlopun', { case: 'genitive', number: 'singular' }],
    ['viikonloppua', { case: 'partitive', number: 'singular' }],
    ['viikonloppuna', { case: 'essive', number: 'singular' }],
  ]),
  entry('ruoka', 'noun', 'еда', [
    ['ruoka', { case: 'nominative', number: 'singular' }],
    ['ruoan', { case: 'genitive', number: 'singular' }],
    ['ruokaa', { case: 'partitive', number: 'singular' }],
  ]),
  entry('kerta', 'noun', 'раз; случай', [
    ['kerta', { case: 'nominative', number: 'singular' }],
    ['kerran', { case: 'genitive', number: 'singular' }],
    ['kertaa', { case: 'partitive', number: 'singular' }],
  ]),
  entry('sää', 'noun', 'погода', [
    ['sää', { case: 'nominative', number: 'singular' }],
    ['sään', { case: 'genitive', number: 'singular' }],
    ['säätä', { case: 'partitive', number: 'singular' }],
  ]),
  entry('voimakas', 'adjective', 'сильный, интенсивный', [
    ['voimakas', { case: 'nominative', number: 'singular' }],
    ['voimakkaan', { case: 'genitive', number: 'singular' }],
    ['voimakasta', { case: 'partitive', number: 'singular' }],
  ]),
  entry('opiskelu', 'noun', 'учёба, обучение', [
    ['opiskelu', { case: 'nominative', number: 'singular' }],
    ['opiskelun', { case: 'genitive', number: 'singular' }],
    ['opiskelua', { case: 'partitive', number: 'singular' }],
  ]),
  fixed('ja', 'conjunction', 'и'),
  fixed('mutta', 'conjunction', 'но'),
  fixed('vaikka', 'conjunction', 'хотя; несмотря на то что'),
  fixed('vielä', 'adverb', 'ещё; пока'),
  fixed('jälkeen', 'adposition', 'после'),
  fixed('eilen', 'adverb', 'вчера'),
  fixed('sitten', 'adverb', 'назад; затем'),
  fixed('esiin', 'adverb', 'наружу; в поле зрения'),
  fixed('nyt', 'adverb', 'сейчас'),
  fixed('enemmän', 'adverb', 'больше'),
] satisfies FinnishLearnerDictionaryEntry[]

const dictionary = new Map(
  entries.map((value) => [value.lemma.toLocaleLowerCase('fi'), value]),
)

export function getFinnishLearnerDictionaryEntry(
  lemma: string,
): FinnishLearnerDictionaryEntry | undefined {
  return dictionary.get(lemma.normalize('NFC').toLocaleLowerCase('fi'))
}

export const finnishLearnerDictionaryEntries = [...dictionary.values()]

export function finnishLearnerDictionaryItemId(lemma: string): string {
  return `word.fi.reader.${lemma.normalize('NFC').toLocaleLowerCase('fi')}`
}

export function finnishLearnerDictionaryConceptId(lemma: string): string {
  return `concept.fi.reader.${lemma.normalize('NFC').toLocaleLowerCase('fi')}`
}

export function finnishLearnerDictionaryLexicalEntryId(lemma: string): string {
  return `lex.fi.reader.${lemma.normalize('NFC').toLocaleLowerCase('fi')}`
}
