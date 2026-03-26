import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ContentModule } from './content/content.module';
import { FortuneModule } from './fortune/fortune.module';
import { TarotModule } from './tarot/tarot.module';
import { CompatModule } from './compat/compat.module';
import { ReportModule } from './report/report.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ConfigModule } from './config/config.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ContentModule,
    FortuneModule,
    TarotModule,
    CompatModule,
    ReportModule,
    FeedbackModule,
    ConfigModule,
    AdminModule,
  ],
})
export class AppModule {}
