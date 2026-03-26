import { Injectable } from '@nestjs/common';

@Injectable()
export class FortuneService {
  getDemo() {
    return { module: 'fortune', ok: true };
  }
}
