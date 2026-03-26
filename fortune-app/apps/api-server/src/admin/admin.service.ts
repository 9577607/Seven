import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getDemo() {
    return { module: 'admin', ok: true };
  }
}
