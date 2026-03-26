import { Injectable } from '@nestjs/common';

@Injectable()
export class TarotService {
  getDemo() {
    return { module: 'tarot', ok: true };
  }
}
