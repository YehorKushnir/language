import { ContentStatus, MemoryState } from '@language/database'
import { NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PrismaService } from '../database/prisma.service'
import { FinnishMorphologyService } from '../morphology/finnish-morphology.service'
import { MediaUrlService } from '../media/media-url.service'
import { TextsService } from './texts.service'

describe('TextsService', () => {
  const prisma = {
    courseRouteVersion: { findUnique: vi.fn() },
    text: { findMany: vi.fn(), findFirst: vi.fn() },
    userLessonProgress: { findMany: vi.fn() },
  }
  const morphology = { analyzeText: vi.fn() }
  const media = { resolve: vi.fn(() => null) }
  const service = new TextsService(
    prisma as unknown as PrismaService,
    morphology as unknown as FinnishMorphologyService,
    media as unknown as MediaUrlService,
  )

  const preparedText = {
    id: 'text.fi.test',
    title: { ru: 'Знакомство' },
    level: 'A1',
    topics: ['знакомство'],
    body: 'Minä olen opiskelija.',
    status: ContentStatus.CURATED,
    audioAsset: null,
    knowledgeItems: [
      {
        itemId: 'grammar.fi.olla.affirmative',
        item: { skill: { name: { ru: 'Утверждение с olla' } } },
      },
    ],
    tokens: [
      {
        position: 0,
        surface: 'Minä',
        lemma: 'minä',
        analysis: { partOfSpeech: 'pronoun' },
        charStart: 0,
        charEnd: 4,
        lexicalSense: null,
      },
      {
        position: 1,
        surface: 'opiskelija',
        lemma: 'opiskelija',
        analysis: {
          partOfSpeech: 'noun',
          case: 'nominative',
        },
        charStart: 10,
        charEnd: 20,
        lexicalSense: {
          id: 'word.fi.opiskelija.person',
          gloss: { ru: 'студент' },
          lexicalEntry: {
            partOfSpeech: 'noun',
            forms: [
              {
                id: 'form.fi.opiskelija.nom.sg',
                surface: 'opiskelija',
                features: { case: 'nominative' },
              },
            ],
          },
          knowledgeItem: {
            userMemories: [
              {
                state: MemoryState.REVIEW,
                dueAt: new Date('2026-09-01T00:00:00.000Z'),
                repetitions: 2,
              },
            ],
          },
        },
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    prisma.courseRouteVersion.findUnique.mockResolvedValue({
      courseId: 'course.ru-fi',
    })
    morphology.analyzeText.mockResolvedValue({
      text: preparedText.body,
      tokens: [
        {
          type: 'word',
          surface: 'Minä',
          charStart: 0,
          charEnd: 4,
          analyses: [
            {
              lemma: 'minä',
              partOfSpeech: 'pronoun',
              features: {
                case: 'nominative',
                number: 'singular',
              },
              raw: {},
            },
          ],
        },
        {
          type: 'word',
          surface: 'opiskelija',
          charStart: 10,
          charEnd: 20,
          analyses: [
            {
              lemma: 'opiskelija',
              partOfSpeech: 'noun',
              features: {
                case: 'nominative',
                number: 'singular',
              },
              raw: {},
            },
          ],
        },
      ],
    })
    prisma.userLessonProgress.findMany.mockResolvedValue([])
  })

  it('returns compact catalog entries with known-word coverage', async () => {
    prisma.text.findMany.mockResolvedValue([preparedText])
    prisma.userLessonProgress.findMany.mockResolvedValue([
      {
        lesson: {
          knowledgeItems: [{ itemId: 'grammar.fi.olla.affirmative' }],
        },
      },
    ])

    await expect(service.getCatalog('user.1', 'route.1')).resolves.toEqual({
      routeVersionId: 'route.1',
      recommendedTextId: 'text.fi.test',
      items: [
        {
          id: 'text.fi.test',
          title: { ru: 'Знакомство' },
          level: 'A1',
          topics: ['знакомство'],
          grammarItems: [
            {
              itemId: 'grammar.fi.olla.affirmative',
              label: { ru: 'Утверждение с olla' },
            },
          ],
          preview: 'Minä olen opiskelija.',
          wordCount: 2,
          linkedWordCount: 1,
          knownWordCount: 1,
          knownPercent: 50,
          isGrammarReady: true,
          audioUrl: null,
        },
      ],
    })
  })

  it('does not recommend grammar that the learner has not completed', async () => {
    prisma.text.findMany.mockResolvedValue([preparedText])

    await expect(
      service.getCatalog('user.1', 'route.1'),
    ).resolves.toMatchObject({
      recommendedTextId: null,
      items: [{ id: 'text.fi.test', isGrammarReady: false }],
    })
  })

  it('returns tokens with morphology and lexical data', async () => {
    prisma.text.findFirst.mockResolvedValue(preparedText)

    const result = await service.getText('user.1', 'route.1', 'text.fi.test')

    expect(result.tokens[0]).toMatchObject({
      surface: 'Minä',
      lemma: 'minä',
      translation: { ru: 'я' },
      analysis: {
        partOfSpeech: 'pronoun',
        case: 'nominative',
        number: 'singular',
      },
      dictionary: {
        gloss: { ru: 'я' },
        partOfSpeech: 'pronoun',
      },
      lexical: null,
    })
    expect(result.tokens[0]?.dictionary.forms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: 'minä' }),
        expect.objectContaining({ surface: 'minulla' }),
      ]),
    )

    expect(result.tokens[1]).toMatchObject({
      surface: 'opiskelija',
      lemma: 'opiskelija',
      translation: { ru: 'студент' },
      analysis: { partOfSpeech: 'noun', case: 'nominative' },
      analyses: [
        expect.objectContaining({
          lemma: 'opiskelija',
          features: { case: 'nominative', number: 'singular' },
        }),
      ],
      dictionary: {
        gloss: { ru: 'студент' },
        partOfSpeech: 'noun',
        forms: [expect.objectContaining({ surface: 'opiskelija' })],
      },
      lexical: {
        itemId: 'word.fi.opiskelija.person',
        gloss: { ru: 'студент' },
        memory: { state: MemoryState.REVIEW, repetitions: 2 },
      },
    })
  })

  it('rejects an unknown route before querying texts', async () => {
    prisma.courseRouteVersion.findUnique.mockResolvedValue(null)

    await expect(
      service.getCatalog('user.1', 'route.missing'),
    ).rejects.toBeInstanceOf(NotFoundException)
    expect(prisma.text.findMany).not.toHaveBeenCalled()
    expect(morphology.analyzeText).not.toHaveBeenCalled()
  })
})
