import { Body, Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('mp/login')
  mpLogin(@Body() body: { code: string; nickname?: string; avatarUrl?: string }) {
    return {
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      userInfo: { id: 1, nickname: body.nickname || '微信用户', avatarUrl: body.avatarUrl || '' },
    };
  }

  @Post('refresh')
  refresh() {
    return { token: 'mock-jwt-token-new' };
  }
}
