import { Strategy, StrategyOptions } from 'passport-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ENV, extractScope } from '../../config/env/vars';
import { Request } from 'express';
import { AuthenticateOptions } from 'passport';

@Injectable()
export class Oauth2Strategy extends PassportStrategy(Strategy) {
  constructor() {
    const logger = new Logger(Oauth2Strategy.name);

    if (!ENV?.OAUTO2_CLIENT_AUTH_URL) {
      logger.error(
        'OAUTO2_CLIENT_AUTH_URL is not defined in the environment variables',
      );
      return;
    }
    if (!ENV?.OAUTO2_CLIENT_TOKEN_URL) {
      logger.error(
        'OAUTO2_CLIENT_TOKEN_URL is not defined in the environment variables',
      );
      return;
    }
    if (!ENV?.OAUTH2_CLIENT_ID) {
      logger.error(
        'OAUTH2_CLIENT_ID is not defined in the environment variables',
      );
      return;
    }
    if (!ENV?.OAUTH2_CLIENT_SECRET) {
      logger.error(
        'OAUTH2_CLIENT_SECRET is not defined in the environment variables',
      );
      return;
    }
    if (!ENV?.OAUTH2_CLIENT_CALLBACKURL) {
      logger.error(
        'OAUTH2_CLIENT_CALLBACKURL is not defined in the environment variables',
      );
      return;
    }

    super({
      authorizationURL: ENV?.OAUTO2_CLIENT_AUTH_URL,
      tokenURL: ENV?.OAUTO2_CLIENT_TOKEN_URL,
      clientID: ENV?.OAUTH2_CLIENT_ID,
      clientSecret: ENV?.OAUTH2_CLIENT_SECRET,
      callbackURL: ENV?.OAUTH2_CLIENT_CALLBACKURL,
      customHeaders: { 'User-Agent': 'kubero/v3' },
      scope: extractScope(ENV?.OAUTH2_CLIENT_SCOPE),
    } as StrategyOptions);
  }
  async validate(accessToken: string, _refreshToken: string, profile: any) {
    //TODO: replace 'any' with 'Profile'
    console.log('Github2Strategy.validate', profile, accessToken);
    //console.log('Github2Strategy.validate', accessToken);
    return profile;
  }
  authenticate(req: Request, options?: AuthenticateOptions): void {
    //console.log('Github2Strategy.authenticate', req, options);
    //console.log('Github2Strategy.authenticate');
    super.authenticate(req, options);
  }
}
