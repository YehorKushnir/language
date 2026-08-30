import type { WordMemoryStatus } from '@language/contracts'
import { IsEnum } from 'class-validator'

enum WordMemoryStatusDto {
  Learning = 'LEARNING',
  Known = 'KNOWN',
}

export class ChangeWordMemoryStatusDto {
  @IsEnum(WordMemoryStatusDto)
  status!: WordMemoryStatus
}
