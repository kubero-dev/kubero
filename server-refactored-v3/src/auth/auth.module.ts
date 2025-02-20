import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { KubernetesModule } from 'src/kubernetes/kubernetes.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { GithubStrategy } from './github.strategy';
import { AuthController } from './auth.controller';
import { AuditModule } from 'src/audit/audit.module';
import { JwtModule } from '@nestjs/jwt';
import { ENV } from '../config/env/vars';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: ENV?.KUBERO_JWT_SECRET || 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
      signOptions: { 
        expiresIn: ENV?.KUBERO_JWT_EXPIRESIN || '36000s' 
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, GithubStrategy, KubernetesModule, AuditModule],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
