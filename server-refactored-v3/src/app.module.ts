import { join } from 'path';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { AppsModule } from './apps/apps.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { VulnerabilitiesModule } from './vulnerabilities/vulnerabilities.module';
import { ConfigModule } from './config/config.module';
import { RepoModule } from './repo/repo.module';
import { SettingsModule } from './settings/settings.module';
import { BannerModule } from './banner/banner.module';
import { TemplatesModule } from './templates/templates.module';
import { MetricsModule } from './metrics/metrics.module';
import { LogsModule } from './logs/logs.module';
import { DeploymentsModule } from './deployments/deployments.module';


@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'dist', 'public'),
    }),
    EventsModule,
    AuthModule,
    CommonModule,
    AppsModule,
    PipelinesModule,
    VulnerabilitiesModule,
    ConfigModule,
    RepoModule,
    SettingsModule,
    BannerModule,
    TemplatesModule,
    MetricsModule,
    LogsModule,
    DeploymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
