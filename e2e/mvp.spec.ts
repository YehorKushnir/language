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

test('learner can move through the first lesson with keyboard controls', async ({
  page,
}) => {
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

  await page.getByRole('link', { name: 'Объяснение' }).click()
  await expect(page).toHaveURL(/\/lessons\/fi\.olla\.basics\/explanation$/u)
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Личные местоимения и olla',
    }),
  ).toBeVisible()
  await expect(page.locator('main')).toHaveCount(1)
  await expectAccessible(page)

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

  await page.getByRole('link', { name: 'Тексты' }).click()
  await expect(page).toHaveURL(/\/texts$/u)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Тексты' }),
  ).toBeVisible()
  await expect(page.locator('main')).toHaveCount(1)
  await expectAccessible(page)

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
