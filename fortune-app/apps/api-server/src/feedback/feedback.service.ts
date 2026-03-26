import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedbackService {
  getDemo() {
    return { module: 'feedback', ok: true };
  }
}
