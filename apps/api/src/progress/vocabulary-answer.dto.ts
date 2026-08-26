import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator'

export class VocabularyAnswerDto {
  @IsString()
  @MaxLength(100)
  answer!: string

  @IsUUID()
  idempotencyKey!: string

  @IsOptional()
  @IsBoolean()
  gaveUp?: boolean
}
