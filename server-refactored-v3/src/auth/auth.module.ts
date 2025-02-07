import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { KubernetesModule } from 'src/kubernetes/kubernetes.module';
import { SettingsService } from '../settings/settings.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { AuditService } from 'src/audit/audit.service';
import { SettingsModule } from 'src/settings/settings.module';

@Module({
  imports: [UsersModule, PassportModule ],
  providers: [AuthService, LocalStrategy, KubernetesModule, AuditService, SettingsService],
  controllers: [AuthController],
})
export class AuthModule {}