import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  getDemo() {
    return { module: 'config', ok: true };
  }
}
