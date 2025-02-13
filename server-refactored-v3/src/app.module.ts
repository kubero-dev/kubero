import { join } from 'path';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import { AppsModule } from './apps/apps.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { RepoModule } from './repo/repo.module';
import { SettingsModule } from './settings/settings.module';
import { MetricsModule } from './metrics/metrics.module';
import { LogsModule } from './logs/logs.module';
import { DeploymentsModule } from './deployments/deployments.module';
import { CoreModule } from './core/core.module';
import { KubernetesModule } from './kubernetes/kubernetes.module';
import { AuditModule } from './audit/audit.module';
import { AddonsModule } from './addons/addons.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SecurityModule } from './security/security.module';
import { TemplatesController } from './templates/templates.controller';
import { TemplatesService } from './templates/templates.service';

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
    RepoModule,
    SettingsModule,
    MetricsModule,
    LogsModule,
    DeploymentsModule,
    KubernetesModule,
    AuditModule,
    AddonsModule,
    NotificationsModule,
    SecurityModule,
  ],
  controllers: [AppController, TemplatesController],
  providers: [AppService, TemplatesService],
})
export class AppModule {}
