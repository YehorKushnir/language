import type {
  FinnishWordAnalysisResponse,
  PreparedTextCatalogResponse,
  PreparedTextDetailResponse,
  PreparedTextSummaryResponse,
  PreparedTextTokenResponse,
  ReviewMemoryState,
} from '@language/contracts'
import { ContentStatus } from '@language/database'
import {
  getFinnishLearnerDictionaryEntry,
  getFinnishTextFormTranslation,
} from '@language/language-fi'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import {
  toLexicalFeatures,
  toLocalizedText,
  toVocabularyExample,
} from '../common/content-mapper'
import { PrismaService } from '../database/prisma.service'
import { MediaUrlService } from '../media/media-url.service'
import { FinnishMorphologyService } from '../morphology/finnish-morphology.service'

interface TextWithTokens {
  id: string
  title: unknown
  level: string
  topics: string[]
  body: string
  audioAsset: { storageKey: string } | null
  knowledgeItems: Array<{
    itemId: string
    item: {
      skill: { name: unknown } | null
    }
  }>
  tokens: Array<{
    position: number
    surface: string
    lemma: string | null
    analysis: unknown
    charStart: number
    charEnd: number
    lexicalSense: {
      id: string
      gloss: unknown
      metadata: unknown
      lexicalEntry: {
        partOfSpeech: string
        forms: Array<{
          id: string
          surface: string
          features: unknown
          audioAsset: { storageKey: string } | null
        }>
      }
      knowledgeItem: {
        userMemories: Array<{
          state: ReviewMemoryState
          dueAt: Date
          repetitions: number
        }>
      }
    } | null
  }>
}

const textInclude = (userId: string) => ({
  audioAsset: { select: { storageKey: true } },
  knowledgeItems: {
    include: { item: { include: { skill: true } } },
  },
  tokens: {
    orderBy: { position: 'asc' as const },
    include: {
      lexicalSense: {
        include: {
          lexicalEntry: {
            include: {
              forms: {
                orderBy: { id: 'asc' as const },
                include: {
                  audioAsset: { select: { storageKey: true } },
                },
              },
            },
          },
          knowledgeItem: {
            include: { userMemories: { where: { userId }, take: 1 } },
          },
        },
      },
    },
  },
})

@Injectable()
export class TextsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(FinnishMorphologyService)
    private readonly morphology: FinnishMorphologyService,
    @Inject(MediaUrlService) private readonly media: MediaUrlService,
  ) {}

  async getCatalog(
    userId: string,
    routeVersionId: string,
  ): Promise<PreparedTextCatalogResponse> {
    const route = await this.getRoute(routeVersionId)
    const [texts, completedLessons] = await Promise.all([
      this.prisma.text.findMany({
        where: { courseId: route.courseId, status: ContentStatus.CURATED },
        orderBy: [{ level: 'asc' }, { id: 'asc' }],
        include: textInclude(userId),
      }),
      this.prisma.userLessonProgress.findMany({
        where: { userId, routeVersionId, completedAt: { not: null } },
        include: {
          lesson: {
            include: {
              knowledgeItems: { select: { itemId: true } },
            },
          },
        },
      }),
    ])
    const values = texts as TextWithTokens[]
    const summaries = values.map((text) => this.toSummary(text))
    const unlockedItemIds = new Set(
      completedLessons.flatMap((progress) =>
        progress.lesson.knowledgeItems.map((item) => item.itemId),
      ),
    )

    return {
      routeVersionId,
      recommendedTextId: selectRecommendedText(
        values,
        summaries,
        unlockedItemIds,
      ),
      items: summaries,
    }
  }

  async getText(
    userId: string,
    routeVersionId: string,
    textId: string,
  ): Promise<PreparedTextDetailResponse> {
    const route = await this.getRoute(routeVersionId)
    const text = await this.prisma.text.findFirst({
      where: {
        id: textId,
        courseId: route.courseId,
        status: ContentStatus.CURATED,
      },
      include: textInclude(userId),
    })

    if (!text) {
      throw new NotFoundException(`Text ${textId} was not found`)
    }

    const value = text as TextWithTokens
    const morphology = await this.morphology.analyzeText(value.body)
    const analysesByRange = new Map(
      morphology.tokens.map((token) => [
        `${token.charStart}:${token.charEnd}`,
        token.analyses,
      ]),
    )
    return {
      ...this.toSummary(value),
      body: value.body,
      tokens: value.tokens.map((token) =>
        this.toToken(
          token,
          analysesByRange.get(`${token.charStart}:${token.charEnd}`) ?? [],
        ),
      ),
    }
  }

  private async getRoute(routeVersionId: string) {
    const route = await this.prisma.courseRouteVersion.findUnique({
      where: { id: routeVersionId, status: ContentStatus.CURATED },
      select: { courseId: true },
    })

    if (!route) {
      throw new NotFoundException(
        `Course route ${routeVersionId} was not found`,
      )
    }

    return route
  }

  private toSummary(text: TextWithTokens): PreparedTextSummaryResponse {
    const linkedTokens = text.tokens.filter((token) => token.lexicalSense)
    const knownWordCount = linkedTokens.filter(
      (token) =>
        (token.lexicalSense?.knowledgeItem.userMemories[0]?.repetitions ?? 0) >
        0,
    ).length

    return {
      id: text.id,
      title: toLocalizedText(text.title),
      level: text.level,
      topics: text.topics,
      grammarItems: text.knowledgeItems.flatMap(({ itemId, item }) =>
        item.skill ? [{ itemId, label: toLocalizedText(item.skill.name) }] : [],
      ),
      preview:
        text.body.length > 140 ? `${text.body.slice(0, 137)}…` : text.body,
      wordCount: text.tokens.length,
      linkedWordCount: linkedTokens.length,
      knownWordCount,
      knownPercent:
        text.tokens.length === 0
          ? 0
          : Math.round((knownWordCount / text.tokens.length) * 100),
      audioUrl: this.media.resolve(text.audioAsset?.storageKey),
    }
  }

  private toToken(
    token: TextWithTokens['tokens'][number],
    analyses: FinnishWordAnalysisResponse[],
  ): PreparedTextTokenResponse {
    const sense = token.lexicalSense
    const memory = sense?.knowledgeItem.userMemories[0]
    const coreEntry = getFinnishLearnerDictionaryEntry(
      token.lemma ?? token.surface,
    )
    const dictionary = sense
      ? {
          gloss: toLocalizedText(sense.gloss),
          partOfSpeech: sense.lexicalEntry.partOfSpeech,
          forms: sense.lexicalEntry.forms.map((form) => ({
            id: form.id,
            surface: form.surface,
            features: toLexicalFeatures(form.features),
            audioUrl: this.media.resolve(form.audioAsset?.storageKey),
          })),
        }
      : coreEntry
        ? {
            gloss: { ru: coreEntry.gloss },
            partOfSpeech: coreEntry.partOfSpeech,
            forms: coreEntry.forms.map((form, index) => ({
              id: `dictionary.${coreEntry.lemma}.${index + 1}`,
              surface: form.surface,
              features: form.features,
              audioUrl: null,
            })),
          }
        : {
            gloss: { ru: token.lemma ?? token.surface },
            partOfSpeech: toAnalysis(token.analysis).partOfSpeech ?? 'unknown',
            forms: [],
          }
    const preferredAnalysis = selectPreferredAnalysis(
      analyses,
      token.lemma ?? token.surface,
      dictionary.partOfSpeech,
    )
    const analysis = preferredAnalysis
      ? toPreparedAnalysis(preferredAnalysis, dictionary.partOfSpeech)
      : toAnalysis(token.analysis)
    const dictionaryForms = ensureDictionaryForms(
      dictionary.forms,
      token.surface,
      token.lemma ?? token.surface,
      analysis,
    )

    return {
      position: token.position,
      surface: token.surface,
      lemma: token.lemma ?? token.surface.toLocaleLowerCase('fi'),
      translation: {
        ru:
          getFinnishTextFormTranslation(token.surface) ??
          dictionary.gloss.ru ??
          token.lemma ??
          token.surface,
      },
      analysis,
      analyses,
      charStart: token.charStart,
      charEnd: token.charEnd,
      dictionary: { ...dictionary, forms: dictionaryForms },
      lexical: sense
        ? {
            itemId: sense.id,
            gloss: toLocalizedText(sense.gloss),
            example: toVocabularyExample(sense.metadata),
            partOfSpeech: sense.lexicalEntry.partOfSpeech,
            forms: sense.lexicalEntry.forms.map((form) => ({
              id: form.id,
              surface: form.surface,
              features: toLexicalFeatures(form.features),
              audioUrl: this.media.resolve(form.audioAsset?.storageKey),
            })),
            memory: {
              state: memory?.state ?? 'NEW',
              dueAt: memory?.dueAt.toISOString() ?? null,
              repetitions: memory?.repetitions ?? 0,
            },
          }
        : null,
    }
  }
}

function selectPreferredAnalysis(
  analyses: FinnishWordAnalysisResponse[],
  lemma: string,
  partOfSpeech: string,
): FinnishWordAnalysisResponse | undefined {
  const normalizedLemma = lemma.toLocaleLowerCase('fi')
  return (
    analyses.find(
      (analysis) =>
        analysis.lemma.toLocaleLowerCase('fi') === normalizedLemma &&
        analysis.partOfSpeech === partOfSpeech,
    ) ??
    analyses.find(
      (analysis) => analysis.lemma.toLocaleLowerCase('fi') === normalizedLemma,
    )
  )
}

function toPreparedAnalysis(
  analysis: FinnishWordAnalysisResponse,
  dictionaryPartOfSpeech: string,
): Record<string, string> {
  return {
    partOfSpeech:
      analysis.partOfSpeech === 'unknown'
        ? dictionaryPartOfSpeech
        : analysis.partOfSpeech,
    ...Object.fromEntries(
      Object.entries(analysis.features).flatMap(([key, value]) =>
        value === undefined ? [] : [[key, String(value)]],
      ),
    ),
  }
}

function ensureDictionaryForms(
  forms: PreparedTextTokenResponse['dictionary']['forms'],
  surface: string,
  lemma: string,
  analysis: Record<string, string>,
): PreparedTextTokenResponse['dictionary']['forms'] {
  const values = [...forms]
  const normalizedSurfaces = new Set(
    values.map((form) => form.surface.toLocaleLowerCase('fi')),
  )
  if (!normalizedSurfaces.has(lemma.toLocaleLowerCase('fi'))) {
    values.unshift({
      id: `dictionary.${lemma}.lemma`,
      surface: lemma,
      features: { form: 'lemma' },
      audioUrl: null,
    })
    normalizedSurfaces.add(lemma.toLocaleLowerCase('fi'))
  }
  if (!normalizedSurfaces.has(surface.toLocaleLowerCase('fi'))) {
    values.push({
      id: `dictionary.${lemma}.current`,
      surface,
      features: Object.fromEntries(
        Object.entries(analysis).filter(([key]) => key !== 'partOfSpeech'),
      ),
      audioUrl: null,
    })
  }
  return values
}

function toAnalysis(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, item]) =>
      typeof item === 'string' ? [[key, item]] : [],
    ),
  )
}

function selectRecommendedText(
  texts: TextWithTokens[],
  summaries: PreparedTextSummaryResponse[],
  unlockedItemIds: Set<string>,
): string | null {
  const ranked = texts.map((text, index) => {
    const summary = summaries[index]!
    const itemCount = text.knowledgeItems.length
    const unlockedCount = text.knowledgeItems.filter((item) =>
      unlockedItemIds.has(item.itemId),
    ).length
    const unlockedPercent =
      itemCount === 0 ? 100 : (unlockedCount / itemCount) * 100
    return {
      id: text.id,
      score: unlockedPercent * 0.7 + summary.knownPercent * 0.3,
      index,
    }
  })

  return (
    ranked.sort(
      (left, right) => right.score - left.score || left.index - right.index,
    )[0]?.id ?? null
  )
}
