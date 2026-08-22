import { IsEnum } from 'class-validator'

enum VocabularyStudyResultDto {
  Success = 'SUCCESS',
  Failure = 'FAILURE',
}

export class VocabularyStudyDto {
  @IsEnum(VocabularyStudyResultDto)
  result!: VocabularyStudyResultDto
}
