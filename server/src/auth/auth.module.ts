import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { KubernetesModule } from '../kubernetes/kubernetes.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { Oauth2Strategy } from './strategies/oauth2.strategy';
import { AuthController } from './auth.controller';
import { AuditModule } from '../audit/audit.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import * as dotenv from 'dotenv';
import { RolesService } from 'src/roles/roles.service';
dotenv.config();

const providers = [AuthService, JwtStrategy, KubernetesModule, AuditModule, RolesService];
if (ConfigService.getOauth2Enabled()) {
  providers.push(Oauth2Strategy);
}
if (ConfigService.getGithubEnabled()) {
  providers.push(GithubStrategy);
}

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRESIN || '36000s',
      },
    }),
  ],
  providers: providers,
  controllers: [AuthController],
  exports: [AuthService, JwtModule, UsersModule],
})
export class AuthModule {}
