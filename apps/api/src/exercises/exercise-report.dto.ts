import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

enum ExerciseReportReasonDto {
  WrongPrompt = 'WRONG_PROMPT',
  WrongAnswer = 'WRONG_ANSWER',
  UnnaturalLanguage = 'UNNATURAL_LANGUAGE',
  TechnicalProblem = 'TECHNICAL_PROBLEM',
  Other = 'OTHER',
}

export class ExerciseReportDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  attemptId!: string

  @IsEnum(ExerciseReportReasonDto)
  reason!: ExerciseReportReasonDto

  @IsOptional()
  @IsString()
  @MaxLength(1_000)
  comment?: string
}
