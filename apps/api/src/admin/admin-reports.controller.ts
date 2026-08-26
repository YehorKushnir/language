import type {
  AdminExerciseReportExportResponse,
  AdminExerciseReportListResponse,
  AdminExerciseReportResponse,
  ExerciseReportStatus,
} from '@language/contracts'
import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import type { Response } from 'express'

import { SessionIdentityGuard } from '../identity/session-identity.guard'
import { AdminReportFilterDto, UpdateAdminReportDto } from './admin-report.dto'
import { AdminRoleGuard } from './admin-role.guard'
import { AdminReportsService } from './admin-reports.service'

@ApiTags('admin')
@UseGuards(SessionIdentityGuard, AdminRoleGuard)
@Controller('admin/reports')
export class AdminReportsController {
  constructor(private readonly reports: AdminReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить жалобы пользователей' })
  @ApiOkResponse({ description: 'Список жалоб и количество по статусам' })
  @ApiForbiddenResponse({ description: 'Требуется роль администратора' })
  listReports(
    @Query() query: AdminReportFilterDto,
  ): Promise<AdminExerciseReportListResponse> {
    return this.reports.listReports(query.status as ExerciseReportStatus)
  }

  @Get('export')
  @Header('Content-Type', 'application/json; charset=utf-8')
  @ApiOperation({ summary: 'Экспортировать отфильтрованные жалобы в JSON' })
  @ApiOkResponse({ description: 'JSON-выгрузка с применённым фильтром' })
  exportReports(
    @Query() query: AdminReportFilterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AdminExerciseReportExportResponse> {
    const suffix = query.status?.toLowerCase() ?? 'all'
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="exercise-reports-${suffix}.json"`,
    )
    return this.reports.exportReports(query.status as ExerciseReportStatus)
  }

  @Patch(':reportId')
  @ApiOperation({ summary: 'Изменить статус жалобы' })
  @ApiOkResponse({ description: 'Жалоба с обновлённым статусом' })
  updateStatus(
    @Param('reportId') reportId: string,
    @Body() update: UpdateAdminReportDto,
  ): Promise<AdminExerciseReportResponse> {
    return this.reports.updateStatus(
      reportId,
      update.status as ExerciseReportStatus,
    )
  }
}
