import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Kubectl } from '../kubernetes/kubernetes.service';
import { UsersModule } from '../users/users.module';
import { SettingsService } from '../settings/settings.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [UsersModule, PassportModule],
  providers: [AuthService, LocalStrategy, Kubectl, SettingsService],
  controllers: [AuthController],
})
export class AuthModule {}