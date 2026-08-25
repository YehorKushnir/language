import { describe, expect, it, vi } from 'vitest'

import {
  ContentStatus,
  type DatabaseClient,
  ExerciseItemRole,
  ExerciseKind,
} from '../src/index.js'
import {
  PublicationValidationError,
  validatePublishedCourse,
} from './publication-validation.js'

const grammarItemIds = [
  'grammar.affirmative',
  'grammar.negative',
  'grammar.question',
]
const wordItemId = 'word.student'

function createFixture() {
  const dependencies: Array<{
    lessonId: string
    prerequisiteLessonId: string
  }> = []
  const exercises = Array.from({ length: 60 }, (_, index) => {
    const grammarItemId = grammarItemIds[index % grammarItemIds.length]!
    return {
      id: `exercise.${index + 1}`,
      lessonId: 'lesson.1',
      kind: ExerciseKind.PREPARED,
      status: ContentStatus.CURATED,
      targetLanguage: 'fi',
      targetText: 'Minä olen opiskelija.',
      answerSpec: {
        acceptedVariants: ['Minä olen opiskelija.'],
        slots: [
          { role: 'verb', accepted: ['olen'], itemIds: [grammarItemId] },
          {
            role: 'complement',
            accepted: ['opiskelija'],
            itemIds: [wordItemId],
          },
        ],
      },
      prompts: [{ sourceLanguage: 'ru', text: 'Я студент.' }],
      items: [
        { itemId: grammarItemId, role: ExerciseItemRole.PRIMARY },
        { itemId: wordItemId, role: ExerciseItemRole.SECONDARY },
      ],
      generated: null,
    }
  })
  const lessonItems = [
    ...grammarItemIds.map((itemId) => ({
      lessonId: 'lesson.1',
      itemId,
      item: { languageCode: 'fi', lexicalSense: null },
    })),
    {
      lessonId: 'lesson.1',
      itemId: wordItemId,
      item: {
        languageCode: 'fi',
        lexicalSense: {
          status: ContentStatus.CURATED,
          metadata: {
            example: {
              target: 'Minä olen opiskelija.',
              source: { ru: 'Я студент.' },
            },
          },
          lexicalEntry: {
            lemma: 'opiskelija',
            status: ContentStatus.CURATED,
            forms: [{ surface: 'opiskelija', audioAssetId: null }],
          },
        },
      },
    },
  ]
  return {
    route: {
      id: 'route.1',
      courseId: 'course.1',
      status: ContentStatus.CURATED,
      publishedAt: new Date('2026-08-23T00:00:00.000Z'),
      course: {
        id: 'course.1',
        status: ContentStatus.CURATED,
        sourceLanguage: 'ru',
        targetLanguage: 'fi',
      },
      entries: [
        {
          lessonId: 'lesson.1',
          modulePosition: 1,
          lessonPosition: 1,
          lesson: {
            id: 'lesson.1',
            courseId: 'course.1',
            status: ContentStatus.CURATED,
          },
        },
      ],
      dependencies,
    },
    lessonItems,
    skillDependencies: [
      {
        skillId: 'grammar.negative',
        prerequisiteSkillId: 'grammar.affirmative',
      },
    ],
    exercises,
    templates: [
      {
        id: 'template.identity@1',
        status: ContentStatus.CURATED,
        definition: {
          schemaVersion: 1,
          frame: 'identity',
          lessonId: 'lesson.1',
          sourceLanguage: 'ru',
          targetLanguage: 'fi',
          personKeys: ['1sg'],
          grammarItems: {
            affirmative: 'grammar.affirmative',
            negative: 'grammar.negative',
            question: 'grammar.question',
          },
          complements: [
            {
              key: 'student',
              itemId: wordItemId,
              singular: 'opiskelija',
              plural: 'opiskelijoita',
              sourceSingular: 'студент',
              sourcePlural: 'студенты',
            },
          ],
        },
      },
    ],
    texts: [
      {
        id: 'text.1',
        body: 'Opiskelija.',
        audioAssetId: null,
        knowledgeItems: [
          {
            itemId: wordItemId,
            item: {
              languageCode: 'fi',
              lexicalSense: {
                status: ContentStatus.CURATED,
                lexicalEntry: { status: ContentStatus.CURATED },
              },
            },
          },
        ],
        tokens: [
          {
            position: 0,
            surface: 'Opiskelija',
            lexicalSenseId: wordItemId,
            charStart: 0,
            charEnd: 10,
          },
        ],
      },
    ],
  }
}

function createPrisma(fixture: ReturnType<typeof createFixture>) {
  return {
    courseRouteVersion: {
      findUnique: vi.fn().mockResolvedValue(fixture.route),
    },
    lessonKnowledgeItem: {
      findMany: vi.fn().mockResolvedValue(fixture.lessonItems),
    },
    skillDependency: {
      findMany: vi.fn().mockResolvedValue(fixture.skillDependencies),
    },
    exercise: { findMany: vi.fn().mockResolvedValue(fixture.exercises) },
    exerciseTemplate: {
      findMany: vi.fn().mockResolvedValue(fixture.templates),
    },
    text: { findMany: vi.fn().mockResolvedValue(fixture.texts) },
  } as unknown as DatabaseClient
}

describe('validatePublishedCourse', () => {
  it('validates the database snapshot used by a published route', async () => {
    const fixture = createFixture()

    await expect(
      validatePublishedCourse(createPrisma(fixture), 'route.1'),
    ).resolves.toMatchObject({
      lessonCount: 1,
      knowledgeItemCount: 4,
      preparedExerciseCount: 60,
      templateCount: 1,
      generatedCandidateCount: 3,
      flashcardFallbackCount: 0,
      warnings: ['Published course has no prepared audio assets yet'],
    })
  })

  it('rejects broken AnswerSpec and cyclic lesson dependencies', async () => {
    const fixture = createFixture()
    fixture.exercises[0]!.answerSpec.acceptedVariants = ['Väärä vastaus.']
    fixture.route.dependencies.push({
      lessonId: 'lesson.1',
      prerequisiteLessonId: 'lesson.1',
    })

    await expect(
      validatePublishedCourse(createPrisma(fixture), 'route.1'),
    ).rejects.toEqual(
      expect.objectContaining({
        name: PublicationValidationError.name,
        issues: expect.arrayContaining([
          expect.stringContaining('depends on itself'),
          expect.stringContaining('does not accept its target text'),
        ]),
      }),
    )
  })

  it('rejects a vocabulary example linked to forms of another lemma', async () => {
    const fixture = createFixture()
    const lexicalSense = fixture.lessonItems.at(-1)!.item.lexicalSense!
    lexicalSense.metadata.example.target = 'Minä olen lääkäri.'

    await expect(
      validatePublishedCourse(createPrisma(fixture), 'route.1'),
    ).rejects.toEqual(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.stringContaining(
            'word.student example does not contain a form of opiskelija',
          ),
        ]),
      }),
    )
  })

  it('validates prepared-variation templates against published exercises', async () => {
    const fixture = createFixture()
    const variationDefinition = {
      schemaVersion: 1,
      frame: 'prepared-variation',
      lessonId: 'lesson.1',
      sourceLanguage: 'ru',
      targetLanguage: 'fi',
      exerciseIds: fixture.exercises.map((exercise) => exercise.id),
      supportedItemIds: [...grammarItemIds, wordItemId],
    }
    fixture.templates[0] = {
      id: 'template.prepared-variation@1',
      status: ContentStatus.CURATED,
      definition:
        variationDefinition as unknown as (typeof fixture.templates)[number]['definition'],
    }

    await expect(
      validatePublishedCourse(createPrisma(fixture), 'route.1'),
    ).resolves.toMatchObject({
      templateCount: 1,
      generatedCandidateCount: 60,
    })

    variationDefinition.exerciseIds.push('exercise.missing')
    await expect(
      validatePublishedCourse(createPrisma(fixture), 'route.1'),
    ).rejects.toEqual(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.stringContaining(
            'references unavailable prepared exercise exercise.missing',
          ),
        ]),
      }),
    )
  })
})
