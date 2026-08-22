import { DatabaseClient } from '@language/database'
import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class PrismaService extends DatabaseClient implements OnModuleDestroy {
  constructor(@Inject(ConfigService) config: ConfigService) {
    super(
      config.get<string>(
        'DATABASE_URL',
        'postgresql://language:language@localhost:5432/language',
      ),
    )
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
