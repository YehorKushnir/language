import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

test.afterEach(async ({ page }) => {
  const response = await page.request.delete('/api/v1/me', {
    data: { confirmation: 'УДАЛИТЬ' },
  })

  expect([204, 401]).toContain(response.status())
})

test('protected pages expose an accessible authentication boundary', async ({
  page,
}) => {
  await page.goto('/lessons')

  await expect(page.getByText('Войдите в аккаунт')).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Создать аккаунт' }),
  ).toBeVisible()
  await expect(page.locator('main')).toHaveCount(1)
  await expectAccessible(page)
})

test('mobile layout keeps navigation reachable without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Финский как система, а не набор фраз',
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Основная навигация' }),
  ).toBeHidden()
  await expect(
    page.getByRole('navigation', { name: 'Мобильная навигация' }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true)

  await page.getByRole('link', { name: 'Уроки' }).click()
  await expect(page.getByText('Войдите в аккаунт')).toBeVisible()
  expect(await page.evaluate(() => scrollY)).toBe(0)
  await expectAccessible(page)
})

test('learner can move through the first lesson with keyboard controls', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const state = window as Window & { __appViewTransitionCalls?: number }
    state.__appViewTransitionCalls = 0
    const startViewTransition = document.startViewTransition?.bind(document)

    if (startViewTransition) {
      document.startViewTransition = (update) => {
        state.__appViewTransitionCalls =
          (state.__appViewTransitionCalls ?? 0) + 1
        return startViewTransition(update)
      }
    }
  })

  const browserErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))

  await page.goto('/sign-up')
  await page.getByLabel('Имя').fill('E2E learner')
  await page
    .getByLabel('Email')
    .fill(
      `e2e-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`,
    )
  await page.getByLabel('Пароль').fill('e2e-password-2026')
  await page.getByRole('button', { name: 'Создать аккаунт' }).click()

  await expect(page).toHaveURL(/\/lessons\/?$/u)
  await expect(
    page.getByRole('heading', { level: 1, name: '5 разделов · 80 уроков' }),
  ).toBeVisible()
  await expect(page.locator('main')).toHaveCount(1)
  await expectAccessible(page)

  const firstLesson = page.getByRole('button', {
    name: /Личные местоимения и olla/u,
  })
  const outlineUrl = page.url()
  await expect(firstLesson).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('link', { name: 'Объяснение' })).toHaveCount(0)
  await firstLesson.click()
  await expect(firstLesson).toHaveAttribute('aria-expanded', 'true')
  expect(page.url()).toBe(outlineUrl)

  const explanationNavigationStartedAt = Date.now()
  await page.getByRole('link', { name: 'Объяснение' }).click()
  await expect(page).toHaveURL(/\/lessons\/fi\.olla\.basics\/explanation$/u)
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Личные местоимения и olla',
    }),
  ).toBeVisible()
  expect(Date.now() - explanationNavigationStartedAt).toBeLessThan(1_500)
  await expect(page.locator('main')).toHaveCount(1)

  const explanationArticle = page.getByRole('article')
  await expect(
    explanationArticle.getByRole('heading', {
      level: 2,
      name: 'Личные местоимения и формы olla',
    }),
  ).toBeVisible()
  await expect(
    explanationArticle.getByRole('table', {
      name: 'Личные местоимения и формы olla',
    }),
  ).toBeVisible()
  const firstSectionContent = await explanationArticle
    .locator('section')
    .first()
    .locator('table, p')
    .allTextContents()
  expect(firstSectionContent[0]).toContain('Кто?МестоимениеOllaВместе')
  expect(firstSectionContent[1]).toContain('Minä означает «я»')
  const firstExamples = explanationArticle
    .getByRole('region', { name: 'Примеры' })
    .first()
  await expect(firstExamples).toBeVisible()
  await expect(
    explanationArticle.locator('blockquote[lang="fi"]').first(),
  ).toBeVisible()
  await expect(firstExamples.getByText('Финский')).toHaveCount(0)
  await expect(firstExamples.getByText('Перевод')).toHaveCount(0)
  await expect(firstExamples.getByText(/Me можно опустить/u)).toHaveCount(0)
  await expect(explanationArticle.getByText('Главное')).toHaveCount(0)
  await expect(explanationArticle.getByText('Проверь себя')).toHaveCount(0)
  await expect(explanationArticle.getByText(/Шаг \d/u)).toHaveCount(0)
  const importantNote = explanationArticle
    .getByRole('complementary', { name: 'Важно' })
    .first()
  await expect(importantNote).toBeVisible()
  await expect(importantNote.getByText('Важно')).toHaveCount(0)
  await expect(importantNote.locator('svg[aria-hidden="true"]')).toBeVisible()
  await expectAccessible(page)

  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true)
  await expect(
    explanationArticle.locator('blockquote[lang="fi"]').first(),
  ).toBeVisible()
  await page.setViewportSize({ width: 1280, height: 720 })

  await page.getByRole('link', { name: 'Слова', exact: true }).click()
  await expect(page).toHaveURL(/\/lessons\/fi\.olla\.basics\/vocabulary$/u)
  const flashcard = page.getByRole('button', { name: 'Показать перевод' })
  await expect(flashcard).toBeVisible()
  await flashcard.press('Enter')
  await expect(
    page.getByRole('button', { name: 'Перевод открыт' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ещё раз' })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Знаю' })).toBeEnabled()
  await expectAccessible(page)

  await page.getByRole('link', { name: 'Практика', exact: true }).click()
  await expect(page).toHaveURL(/\/lessons\/fi\.olla\.basics\/practice$/u)
  await expect(page.getByText('Задание 1 из 60')).toBeVisible()
  await expect(
    page.getByText('Переведи на финский:', { exact: false }),
  ).toHaveCount(0)

  const answer = page.getByLabel('Ответ на финском')
  await expect(answer).toBeFocused()
  await answer.fill('xyz')
  await answer.press('Enter')
  await expect(page.getByText(/Нажми Enter, чтобы продолжить/u)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Следующий' })).toBeVisible()
  await expectAccessible(page)

  await answer.press('Enter')
  await expect(page.getByText('Задание 2 из 60')).toBeVisible()
  await expect(answer).toBeFocused()
  await expect(page.locator('main')).toHaveCount(1)

  const textsNavigationStartedAt = Date.now()
  await page.getByRole('link', { name: 'Тексты' }).click()
  await expect(page).toHaveURL(/\/texts$/u)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Тексты' }),
  ).toBeVisible()
  await expect(page.getByRole('combobox')).toHaveCount(0)
  await expect(
    page.getByRole('heading', { level: 2, name: /A1 · Начальный уровень/u }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: /A2 · Базовый уровень/u }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: /B1 · Средний уровень/u }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: /B2 · Выше среднего/u }),
  ).toBeVisible()
  await expect(page.getByText(/Aamulla luen kirjaa/u)).toHaveCount(0)
  await expect(page.getByText(/% знакомых/u).first()).toBeVisible()
  expect(Date.now() - textsNavigationStartedAt).toBeLessThan(1_000)
  await expect(page.locator('main')).toHaveCount(1)
  await expectAccessible(page)

  const courseResponse = await page.request.get('/api/v1/courses/course.ru-fi')
  expect(courseResponse.ok()).toBe(true)
  const course = (await courseResponse.json()) as {
    route: { id: string }
  }
  const textCatalogResponse = await page.request.get(
    `/api/v1/me/texts/${course.route.id}`,
  )
  expect(textCatalogResponse.ok()).toBe(true)
  const textCatalog = (await textCatalogResponse.json()) as {
    items: Array<{
      id: string
      wordCount: number
      linkedWordCount: number
      knownWordCount: number
      knownPercent: number
    }>
  }
  expect(
    textCatalog.items.every((text) => text.wordCount === text.linkedWordCount),
  ).toBe(true)
  const textDetails = await Promise.all(
    textCatalog.items.map(async ({ id }) => {
      const response = await page.request.get(
        `/api/v1/me/texts/${course.route.id}/${id}`,
      )
      expect(response.ok()).toBe(true)
      return response.json() as Promise<{
        id: string
        tokens: Array<{
          translation?: { ru?: string }
          lexical?: { itemId?: string; memory?: { repetitions?: number } }
          analysis: { partOfSpeech?: string }
          dictionary?: {
            gloss?: { ru?: string }
            forms?: unknown[]
          }
        }>
      }>
    }),
  )
  const textTokens = textDetails.flatMap((text) => text.tokens)
  expect(textTokens).toHaveLength(215)
  expect(
    textTokens.filter(
      (token) =>
        !token.translation?.ru ||
        !token.lexical?.itemId ||
        !token.dictionary?.gloss?.ru ||
        !token.dictionary.forms?.length ||
        token.analysis.partOfSpeech === 'unknown',
    ),
  ).toEqual([])
  for (const summary of textCatalog.items) {
    const detail = textDetails.find((text) => text.id === summary.id)
    const knownTokenCount =
      detail?.tokens.filter(
        (token) => (token.lexical?.memory?.repetitions ?? 0) > 0,
      ).length ?? 0
    expect(summary.knownWordCount).toBe(knownTokenCount)
    expect(summary.knownPercent).toBe(
      Math.round((knownTokenCount / summary.wordCount) * 100),
    )
  }

  await page.getByRole('link', { name: 'Открыть Учебный день' }).click()
  const analyzedWord = page.getByLabel('Aamulla: утром')
  await expect(analyzedWord).toBeVisible()
  await analyzedWord.hover()
  const hoverCard = page.locator('[data-slot="hover-card-content"]')
  await expect(hoverCard).toBeVisible()
  await expect(hoverCard.getByText('утром', { exact: true })).toBeVisible()
  await expect(hoverCard.getByText('Начальная форма: aamu')).toBeVisible()
  await expect(hoverCard.getByText('Форма в тексте')).toHaveCount(0)
  await expect(hoverCard.getByText('Формы слова')).toHaveCount(0)
  await expect(
    hoverCard.getByRole('button', { name: 'Добавить в изучаемое' }),
  ).toBeEnabled()

  const verb = page.getByLabel('olen: я есть; я являюсь')
  await verb.hover()
  const verbHoverCard = page
    .locator('[data-slot="hover-card-content"]')
    .filter({ hasText: 'Инфинитив: olla' })
  await expect(verbHoverCard.getByText('Инфинитив: olla')).toBeVisible()
  const addResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'PUT' &&
      response.url().includes('/api/v1/me/vocabulary/'),
  )
  await verbHoverCard
    .getByRole('button', { name: 'Добавить в изучаемое' })
    .click()
  expect((await addResponse).ok()).toBe(true)
  await expectAccessible(page)

  expect(
    await page.evaluate(
      () =>
        (window as Window & { __appViewTransitionCalls?: number })
          .__appViewTransitionCalls ?? 0,
    ),
  ).toBe(0)
  expect(browserErrors).toEqual([])
})

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  expect(
    results.violations,
    results.violations
      .map(
        (violation) =>
          `${violation.id}: ${violation.help}\n${violation.nodes
            .map((node) => `  ${node.target.join(' ')}: ${node.failureSummary}`)
            .join('\n')}`,
      )
      .join('\n\n'),
  ).toEqual([])
}
