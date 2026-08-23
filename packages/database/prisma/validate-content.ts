import {
  validateCourseContent,
  validateFinnishMorphologyContent,
} from './content-validation.js'

const report = validateCourseContent()

for (const lesson of report.lessons) {
  console.log(
    [
      'Content is valid:',
      lesson.lessonId,
      `${lesson.explanationScreenCount} sections`,
      `${lesson.exampleCount} examples`,
      `${lesson.vocabularyCount} vocabulary items`,
      `${lesson.exerciseCount} exercises`,
    ].join(' '),
  )
}

console.log(
  `Prepared texts are valid: ${report.texts.textCount} texts ${report.texts.tokenCount} tokens ${report.texts.lexicalTokenCount} linked tokens`,
)

const morphology = await validateFinnishMorphologyContent()
console.log(
  `Finnish morphology is valid: ${morphology.checkedWordCount} unique forms, ${morphology.lemmaOverrideCount} curated lemma overrides`,
)
