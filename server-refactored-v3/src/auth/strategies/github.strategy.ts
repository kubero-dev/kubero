import { Strategy, StrategyOptions, Profile } from 'passport-github2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ENV, extractScope } from '../../config/env/vars';
import { Request } from 'express';
import { AuthenticateOptions } from 'passport';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super(
      {
        clientID: ENV?.GITHUB_CLIENT_ID,
        clientSecret: ENV?.GITHUB_CLIENT_SECRET,
        callbackURL: ENV?.GITHUB_CLIENT_CALLBACKURL,
        scope: extractScope(ENV?.GITHUB_CLIENT_SCOPE),
        userAgent: 'kubero/v3'
      } as StrategyOptions
    );
  }
  async validate(accessToken: string, _refreshToken: string, profile: Profile) {
    //console.log('Github2Strategy.validate', profile, accessToken);
    //console.log('Github2Strategy.validate', accessToken);
    return profile;
  }
  authenticate(req: Request, options?: AuthenticateOptions): void {
    //console.log('Github2Strategy.authenticate', req, options);
    //console.log('Github2Strategy.authenticate');
    super.authenticate(req, options);
  }
}