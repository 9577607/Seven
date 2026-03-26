import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentService {
  getDemo() {
    return { module: 'content', ok: true };
  }
}
