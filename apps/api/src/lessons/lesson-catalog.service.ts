import type {
  LessonDetailResponse,
  LessonVocabularyResponse,
  LexicalFeatureValue,
} from '@language/contracts'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import {
  toLessonContent,
  toLocalizedText,
  toNullableLocalizedText,
} from '../common/content-mapper'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class LessonCatalogService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getLesson(lessonId: string): Promise<LessonDetailResponse> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        knowledgeItems: {
          orderBy: { position: 'asc' },
          include: {
            item: {
              include: {
                skill: true,
                lexicalSense: true,
              },
            },
          },
        },
        _count: { select: { exercises: true } },
      },
    })

    if (!lesson) {
      throw new NotFoundException(`Lesson ${lessonId} was not found`)
    }

    return {
      id: lesson.id,
      courseId: lesson.courseId,
      title: toLocalizedText(lesson.title),
      summary: toNullableLocalizedText(lesson.summary),
      content: toLessonContent(lesson.content),
      status: lesson.status,
      knowledgeItems: lesson.knowledgeItems.map(({ item, ...lessonItem }) => ({
        id: item.id,
        kind: item.kind,
        role: lessonItem.role,
        position: lessonItem.position,
        label: toLocalizedText(
          item.skill?.name ?? item.lexicalSense?.gloss ?? { ru: item.id },
        ),
      })),
      exerciseCount: lesson._count.exercises,
    }
  }

  async getVocabulary(lessonId: string): Promise<LessonVocabularyResponse> {
    const [lesson, lessonItems] = await Promise.all([
      this.prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { id: true },
      }),
      this.prisma.lessonKnowledgeItem.findMany({
        where: {
          lessonId,
          item: { lexicalSense: { isNot: null } },
        },
        orderBy: { position: 'asc' },
        include: {
          item: {
            include: {
              lexicalSense: {
                include: {
                  lexicalEntry: {
                    include: { forms: { orderBy: { id: 'asc' } } },
                  },
                },
              },
            },
          },
        },
      }),
    ])

    if (!lesson) {
      throw new NotFoundException(`Lesson ${lessonId} was not found`)
    }

    return {
      lessonId,
      items: lessonItems.flatMap(({ item }) => {
        const sense = item.lexicalSense
        if (!sense) {
          return []
        }

        return [
          {
            itemId: item.id,
            lexicalEntryId: sense.lexicalEntry.id,
            lemma: sense.lexicalEntry.lemma,
            partOfSpeech: sense.lexicalEntry.partOfSpeech,
            gloss: toLocalizedText(sense.gloss),
            forms: sense.lexicalEntry.forms.map((form) => ({
              id: form.id,
              surface: form.surface,
              features: toLexicalFeatures(form.features),
            })),
            status: sense.status,
          },
        ]
      }),
    }
  }
}

function toLexicalFeatures(
  value: unknown,
): Record<string, LexicalFeatureValue> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, LexicalFeatureValue] =>
        typeof entry[1] === 'string' ||
        typeof entry[1] === 'number' ||
        typeof entry[1] === 'boolean',
    ),
  )
}
