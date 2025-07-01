import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [TokenService, AuthService, UsersService, JwtService],
  controllers: [TokenController],
})
export class TokenModule {}
