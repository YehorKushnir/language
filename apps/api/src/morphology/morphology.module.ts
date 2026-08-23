import { Global, Module } from '@nestjs/common'

import { FinnishMorphologyController } from './finnish-morphology.controller'
import { FinnishMorphologyService } from './finnish-morphology.service'

@Global()
@Module({
  controllers: [FinnishMorphologyController],
  providers: [FinnishMorphologyService],
  exports: [FinnishMorphologyService],
})
export class MorphologyModule {}
