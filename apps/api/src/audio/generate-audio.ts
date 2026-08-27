import { NestFactory } from '@nestjs/core'

import { AppModule } from '../app.module'
import {
  AudioBatchGenerationService,
  type AudioBatchCounters,
} from './audio-generation.service'

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  })
  try {
    const options = parseOptions(process.argv.slice(2))
    const generation = app.get(AudioBatchGenerationService)
    if (options.scope === 'words') {
      const words = await generation.generateWords(options.limit)
      printCounters('Words', words)
      if (words.failed > 0) process.exitCode = 1
      return
    }
    if (options.scope === 'sentences') {
      const sentences = await generation.generateSentences(options.limit)
      printCounters('Sentences', sentences)
      if (sentences.failed > 0) process.exitCode = 1
      return
    }
    if (options.scope === 'texts') {
      const texts = await generation.generateTexts(options.limit)
      printCounters('Texts', texts)
      if (texts.failed > 0) process.exitCode = 1
      return
    }
    const summary = await generation.generateAll()
    printCounters('Words', summary.words)
    printCounters('Sentences', summary.sentences)
    printCounters('Texts', summary.texts)
    const failed =
      summary.words.failed + summary.sentences.failed + summary.texts.failed
    if (failed > 0) process.exitCode = 1
  } finally {
    await app.close()
  }
}

function parseOptions(arguments_: string[]): {
  scope: 'all' | 'words' | 'sentences' | 'texts'
  limit?: number
} {
  let scope: 'all' | 'words' | 'sentences' | 'texts' = 'all'
  let limit: number | undefined
  const normalizedArguments: string[] = []
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index]
    if (!argument) continue
    if (argument === '--scope' || argument === '--limit') {
      const value = arguments_[index + 1]
      if (!value) throw new Error(`${argument} requires a value`)
      normalizedArguments.push(`${argument}=${value}`)
      index += 1
    } else {
      normalizedArguments.push(argument)
    }
  }
  for (const argument of normalizedArguments) {
    if (argument === '--') {
      continue
    } else if (argument.startsWith('--scope=')) {
      const value = argument.slice('--scope='.length)
      if (
        value !== 'all' &&
        value !== 'words' &&
        value !== 'sentences' &&
        value !== 'texts'
      ) {
        throw new Error('--scope must be all, words, sentences or texts')
      }
      scope = value
    } else if (argument.startsWith('--limit=')) {
      limit = Number(argument.slice('--limit='.length))
      if (!Number.isInteger(limit) || limit < 1) {
        throw new Error('--limit must be a positive integer')
      }
    } else {
      throw new Error(`Unknown audio generation option: ${argument}`)
    }
  }
  if (scope === 'all' && limit !== undefined) {
    throw new Error('--limit requires a specific generation scope')
  }
  return { scope, limit }
}

function printCounters(label: string, counters: AudioBatchCounters): void {
  process.stdout.write(
    `${label}:\n${counters.generated} generated\n${counters.cached} cached\n${counters.failed} failed\n\n`,
  )
}

void main().catch((error: unknown) => {
  process.stderr.write(
    `Audio generation failed: ${error instanceof Error ? error.stack : String(error)}\n`,
  )
  process.exitCode = 1
})
