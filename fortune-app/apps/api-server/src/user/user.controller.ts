import { Body, Controller, Get, Put } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Get('profile')
  profile() {
    return { id: 1, nickname: '玄镜用户', birthday: '1998-02-24' };
  }

  @Put('profile')
  update(@Body() body: Record<string, unknown>) {
    return { updated: true, ...body };
  }
}
