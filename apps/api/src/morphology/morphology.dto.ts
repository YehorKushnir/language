import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class FinnishWordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  @Matches(/^\S+$/u, { message: 'word must contain exactly one token' })
  word!: string
}

export class FinnishTextDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20_000)
  text!: string
}
