import { IsEnum, IsOptional } from 'class-validator'

enum ExerciseReportStatusDto {
  New = 'NEW',
  InProgress = 'IN_PROGRESS',
  Fixed = 'FIXED',
  Dismissed = 'DISMISSED',
}

export class AdminReportFilterDto {
  @IsOptional()
  @IsEnum(ExerciseReportStatusDto)
  status?: ExerciseReportStatusDto
}

export class UpdateAdminReportDto {
  @IsEnum(ExerciseReportStatusDto)
  status!: ExerciseReportStatusDto
}
