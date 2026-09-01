import { IsString, MaxLength, MinLength } from 'class-validator'

export class SetAccountPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string
}
