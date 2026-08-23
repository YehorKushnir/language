import { describe, expect, it } from 'vitest'

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
})
