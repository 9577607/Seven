import { Controller, Get, Param } from '@nestjs/common';

@Controller('content')
export class ContentController {
  @Get('banners')
  banners() {
    return [{ id: 1, title: '春季运势活动', imageUrl: '/banner-1.png' }];
  }

  @Get('notices')
  notices() {
    return [{ id: 1, title: '系统公告', summary: '欢迎使用玄镜运势' }];
  }

  @Get('notices/:id')
  noticeDetail(@Param('id') id: string) {
    return { id: Number(id), title: '系统公告', content: '本内容仅供娱乐与参考，请理性看待。' };
  }
}
