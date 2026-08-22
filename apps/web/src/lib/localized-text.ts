import type { LocalizedText } from '@language/contracts'

export function localizedText(
  value: LocalizedText | null | undefined,
  language = 'ru',
): string {
  if (!value) return ''
  return value[language] ?? Object.values(value)[0] ?? ''
}
