import { Module } from '@nestjs/common'

import { AdminReportsController } from './admin-reports.controller'
import { AdminRoleGuard } from './admin-role.guard'
import { AdminReportsService } from './admin-reports.service'

@Module({
  controllers: [AdminReportsController],
  providers: [AdminRoleGuard, AdminReportsService],
})
export class AdminModule {}
