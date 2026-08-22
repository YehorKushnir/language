import { describe, expect, it } from 'vitest'

import {
  toLessonContent,
  toLocalizedText,
  toNullableLocalizedText,
} from './content-mapper'

describe('content mappers', () => {
  it('keeps only string localization values', () => {
    expect(
      toLocalizedText({ ru: 'Урок', fi: 'Oppitunti', version: 1 }),
    ).toEqual({
      ru: 'Урок',
      fi: 'Oppitunti',
    })
  })

  it('returns null for an empty optional localization', () => {
    expect(toNullableLocalizedText(null)).toBeNull()
  })

  it('drops unknown lesson sections', () => {
    expect(
      toLessonContent({
        version: 2,
        sections: ['explanation', 'unknown', 'practice'],
      }),
    ).toEqual({
      version: 2,
      sections: ['explanation', 'practice'],
      explanationScreens: [],
    })
  })

  it('maps valid explanation screens and drops malformed entries', () => {
    expect(
      toLessonContent({
        version: 1,
        sections: ['explanation'],
        explanationScreens: [
          {
            id: 'intro',
            title: { ru: 'Введение' },
            paragraphs: [{ ru: 'Текст' }],
            examples: [
              { target: 'Minä olen.', source: { ru: 'Я есть.' } },
              { source: { ru: 'Нет оригинала' } },
            ],
          },
          null,
        ],
      }).explanationScreens,
    ).toEqual([
      {
        id: 'intro',
        title: { ru: 'Введение' },
        paragraphs: [{ ru: 'Текст' }],
        examples: [{ target: 'Minä olen.', source: { ru: 'Я есть.' } }],
      },
    ])
  })
})
