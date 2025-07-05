import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RolesService } from 'src/roles/roles.service';

@Module({
  providers: [TokenService, AuthService, UsersService, JwtService, RolesService],
  controllers: [TokenController],
})
export class TokenModule {}
