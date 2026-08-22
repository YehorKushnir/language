import { Type } from 'class-transformer'
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export class ExerciseAttemptDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  answer!: string

  @IsUUID()
  idempotencyKey!: string

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  routeVersionId!: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3_600_000)
  durationMs?: number
}
