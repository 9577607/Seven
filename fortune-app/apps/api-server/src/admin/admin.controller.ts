import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  @Post('auth/login')
  login() {
    return { token: 'admin-jwt-token', refreshToken: 'admin-refresh-token' };
  }

  @Get('dashboard/overview')
  overview() {
    return { newUsers: 12, activeUsers: 89, reports: 233 };
  }

  @Get('users')
  users() {
    return [{ id: 1, nickname: '玄镜用户', status: 'active' }];
  }

  @Patch('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return { id: Number(id), status: body.status };
  }
}
