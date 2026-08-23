import { Equals, IsString } from 'class-validator'

export class DeleteAccountDto {
  @IsString()
  @Equals('УДАЛИТЬ')
  confirmation!: string
}
