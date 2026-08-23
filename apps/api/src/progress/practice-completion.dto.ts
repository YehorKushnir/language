import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class PracticeCompletionDto {
  @IsArray()
  @ArrayMinSize(60)
  @ArrayMaxSize(60)
  @ArrayUnique()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(100, { each: true })
  attemptIds!: string[]
}
