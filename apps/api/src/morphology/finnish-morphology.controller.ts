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
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'

import { SessionIdentityGuard } from '../identity/session-identity.guard'
import { FinnishMorphologyService } from './finnish-morphology.service'
import { FinnishTextDto, FinnishWordDto } from './morphology.dto'

@ApiTags('finnish-morphology')
@UseGuards(SessionIdentityGuard)
@Throttle({ default: { limit: 30, ttl: 60_000 } })
@Controller('language/fi')
export class FinnishMorphologyController {
  constructor(
    @Inject(FinnishMorphologyService)
    private readonly morphology: FinnishMorphologyService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Проверить готовность морфологии финского языка' })
  @ApiOkResponse({ description: 'Движок и словарь загружены' })
  getStatus(): Promise<FinnishMorphologyEngineResponse> {
    return this.morphology.getInfo()
  }

  @Post('analyze-word')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получить все морфологические разборы слова' })
  @ApiOkResponse({ description: 'Леммы, части речи и признаки формы' })
  @ApiBadRequestResponse({ description: 'Недопустимое слово' })
  analyzeWord(
    @Body() body: FinnishWordDto,
  ): Promise<FinnishAnalyzeWordResponse> {
    return this.morphology.analyzeWord(body.word)
  }

  @Post('analyze-text')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Токенизировать и разобрать финский текст' })
  @ApiOkResponse({ description: 'Токены, диапазоны и все варианты разбора' })
  @ApiBadRequestResponse({ description: 'Недопустимый текст' })
  analyzeText(
    @Body() body: FinnishTextDto,
  ): Promise<FinnishAnalyzeTextResponse> {
    return this.morphology.analyzeText(body.text)
  }

  @Post('spell')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Проверить написание финского слова' })
  @ApiOkResponse({ description: 'Результат и варианты исправления' })
  checkSpelling(
    @Body() body: FinnishWordDto,
  ): Promise<FinnishSpellingResponse> {
    return this.morphology.checkSpelling(body.word)
  }

  @Post('grammar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Проверить текст встроенными правилами Voikko' })
  @ApiOkResponse({ description: 'Диапазоны ошибок и исправления' })
  checkGrammar(@Body() body: FinnishTextDto): Promise<FinnishGrammarResponse> {
    return this.morphology.checkGrammar(body.text)
  }

  @Post('sentences')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Разбить финский текст на предложения' })
  @ApiOkResponse({ description: 'Предложения и точные диапазоны символов' })
  splitSentences(
    @Body() body: FinnishTextDto,
  ): Promise<FinnishSentencesResponse> {
    return this.morphology.splitSentences(body.text)
  }

  @Post('hyphenate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Расставить переносы в финском слове' })
  @ApiOkResponse({ description: 'Слово с границами допустимых переносов' })
  hyphenate(@Body() body: FinnishWordDto): Promise<FinnishHyphenationResponse> {
    return this.morphology.hyphenate(body.word)
  }
}
