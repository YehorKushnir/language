import { mkdir, writeFile } from 'node:fs/promises'

import { lessonExercises } from '../../content/courses/ru-fi/lessons/fi.olla.basics.js'
import {
  presentCommonExercises,
  presentCommonVocabulary,
} from '../../content/courses/ru-fi/lessons/fi.present.common.js'

const contextSourceByLemma: Record<string, string> = {
  puhua: 'по-фински',
  asua: 'в Хельсинки',
  kysyä: 'совета',
  sanoa: '«привет»',
  kertoa: 'историю',
  lukea: 'книгу',
  kirjoittaa: 'сообщение',
  katsoa: 'телевизор',
  oppia: 'финский язык',
  opettaa: 'финский язык',
  ymmärtää: 'вопрос',
  muistaa: 'имя',
  unohtaa: 'адрес',
  auttaa: 'другу',
  odottaa: 'автобус',
  ottaa: 'кофе',
  antaa: 'ответ',
  löytää: 'ключ',
  käyttää: 'телефон',
  maksaa: 'счёт',
  ostaa: 'билет',
  sulkea: 'дверь',
  selittää: 'ситуацию',
  näyttää: 'фотографию',
  tarkistaa: 'адрес',
  hoitaa: 'этим делом',
}

interface DraftSentence {
  order: number
  id: string
  prompt: string
  targetText: string
  acceptedVariants: string[]
}

const vocabularyByItemId = new Map(
  presentCommonVocabulary.map((item) => [item.itemId, item]),
)

const firstLesson: DraftSentence[] = lessonExercises.map((exercise) => ({
  order: exercise.selectionOrder,
  id: exercise.id,
  prompt: exercise.prompt,
  targetText: exercise.targetText,
  acceptedVariants: [...exercise.acceptedVariants],
}))

const secondLesson: DraftSentence[] = presentCommonExercises.map((exercise) => {
  const vocabulary = vocabularyByItemId.get(exercise.vocabularyItemId)
  const subjectSlot = exercise.slots.find((slot) => slot.role === 'subject')
  const verbSlot = exercise.slots.find((slot) => slot.role === 'mainVerb')
  if (!vocabulary || !subjectSlot || !verbSlot) {
    throw new Error(`Incomplete exercise ${exercise.id}`)
  }

  const subject = subjectSlot.accepted[0]!
  const verb = verbSlot.accepted[0]!
  const context =
    vocabulary.lemma === 'asua'
      ? 'täällä'
      : vocabulary.lemma === 'sanoa'
        ? 'hei'
        : null
  const predicate = [verb, context].filter(Boolean).join(' ')
  const targetText = `${capitalize(subject)} ${predicate}.`
  const acceptedVariants = subjectSlot.optional
    ? [targetText, `${capitalize(predicate)}.`]
    : [targetText]

  return {
    order: exercise.selectionOrder,
    id: exercise.id,
    prompt: createPrompt(exercise.prompt, vocabulary.lemma),
    targetText,
    acceptedVariants,
  }
})

function createPrompt(currentPrompt: string, lemma: string) {
  const sourceContext = contextSourceByLemma[lemma]
  if (!sourceContext) throw new Error(`Missing source context for ${lemma}`)

  let prompt = currentPrompt.replace(` ${sourceContext}.`, '.')
  prompt = prompt
    .replace(/^Ты сейчас /u, 'Ты ')
    .replace(/^Сейчас мы /u, 'Мы ')
    .replace(/^Они сейчас /u, 'Они ')

  if (lemma === 'asua') return prompt.replace(/\.$/u, ' здесь.')
  if (lemma === 'sanoa') return currentPrompt.replace(' сейчас ', ' ')
  if (lemma === 'oppia') {
    return prompt
      .replace(/^Я учу\.$/u, 'Я учусь.')
      .replace(/^Он или она учит\.$/u, 'Он или она учится.')
      .replace(/^Они учат\.$/u, 'Они учатся.')
  }
  return prompt
}

function capitalize(value: string) {
  return `${value.charAt(0).toLocaleUpperCase('fi')}${value.slice(1)}`
}

async function main() {
  if (firstLesson.length !== 60 || secondLesson.length !== 60) {
    throw new Error(
      `Expected 60 sentences per lesson, received ${firstLesson.length} and ${secondLesson.length}`,
    )
  }

  const output = [{ '1': firstLesson }, { '2': secondLesson }]
  await mkdir('content/courses/ru-fi', { recursive: true })
  await writeFile(
    'content/courses/ru-fi/lesson-sentences.review.json',
    `${JSON.stringify(output, null, 2)}\n`,
    'utf8',
  )
}

void main()
