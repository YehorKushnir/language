import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export class ClientErrorDto {
  @IsIn(['window_error', 'unhandled_rejection'])
  type!: 'window_error' | 'unhandled_rejection'

  @IsString()
  @MaxLength(500)
  message!: string

  @IsString()
  @MaxLength(300)
  path!: string

  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  stack?: string
}
