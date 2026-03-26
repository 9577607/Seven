import { Injectable } from '@nestjs/common';

@Injectable()
export class CompatService {
  getDemo() {
    return { module: 'compat', ok: true };
  }
}
