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
import { moduleOneLessons } from '../../../content/courses/ru-fi/module-one.js'
import { preparedTexts } from '../../../content/courses/ru-fi/texts/fi.olla.introductions.js'
import { finnishGeneratedParadigms } from '../../../content/courses/ru-fi/finnish-paradigms.generated.js'
import {
  finnishLearnerDictionaryConceptId,
  finnishLearnerDictionaryEntries,
  finnishLearnerDictionaryItemId,
  finnishLearnerDictionaryLexicalEntryId,
} from '@language/language-fi'
import {
  validateCourseContent,
  validateFinnishMorphologyContent,
} from './content-validation.js'

const prisma = new DatabaseClient()

const COURSE_ID = 'course.ru-fi'
const ROUTE_VERSION_ID = 'course.ru-fi@1'
const LESSON_ID = 'fi.olla.basics'
const LOCAL_USER_ID = 'user.local'

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

  for (const lesson of moduleOneLessons) {
    await prisma.lesson.upsert({
      where: { id: lesson.id },
      update: {
        title: lesson.title,
        summary: lesson.summary,
        content: lesson.content as unknown as Prisma.InputJsonValue,
        status: ContentStatus.CURATED,
      },
      create: {
        id: lesson.id,
        courseId: COURSE_ID,
        title: lesson.title,
        summary: lesson.summary,
        content: lesson.content as unknown as Prisma.InputJsonValue,
        status: ContentStatus.CURATED,
      },
    })
  }

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

  for (const [index, lesson] of moduleOneLessons.entries()) {
    await prisma.courseRouteEntry.upsert({
      where: {
        routeVersionId_lessonId: {
          routeVersionId: ROUTE_VERSION_ID,
          lessonId: lesson.id,
        },
      },
      update: {
        modulePosition: lesson.modulePosition,
        lessonPosition: lesson.lessonPosition,
      },
      create: {
        routeVersionId: ROUTE_VERSION_ID,
        lessonId: lesson.id,
        modulePosition: lesson.modulePosition,
        lessonPosition: lesson.lessonPosition,
      },
    })

    const prerequisite = moduleOneLessons[index - 1]
    if (prerequisite) {
      await prisma.courseRouteDependency.upsert({
        where: {
          routeVersionId_lessonId_prerequisiteLessonId: {
            routeVersionId: ROUTE_VERSION_ID,
            lessonId: lesson.id,
            prerequisiteLessonId: prerequisite.id,
          },
        },
        update: {},
        create: {
          routeVersionId: ROUTE_VERSION_ID,
          lessonId: lesson.id,
          prerequisiteLessonId: prerequisite.id,
        },
      })
    }
  }
}

async function seedKnowledge() {
  for (const lesson of moduleOneLessons) {
    await prisma.lessonKnowledgeItem.deleteMany({
      where: {
        lessonId: lesson.id,
        itemId: {
          notIn: [
            ...lesson.skills.map((skill) => skill.id),
            ...lesson.vocabulary.map((vocabulary) => vocabulary.itemId),
          ],
        },
      },
    })

    for (const [position, skill] of lesson.skills.entries()) {
      const kind = KnowledgeItemKind[skill.kind]
      const role = LessonItemRole[skill.role ?? 'INTRODUCED']
      await prisma.knowledgeItem.upsert({
        where: { id: skill.id },
        update: {
          kind,
          languageCode: 'fi',
          skill: {
            upsert: {
              create: { name: skill.name, description: skill.description },
              update: { name: skill.name, description: skill.description },
            },
          },
        },
        create: {
          id: skill.id,
          kind,
          languageCode: 'fi',
          skill: {
            create: { name: skill.name, description: skill.description },
          },
        },
      })

      await prisma.lessonKnowledgeItem.upsert({
        where: {
          lessonId_itemId: { lessonId: lesson.id, itemId: skill.id },
        },
        update: { role, position: position + 1 },
        create: {
          lessonId: lesson.id,
          itemId: skill.id,
          role,
          position: position + 1,
        },
      })

      for (const prerequisiteSkillId of skill.prerequisiteSkillIds) {
        await prisma.skillDependency.upsert({
          where: {
            skillId_prerequisiteSkillId: {
              skillId: skill.id,
              prerequisiteSkillId,
            },
          },
          update: {},
          create: { skillId: skill.id, prerequisiteSkillId },
        })
      }
    }
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

  for (const lesson of moduleOneLessons) {
    for (const [index, vocabulary] of lesson.vocabulary.entries()) {
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
                metadata: { example: vocabulary.example },
                status: ContentStatus.CURATED,
              },
              update: {
                lexicalEntry: {
                  connect: { id: vocabulary.lexicalEntryId },
                },
                concept: { connect: { id: vocabulary.conceptId } },
                gloss: { ru: vocabulary.gloss },
                metadata: { example: vocabulary.example },
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
              metadata: { example: vocabulary.example },
              status: ContentStatus.CURATED,
            },
          },
        },
      })

      await prisma.lessonKnowledgeItem.upsert({
        where: {
          lessonId_itemId: {
            lessonId: lesson.id,
            itemId: vocabulary.itemId,
          },
        },
        update: {
          role: LessonItemRole.INTRODUCED,
          position: lesson.skills.length + index + 1,
        },
        create: {
          lessonId: lesson.id,
          itemId: vocabulary.itemId,
          role: LessonItemRole.INTRODUCED,
          position: lesson.skills.length + index + 1,
        },
      })
    }
  }
}

async function seedReaderDictionary() {
  for (const entry of finnishLearnerDictionaryEntries) {
    const itemId = finnishLearnerDictionaryItemId(entry.lemma)
    const conceptId = finnishLearnerDictionaryConceptId(entry.lemma)
    const lexicalEntryId = finnishLearnerDictionaryLexicalEntryId(entry.lemma)

    await prisma.concept.upsert({
      where: { id: conceptId },
      update: { semanticTypes: ['reader-dictionary', entry.partOfSpeech] },
      create: {
        id: conceptId,
        semanticTypes: ['reader-dictionary', entry.partOfSpeech],
      },
    })

    await prisma.lexicalEntry.upsert({
      where: { id: lexicalEntryId },
      update: {
        lemma: entry.lemma,
        partOfSpeech: entry.partOfSpeech,
        status: ContentStatus.CURATED,
      },
      create: {
        id: lexicalEntryId,
        languageCode: 'fi',
        lemma: entry.lemma,
        partOfSpeech: entry.partOfSpeech,
        status: ContentStatus.CURATED,
      },
    })

    const paradigm = finnishGeneratedParadigms[entry.lemma]
    const metadata =
      paradigm?.partOfSpeech === entry.partOfSpeech
        ? Object.fromEntries(
            Object.entries({
              inflectionType: paradigm.inflectionType,
              gradationType: paradigm.gradationType,
              verbType: paradigm.verbType,
            }).filter((value): value is [string, string] => value[1] !== null),
          )
        : {}
    const forms: Array<{
      id: string
      surface: string
      features: Record<string, string>
      source: LexicalFormSource
    }> = entry.forms.map((form, index) => ({
      ...form,
      id: `form.fi.reader.${entry.lemma}.${index + 1}`,
      features: index === 0 ? { ...metadata, ...form.features } : form.features,
      source: LexicalFormSource.CURATED,
    }))
    if (paradigm?.partOfSpeech === entry.partOfSpeech) {
      for (const generated of paradigm.forms) {
        if (
          forms.some((form) =>
            isSameReaderDictionaryForm(
              form.features,
              generated.features,
              entry.partOfSpeech,
            ),
          )
        ) {
          continue
        }
        forms.push({
          id: `form.fi.reader.${entry.lemma}.paradigm.${generated.key}`,
          surface: generated.surface,
          features: generated.features,
          source: LexicalFormSource.GENERATED,
        })
      }
    }

    await prisma.lexicalForm.deleteMany({
      where: {
        lexicalEntryId,
        id: { notIn: forms.map((form) => form.id) },
      },
    })
    for (const form of forms) {
      await prisma.lexicalForm.upsert({
        where: { id: form.id },
        update: {
          surface: form.surface,
          features: form.features,
          source: form.source,
        },
        create: {
          id: form.id,
          lexicalEntryId,
          surface: form.surface,
          features: form.features,
          source: form.source,
        },
      })
    }

    await prisma.knowledgeItem.upsert({
      where: { id: itemId },
      update: {
        kind: KnowledgeItemKind.LEXICAL_SENSE,
        languageCode: 'fi',
        lexicalSense: {
          upsert: {
            create: {
              lexicalEntry: { connect: { id: lexicalEntryId } },
              concept: { connect: { id: conceptId } },
              gloss: { ru: entry.gloss },
              status: ContentStatus.CURATED,
            },
            update: {
              gloss: { ru: entry.gloss },
              status: ContentStatus.CURATED,
            },
          },
        },
      },
      create: {
        id: itemId,
        kind: KnowledgeItemKind.LEXICAL_SENSE,
        languageCode: 'fi',
        lexicalSense: {
          create: {
            lexicalEntry: { connect: { id: lexicalEntryId } },
            concept: { connect: { id: conceptId } },
            gloss: { ru: entry.gloss },
            status: ContentStatus.CURATED,
          },
        },
      },
    })
  }
}

const readerDictionaryFormFeatures = [
  'case',
  'comparison',
  'form',
  'mood',
  'number',
  'person',
  'tense',
  'voice',
] as const

function isSameReaderDictionaryForm(
  left: Record<string, string>,
  right: Record<string, string>,
  partOfSpeech: string,
) {
  const keys =
    partOfSpeech === 'verb'
      ? readerDictionaryFormFeatures
      : readerDictionaryFormFeatures.filter((key) =>
          ['case', 'comparison', 'form', 'number'].includes(key),
        )
  return keys.every(
    (key) =>
      normalizeReaderDictionaryFeature(key, left[key], partOfSpeech) ===
      normalizeReaderDictionaryFeature(key, right[key], partOfSpeech),
  )
}

function normalizeReaderDictionaryFeature(
  key: (typeof readerDictionaryFormFeatures)[number],
  value: string | undefined,
  partOfSpeech: string,
) {
  if (key === 'comparison' && partOfSpeech === 'adjective') {
    return value ?? 'positive'
  }
  if (key === 'voice' && partOfSpeech === 'verb') return value ?? 'active'
  if (key === 'mood' && partOfSpeech === 'verb') return value ?? 'indicative'
  if (key === 'tense') {
    if (value === 'present_simple') return 'present'
    if (value === 'past_imperfective') return 'imperfect'
  }
  return value ?? null
}

async function seedExercise() {
  const preparedExerciseIds = moduleOneLessons.flatMap((lesson) =>
    lesson.exercises.map((exercise) => exercise.id),
  )
  await prisma.exercise.updateMany({
    where: {
      courseId: COURSE_ID,
      kind: ExerciseKind.PREPARED,
      id: { notIn: preparedExerciseIds },
    },
    data: { status: ContentStatus.DRAFT },
  })

  for (const lesson of moduleOneLessons) {
    for (const exercise of lesson.exercises) {
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
          courseId: COURSE_ID,
          lessonId: lesson.id,
          kind: ExerciseKind.PREPARED,
          targetLanguage: 'fi',
          targetText: exercise.targetText,
          answerSpec,
          status: ContentStatus.CURATED,
        },
        create: {
          id: exercise.id,
          courseId: COURSE_ID,
          lessonId: lesson.id,
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

      const exerciseItems = new Map<string, ExerciseItemRole>([
        [exercise.primaryItemId, ExerciseItemRole.PRIMARY],
      ])
      for (const itemId of [
        ...exercise.secondaryItemIds,
        exercise.vocabularyItemId,
      ]) {
        if (!exerciseItems.has(itemId)) {
          exerciseItems.set(itemId, ExerciseItemRole.SECONDARY)
        }
      }

      await prisma.exerciseItem.deleteMany({
        where: {
          exerciseId: exercise.id,
          itemId: { notIn: [...exerciseItems.keys()] },
        },
      })

      for (const [itemId, role] of exerciseItems) {
        await prisma.exerciseItem.upsert({
          where: {
            exerciseId_itemId: {
              exerciseId: exercise.id,
              itemId,
            },
          },
          update: { role },
          create: {
            exerciseId: exercise.id,
            itemId,
            role,
          },
        })
      }
    }
  }
}

async function seedExerciseTemplate() {
  const templateIds = moduleOneLessons.flatMap((lesson) =>
    lesson.templateId ? [lesson.templateId] : [],
  )
  await prisma.exerciseTemplate.updateMany({
    where: {
      courseId: COURSE_ID,
      id: { notIn: templateIds },
    },
    data: { status: ContentStatus.DRAFT },
  })

  for (const lesson of moduleOneLessons) {
    if (!lesson.template || !lesson.templateId) continue
    await prisma.exerciseTemplate.upsert({
      where: { id: lesson.templateId },
      update: {
        frame: lesson.template.frame,
        version: lesson.template.schemaVersion,
        definition: lesson.template as unknown as Prisma.InputJsonValue,
        status: ContentStatus.CURATED,
      },
      create: {
        id: lesson.templateId,
        courseId: COURSE_ID,
        frame: lesson.template.frame,
        version: lesson.template.schemaVersion,
        definition: lesson.template as unknown as Prisma.InputJsonValue,
        status: ContentStatus.CURATED,
      },
    })
  }
}

async function seedTexts() {
  await prisma.text.deleteMany({
    where: {
      courseId: COURSE_ID,
      id: { notIn: preparedTexts.map((text) => text.id) },
    },
  })

  for (const text of preparedTexts) {
    const existingText = await prisma.text.findUnique({
      where: { id: text.id },
      select: { body: true },
    })
    if (existingText && existingText.body !== text.body) {
      await prisma.textAudioAsset.deleteMany({ where: { textId: text.id } })
    }

    await prisma.text.upsert({
      where: { id: text.id },
      update: {
        title: text.title,
        level: text.level,
        topics: text.topics,
        body: text.body,
        status: ContentStatus.CURATED,
      },
      create: {
        id: text.id,
        courseId: text.courseId,
        title: text.title,
        level: text.level,
        topics: text.topics,
        body: text.body,
        status: ContentStatus.CURATED,
      },
    })

    await prisma.textToken.deleteMany({
      where: {
        textId: text.id,
        position: { notIn: text.tokens.map((token) => token.position) },
      },
    })

    for (const token of text.tokens) {
      await prisma.textToken.upsert({
        where: {
          textId_position: { textId: text.id, position: token.position },
        },
        update: {
          surface: token.surface,
          lemma: token.lemma,
          lexicalSenseId: token.lexicalSenseId,
          analysis: token.analysis,
          charStart: token.charStart,
          charEnd: token.charEnd,
        },
        create: {
          textId: text.id,
          position: token.position,
          surface: token.surface,
          lemma: token.lemma,
          lexicalSenseId: token.lexicalSenseId,
          analysis: token.analysis,
          charStart: token.charStart,
          charEnd: token.charEnd,
        },
      })
    }

    await prisma.textKnowledgeItem.deleteMany({
      where: {
        textId: text.id,
        itemId: { notIn: text.knowledgeItemIds },
      },
    })

    for (const itemId of text.knowledgeItemIds) {
      await prisma.textKnowledgeItem.upsert({
        where: { textId_itemId: { textId: text.id, itemId } },
        update: {},
        create: { textId: text.id, itemId },
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
  validateCourseContent()
  await validateFinnishMorphologyContent()
  await seedCourse()
  await seedKnowledge()
  await seedVocabulary()
  await seedReaderDictionary()
  await seedExerciseTemplate()
  await seedExercise()
  await seedTexts()
  if (process.env.NODE_ENV !== 'production') {
    await seedLocalUser()
  }
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
