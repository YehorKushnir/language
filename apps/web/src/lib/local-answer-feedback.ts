import type {
  StructuredAnswerCheckResult,
  StructuredAnswerDiagnostic,
} from '@language/domain'

export function localAnswerFeedback(
  result: StructuredAnswerCheckResult,
): string {
  if (result.isCorrect) return 'Верно.'

  return combineAnswerIssues(result.diagnostics.map(localDiagnosticFeedback))
}

export function combineAnswerIssues(messages: string[]): string {
  if (messages.length === 0) {
    return 'Пока не совпало. Проверь слова и их формы.'
  }
  if (messages.length === 1) return messages[0]!

  return `В ответе ${messages.length} ${errorWord(messages.length)}. ${messages.join(' ')}`
}

function localDiagnosticFeedback(
  diagnostic: StructuredAnswerDiagnostic,
): string {
  const expected = diagnostic.expected?.map((token) => `«${token}»`).join(' / ')

  if (diagnostic.code === 'MISSING_TOKEN') {
    return expected
      ? `В ответе не хватает элемента ${expected}.`
      : 'В ответе не хватает одного из элементов.'
  }
  if (diagnostic.code === 'EXTRA_TOKEN') {
    return diagnostic.actual
      ? `В ответе есть лишнее слово «${diagnostic.actual}».`
      : 'В ответе есть лишнее слово.'
  }
  if (diagnostic.code === 'WORD_ORDER') {
    return 'Все нужные слова есть, но проверь их порядок.'
  }
  if (diagnostic.code === 'TYPO') {
    return `Похоже на опечатку в слове «${diagnostic.actual ?? '—'}»${expected ? `. Проверь написание: ${expected}` : ''}.`
  }
  if (diagnostic.code === 'WRONG_FORM') {
    return `Форма «${diagnostic.actual ?? '—'}» здесь не подходит${expected ? `. Ожидалось ${expected}` : ''}.`
  }

  return 'Пока не совпало. Проверь слова и их формы.'
}

function errorWord(count: number): string {
  const modulo100 = count % 100
  const modulo10 = count % 10
  if (modulo100 >= 11 && modulo100 <= 14) return 'ошибок'
  if (modulo10 === 1) return 'ошибка'
  if (modulo10 >= 2 && modulo10 <= 4) return 'ошибки'
  return 'ошибок'
}
