import {
  objectBoundednessContent,
  objectBoundednessSkills,
  objectBoundednessVocabulary,
} from './lessons/fi.object.boundedness.js'
import {
  objectTotalFormsContent,
  objectTotalFormsSkills,
  objectTotalFormsVocabulary,
} from './lessons/fi.object.total.forms.js'
import { moduleOneLessons, type CourseLessonSeed } from './module-one.js'
import { moduleTwoLessonPlan } from './module-two-plan.js'
import { applyReviewedExercises } from './reviewed-exercises.js'

const objectBoundednessPlan = moduleTwoLessonPlan[0]
const objectTotalFormsPlan = moduleTwoLessonPlan[1]

if (!objectBoundednessPlan || !objectTotalFormsPlan) {
  throw new Error('Module two must declare lessons 17 and 18')
}

const moduleTwoLessonDrafts: CourseLessonSeed[] = [
  {
    id: objectBoundednessPlan.id,
    modulePosition: 2,
    lessonPosition: 1,
    title: { ru: objectBoundednessPlan.title },
    summary: {
      ru: 'Партитив показывает действие как процесс, а полный объект — достигнутый или запланированный результат.',
    },
    content: objectBoundednessContent,
    vocabulary: objectBoundednessVocabulary,
    exercises: [],
    skills: objectBoundednessSkills,
    template: {
      schemaVersion: 1,
      frame: 'prepared-variation',
      lessonId: objectBoundednessPlan.id,
      sourceLanguage: 'ru',
      targetLanguage: 'fi',
      exerciseIds: [],
      supportedItemIds: [
        ...objectBoundednessSkills.map((skill) => skill.id),
        ...objectBoundednessVocabulary.map((item) => item.itemId),
      ],
    },
    templateId: `template.${objectBoundednessPlan.id}.prepared-variation@1`,
    mvpQuality: {
      content: 'CURATED',
      linguisticReview: 'PENDING',
      goldenExerciseIds: [],
    },
  },
  {
    id: objectTotalFormsPlan.id,
    modulePosition: 2,
    lessonPosition: 2,
    title: { ru: objectTotalFormsPlan.title },
    summary: {
      ru: 'Полный объект единственного числа имеет форму генитива, а множественного — форму номинатива множественного числа.',
    },
    content: objectTotalFormsContent,
    vocabulary: objectTotalFormsVocabulary,
    exercises: [],
    skills: objectTotalFormsSkills,
    template: {
      schemaVersion: 1,
      frame: 'prepared-variation',
      lessonId: objectTotalFormsPlan.id,
      sourceLanguage: 'ru',
      targetLanguage: 'fi',
      exerciseIds: [],
      supportedItemIds: [
        ...objectTotalFormsSkills.map((skill) => skill.id),
        ...objectTotalFormsVocabulary.map((item) => item.itemId),
      ],
    },
    templateId: `template.${objectTotalFormsPlan.id}.prepared-variation@1`,
    mvpQuality: {
      content: 'CURATED',
      linguisticReview: 'PENDING',
      goldenExerciseIds: [],
    },
  },
]

export const moduleTwoDraftLessons = applyReviewedExercises(
  moduleTwoLessonDrafts,
  {
    previousLessons: moduleOneLessons,
    reviewLessonOffset: 16,
  },
)

export const moduleTwoDraftVocabulary = moduleTwoDraftLessons.flatMap(
  (lesson) => lesson.vocabulary,
)
