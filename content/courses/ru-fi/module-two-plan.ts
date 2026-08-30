export interface ModuleTwoLessonPlan {
  courseLessonNumber: number
  id: string
  title: string
  activeVocabularyTarget: number
}

export const moduleTwoLessonPlan: readonly ModuleTwoLessonPlan[] = [
  {
    courseLessonNumber: 17,
    id: 'fi.object.boundedness',
    title: 'Объект: процесс или результат',
    activeVocabularyTarget: 26,
  },
  {
    courseLessonNumber: 18,
    id: 'fi.object.total.forms',
    title: 'Полный объект в личном предложении',
    activeVocabularyTarget: 26,
  },
  {
    courseLessonNumber: 19,
    id: 'fi.numerals.quantities',
    title: 'Числительные и количество',
    activeVocabularyTarget: 26,
  },
  {
    courseLessonNumber: 20,
    id: 'fi.plural.partitive.formation',
    title: 'Партитив множественного числа: образование',
    activeVocabularyTarget: 26,
  },
  {
    courseLessonNumber: 21,
    id: 'fi.plural.partitive.usage',
    title: 'Партитив множественного числа: употребление',
    activeVocabularyTarget: 26,
  },
  {
    courseLessonNumber: 22,
    id: 'fi.plural.local-cases',
    title: 'Местные падежи во множественном числе',
    activeVocabularyTarget: 26,
  },
  {
    courseLessonNumber: 23,
    id: 'fi.plural.genitive',
    title: 'Генитив множественного числа',
    activeVocabularyTarget: 26,
  },
  {
    courseLessonNumber: 24,
    id: 'fi.adjective.case-agreement',
    title: 'Согласование прилагательных в падежах',
    activeVocabularyTarget: 26,
  },
  {
    courseLessonNumber: 25,
    id: 'fi.essive',
    title: 'Эссив: роль и временное состояние',
    activeVocabularyTarget: 26,
  },
  {
    courseLessonNumber: 26,
    id: 'fi.translative',
    title: 'Транслатив: изменение и результат',
    activeVocabularyTarget: 26,
  },
  {
    courseLessonNumber: 27,
    id: 'fi.adjective.comparative',
    title: 'Сравнительная степень',
    activeVocabularyTarget: 26,
  },
  {
    courseLessonNumber: 28,
    id: 'fi.adjective.superlative',
    title: 'Превосходная степень',
    activeVocabularyTarget: 26,
  },
  {
    courseLessonNumber: 29,
    id: 'fi.pronouns.case-forms',
    title: 'Личные и указательные местоимения в падежах',
    activeVocabularyTarget: 26,
  },
  {
    courseLessonNumber: 30,
    id: 'fi.pronouns.interrogative-indefinite',
    title: 'Вопросительные и неопределённые местоимения',
    activeVocabularyTarget: 26,
  },
  {
    courseLessonNumber: 31,
    id: 'fi.possessive.suffixes',
    title: 'Притяжательные суффиксы',
    activeVocabularyTarget: 26,
  },
  {
    courseLessonNumber: 32,
    id: 'fi.postpositions.case-government',
    title: 'Послелоги, предлоги и вся падежная система',
    activeVocabularyTarget: 26,
  },
] as const

export const moduleTwoTextPlan = [
  { afterLesson: 20, newVocabularyTarget: 17 },
  { afterLesson: 24, newVocabularyTarget: 17 },
  { afterLesson: 28, newVocabularyTarget: 17 },
  { afterLesson: 32, newVocabularyTarget: 17 },
  { afterLesson: 32, kind: 'final', newVocabularyTarget: 16 },
] as const

export const moduleTwoVocabularyBudget = {
  lessonVocabulary: moduleTwoLessonPlan.reduce(
    (total, lesson) => total + lesson.activeVocabularyTarget,
    0,
  ),
  textOnlyVocabulary: moduleTwoTextPlan.reduce(
    (total, text) => total + text.newVocabularyTarget,
    0,
  ),
  total: 500,
} as const
