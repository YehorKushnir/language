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
import {
  numeralsQuantitiesContent,
  numeralsQuantitiesSkills,
  numeralsQuantitiesVocabulary,
} from './lessons/fi.numerals.quantities.js'
import {
  pluralPartitiveFormationContent,
  pluralPartitiveFormationSkills,
  pluralPartitiveFormationVocabulary,
} from './lessons/fi.plural.partitive.formation.js'
import {
  pluralPartitiveUsageContent,
  pluralPartitiveUsageSkills,
  pluralPartitiveUsageVocabulary,
} from './lessons/fi.plural.partitive.usage.js'
import {
  pluralLocalCasesContent,
  pluralLocalCasesSkills,
  pluralLocalCasesVocabulary,
} from './lessons/fi.plural.local-cases.js'
import {
  pluralGenitiveContent,
  pluralGenitiveSkills,
  pluralGenitiveVocabulary,
} from './lessons/fi.plural.genitive.js'
import {
  adjectiveCaseAgreementContent,
  adjectiveCaseAgreementSkills,
  adjectiveCaseAgreementVocabulary,
} from './lessons/fi.adjective.case-agreement.js'
import { moduleOneLessons, type CourseLessonSeed } from './module-one.js'
import { moduleTwoLessonPlan } from './module-two-plan.js'
import { applyReviewedExercises } from './reviewed-exercises.js'

const objectBoundednessPlan = moduleTwoLessonPlan[0]
const objectTotalFormsPlan = moduleTwoLessonPlan[1]
const numeralsQuantitiesPlan = moduleTwoLessonPlan[2]
const pluralPartitiveFormationPlan = moduleTwoLessonPlan[3]
const pluralPartitiveUsagePlan = moduleTwoLessonPlan[4]
const pluralLocalCasesPlan = moduleTwoLessonPlan[5]
const pluralGenitivePlan = moduleTwoLessonPlan[6]
const adjectiveCaseAgreementPlan = moduleTwoLessonPlan[7]

if (
  !objectBoundednessPlan ||
  !objectTotalFormsPlan ||
  !numeralsQuantitiesPlan ||
  !pluralPartitiveFormationPlan ||
  !pluralPartitiveUsagePlan ||
  !pluralLocalCasesPlan ||
  !pluralGenitivePlan ||
  !adjectiveCaseAgreementPlan
) {
  throw new Error('Module two must declare lessons 17 through 24')
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
  {
    id: numeralsQuantitiesPlan.id,
    modulePosition: 2,
    lessonPosition: 3,
    title: { ru: numeralsQuantitiesPlan.title },
    summary: {
      ru: 'Числа 0–12, партитив после количества, согласование числового подлежащего, меры и цены.',
    },
    content: numeralsQuantitiesContent,
    vocabulary: numeralsQuantitiesVocabulary,
    exercises: [],
    skills: numeralsQuantitiesSkills,
    template: {
      schemaVersion: 1,
      frame: 'prepared-variation',
      lessonId: numeralsQuantitiesPlan.id,
      sourceLanguage: 'ru',
      targetLanguage: 'fi',
      exerciseIds: [],
      supportedItemIds: [
        ...numeralsQuantitiesSkills.map((skill) => skill.id),
        ...numeralsQuantitiesVocabulary.map((item) => item.itemId),
      ],
    },
    templateId: `template.${numeralsQuantitiesPlan.id}.prepared-variation@1`,
    mvpQuality: {
      content: 'CURATED',
      linguisticReview: 'PENDING',
      goldenExerciseIds: [],
    },
  },
  {
    id: pluralPartitiveFormationPlan.id,
    modulePosition: 2,
    lessonPosition: 4,
    title: { ru: pluralPartitiveFormationPlan.title },
    summary: {
      ru: 'Партитив множественного числа с показателем -i- и основные модели изменения основы.',
    },
    content: pluralPartitiveFormationContent,
    vocabulary: pluralPartitiveFormationVocabulary,
    exercises: [],
    skills: pluralPartitiveFormationSkills,
    template: {
      schemaVersion: 1,
      frame: 'prepared-variation',
      lessonId: pluralPartitiveFormationPlan.id,
      sourceLanguage: 'ru',
      targetLanguage: 'fi',
      exerciseIds: [],
      supportedItemIds: [
        ...pluralPartitiveFormationSkills.map((skill) => skill.id),
        ...pluralPartitiveFormationVocabulary.map((item) => item.itemId),
      ],
    },
    templateId: `template.${pluralPartitiveFormationPlan.id}.prepared-variation@1`,
    mvpQuality: {
      content: 'CURATED',
      linguisticReview: 'PENDING',
      goldenExerciseIds: [],
    },
  },
  {
    id: pluralPartitiveUsagePlan.id,
    modulePosition: 2,
    lessonPosition: 5,
    title: { ru: pluralPartitiveUsagePlan.title },
    summary: {
      ru: 'Партитив множественного числа для неопределённой группы, процесса, отрицания и количества.',
    },
    content: pluralPartitiveUsageContent,
    vocabulary: pluralPartitiveUsageVocabulary,
    exercises: [],
    skills: pluralPartitiveUsageSkills,
    template: {
      schemaVersion: 1,
      frame: 'prepared-variation',
      lessonId: pluralPartitiveUsagePlan.id,
      sourceLanguage: 'ru',
      targetLanguage: 'fi',
      exerciseIds: [],
      supportedItemIds: [
        ...pluralPartitiveUsageSkills.map((skill) => skill.id),
        ...pluralPartitiveUsageVocabulary.map((item) => item.itemId),
      ],
    },
    templateId: `template.${pluralPartitiveUsagePlan.id}.prepared-variation@1`,
    mvpQuality: {
      content: 'CURATED',
      linguisticReview: 'PENDING',
      goldenExerciseIds: [],
    },
  },
  {
    id: pluralLocalCasesPlan.id,
    modulePosition: 2,
    lessonPosition: 6,
    title: { ru: pluralLocalCasesPlan.title },
    summary: {
      ru: 'Шесть местных падежей во множественном числе: внутри, снаружи, источник и направление.',
    },
    content: pluralLocalCasesContent,
    vocabulary: pluralLocalCasesVocabulary,
    exercises: [],
    skills: pluralLocalCasesSkills,
    template: {
      schemaVersion: 1,
      frame: 'prepared-variation',
      lessonId: pluralLocalCasesPlan.id,
      sourceLanguage: 'ru',
      targetLanguage: 'fi',
      exerciseIds: [],
      supportedItemIds: [
        ...pluralLocalCasesSkills.map((skill) => skill.id),
        ...pluralLocalCasesVocabulary.map((item) => item.itemId),
      ],
    },
    templateId: `template.${pluralLocalCasesPlan.id}.prepared-variation@1`,
    mvpQuality: {
      content: 'CURATED',
      linguisticReview: 'PENDING',
      goldenExerciseIds: [],
    },
  },
  {
    id: pluralGenitivePlan.id,
    modulePosition: 2,
    lessonPosition: 7,
    title: { ru: pluralGenitivePlan.title },
    summary: {
      ru: 'Генитив множественного числа и основные модели -jen, -ien, -iden/-itten и -ten.',
    },
    content: pluralGenitiveContent,
    vocabulary: pluralGenitiveVocabulary,
    exercises: [],
    skills: pluralGenitiveSkills,
    template: {
      schemaVersion: 1,
      frame: 'prepared-variation',
      lessonId: pluralGenitivePlan.id,
      sourceLanguage: 'ru',
      targetLanguage: 'fi',
      exerciseIds: [],
      supportedItemIds: [
        ...pluralGenitiveSkills.map((skill) => skill.id),
        ...pluralGenitiveVocabulary.map((item) => item.itemId),
      ],
    },
    templateId: `template.${pluralGenitivePlan.id}.prepared-variation@1`,
    mvpQuality: {
      content: 'CURATED',
      linguisticReview: 'PENDING',
      goldenExerciseIds: [],
    },
  },
  {
    id: adjectiveCaseAgreementPlan.id,
    modulePosition: 2,
    lessonPosition: 8,
    title: { ru: adjectiveCaseAgreementPlan.title },
    summary: {
      ru: 'Прилагательное согласуется с существительным в падеже и числе: от генитива и партитива до местных падежей и множественного числа.',
    },
    content: adjectiveCaseAgreementContent,
    vocabulary: adjectiveCaseAgreementVocabulary,
    exercises: [],
    skills: adjectiveCaseAgreementSkills,
    template: {
      schemaVersion: 1,
      frame: 'prepared-variation',
      lessonId: adjectiveCaseAgreementPlan.id,
      sourceLanguage: 'ru',
      targetLanguage: 'fi',
      exerciseIds: [],
      supportedItemIds: [
        ...adjectiveCaseAgreementSkills.map((skill) => skill.id),
        ...adjectiveCaseAgreementVocabulary.map((item) => item.itemId),
      ],
    },
    templateId: `template.${adjectiveCaseAgreementPlan.id}.prepared-variation@1`,
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
