import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  getDemo() {
    return { module: 'user', ok: true };
  }
}
