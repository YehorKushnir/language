import { describe, expect, it } from 'vitest'

import {
  getExerciseConstructionKey,
  getExercisePersonKey,
} from '../../../content/courses/ru-fi/lessons/exercise-sequencing.js'
import { moduleOneLessons } from '../../../content/courses/ru-fi/module-one.js'
import { inspectCurriculumProgression } from './curriculum-progression.js'

describe('curriculum grammar progression', () => {
  it('uses only grammar and knowledge available by the current lesson', () => {
    expect(inspectCurriculumProgression()).toEqual([])
  })

  it('rejects an early partitive form', () => {
    const lessons = structuredClone(moduleOneLessons)
    const exercise = lessons[0]!.exercises.find((candidate) =>
      candidate.slots.some((slot) => slot.role === 'complement'),
    )!
    const complement = exercise.slots.find(
      (slot) => slot.role === 'complement',
    )!
    const student = lessons[0]!.vocabulary.find(
      (item) => item.lemma === 'opiskelija',
    )!
    complement.accepted = ['opiskelijoita']
    complement.itemIds = [student.itemId]

    expect(inspectCurriculumProgression(lessons)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('uses opiskelijoita (partitive) too early'),
      ]),
    )
  })

  it('rejects a future knowledge item in an earlier lesson', () => {
    const lessons = structuredClone(moduleOneLessons)
    const futureSkillId = lessons[9]!.skills[0]!.id
    lessons[0]!.exercises[0]!.secondaryItemIds.push(futureSkillId)

    expect(inspectCurriculumProgression(lessons)).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`references future item ${futureSkillId}`),
      ]),
    )
  })

  it('rejects long runs of the same construction', () => {
    const lessons = structuredClone(moduleOneLessons)
    const lesson = lessons[9]!
    const firstKey = getExerciseConstructionKey(lesson.exercises[0]!)
    const repeated = lesson.exercises.filter(
      (exercise) => getExerciseConstructionKey(exercise) === firstKey,
    )
    const remaining = lesson.exercises.filter(
      (exercise) => getExerciseConstructionKey(exercise) !== firstKey,
    )
    lesson.exercises = [...repeated, ...remaining].map((exercise, index) => ({
      ...exercise,
      selectionOrder: index + 1,
    }))

    expect(inspectCurriculumProgression(lessons)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('more than 2 exercises with construction'),
      ]),
    )
  })

  it('rejects long runs with the same grammatical person', () => {
    const lessons = structuredClone(moduleOneLessons)
    const lesson = lessons[0]!
    const samePerson = lesson.exercises.filter(
      (exercise) => getExercisePersonKey(exercise) === 'minä',
    )
    const remaining = lesson.exercises.filter(
      (exercise) => getExercisePersonKey(exercise) !== 'minä',
    )
    lesson.exercises = [...samePerson, ...remaining].map((exercise, index) => ({
      ...exercise,
      selectionOrder: index + 1,
    }))

    expect(samePerson.length).toBeGreaterThanOrEqual(3)
    expect(inspectCurriculumProgression(lessons)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('more than 2 exercises with person minä'),
      ]),
    )
  })
})
