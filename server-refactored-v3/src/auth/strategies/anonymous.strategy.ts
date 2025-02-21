import { Strategy } from 'passport-anonymous';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
export const ENV = dotenv.config()

@Injectable()
export class AnonymousStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }

  async validate() {
    let u = { userId: 'anonymous', username: 'anonymous' };
    return u;
  }

  async authenticate(req: any, options: any) {
    if (!process.env.KUBERO_USERS && !process.env.GITHUB_CLIENT_SECRET && !process.env.OAUTH2_CLIENT_SECRET) {
      return false
    }
    return super.authenticate(req, options);
  }
}