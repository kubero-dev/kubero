import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { KubernetesModule } from 'src/kubernetes/kubernetes.module';
import { SettingsService } from '../settings/settings.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [UsersModule, PassportModule ],
  providers: [AuthService, LocalStrategy, KubernetesModule, AuditModule, SettingsService],
  controllers: [AuthController],
})
export class AuthModule {}