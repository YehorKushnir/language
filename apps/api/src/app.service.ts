import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'Language Learning API',
      version: '1',
    } as const
  }
}
