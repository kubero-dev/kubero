import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { KubernetesModule } from 'src/kubernetes/kubernetes.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuditModule } from 'src/audit/audit.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
    secret: jwtConstants.secret,
    signOptions: { expiresIn: '3600s' },
  }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, KubernetesModule, AuditModule],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
