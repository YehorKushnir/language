import type {
  FinnishWordAnalysisResponse,
  PreparedTextAudioSegmentResponse,
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
  audioTimingChecksum: string | null
  audioSegments: unknown
  audioAssets: Array<{
    variant: string
    audioAsset: { url: string; checksum: string }
  }>
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
          audioAssets: Array<{
            variant: string
            audioAsset: { url: string }
          }>
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
  audioAssets: {
    where: { variant: 'normal' },
    select: {
      variant: true,
      audioAsset: { select: { url: true, checksum: true } },
    },
  },
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
                  audioAssets: {
                    where: { variant: 'standard' },
                    take: 1,
                    select: {
                      variant: true,
                      audioAsset: { select: { url: true } },
                    },
                  },
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
    const unlockedItemIds = new Set(
      completedLessons.flatMap((progress) =>
        progress.lesson.knowledgeItems.map((item) => item.itemId),
      ),
    )
    const summaries = values.map((text) =>
      this.toSummary(text, isTextGrammarReady(text, unlockedItemIds)),
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
    const [text, completedLessons] = await Promise.all([
      this.prisma.text.findFirst({
        where: {
          id: textId,
          courseId: route.courseId,
          status: ContentStatus.CURATED,
        },
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

    if (!text) {
      throw new NotFoundException(`Text ${textId} was not found`)
    }

    const value = text as TextWithTokens
    const unlockedItemIds = new Set(
      completedLessons.flatMap((progress) =>
        progress.lesson.knowledgeItems.map((item) => item.itemId),
      ),
    )
    const morphology = await this.morphology.analyzeText(value.body)
    const normalAudio = value.audioAssets.find(
      (audio) => audio.variant === 'normal',
    )?.audioAsset
    const analysesByRange = new Map(
      morphology.tokens.map((token) => [
        `${token.charStart}:${token.charEnd}`,
        token.analyses,
      ]),
    )
    return {
      ...this.toSummary(value, isTextGrammarReady(value, unlockedItemIds)),
      body: value.body,
      audioSegments:
        normalAudio?.checksum === value.audioTimingChecksum
          ? toPreparedTextAudioSegments(value.audioSegments, value.body)
          : [],
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

  private toSummary(
    text: TextWithTokens,
    isGrammarReady: boolean,
  ): PreparedTextSummaryResponse {
    const linkedTokens = text.tokens.filter((token) => token.lexicalSense)
    const knownWordCount = linkedTokens.filter(
      (token) =>
        (token.lexicalSense?.knowledgeItem.userMemories[0]?.repetitions ?? 0) >
        0,
    ).length
    const normalAudio = text.audioAssets.find(
      (audio) => audio.variant === 'normal',
    )?.audioAsset
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
      isGrammarReady,
      audioUrl: this.media.resolve(normalAudio?.url),
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
            audioUrl: this.media.resolve(form.audioAssets[0]?.audioAsset.url),
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
              audioUrl: this.media.resolve(form.audioAssets[0]?.audioAsset.url),
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

function toPreparedTextAudioSegments(
  value: unknown,
  body: string,
): PreparedTextAudioSegmentResponse[] {
  if (!Array.isArray(value) || value.length === 0) return []

  const segments: PreparedTextAudioSegmentResponse[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return []
    const candidate = item as Record<string, unknown>
    const segment = {
      charStart: candidate.charStart,
      charEnd: candidate.charEnd,
      audioStartMs: candidate.audioStartMs,
      audioEndMs: candidate.audioEndMs,
    }
    if (
      !Number.isInteger(segment.charStart) ||
      !Number.isInteger(segment.charEnd) ||
      !Number.isInteger(segment.audioStartMs) ||
      !Number.isInteger(segment.audioEndMs)
    ) {
      return []
    }

    const prepared = segment as PreparedTextAudioSegmentResponse
    const previous = segments.at(-1)
    if (
      prepared.charStart < 0 ||
      prepared.charEnd <= prepared.charStart ||
      prepared.charEnd > body.length ||
      prepared.audioStartMs < 0 ||
      prepared.audioEndMs <= prepared.audioStartMs ||
      body.slice(prepared.charStart, prepared.charEnd).trim().length === 0 ||
      (previous
        ? previous.charEnd > prepared.charStart ||
          previous.audioEndMs !== prepared.audioStartMs ||
          body.slice(previous.charEnd, prepared.charStart).trim().length > 0
        : prepared.audioStartMs !== 0 ||
          body.slice(0, prepared.charStart).trim().length > 0)
    ) {
      return []
    }
    segments.push(prepared)
  }

  const last = segments.at(-1)
  return last && body.slice(last.charEnd).trim().length === 0 ? segments : []
}

function selectRecommendedText(
  texts: TextWithTokens[],
  summaries: PreparedTextSummaryResponse[],
  unlockedItemIds: Set<string>,
): string | null {
  const ranked = texts.flatMap((text, index) => {
    const summary = summaries[index]!
    if (!isTextGrammarReady(text, unlockedItemIds)) return []
    return [
      {
        id: text.id,
        score: summary.knownPercent,
        index,
      },
    ]
  })

  return (
    ranked.sort(
      (left, right) => right.score - left.score || left.index - right.index,
    )[0]?.id ?? null
  )
}

function isTextGrammarReady(
  text: TextWithTokens,
  unlockedItemIds: Set<string>,
): boolean {
  const grammarItemIds = text.knowledgeItems
    .filter((item) => item.item.skill)
    .map((item) => item.itemId)
  return (
    grammarItemIds.length === 0 ||
    grammarItemIds.every((itemId) => unlockedItemIds.has(itemId))
  )
}
