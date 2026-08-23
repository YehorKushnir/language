import type {
  FinnishWordAnalysisResponse,
  PreparedTextCatalogResponse,
  PreparedTextDetailResponse,
  PreparedTextSummaryResponse,
  PreparedTextTokenResponse,
  ReviewMemoryState,
} from '@language/contracts'
import { ContentStatus } from '@language/database'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { toLexicalFeatures, toLocalizedText } from '../common/content-mapper'
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
    const texts = await this.prisma.text.findMany({
      where: { courseId: route.courseId, status: ContentStatus.CURATED },
      orderBy: [{ level: 'asc' }, { id: 'asc' }],
      include: textInclude(userId),
    })

    return {
      routeVersionId,
      items: texts.map((text) => this.toSummary(text as TextWithTokens)),
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
      preview:
        text.body.length > 140 ? `${text.body.slice(0, 137)}…` : text.body,
      wordCount: text.tokens.length,
      linkedWordCount: linkedTokens.length,
      knownWordCount,
      knownPercent:
        linkedTokens.length === 0
          ? 0
          : Math.round((knownWordCount / linkedTokens.length) * 100),
      audioUrl: this.media.resolve(text.audioAsset?.storageKey),
    }
  }

  private toToken(
    token: TextWithTokens['tokens'][number],
    analyses: FinnishWordAnalysisResponse[],
  ): PreparedTextTokenResponse {
    const sense = token.lexicalSense
    const memory = sense?.knowledgeItem.userMemories[0]

    return {
      position: token.position,
      surface: token.surface,
      lemma: token.lemma ?? token.surface.toLocaleLowerCase('fi'),
      analysis: toAnalysis(token.analysis),
      analyses,
      charStart: token.charStart,
      charEnd: token.charEnd,
      lexical: sense
        ? {
            itemId: sense.id,
            gloss: toLocalizedText(sense.gloss),
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

function toAnalysis(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, item]) =>
      typeof item === 'string' ? [[key, item]] : [],
    ),
  )
}
