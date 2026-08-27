import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

import {
  finnishLearnerDictionaryEntries,
  VoikkoFinnishMorphologyAnalyzer,
} from '@language/language-fi'
import { format, resolveConfig } from 'prettier'

import { moduleOneVocabulary } from '../content/courses/ru-fi/module-one.js'

const KOTUS_WORD_LIST_URL =
  'https://kaino.kotus.fi/lataa/nykysuomensanalista2024.txt'
const OUTPUT_PATH = path.resolve(
  'content/courses/ru-fi/finnish-paradigms.generated.ts',
)
const morphgridRoot = process.env.MORPHGRID_ROOT

if (!morphgridRoot) {
  throw new Error(
    'MORPHGRID_ROOT must point to a directory containing node_modules/@morphgrid/core and node_modules/@morphgrid/packs',
  )
}

interface MorphgridModule {
  morph: {
    load(language: 'fi-FI'): Promise<void>
    generate(
      input: { lemma: string; tags: string[] },
      language: 'fi-FI',
    ): Promise<string[]>
  }
  configureMorphRuntime(mode: 'hfst'): void
  configureMorphHfst(options: { packUrl: string }): void
  configureTagOrdering(policy: 'strict'): void
  cleanup(): void
}

interface GeneratedForm {
  key: string
  surface: string
  features: Record<string, string>
}

interface GeneratedParadigm {
  partOfSpeech: string
  inflectionType: string | null
  gradationType: string | null
  verbType: string | null
  forms: GeneratedForm[]
}

interface FormTarget {
  key: string
  tags: string[]
  features: Record<string, string>
}

let morphgrid: MorphgridModule
let morphology: VoikkoFinnishMorphologyAnalyzer

async function main() {
  const modulePath = path.resolve(
    morphgridRoot!,
    'node_modules/@morphgrid/core/dist/index.js',
  )
  const packPath = path.resolve(
    morphgridRoot!,
    'node_modules/@morphgrid/packs/fi-FI/v1',
  )
  morphgrid = (await import(pathToFileURL(modulePath).href)) as MorphgridModule
  const analysisUrl = pathToFileURL(path.join(packPath, 'analysis.hfstol')).href
  const generationUrl = pathToFileURL(
    path.join(packPath, 'generate.hfstol'),
  ).href

  morphgrid.configureMorphRuntime('hfst')
  morphgrid.configureTagOrdering('strict')
  morphgrid.configureMorphHfst({
    packUrl: `${analysisUrl}?gen=${encodeURIComponent(generationUrl)}`,
  })

  morphology = await VoikkoFinnishMorphologyAnalyzer.create()

  try {
    await morphgrid.morph.load('fi-FI')
    const kotusEntries = await loadKotusEntries()
    const vocabulary = [
      ...new Map(
        [...moduleOneVocabulary, ...finnishLearnerDictionaryEntries].map(
          (item) => [`${item.lemma}|${item.partOfSpeech}`, item],
        ),
      ).values(),
    ]
    const paradigms: Record<string, GeneratedParadigm> = {}

    for (const [index, item] of vocabulary.entries()) {
      const kotus = chooseKotusEntry(
        kotusEntries.get(item.lemma) ?? [],
        item.partOfSpeech,
      )
      const parsedType = parseInflectionType(
        kotus?.inflection ?? fallbackInflectionType(item.lemma),
        item.partOfSpeech,
      )
      const targets = targetsFor(item.lemma, item.partOfSpeech)
      const forms: GeneratedForm[] = []

      for (const target of targets) {
        const outputs = await morphgrid.morph.generate(
          { lemma: item.lemma, tags: target.tags },
          'fi-FI',
        )
        const surface = await chooseVerifiedSurface(
          outputs,
          item.lemma,
          item.partOfSpeech,
          target.features,
        )
        if (surface) {
          forms.push({ key: target.key, surface, features: target.features })
        }
      }

      const verbType =
        item.partOfSpeech === 'verb'
          ? derivePedagogicalVerbType(item.lemma, forms)
          : null
      paradigms[item.lemma] = {
        partOfSpeech: item.partOfSpeech,
        inflectionType: parsedType.inflectionType,
        gradationType: parsedType.gradationType,
        verbType,
        forms,
      }

      if ((index + 1) % 25 === 0 || index + 1 === vocabulary.length) {
        console.log(`Generated ${index + 1}/${vocabulary.length} paradigms`)
      }
    }

    const incomplete = Object.entries(paradigms).filter(
      ([lemma, paradigm]) =>
        finnishLearnerDictionaryEntries.find((entry) => entry.lemma === lemma)
          ?.completeParadigm !== false &&
        !['adposition', 'adverb', 'conjunction', 'negativeVerb'].includes(
          paradigm.partOfSpeech,
        ) &&
        paradigm.forms.length < 7,
    )
    if (incomplete.length > 0) {
      throw new Error(
        `Incomplete paradigms: ${incomplete
          .map(([lemma, paradigm]) => `${lemma} (${paradigm.forms.length})`)
          .join(', ')}`,
      )
    }

    const output =
      `// Generated from Omorfi/GiellaLT forms and Kotus Nykysuomen sanalista 2024.\n` +
      `// Do not edit individual forms by hand; regenerate with scripts/generate-finnish-paradigms.ts.\n\n` +
      `export interface FinnishGeneratedForm {\n` +
      `  key: string\n` +
      `  surface: string\n` +
      `  features: Record<string, string>\n` +
      `}\n\n` +
      `export interface FinnishGeneratedParadigm {\n` +
      `  partOfSpeech: string\n` +
      `  inflectionType: string | null\n` +
      `  gradationType: string | null\n` +
      `  verbType: string | null\n` +
      `  forms: FinnishGeneratedForm[]\n` +
      `}\n\n` +
      `export const finnishGeneratedParadigms: Record<string, FinnishGeneratedParadigm> = ${JSON.stringify(paradigms, null, 2)}\n`
    await writeFile(
      OUTPUT_PATH,
      await format(output, {
        ...(await resolveConfig(OUTPUT_PATH)),
        filepath: OUTPUT_PATH,
      }),
      'utf8',
    )
    console.log(`Wrote ${OUTPUT_PATH}`)
  } finally {
    morphology.close()
    morphgrid.cleanup()
  }
}

void main()

async function loadKotusEntries() {
  const localPath = process.env.KOTUS_WORD_LIST_PATH
  const value = localPath
    ? await readFile(localPath, 'utf8')
    : await fetch(KOTUS_WORD_LIST_URL).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Kotus word list responded with ${response.status}`)
        }
        return response.text()
      })
  const entries = new Map<
    string,
    Array<{ partOfSpeech: string; inflection: string }>
  >()

  for (const line of value.split(/\r?\n/u).slice(1)) {
    const [lemma, , partOfSpeech = '', inflection = ''] = line.split('\t')
    if (!lemma) continue
    const current = entries.get(lemma) ?? []
    current.push({ partOfSpeech, inflection })
    entries.set(lemma, current)
  }
  return entries
}

function chooseKotusEntry(
  entries: Array<{ partOfSpeech: string; inflection: string }>,
  partOfSpeech: string,
) {
  const expected: Record<string, string> = {
    adjective: 'adjektiivi',
    adverb: 'adverbi',
    noun: 'substantiivi',
    properNoun: 'erisnimi',
    pronoun: 'pronomini',
    verb: 'verbi',
  }
  return (
    entries.find((entry) =>
      entry.partOfSpeech.includes(expected[partOfSpeech] ?? partOfSpeech),
    ) ?? entries[0]
  )
}

function fallbackInflectionType(lemma: string) {
  if (lemma.endsWith('minen')) return '38'
  return ''
}

function parseInflectionType(value: string, partOfSpeech: string) {
  if (partOfSpeech === 'adverb') {
    return { inflectionType: '99', gradationType: null }
  }
  if (!value && ['noun', 'properNoun', 'adjective'].includes(partOfSpeech)) {
    return { inflectionType: 'compound', gradationType: null }
  }
  const match = value.match(/(\d+)(?:\*([A-Z]))?/u)
  return {
    inflectionType: match?.[1] ?? null,
    gradationType: match?.[2] ?? null,
  }
}

async function chooseVerifiedSurface(
  outputs: string[],
  lemma: string,
  partOfSpeech: string,
  features: Record<string, string>,
) {
  const candidates = [
    ...new Set(
      outputs.filter(
        (surface) => surface && !surface.startsWith('HFST_GENERATION_FAILED:'),
      ),
    ),
  ]
  const verified: string[] = []
  for (const surface of candidates) {
    const analyses = await morphology.analyzeWord(surface)
    if (
      analyses.some(
        (analysis) =>
          (analysis.lemma.toLocaleLowerCase('fi') ===
            lemma.toLocaleLowerCase('fi') &&
            matchesPartOfSpeech(analysis.partOfSpeech, partOfSpeech)) ||
          (lemma.endsWith('minen') &&
            analysis.features.mood === 'MINEN-infinitive') ||
          (partOfSpeech === 'verb' &&
            Boolean(analysis.features.participle) &&
            Boolean(analysis.wordBases?.includes(`(${lemma})`))),
      )
    ) {
      verified.push(surface)
    }
  }
  const preferredCandidates =
    verified.length > 0 ||
    !(partOfSpeech === 'verb' && features.form?.includes('participle'))
      ? verified
      : candidates
  return (
    preferredCandidates.sort(
      (left, right) =>
        learnerFormPenalty(left, features) -
        learnerFormPenalty(right, features),
    )[0] ?? null
  )
}

function learnerFormPenalty(surface: string, features: Record<string, string>) {
  if (
    features.case === 'genitive' &&
    features.number === 'plural' &&
    (surface.endsWith('in') || surface.endsWith('tten'))
  ) {
    return 10
  }
  return 0
}

function matchesPartOfSpeech(actual: string, expected: string) {
  if (actual === expected) return true
  if (actual === 'unknown' && ['noun', 'adjective'].includes(expected)) {
    return true
  }
  return (
    (expected === 'noun' && actual === 'properNoun') ||
    (expected === 'pronoun' && actual === 'noun') ||
    (expected === 'properNoun' && ['noun', 'properNoun'].includes(actual))
  )
}

function targetsFor(lemma: string, partOfSpeech: string): FormTarget[] {
  if (partOfSpeech === 'verb') return verbTargets()
  if (partOfSpeech === 'pronoun') return pronounTargets(lemma)
  if (partOfSpeech === 'adverb') {
    return [
      {
        key: 'invariant',
        tags: ['Adv'],
        features: { form: 'invariant' },
      },
    ]
  }
  if (partOfSpeech === 'adjective') {
    return ['positive', 'comparative', 'superlative'].flatMap((comparison) =>
      nominalTargets('A', comparison),
    )
  }
  if (['adposition', 'conjunction', 'negativeVerb'].includes(partOfSpeech)) {
    return []
  }
  if (partOfSpeech === 'properNoun') {
    return nominalTargets('N').map((target) => ({
      ...target,
      tags: ['N', 'Prop', ...target.tags.slice(1)],
    }))
  }
  return nominalTargets('N')
}

const nominalCases = [
  ['nominative', 'Nom'],
  ['genitive', 'Gen'],
  ['accusative', 'Acc'],
  ['partitive', 'Par'],
  ['essive', 'Ess'],
  ['translative', 'Tra'],
  ['inessive', 'Ine'],
  ['elative', 'Ela'],
  ['illative', 'Ill'],
  ['adessive', 'Ade'],
  ['ablative', 'Abl'],
  ['allative', 'All'],
  ['abessive', 'Abe'],
  ['instructive', 'Ins'],
  ['comitative', 'Com'],
] as const

function nominalTargets(partOfSpeechTag: 'N' | 'A', comparison?: string) {
  const comparisonTag =
    comparison === 'comparative'
      ? 'Comp'
      : comparison === 'superlative'
        ? 'Superl'
        : null
  return (['singular', 'plural'] as const).flatMap((number) =>
    nominalCases.flatMap(([grammaticalCase, caseTag]) => {
      if (
        number === 'singular' &&
        ['instructive', 'comitative'].includes(grammaticalCase)
      ) {
        return []
      }
      const numberTag = number === 'singular' ? 'Sg' : 'Pl'
      return [
        {
          key: [comparison, number, grammaticalCase].filter(Boolean).join('-'),
          tags: [
            partOfSpeechTag,
            ...(comparisonTag ? [comparisonTag] : []),
            numberTag,
            caseTag,
          ],
          features: {
            ...(comparison ? { comparison } : {}),
            number,
            case: grammaticalCase,
          },
        },
      ]
    }),
  )
}

function pronounTargets(lemma: string): FormTarget[] {
  const personByLemma: Record<
    string,
    { person: string; number: string; tag: string }
  > = {
    minä: { person: 'first', number: 'singular', tag: 'Sg1' },
    sinä: { person: 'second', number: 'singular', tag: 'Sg2' },
    hän: { person: 'third', number: 'singular', tag: 'Sg3' },
    me: { person: 'first', number: 'plural', tag: 'Pl1' },
    te: { person: 'second', number: 'plural', tag: 'Pl2' },
    he: { person: 'third', number: 'plural', tag: 'Pl3' },
  }
  const person = personByLemma[lemma]
  if (!person) {
    const subtype: Record<string, string> = {
      kaikki: 'Qu',
      joka: 'Rel',
      se: 'Dem',
    }
    return (['singular', 'plural'] as const).flatMap((number) =>
      nominalCases.flatMap(([grammaticalCase, caseTag]) => {
        if (
          number === 'singular' &&
          ['instructive', 'comitative'].includes(grammaticalCase)
        ) {
          return []
        }
        return [
          {
            key: `${number}-${grammaticalCase}`,
            tags: [
              'Pron',
              ...(subtype[lemma] ? [subtype[lemma]] : []),
              number === 'singular' ? 'Sg' : 'Pl',
              caseTag,
            ],
            features: { number, case: grammaticalCase },
          },
        ]
      }),
    )
  }

  return nominalCases.flatMap(([grammaticalCase, caseTag]) => {
    if (['instructive', 'comitative'].includes(grammaticalCase)) return []
    return [
      {
        key: grammaticalCase,
        tags: ['Pron', 'Pers', person.tag, caseTag],
        features: {
          person: person.person,
          number: person.number,
          case: grammaticalCase,
        },
      },
    ]
  })
}

function verbTargets(): FormTarget[] {
  const persons = [
    ['first', 'singular', 'Sg1'],
    ['second', 'singular', 'Sg2'],
    ['third', 'singular', 'Sg3'],
    ['first', 'plural', 'Pl1'],
    ['second', 'plural', 'Pl2'],
    ['third', 'plural', 'Pl3'],
  ] as const
  const targets: FormTarget[] = [
    {
      key: 'infinitive',
      tags: ['V', 'Act', 'InfA', 'Sg', 'Lat'],
      features: { form: 'infinitive' },
    },
  ]

  for (const [person, number, tag] of persons) {
    targets.push(
      {
        key: `present-${tag.toLocaleLowerCase('fi')}`,
        tags: ['V', 'Act', 'Ind', 'Prs', tag],
        features: {
          voice: 'active',
          mood: 'indicative',
          tense: 'present',
          person,
          number,
        },
      },
      {
        key: `imperfect-${tag.toLocaleLowerCase('fi')}`,
        tags: ['V', 'Act', 'Ind', 'Prt', tag],
        features: {
          voice: 'active',
          mood: 'indicative',
          tense: 'imperfect',
          person,
          number,
        },
      },
      {
        key: `conditional-${tag.toLocaleLowerCase('fi')}`,
        tags: ['V', 'Act', 'Cond', tag],
        features: {
          voice: 'active',
          mood: 'conditional',
          person,
          number,
        },
      },
    )
  }

  for (const [person, number, tag] of persons.slice(1)) {
    targets.push({
      key: `imperative-${tag.toLocaleLowerCase('fi')}`,
      tags: ['V', 'Act', 'Imprt', tag],
      features: {
        voice: 'active',
        mood: 'imperative',
        person,
        number,
      },
    })
  }

  targets.push(
    {
      key: 'present-connegative',
      tags: ['V', 'Act', 'Ind', 'Prs', 'ConNeg'],
      features: {
        voice: 'active',
        mood: 'indicative',
        tense: 'present',
        form: 'connegative',
      },
    },
    ...[
      [
        'passive-present',
        ['V', 'Pss', 'Ind', 'Prs', 'Pe4'],
        'indicative',
        'present',
      ],
      [
        'passive-imperfect',
        ['V', 'Pss', 'Ind', 'Prt', 'Pe4'],
        'indicative',
        'imperfect',
      ],
      ['passive-conditional', ['V', 'Pss', 'Cond', 'Pe4'], 'conditional', null],
      ['passive-imperative', ['V', 'Pss', 'Imprt', 'Pe4'], 'imperative', null],
    ].map(([key, tags, mood, tense]) => ({
      key: key as string,
      tags: tags as string[],
      features: {
        voice: 'passive',
        mood: mood as string,
        ...(tense ? { tense: tense as string } : {}),
      },
    })),
    {
      key: 'active-past-participle',
      tags: ['V', 'Act', 'PrfPrc', 'Sg', 'Nom'],
      features: { voice: 'active', form: 'past_participle' },
    },
    {
      key: 'active-present-participle',
      tags: ['V', 'Act', 'PrsPrc', 'Sg', 'Nom'],
      features: { voice: 'active', form: 'present_participle' },
    },
    {
      key: 'passive-past-participle',
      tags: ['V', 'Pss', 'PrfPrc', 'Sg', 'Nom'],
      features: { voice: 'passive', form: 'past_participle' },
    },
    {
      key: 'passive-present-participle',
      tags: ['V', 'Pss', 'PrsPrc', 'Sg', 'Nom'],
      features: { voice: 'passive', form: 'present_participle' },
    },
    {
      key: 'agent-participle',
      tags: ['V', 'AgPrc', 'Sg', 'Nom'],
      features: { voice: 'active', form: 'agent_participle' },
    },
    {
      key: 'negative-participle',
      tags: ['V', 'NegPrc', 'Sg', 'Nom'],
      features: { voice: 'active', form: 'negative_participle' },
    },
  )

  return targets
}

function derivePedagogicalVerbType(lemma: string, forms: GeneratedForm[]) {
  if (/[dD][aä]$/u.test(lemma)) return '2'
  if (/(?:ll|nn|rr|st)[aä]$/u.test(lemma)) return '3'
  const firstSingular = forms.find(
    (form) =>
      form.features.mood === 'indicative' &&
      form.features.tense === 'present' &&
      form.features.person === 'first' &&
      form.features.number === 'singular',
  )
  const stem = firstSingular?.surface.replace(/n$/u, '') ?? ''
  if (stem.endsWith('itse')) return '5'
  if (stem.endsWith('ne')) return '6'
  if (/t[aä]$/u.test(lemma)) return '4'
  return '1'
}
