import type {
  FinnishAnalyzeTextResponse,
  FinnishAnalyzeWordResponse,
  FinnishGrammarResponse,
  FinnishHyphenationResponse,
  FinnishMorphologyEngineResponse,
  FinnishSpellingResponse,
  FinnishSentencesResponse,
} from '@language/contracts'
import {
  FinnishMorphologyInputError,
  VoikkoFinnishMorphologyAnalyzer,
  type FinnishFormComparison,
} from '@language/language-fi'
import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'

@Injectable()
export class FinnishMorphologyService implements OnModuleInit, OnModuleDestroy {
  private analyzer?: VoikkoFinnishMorphologyAnalyzer

  async onModuleInit() {
    this.analyzer = await VoikkoFinnishMorphologyAnalyzer.create()
  }

  onModuleDestroy() {
    this.analyzer?.close()
    this.analyzer = undefined
  }

  async getInfo(): Promise<FinnishMorphologyEngineResponse> {
    return this.getAnalyzer().getInfo()
  }

  async analyzeWord(word: string): Promise<FinnishAnalyzeWordResponse> {
    return this.withInputErrors(async () => {
      const normalized = word.normalize('NFC').trim()
      const analyses = await this.getAnalyzer().analyzeWord(normalized)
      return { word: normalized, isKnown: analyses.length > 0, analyses }
    })
  }

  async analyzeText(text: string): Promise<FinnishAnalyzeTextResponse> {
    return this.withInputErrors(async () => {
      const normalized = text.normalize('NFC')
      return {
        text: normalized,
        tokens: await this.getAnalyzer().analyzeText(normalized),
      }
    })
  }

  async compareForms(
    actual: string,
    expected: string[],
  ): Promise<FinnishFormComparison> {
    return this.withInputErrors(() =>
      this.getAnalyzer().compareForms(actual, expected),
    )
  }

  async checkSpelling(word: string): Promise<FinnishSpellingResponse> {
    return this.withInputErrors(() => this.getAnalyzer().checkSpelling(word))
  }

  async checkGrammar(text: string): Promise<FinnishGrammarResponse> {
    return this.withInputErrors(async () => ({
      text: text.normalize('NFC'),
      errors: await this.getAnalyzer().checkGrammar(text),
    }))
  }

  async splitSentences(text: string): Promise<FinnishSentencesResponse> {
    return this.withInputErrors(async () => ({
      text: text.normalize('NFC'),
      sentences: await this.getAnalyzer().splitSentences(text),
    }))
  }

  async hyphenate(word: string): Promise<FinnishHyphenationResponse> {
    return this.withInputErrors(async () => ({
      word: word.normalize('NFC').trim(),
      hyphenated: await this.getAnalyzer().hyphenate(word),
    }))
  }

  private getAnalyzer(): VoikkoFinnishMorphologyAnalyzer {
    if (!this.analyzer) {
      throw new Error('Finnish morphology engine is not initialized')
    }
    return this.analyzer
  }

  private async withInputErrors<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof FinnishMorphologyInputError) {
        throw new BadRequestException(error.message)
      }
      throw error
    }
  }
}
