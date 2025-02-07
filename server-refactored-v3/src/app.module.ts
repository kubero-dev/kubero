import { join } from 'path';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import { AppsModule } from './apps/apps.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { VulnerabilitiesModule } from './vulnerabilities/vulnerabilities.module';
import { ConfigModule } from './config/config.module';
import { RepoModule } from './repo/repo.module';
import { SettingsModule } from './settings/settings.module';
import { TemplatesModule } from './templates/templates.module';
import { MetricsModule } from './metrics/metrics.module';
import { LogsModule } from './logs/logs.module';
import { DeploymentsModule } from './deployments/deployments.module';
import { CoreModule } from './core/core.module';
import { KubernetesModule } from './kubernetes/kubernetes.module';


@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'dist', 'public'),
    }),
    CoreModule,
    EventsModule,
    AuthModule,
    AppsModule,
    PipelinesModule,
    VulnerabilitiesModule,
    ConfigModule,
    RepoModule,
    SettingsModule,
    TemplatesModule,
    MetricsModule,
    LogsModule,
    DeploymentsModule,
    KubernetesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
