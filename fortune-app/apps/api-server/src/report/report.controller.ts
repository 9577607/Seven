import { Controller, Delete, Get, Param, Post } from '@nestjs/common';

@Controller('reports')
export class ReportController {
  @Get()
  list() {
    return [{ id: 1001, reportType: 'today', title: '今日运势' }];
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return { id: Number(id), title: '报告详情', disclaimer: '本内容仅供娱乐与参考，请理性看待。' };
  }

  @Post(':id/favorite')
  favorite(@Param('id') id: string) {
    return { reportId: Number(id), isFavorite: true };
  }

  @Delete(':id/favorite')
  unfavorite(@Param('id') id: string) {
    return { reportId: Number(id), isFavorite: false };
  }

  @Get(':id/poster-config')
  posterConfig(@Param('id') id: string) {
    return { reportId: Number(id), title: '玄镜运势海报', qrCode: '/qrcode.png' };
  }

  @Post(':id/share-log')
  shareLog(@Param('id') id: string) {
    return { reportId: Number(id), logged: true };
  }
}
