import { Controller, Post } from '@nestjs/common';

@Controller('compat')
export class CompatController {
  @Post('generate')
  generate() {
    return {
      reportId: 1004,
      score: 84,
      metrics: { communication: 80, emotion: 88, rhythm: 76 },
      suggestions: ['多做清晰表达', '减少预设立场'],
      disclaimer: '本内容仅供娱乐与参考，请理性看待。',
    };
  }
}
