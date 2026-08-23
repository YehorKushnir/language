import { DatabaseClient } from '../src/index.js'
import { validatePublishedCourse } from './publication-validation.js'

const routeVersionId = process.argv[2] ?? 'course.ru-fi@1'
const prisma = new DatabaseClient()

try {
  const report = await validatePublishedCourse(prisma, routeVersionId)
  console.log(
    [
      'Publication is valid:',
      report.routeVersionId,
      `${report.lessonCount} lessons`,
      `${report.knowledgeItemCount} knowledge items`,
      `${report.preparedExerciseCount} prepared exercises`,
      `${report.generatedExerciseCount} cached generated exercises`,
      `${report.templateCount} templates`,
      `${report.generatedCandidateCount} generated candidates`,
      `${report.textCount} texts`,
      `${report.skillDependencyCount} skill dependencies`,
      `${report.linkedAudioCount} linked audio assets`,
    ].join(' '),
  )
  for (const warning of report.warnings) console.warn(`Warning: ${warning}`)
} finally {
  await prisma.$disconnect()
}
