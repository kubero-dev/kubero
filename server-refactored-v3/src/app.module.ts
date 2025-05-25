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
import { ConfigModule } from './config/config.module';
import { MetricsModule } from './metrics/metrics.module';
import { LogsModule } from './logs/logs.module';
import { DeploymentsModule } from './deployments/deployments.module';
import { KubernetesModule } from './kubernetes/kubernetes.module';
import { AuditModule } from './audit/audit.module';
import { AddonsModule } from './addons/addons.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SecurityModule } from './security/security.module';
import { TemplatesController } from './templates/templates.controller';
import { TemplatesService } from './templates/templates.service';
import { StatusModule } from './status/status.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'public'),
    }),
    EventsModule,
    AuthModule,
    AppsModule,
    PipelinesModule,
    RepoModule,
    ConfigModule,
    MetricsModule,
    LogsModule,
    DeploymentsModule,
    KubernetesModule,
    AuditModule,
    AddonsModule,
    NotificationsModule,
    SecurityModule,
    StatusModule,
  ],
  controllers: [AppController, TemplatesController],
  providers: [AppService, TemplatesService],
})
export class AppModule {}
