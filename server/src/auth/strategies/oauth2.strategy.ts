import { Strategy, StrategyOptions } from 'passport-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticateOptions } from 'passport';
import { ConfigService } from '../../config/config.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class Oauth2Strategy extends PassportStrategy(Strategy) {
  constructor() {
    const logger = new Logger(Oauth2Strategy.name);

    if (!process.env.OAUTH2_CLIENT_AUTH_URL) {
      logger.error(
        'OAUTH2_CLIENT_AUTH_URL is not defined in the environment variables',
      );
      return;
    }
    if (!process.env.OAUTH2_CLIENT_TOKEN_URL) {
      logger.error(
        'OAUTH2_CLIENT_TOKEN_URL is not defined in the environment variables',
      );
      return;
    }
    if (!process.env.OAUTH2_CLIENT_ID) {
      logger.error(
        'OAUTH2_CLIENT_ID is not defined in the environment variables',
      );
      return;
    }
    if (!process.env.OAUTH2_CLIENT_SECRET) {
      logger.error(
        'OAUTH2_CLIENT_SECRET is not defined in the environment variables',
      );
      return;
    }
    if (!process.env.OAUTH2_CLIENT_CALLBACKURL) {
      logger.error(
        'OAUTH2_CLIENT_CALLBACKURL is not defined in the environment variables',
      );
      return;
    }

    super({
      authorizationURL: process.env.OAUTH2_CLIENT_AUTH_URL,
      tokenURL: process.env.OAUTH2_CLIENT_TOKEN_URL,
      clientID: process.env.OAUTH2_CLIENT_ID,
      clientSecret: process.env.OAUTH2_CLIENT_SECRET,
      callbackURL: process.env.OAUTH2_CLIENT_CALLBACKURL,
      customHeaders: { 'User-Agent': 'kubero/v3' },
      scope: ConfigService.getAuthenticationScope(
        process.env.OAUTH2_CLIENT_SCOPE,
      ),
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
