import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator'

export class VocabularyAnswerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  answer!: string

  @IsUUID()
  idempotencyKey!: string
}
