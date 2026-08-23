import { inspectMvpContentReadiness } from './mvp-content-readiness.js'

const report = inspectMvpContentReadiness()

console.log(
  `Strict MVP content readiness: ${report.readyLessonCount}/${report.lessonCount} lessons ready`,
)

for (const issue of report.courseIssues) console.log(`Course: ${issue}`)
for (const lesson of report.lessons) {
  const status = lesson.ready ? 'READY' : 'NOT READY'
  console.log(`${status}: ${lesson.lessonId}`)
  for (const issue of lesson.issues) console.log(`  - ${issue}`)
}

if (!report.ready) process.exitCode = 1
