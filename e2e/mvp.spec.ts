import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'

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
      name: 'Финский с нуля',
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Основная навигация' }),
  ).toBeHidden()
  await expect(
    page.getByRole('navigation', { name: 'Мобильная навигация' }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('link', { name: 'Создать аккаунт и начать' }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true)

  await page.goto('/lessons')
  await expect(page.getByText('Войдите в аккаунт')).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Мобильная навигация' }),
  ).toHaveCount(0)
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
  await page.getByLabel('Пароль', { exact: true }).fill('e2e-password-2026')
  await page.getByRole('button', { name: 'Создать аккаунт' }).click()

  await expect(page).toHaveURL(/\/lessons\/?$/u)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Первый модуль · 16 уроков' }),
  ).toBeVisible()
  await expect(page.locator('main')).toHaveCount(1)
  await expectAccessible(page)

  const firstLesson = page.getByRole('button', {
    name: /Личные местоимения и olla/u,
  })
  const outlineUrl = page.url()
  await expect(firstLesson).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('link', { name: 'Объяснение' })).toBeVisible()
  await firstLesson.click()
  await expect(firstLesson).toHaveAttribute('aria-expanded', 'false')
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
  await expect(
    page.getByText('Утверждение, отрицание и общий вопрос.'),
  ).toHaveCount(0)
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
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('[data-app-header]')).toBeHidden()
  const mobileNavigation = page.getByRole('navigation', {
    name: 'Мобильная навигация',
  })
  await expect(mobileNavigation.getByRole('link')).toHaveCount(5)
  await expect(
    mobileNavigation.getByRole('link', { name: 'Настройки' }),
  ).toBeVisible()
  await expect(
    page.getByText(/Напиши слово по-фински без подсказки/u),
  ).toHaveCount(0)
  await expect(page.getByText(/Прогресс сохраняется на сервере/u)).toHaveCount(
    0,
  )
  await expect(page.getByText('местоимение', { exact: true })).toHaveCount(0)
  await expect(page.locator('main > header')).toHaveCSS(
    'border-bottom-width',
    '0px',
  )
  const lessonVocabularyResponse = await page.request.get(
    '/api/v1/lessons/fi.olla.basics/vocabulary',
  )
  expect(lessonVocabularyResponse.ok()).toBe(true)
  const lessonVocabulary = (await lessonVocabularyResponse.json()) as {
    items: Array<{ itemId: string; lemma: string }>
  }
  const activeItemId = await page
    .locator('article[data-item-id]')
    .getAttribute('data-item-id')
  const activeWord = lessonVocabulary.items.find(
    (item) => item.itemId === activeItemId,
  )
  expect(activeWord).toBeTruthy()
  const vocabularyAnswer = page.getByLabel('Слово по-фински')
  const vocabularyButton = page.getByRole('button', { name: 'Проверить' })
  const vocabularyAnswerBox = await vocabularyAnswer.boundingBox()
  const vocabularyButtonBox = await vocabularyButton.boundingBox()
  expect(vocabularyAnswerBox).not.toBeNull()
  expect(vocabularyButtonBox).not.toBeNull()
  expect(vocabularyButtonBox!.y).toBeGreaterThan(
    vocabularyAnswerBox!.y + vocabularyAnswerBox!.height,
  )
  expect(
    Math.abs(vocabularyButtonBox!.width - vocabularyAnswerBox!.width),
  ).toBe(0)
  await expect(vocabularyAnswer).toBeFocused()
  await vocabularyAnswer.fill(activeWord!.lemma)
  await page.keyboard.press('Enter')
  await expect(page.getByText('Верно · 1 из 3', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Правильных ответов: 1 из 3')).toBeVisible()
  await expect(page.getByLabel('Правильных ответов: 1 из 3')).toHaveText('1/3')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= window.innerHeight,
    ),
  ).toBe(true)
  await page.keyboard.press('Enter')
  await expect(page.getByText('Верно · 1 из 3', { exact: true })).toHaveCount(0)
  await expect(vocabularyAnswer).toBeFocused()
  await expectAccessible(page)

  await mobileNavigation.getByRole('link', { name: 'Настройки' }).click()
  await expect(page).toHaveURL(/\/settings$/u)
  await expect(
    page.getByRole('main').getByRole('button', { name: 'Выйти', exact: true }),
  ).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/\/lessons\/fi\.olla\.basics\/vocabulary$/u)

  await page.getByRole('link', { name: 'Практика', exact: true }).click()
  await expect(page).toHaveURL(/\/lessons\/fi\.olla\.basics\/practice$/u)
  await expect(page.getByText('1 из 60', { exact: true })).toBeVisible()
  await expect(page.getByText(/Блок/u)).toHaveCount(0)
  await expect(page.getByText(/Верных:/u)).toHaveCount(0)
  await expect(
    page.getByText('Проверенные ответы сохраняются автоматически.'),
  ).toHaveCount(0)
  await expect(
    page.getByRole('link', { name: 'Сохранить и выйти' }),
  ).toHaveCount(0)
  await expect(page.getByRole('article')).toHaveClass(/bg-card/u)
  await expect(
    page.getByText('Переведи на финский:', { exact: false }),
  ).toHaveCount(0)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= window.innerHeight,
    ),
  ).toBe(true)

  const answer = page.getByLabel('Ответ на финском')
  const practiceButton = page.getByRole('button', { name: 'Проверить' })
  const practiceAnswerBox = await answer.boundingBox()
  const practiceButtonBox = await practiceButton.boundingBox()
  expect(practiceAnswerBox).not.toBeNull()
  expect(practiceButtonBox).not.toBeNull()
  expect(practiceButtonBox!.y).toBeGreaterThan(
    practiceAnswerBox!.y + practiceAnswerBox!.height,
  )
  expect(Math.abs(practiceButtonBox!.width - practiceAnswerBox!.width)).toBe(0)
  await expect(answer).toBeFocused()
  await answer.fill('xyz')
  await answer.press('Enter')
  await expect(page.getByText(/Нажми Enter, чтобы продолжить/u)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Следующий' })).toBeVisible()
  await expectAccessible(page)

  await answer.press('Enter')
  await expect(page.getByText('2 из 60', { exact: true })).toBeVisible()
  await expect(answer).toBeFocused()
  await expect(page.locator('main')).toHaveCount(1)

  await page.reload()
  await expect(page.getByText('2 из 60', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Ответ на финском')).toBeFocused()

  await page.setViewportSize({ width: 1280, height: 720 })
  const textsNavigationStartedAt = Date.now()
  await page.getByRole('link', { name: 'Тексты' }).click()
  await expect(page).toHaveURL(/\/texts$/u)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Тексты' }),
  ).toBeVisible()
  await expect(page.getByRole('combobox')).toHaveCount(2)
  await expect(
    page.getByRole('button', { name: 'Все тексты' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(
    page.getByRole('heading', { level: 2, name: /A1 · Начальный уровень/u }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: /A2 · Базовый уровень/u }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: /B1 · Средний уровень/u }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('heading', { level: 2, name: /B2 · Выше среднего/u }),
  ).toHaveCount(0)
  await expect(page.getByText(/Aamulla luen kirjaa/u)).toHaveCount(0)
  await expect(page.getByText(/% знакомых/u).last()).toBeVisible()
  await page.getByRole('button', { name: 'Подходят сейчас' }).click()
  await expect(page.getByText('Подходящих текстов пока нет')).toBeVisible()
  await page.getByRole('button', { name: 'Все тексты' }).click()
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
  await verb.hover()
  await expect(
    page
      .locator('[data-slot="hover-card-content"]')
      .filter({ hasText: 'Инфинитив: olla' })
      .getByRole('button', { name: 'Уже изучается' }),
  ).toBeVisible()
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

test('text-only vocabulary enters review as a flashcard', async ({ page }) => {
  await signUpLearner(page, 'Text word learner')
  await page.goto('/texts')
  await page.getByRole('link', { name: 'Открыть Учебный день' }).click()

  const textWord = page.getByLabel('Aamulla: утром')
  await textWord.click()
  const wordCard = page
    .locator('[data-slot="hover-card-content"]:visible')
    .last()
  await expect(wordCard.getByText('Начальная форма: aamu')).toBeVisible()
  await wordCard.getByRole('button', { name: 'Добавить в изучаемое' }).click()

  await page.goto('/vocabulary')
  await expect(
    page.getByText(/1 слово · 0 конструкций · 1 пора повторить/u),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Повторить' }).click()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Вспомни слово' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'aamu' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Показать перевод' }).click()
  await expect(page.getByText('утро', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Знаю' }).click()
  const continueReview = page.getByRole('button', { name: 'Продолжить' })
  await expect(continueReview).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('heading', { name: 'Повторение завершено' }),
  ).toBeVisible()
})

test('practice restores an error only after twelve other answers', async ({
  page,
}) => {
  await signUpLearner(page, 'Delayed correction learner')
  const courseResponse = await page.request.get('/api/v1/courses/course.ru-fi')
  const course = (await courseResponse.json()) as { route: { id: string } }
  const routeVersionId = course.route.id
  const sessionResponse = await page.request.put(
    `/api/v1/me/course-progress/${routeVersionId}/lessons/fi.olla.basics/practice-session`,
  )
  expect(sessionResponse.ok()).toBe(true)

  const completedExerciseIds: string[] = []
  let firstPrompt = ''
  for (let index = 0; index < 13; index += 1) {
    const search = new URLSearchParams({
      sourceLanguage: 'ru',
      routeVersionId,
      ...(completedExerciseIds.length > 0
        ? { exclude: completedExerciseIds.join(',') }
        : {}),
    })
    const exerciseResponse = await page.request.get(
      `/api/v1/lessons/fi.olla.basics/exercises/next?${search.toString()}`,
    )
    expect(exerciseResponse.ok()).toBe(true)
    const exercise = (await exerciseResponse.json()) as {
      id: string
      prompt: string
    }
    if (index === 0) {
      firstPrompt = exercise.prompt.replace(/^Переведи на финский:\s*/u, '')
    }
    completedExerciseIds.push(exercise.id)

    const attemptResponse = await page.request.post(
      `/api/v1/exercises/${exercise.id}/attempts`,
      {
        data: {
          answer: 'xyz',
          idempotencyKey: randomUUID(),
          routeVersionId,
          durationMs: 100,
        },
      },
    )
    expect(attemptResponse.ok()).toBe(true)
  }

  await page.goto('/lessons/fi.olla.basics/practice')
  await expect(page.getByText('Повтор ошибки', { exact: true })).toBeVisible()
  await expect(page.getByText('13 из 60', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: firstPrompt }),
  ).toBeVisible()

  await page.reload()
  await expect(page.getByText('Повтор ошибки', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: firstPrompt }),
  ).toBeVisible()
})

test('lesson vocabulary requires three server-checked answers per word', async ({
  page,
}) => {
  await signUpLearner(page, 'Active recall learner')
  const courseResponse = await page.request.get('/api/v1/courses/course.ru-fi')
  expect(courseResponse.ok()).toBe(true)
  const course = (await courseResponse.json()) as {
    route: { id: string }
  }
  const vocabularyResponse = await page.request.get(
    '/api/v1/lessons/fi.olla.basics/vocabulary',
  )
  expect(vocabularyResponse.ok()).toBe(true)
  const vocabulary = (await vocabularyResponse.json()) as {
    items: Array<{ itemId: string; lemma: string }>
  }

  for (const item of vocabulary.items) {
    for (let answerIndex = 0; answerIndex < 3; answerIndex += 1) {
      const idempotencyKey = randomUUID()
      const response = await page.request.post(
        `/api/v1/me/course-progress/${course.route.id}/lessons/fi.olla.basics/vocabulary/${item.itemId}/attempts`,
        {
          data: {
            answer: item.lemma,
            idempotencyKey,
          },
        },
      )
      expect(response.ok()).toBe(true)
      if (item === vocabulary.items[0] && answerIndex === 0) {
        const duplicateResponse = await page.request.post(
          `/api/v1/me/course-progress/${course.route.id}/lessons/fi.olla.basics/vocabulary/${item.itemId}/attempts`,
          { data: { answer: item.lemma, idempotencyKey } },
        )
        expect(duplicateResponse.ok()).toBe(true)
        const duplicateResult = (await duplicateResponse.json()) as {
          itemProgress: { correctAnswers: number }
        }
        expect(duplicateResult.itemProgress.correctAnswers).toBe(1)
      }
    }
  }

  await page.goto('/lessons/fi.olla.basics/vocabulary')
  await expect(
    page.getByRole('heading', {
      name: `Все ${vocabulary.items.length} слов изучены`,
    }),
  ).toBeVisible()

  const progressResponse = await page.request.get(
    `/api/v1/me/course-progress/${course.route.id}`,
  )
  expect(progressResponse.ok()).toBe(true)
  const progress = (await progressResponse.json()) as {
    lessons: Array<{
      lessonId: string
      vocabularyCompletedAt: string | null
    }>
  }
  expect(
    progress.lessons.find((lesson) => lesson.lessonId === 'fi.olla.basics')
      ?.vocabularyCompletedAt,
  ).not.toBeNull()
  await expectAccessible(page)
})

test('password recovery keeps account existence private', async ({ page }) => {
  await page.goto('/sign-in')
  await page.getByRole('link', { name: 'Забыли пароль?' }).click()
  await page.getByLabel('Email').fill(`missing-${Date.now()}@example.test`)
  await page.getByRole('button', { name: 'Получить ссылку' }).click()

  await expect(
    page.getByRole('heading', { level: 1, name: 'Проверьте почту' }),
  ).toBeVisible()
  await expect(
    page.getByText(/Если аккаунт с таким email существует/u),
  ).toBeVisible()
  await expectAccessible(page)
})

test('new learner is not sent into an empty review session', async ({
  page,
}) => {
  await signUpLearner(page, 'New vocabulary learner')
  await page.goto('/vocabulary')

  await expect(
    page.getByRole('button', { name: 'Повторений пока нет' }),
  ).toBeDisabled()
})

test('a grammar mistake automatically appears in the grammar section', async ({
  page,
}) => {
  await signUpLearner(page, 'Grammar memory learner')
  const courseResponse = await page.request.get('/api/v1/courses/course.ru-fi')
  const course = (await courseResponse.json()) as { route: { id: string } }
  const routeVersionId = course.route.id

  const sessionResponse = await page.request.put(
    `/api/v1/me/course-progress/${routeVersionId}/lessons/fi.olla.basics/practice-session`,
  )
  expect(sessionResponse.ok()).toBe(true)
  const attemptResponse = await page.request.post(
    '/api/v1/exercises/exercise.fi.olla.negative.001/attempts',
    {
      data: {
        answer: 'xyz',
        idempotencyKey: randomUUID(),
        routeVersionId,
        durationMs: 100,
      },
    },
  )
  expect(attemptResponse.ok()).toBe(true)
  const attempt = (await attemptResponse.json()) as {
    evidence: Array<{ itemId: string; result: string }>
  }
  const failedGrammar = attempt.evidence.find(
    (item) => item.itemId.startsWith('grammar.') && item.result === 'FAILURE',
  )
  expect(failedGrammar).toBeDefined()

  const vocabularyResponse = await page.request.get(
    `/api/v1/me/vocabulary/${routeVersionId}`,
  )
  expect(vocabularyResponse.ok()).toBe(true)
  const vocabulary = (await vocabularyResponse.json()) as {
    grammarItems: Array<{ itemId: string; name: { ru: string } }>
  }
  const grammarItem = vocabulary.grammarItems.find(
    (item) => item.itemId === failedGrammar?.itemId,
  )
  expect(grammarItem).toBeDefined()

  await page.goto('/vocabulary?section=grammar')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Мои знания' }),
  ).toBeVisible()
  await expect(
    page.getByText(grammarItem!.name.ru, { exact: true }),
  ).toBeVisible()
  await expectAccessible(page)
})

test('text catalog has no horizontal overflow on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await signUpLearner(page, 'Mobile reader')
  await page.goto('/texts')

  await expect(
    page.getByRole('heading', { level: 1, name: 'Тексты' }),
  ).toBeVisible()
  await page.getByLabel('Уровень').selectOption('A1')
  await expect(page).toHaveURL(/level=A1/u)
  await page
    .getByRole('link', { name: /Открыть/u })
    .first()
    .click()
  await page.goBack()
  await expect(page.getByLabel('Уровень')).toHaveValue('A1')
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true)
  await expectAccessible(page)
})

async function signUpLearner(page: Page, name: string) {
  await page.goto('/sign-up')
  await page.getByLabel('Имя').fill(name)
  await page
    .getByLabel('Email')
    .fill(
      `e2e-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`,
    )
  await page.getByLabel('Пароль', { exact: true }).fill('e2e-password-2026')
  await page.getByRole('button', { name: 'Создать аккаунт' }).click()
  await expect(page).toHaveURL(/\/lessons\/?$/u)
}

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
