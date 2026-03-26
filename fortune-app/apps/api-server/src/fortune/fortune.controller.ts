import { Body, Controller, Post } from '@nestjs/common';

@Controller('fortune')
export class FortuneController {
  @Post('today/generate')
  today(@Body() body: { birthday?: string }) {
    return {
      reportId: 1001,
      score: 82,
      loveScore: 78,
      careerScore: 86,
      wealthScore: 73,
      luckyColor: '深蓝',
      luckyNumber: 7,
      dos: ['整理桌面', '主动沟通'],
      donts: ['情绪化表达'],
      advice: `生日${body.birthday || '未知'}，建议稳中求进。`,
      disclaimer: '本内容仅供娱乐与参考，请理性看待。',
    };
  }

  @Post('bazi/generate')
  bazi() {
    return {
      reportId: 1002,
      title: '八字简批报告',
      tags: ['感知敏锐', '行动果断', '情绪内收'],
      sections: [{ title: '性格画像', content: '你更容易先观察，再决定是否出手。' }],
      score: 79,
      disclaimer: '本内容仅供娱乐与参考，请理性看待。',
    };
  }
}
