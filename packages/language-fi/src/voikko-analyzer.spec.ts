import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { FinnishMorphologyInputError } from './types.js'
import { VoikkoFinnishMorphologyAnalyzer } from './voikko-analyzer.js'

describe('VoikkoFinnishMorphologyAnalyzer', () => {
  let analyzer: VoikkoFinnishMorphologyAnalyzer

  beforeAll(async () => {
    analyzer = await VoikkoFinnishMorphologyAnalyzer.create()
  })

  afterAll(() => {
    analyzer.close()
  })

  it('analyzes noun cases, number, and lemma', async () => {
    await expect(analyzer.analyzeWord('opiskelijoita')).resolves.toContainEqual(
      expect.objectContaining({
        lemma: 'opiskelija',
        partOfSpeech: 'noun',
        features: expect.objectContaining({
          case: 'partitive',
          number: 'plural',
        }),
      }),
    )
  })

  it.each([
    ['talo', 'nominative', 'singular'],
    ['talon', 'genitive', 'singular'],
    ['taloa', 'partitive', 'singular'],
    ['talossa', 'inessive', 'singular'],
    ['talosta', 'elative', 'singular'],
    ['taloon', 'illative', 'singular'],
    ['talolla', 'adessive', 'singular'],
    ['talolta', 'ablative', 'singular'],
    ['talolle', 'allative', 'singular'],
    ['talona', 'essive', 'singular'],
    ['taloksi', 'translative', 'singular'],
    ['talotta', 'abessive', 'singular'],
    ['taloin', 'instructive', 'plural'],
    ['taloineen', 'comitative', 'plural'],
  ] as const)(
    'maps the Finnish case in %s',
    async (word, grammaticalCase, number) => {
      await expect(analyzer.analyzeWord(word)).resolves.toContainEqual(
        expect.objectContaining({
          lemma: 'talo',
          partOfSpeech: 'noun',
          features: expect.objectContaining({ case: grammaticalCase, number }),
        }),
      )
    },
  )

  it('maps the morphologically distinct accusative', async () => {
    await expect(analyzer.analyzeWord('minut')).resolves.toContainEqual(
      expect.objectContaining({
        lemma: 'minä',
        features: expect.objectContaining({
          case: 'accusative',
          number: 'singular',
        }),
      }),
    )
  })

  it('analyzes person, tense, mood, and question clitics', async () => {
    await expect(analyzer.analyzeWord('olen')).resolves.toContainEqual(
      expect.objectContaining({
        lemma: 'olla',
        partOfSpeech: 'verb',
        features: expect.objectContaining({
          person: 'first',
          number: 'singular',
          mood: 'indicative',
          tense: 'present_simple',
        }),
      }),
    )
    await expect(analyzer.analyzeWord('oletko')).resolves.toContainEqual(
      expect.objectContaining({
        lemma: 'olla',
        features: expect.objectContaining({ questionClitic: true }),
      }),
    )
  })

  it.each([
    ['olisin', 'conditional', 'first'],
    ['ollaan', 'indicative', 'passive'],
    ['olkaa', 'imperative', 'second'],
  ] as const)('maps mood and person in %s', async (word, mood, person) => {
    await expect(analyzer.analyzeWord(word)).resolves.toContainEqual(
      expect.objectContaining({
        lemma: 'olla',
        partOfSpeech: 'verb',
        features: expect.objectContaining({ mood, person }),
      }),
    )
  })

  it('preserves complex suffix analysis', async () => {
    await expect(
      analyzer.analyzeWord('talossanikinko'),
    ).resolves.toContainEqual(
      expect.objectContaining({
        lemma: 'talo',
        features: expect.objectContaining({
          case: 'inessive',
          possessive: '1s',
          focus: 'kin',
          questionClitic: true,
        }),
      }),
    )
  })

  it('analyzes the curated puhekieli overlay', async () => {
    await expect(analyzer.analyzeWord('oon')).resolves.toContainEqual(
      expect.objectContaining({
        lemma: 'olla',
        partOfSpeech: 'verb',
        features: expect.objectContaining({
          person: 'first',
          number: 'singular',
          register: 'spoken',
        }),
      }),
    )
    await expect(analyzer.checkSpelling('mä')).resolves.toMatchObject({
      isCorrect: true,
    })
  })

  it('returns spelling suggestions for a typo', async () => {
    await expect(analyzer.checkSpelling('opiskleija')).resolves.toMatchObject({
      isCorrect: false,
      suggestions: expect.arrayContaining(['opiskelija']),
    })
  })

  it('distinguishes an inflection error from a different word', async () => {
    await expect(analyzer.compareForms('en', ['ei'])).resolves.toMatchObject({
      relation: 'sameLemma',
      actualAnalysis: { lemma: 'ei' },
      expectedAnalysis: { lemma: 'ei' },
      differences: expect.arrayContaining([
        expect.objectContaining({
          feature: 'person',
          actual: 'first',
          expected: 'third',
        }),
      ]),
    })

    await expect(
      analyzer.compareForms('opiskelijaa', ['opiskelija']),
    ).resolves.toMatchObject({
      relation: 'sameLemma',
      actualAnalysis: { lemma: 'opiskelija' },
      expectedAnalysis: { lemma: 'opiskelija' },
      differences: expect.arrayContaining([
        expect.objectContaining({
          feature: 'case',
          actual: 'partitive',
          expected: 'nominative',
        }),
      ]),
    })
  })

  it('classifies a dictionary suggestion as a spelling error', async () => {
    await expect(
      analyzer.compareForms('opiskleija', ['opiskelija']),
    ).resolves.toMatchObject({
      relation: 'spellingError',
      expected: 'opiskelija',
      suggestions: expect.arrayContaining(['opiskelija']),
    })
  })

  it('tokenizes text with exact character ranges and analyses', async () => {
    const tokens = await analyzer.analyzeText('Minä olen täällä.')

    expect(
      tokens.map(({ surface, charStart, charEnd }) => ({
        surface,
        charStart,
        charEnd,
      })),
    ).toEqual([
      { surface: 'Minä', charStart: 0, charEnd: 4 },
      { surface: ' ', charStart: 4, charEnd: 5 },
      { surface: 'olen', charStart: 5, charEnd: 9 },
      { surface: ' ', charStart: 9, charEnd: 10 },
      { surface: 'täällä', charStart: 10, charEnd: 16 },
      { surface: '.', charStart: 16, charEnd: 17 },
    ])
    expect(tokens[1]?.analyses).toEqual([])
    expect(tokens[2]?.analyses[0]?.lemma).toBe('olla')
  })

  it('splits sentences and hyphenates Finnish words', async () => {
    await expect(analyzer.hyphenate('opiskelija')).resolves.toBe(
      'o-pis-ke-li-ja',
    )
    await expect(analyzer.splitSentences('Hei. Miten menee?')).resolves.toEqual(
      [
        {
          text: 'Hei. ',
          charStart: 0,
          charEnd: 5,
          nextStart: 'probable',
        },
        {
          text: 'Miten menee?',
          charStart: 5,
          charEnd: 17,
          nextStart: 'none',
        },
      ],
    )
  })

  it('rejects invalid inputs before calling the engine', async () => {
    await expect(analyzer.analyzeWord('kaksi sanaa')).rejects.toBeInstanceOf(
      FinnishMorphologyInputError,
    )
  })
})
