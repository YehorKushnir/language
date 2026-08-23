import { describe, expect, it } from 'vitest'

import { moduleOneLessons } from '../../../content/courses/ru-fi/module-one.js'

import {
  assertMvpContentReadiness,
  inspectMvpContentReadiness,
} from './mvp-content-readiness.js'

describe('strict MVP content readiness', () => {
  it('marks every module-one lesson as release-ready', () => {
    const report = inspectMvpContentReadiness()

    expect(report).toMatchObject({
      ready: true,
      readyLessonCount: 16,
      lessonCount: 16,
      courseIssues: [],
    })
    expect(report.lessons).toHaveLength(16)
    expect(report.lessons.every((lesson) => lesson.ready)).toBe(true)
    expect(report.lessons.every((lesson) => lesson.issues.length === 0)).toBe(
      true,
    )
  })

  it('passes the strict release gate', () => {
    expect(assertMvpContentReadiness()).toMatchObject({
      ready: true,
      readyLessonCount: 16,
      lessonCount: 16,
    })
  })

  it('rejects an explanation that breaks the pedagogical standard', () => {
    const lessons = structuredClone(moduleOneLessons)
    const firstScreen = lessons[0]!.content.explanationScreens[0]!
    delete firstScreen.table
    firstScreen.title = { ru: 'Самопроверка' }
    firstScreen.examples = [firstScreen.examples[0]!]
    ;(firstScreen as unknown as Record<string, unknown>).quickChecks = []

    const report = inspectMvpContentReadiness(lessons)

    expect(report.lessons[0]).toMatchObject({
      ready: false,
      issues: expect.arrayContaining([
        'first explanation section must contain the overview table',
        'every explanation section must contain at least 2 examples',
        'explanation contains a service or self-check heading',
        'explanation contains a forbidden service field',
      ]),
    })
  })
})
