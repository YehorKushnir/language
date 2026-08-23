import { describe, expect, it } from 'vitest'

import {
  assertMvpContentReadiness,
  inspectMvpContentReadiness,
} from './mvp-content-readiness.js'

describe('strict MVP content readiness', () => {
  it('keeps scaffold lessons out of the ready count', () => {
    const report = inspectMvpContentReadiness()
    const firstLesson = report.lessons.find(
      (lesson) => lesson.lessonId === 'fi.olla.basics',
    )
    const scaffoldLesson = report.lessons.find((lesson) => !lesson.ready)

    expect(firstLesson).toMatchObject({ ready: true, issues: [] })
    expect(scaffoldLesson?.ready).toBe(false)
    expect(scaffoldLesson?.issues).toContain(
      'content is still marked as scaffold',
    )
    expect(report.readyLessonCount).toBeGreaterThanOrEqual(3)
    expect(report.ready).toBe(false)
  })

  it('fails the strict release gate while content gaps remain', () => {
    expect(() => assertMvpContentReadiness()).toThrow(
      /content is still marked as scaffold/u,
    )
  })
})
