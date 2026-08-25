import { describe, expect, it } from 'vitest'

import { localAnswerFeedback } from './local-answer-feedback'

describe('localAnswerFeedback', () => {
  it('renders useful feedback without waiting for morphology diagnostics', () => {
    expect(
      localAnswerFeedback({
        isCorrect: false,
        normalizedAnswer: 'minä olet',
        matchedVariant: null,
        diagnostics: [
          {
            code: 'WRONG_FORM',
            actual: 'olet',
            expected: ['olen'],
          },
        ],
      }),
    ).toBe('Форма «olet» здесь не подходит. Ожидалось «olen».')
  })

  it('counts and lists every local error', () => {
    expect(
      localAnswerFeedback({
        isCorrect: false,
        normalizedAnswer: 'hän en lääkäri',
        matchedVariant: null,
        diagnostics: [
          { code: 'WRONG_FORM', actual: 'en', expected: ['ei'] },
          { code: 'MISSING_TOKEN', expected: ['ole'] },
          { code: 'TYPO', actual: 'lääkari', expected: ['lääkäri'] },
        ],
      }),
    ).toBe(
      'В ответе 3 ошибки. Форма «en» здесь не подходит. Ожидалось «ei». В ответе не хватает элемента «ole». Похоже на опечатку в слове «lääkari». Проверь написание: «lääkäri».',
    )
  })
})
