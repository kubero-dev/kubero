import { Strategy, StrategyOptions, Profile } from 'passport-github2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticateOptions } from 'passport';
import { ConfigService } from 'src/config/config.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CLIENT_CALLBACKURL,
      scope: ConfigService.getAuthenticationScope(
        process.env.GITHUB_CLIENT_SCOPE,
      ),
      userAgent: 'kubero/v3',
    } as StrategyOptions);
  }
  async validate(accessToken: string, _refreshToken: string, profile: Profile) {
    //console.log('Github2Strategy.validate', profile, accessToken);
    return profile;
  }
  authenticate(req: Request, options?: AuthenticateOptions): void {
    //console.log('Github2Strategy.authenticate', req, options);
    //console.log('Github2Strategy.authenticate');
    super.authenticate(req, options);
  }
}
