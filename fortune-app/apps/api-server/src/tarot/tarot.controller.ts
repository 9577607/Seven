import { Body, Controller, Post } from '@nestjs/common';

@Controller('tarot')
export class TarotController {
  @Post('generate')
  generate(@Body() body: { spreadType?: string }) {
    return {
      reportId: 1003,
      cards: [{ name: 'The Fool', position: 'past', orientation: 'upright' }],
      sections: [
        {
          title: body.spreadType === 'three-card' ? '过去-现在-未来' : '单牌建议',
          content: '行动前先明确边界。',
        },
      ],
      score: 75,
      disclaimer: '本内容仅供娱乐与参考，请理性看待。',
    };
  }
}
