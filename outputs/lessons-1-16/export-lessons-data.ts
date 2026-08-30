import { writeFile } from 'node:fs/promises'

import { moduleOneLessons } from '../../content/courses/ru-fi/module-one.js'

const lessons = moduleOneLessons.map((lesson) => ({
  lessonNumber: lesson.lessonPosition,
  lessonId: lesson.id,
  lessonTitle: lesson.title.ru,
  exercises: lesson.exercises.map((exercise) => ({
    order: exercise.selectionOrder,
    exerciseId: exercise.id,
    prompt: exercise.prompt,
    targetText: exercise.targetText,
    acceptedVariants: exercise.acceptedVariants,
  })),
}))

async function main() {
  await writeFile(
    'outputs/lessons-1-16/lessons-data.json',
    JSON.stringify(lessons, null, 2),
    'utf8',
  )
}

void main()
