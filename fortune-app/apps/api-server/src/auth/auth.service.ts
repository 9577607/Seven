import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  getDemo() {
    return { module: 'auth', ok: true };
  }
}
