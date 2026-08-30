import { readFile } from 'node:fs/promises'

import { VoikkoFinnishMorphologyAnalyzer } from '../../packages/language-fi/src/voikko-analyzer.js'
import { lessonExercises } from '../../content/courses/ru-fi/lessons/fi.olla.basics.js'
import { presentCommonExercises } from '../../content/courses/ru-fi/lessons/fi.present.common.js'

interface DraftSentence {
  order: number
  id: string
  prompt: string
  targetText: string
  acceptedVariants: string[]
}

async function main() {
  const draft = JSON.parse(
    await readFile(
      'content/courses/ru-fi/lesson-sentences.review.json',
      'utf8',
    ),
  ) as Array<Record<string, DraftSentence[]>>

  const lessonOne = draft[0]?.['1'] ?? []
  const lessonTwo = draft[1]?.['2'] ?? []
  const expectedLessonOne = lessonExercises.map((exercise) => ({
    order: exercise.selectionOrder,
    id: exercise.id,
    prompt: exercise.prompt,
    targetText: exercise.targetText,
    acceptedVariants: [...exercise.acceptedVariants],
  }))

  if (JSON.stringify(lessonOne) !== JSON.stringify(expectedLessonOne)) {
    throw new Error('Lesson 1 is not an exact copy of the current 60 exercises')
  }

  for (const [lessonNumber, sentences] of [
    [1, lessonOne],
    [2, lessonTwo],
  ] as const) {
    if (sentences.length !== 60) {
      throw new Error(
        `Lesson ${lessonNumber} contains ${sentences.length} items`,
      )
    }
    if (new Set(sentences.map((sentence) => sentence.id)).size !== 60) {
      throw new Error(`Lesson ${lessonNumber} has duplicate IDs`)
    }
    if (new Set(sentences.map((sentence) => sentence.order)).size !== 60) {
      throw new Error(`Lesson ${lessonNumber} has duplicate order values`)
    }
  }

  const permittedForms = new Set([
    'minä',
    'sinä',
    'hän',
    'me',
    'te',
    'he',
    'täällä',
    'hei',
    ...presentCommonExercises.flatMap((exercise) =>
      exercise.slots
        .filter((slot) => slot.role === 'mainVerb')
        .flatMap((slot) => slot.accepted),
    ),
  ])

  const analyzer = await VoikkoFinnishMorphologyAnalyzer.create()
  try {
    for (const sentence of lessonTwo) {
      if (sentence.acceptedVariants.length === 0) {
        throw new Error(`${sentence.id} has no accepted variants`)
      }
      if (!sentence.acceptedVariants.includes(sentence.targetText)) {
        throw new Error(`${sentence.id} does not accept its targetText`)
      }

      for (const variant of sentence.acceptedVariants) {
        const grammarErrors = await analyzer.checkGrammar(variant)
        if (grammarErrors.length > 0) {
          throw new Error(
            `${sentence.id} has grammar errors in "${variant}": ${JSON.stringify(grammarErrors)}`,
          )
        }

        const tokens = await analyzer.analyzeText(variant)
        for (const token of tokens) {
          if (token.type !== 'word') continue
          const normalized = token.surface.toLocaleLowerCase('fi')
          if (!permittedForms.has(normalized)) {
            throw new Error(
              `${sentence.id} uses an unexplained token "${token.surface}"`,
            )
          }
          if (token.analyses.length === 0) {
            throw new Error(
              `${sentence.id} contains unknown form "${token.surface}"`,
            )
          }
        }
      }
    }
  } finally {
    analyzer.close()
  }

  console.log(
    JSON.stringify(
      {
        lessons: draft.map((entry) => Object.keys(entry)[0]),
        counts: [lessonOne.length, lessonTwo.length],
        lessonOneMatchesCurrentContent: true,
        lessonTwoUniqueTargets: new Set(
          lessonTwo.map((sentence) => sentence.targetText),
        ).size,
        lessonTwoAcceptedVariants: lessonTwo.reduce(
          (count, sentence) => count + sentence.acceptedVariants.length,
          0,
        ),
        lessonTwoMorphology: 'valid',
        unexplainedTokens: 0,
      },
      null,
      2,
    ),
  )
}

void main()
