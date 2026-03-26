import { Module } from '@nestjs/common';
import { CompatController } from './compat.controller';
import { CompatService } from './compat.service';

@Module({
  controllers: [CompatController],
  providers: [CompatService],
  exports: [CompatService],
})
export class CompatModule {}
