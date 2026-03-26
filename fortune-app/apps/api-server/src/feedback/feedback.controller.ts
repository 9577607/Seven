import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('feedbacks')
export class FeedbackController {
  @Post()
  create(@Body() body: Record<string, unknown>) {
    return { id: 1, status: 'pending', ...body };
  }

  @Get('my')
  my() {
    return [{ id: 1, status: 'pending', content: '页面很好看' }];
  }
}
