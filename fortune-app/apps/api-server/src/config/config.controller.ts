import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly service: ConfigService) {}

  @Get('health')
  health() {
    return this.service.getDemo();
  }

  @Post('demo')
  demo(@Body() body: Record<string, unknown>) {
    return { ...this.service.getDemo(), body };
  }
}
