import {
  ContentStatus,
  DatabaseClient,
  ExerciseItemRole,
  ExerciseKind,
  KnowledgeItemKind,
  LexicalFormSource,
  LessonItemRole,
  Prisma,
} from '../src/index.js'
import {
  assertLessonOneContent,
  lessonContent,
  lessonExercises,
  lessonVocabulary,
} from './lesson-one-content.js'

const prisma = new DatabaseClient()

const COURSE_ID = 'course.ru-fi'
const ROUTE_VERSION_ID = 'course.ru-fi@1'
const LESSON_ID = 'fi.olla.basics'
const LOCAL_USER_ID = 'user.local'

const skills = [
  {
    id: 'grammar.fi.olla.affirmative',
    kind: KnowledgeItemKind.GRAMMAR,
    name: { ru: 'Утвердительные предложения с olla' },
    description: { ru: 'Личные формы olla в настоящем времени.' },
  },
  {
    id: 'grammar.fi.olla.negative',
    kind: KnowledgeItemKind.SPECIFIC_SKILL,
    name: { ru: 'Отрицание с olla' },
    description: { ru: 'Согласование отрицательного глагола с лицом.' },
  },
  {
    id: 'grammar.fi.olla.question',
    kind: KnowledgeItemKind.SPECIFIC_SKILL,
    name: { ru: 'Вопросы с olla' },
    description: { ru: 'Общие вопросы с частицей -ko/-kö.' },
  },
  {
    id: 'register.fi.puhekieli.olla',
    kind: KnowledgeItemKind.REGISTER,
    name: { ru: 'Разговорные формы olla' },
    description: { ru: 'Распознавание распространённых форм puhekieli.' },
  },
] as const

async function seedCourse() {
  await prisma.course.upsert({
    where: { id: COURSE_ID },
    update: {
      title: { ru: 'Финский с нуля' },
      description: { ru: 'Курс финского языка для русскоязычных.' },
      status: ContentStatus.CURATED,
    },
    create: {
      id: COURSE_ID,
      sourceLanguage: 'ru',
      targetLanguage: 'fi',
      title: { ru: 'Финский с нуля' },
      description: { ru: 'Курс финского языка для русскоязычных.' },
      status: ContentStatus.CURATED,
    },
  })

  await prisma.lesson.upsert({
    where: { id: LESSON_ID },
    update: {
      title: { ru: 'Личные местоимения и olla' },
      summary: { ru: 'Утверждение, отрицание и общий вопрос.' },
      content: lessonContent,
      status: ContentStatus.CURATED,
    },
    create: {
      id: LESSON_ID,
      courseId: COURSE_ID,
      title: { ru: 'Личные местоимения и olla' },
      summary: { ru: 'Утверждение, отрицание и общий вопрос.' },
      content: lessonContent,
      status: ContentStatus.CURATED,
    },
  })

  await prisma.courseRouteVersion.upsert({
    where: { id: ROUTE_VERSION_ID },
    update: {
      status: ContentStatus.CURATED,
      publishedAt: new Date('2026-08-22T00:00:00.000Z'),
    },
    create: {
      id: ROUTE_VERSION_ID,
      courseId: COURSE_ID,
      version: 1,
      status: ContentStatus.CURATED,
      publishedAt: new Date('2026-08-22T00:00:00.000Z'),
    },
  })

  await prisma.courseRouteEntry.upsert({
    where: {
      routeVersionId_lessonId: {
        routeVersionId: ROUTE_VERSION_ID,
        lessonId: LESSON_ID,
      },
    },
    update: {
      modulePosition: 1,
      lessonPosition: 1,
    },
    create: {
      routeVersionId: ROUTE_VERSION_ID,
      lessonId: LESSON_ID,
      modulePosition: 1,
      lessonPosition: 1,
    },
  })
}

async function seedKnowledge() {
  for (const [position, skill] of skills.entries()) {
    await prisma.knowledgeItem.upsert({
      where: { id: skill.id },
      update: {
        kind: skill.kind,
        languageCode: 'fi',
        skill: {
          upsert: {
            create: {
              name: skill.name,
              description: skill.description,
            },
            update: {
              name: skill.name,
              description: skill.description,
            },
          },
        },
      },
      create: {
        id: skill.id,
        kind: skill.kind,
        languageCode: 'fi',
        skill: {
          create: {
            name: skill.name,
            description: skill.description,
          },
        },
      },
    })

    await prisma.lessonKnowledgeItem.upsert({
      where: {
        lessonId_itemId: {
          lessonId: LESSON_ID,
          itemId: skill.id,
        },
      },
      update: {
        role:
          skill.kind === KnowledgeItemKind.REGISTER
            ? LessonItemRole.RECOGNITION
            : LessonItemRole.INTRODUCED,
        position: position + 1,
      },
      create: {
        lessonId: LESSON_ID,
        itemId: skill.id,
        role:
          skill.kind === KnowledgeItemKind.REGISTER
            ? LessonItemRole.RECOGNITION
            : LessonItemRole.INTRODUCED,
        position: position + 1,
      },
    })
  }

  for (const skillId of [
    'grammar.fi.olla.negative',
    'grammar.fi.olla.question',
  ]) {
    await prisma.skillDependency.upsert({
      where: {
        skillId_prerequisiteSkillId: {
          skillId,
          prerequisiteSkillId: 'grammar.fi.olla.affirmative',
        },
      },
      update: {},
      create: {
        skillId,
        prerequisiteSkillId: 'grammar.fi.olla.affirmative',
      },
    })
  }
}

async function seedVocabulary() {
  await prisma.lexicalForm.deleteMany({
    where: {
      id: {
        in: [
          'form.fi.opiskelija.nominative.sg',
          'form.fi.opiskelija.genitive.sg',
          'form.fi.opiskelija.partitive.sg',
        ],
      },
    },
  })

  for (const [index, vocabulary] of lessonVocabulary.entries()) {
    await prisma.concept.upsert({
      where: { id: vocabulary.conceptId },
      update: { semanticTypes: vocabulary.semanticTypes },
      create: {
        id: vocabulary.conceptId,
        semanticTypes: vocabulary.semanticTypes,
      },
    })

    await prisma.lexicalEntry.upsert({
      where: { id: vocabulary.lexicalEntryId },
      update: {
        lemma: vocabulary.lemma,
        partOfSpeech: vocabulary.partOfSpeech,
        status: ContentStatus.CURATED,
      },
      create: {
        id: vocabulary.lexicalEntryId,
        languageCode: 'fi',
        lemma: vocabulary.lemma,
        partOfSpeech: vocabulary.partOfSpeech,
        status: ContentStatus.CURATED,
      },
    })

    for (const form of vocabulary.forms) {
      await prisma.lexicalForm.upsert({
        where: { id: form.id },
        update: {
          surface: form.surface,
          features: form.features,
          source: LexicalFormSource.CURATED,
        },
        create: {
          id: form.id,
          lexicalEntryId: vocabulary.lexicalEntryId,
          surface: form.surface,
          features: form.features,
          source: LexicalFormSource.CURATED,
        },
      })
    }

    await prisma.knowledgeItem.upsert({
      where: { id: vocabulary.itemId },
      update: {
        kind: KnowledgeItemKind.LEXICAL_SENSE,
        languageCode: 'fi',
        lexicalSense: {
          upsert: {
            create: {
              lexicalEntry: { connect: { id: vocabulary.lexicalEntryId } },
              concept: { connect: { id: vocabulary.conceptId } },
              gloss: { ru: vocabulary.gloss },
              status: ContentStatus.CURATED,
            },
            update: {
              gloss: { ru: vocabulary.gloss },
              status: ContentStatus.CURATED,
            },
          },
        },
      },
      create: {
        id: vocabulary.itemId,
        kind: KnowledgeItemKind.LEXICAL_SENSE,
        languageCode: 'fi',
        lexicalSense: {
          create: {
            lexicalEntry: { connect: { id: vocabulary.lexicalEntryId } },
            concept: { connect: { id: vocabulary.conceptId } },
            gloss: { ru: vocabulary.gloss },
            status: ContentStatus.CURATED,
          },
        },
      },
    })

    await prisma.lessonKnowledgeItem.upsert({
      where: {
        lessonId_itemId: {
          lessonId: LESSON_ID,
          itemId: vocabulary.itemId,
        },
      },
      update: { role: LessonItemRole.INTRODUCED, position: index + 5 },
      create: {
        lessonId: LESSON_ID,
        itemId: vocabulary.itemId,
        role: LessonItemRole.INTRODUCED,
        position: index + 5,
      },
    })
  }
}

async function seedExercise() {
  for (const exercise of lessonExercises) {
    const answerSpec = {
      selectionOrder: exercise.selectionOrder,
      acceptedVariants: exercise.acceptedVariants,
      slots: exercise.slots,
      testedItems: [
        exercise.primaryItemId,
        ...exercise.secondaryItemIds,
        exercise.vocabularyItemId,
      ],
    } as unknown as Prisma.InputJsonValue

    await prisma.exercise.upsert({
      where: { id: exercise.id },
      update: {
        targetText: exercise.targetText,
        answerSpec,
        status: ContentStatus.CURATED,
      },
      create: {
        id: exercise.id,
        courseId: COURSE_ID,
        lessonId: LESSON_ID,
        kind: ExerciseKind.PREPARED,
        status: ContentStatus.CURATED,
        targetLanguage: 'fi',
        targetText: exercise.targetText,
        answerSpec,
      },
    })

    await prisma.exercisePrompt.upsert({
      where: {
        exerciseId_sourceLanguage: {
          exerciseId: exercise.id,
          sourceLanguage: 'ru',
        },
      },
      update: { text: exercise.prompt },
      create: {
        exerciseId: exercise.id,
        sourceLanguage: 'ru',
        text: exercise.prompt,
      },
    })

    const exerciseItems = [
      {
        itemId: exercise.primaryItemId,
        role: ExerciseItemRole.PRIMARY,
      },
      ...exercise.secondaryItemIds.map((itemId) => ({
        itemId,
        role: ExerciseItemRole.SECONDARY,
      })),
      {
        itemId: exercise.vocabularyItemId,
        role: ExerciseItemRole.SECONDARY,
      },
    ]

    for (const item of exerciseItems) {
      await prisma.exerciseItem.upsert({
        where: {
          exerciseId_itemId: {
            exerciseId: exercise.id,
            itemId: item.itemId,
          },
        },
        update: { role: item.role },
        create: {
          exerciseId: exercise.id,
          itemId: item.itemId,
          role: item.role,
        },
      })
    }
  }
}

async function seedLocalUser() {
  await prisma.user.upsert({
    where: { id: LOCAL_USER_ID },
    update: {
      email: 'local@example.invalid',
      name: 'Local learner',
    },
    create: {
      id: LOCAL_USER_ID,
      email: 'local@example.invalid',
      name: 'Local learner',
    },
  })

  await prisma.userCourseProgress.upsert({
    where: {
      userId_routeVersionId: {
        userId: LOCAL_USER_ID,
        routeVersionId: ROUTE_VERSION_ID,
      },
    },
    update: { currentLessonId: LESSON_ID },
    create: {
      userId: LOCAL_USER_ID,
      routeVersionId: ROUTE_VERSION_ID,
      currentLessonId: LESSON_ID,
    },
  })
}

async function main() {
  assertLessonOneContent()
  await seedCourse()
  await seedKnowledge()
  await seedVocabulary()
  await seedExercise()
  await seedLocalUser()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error: unknown) => {
    console.error(error)
    await prisma.$disconnect()
    process.exitCode = 1
  })
