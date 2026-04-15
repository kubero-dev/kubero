import { Strategy, StrategyOptions } from 'passport-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import * as dotenv from 'dotenv';
dotenv.config();

export interface UserProfile {
  id: string | number;
  username: string;
  displayName: string;
  email?: string;
  emails: Array<{ value: string }>;
  photos: Array<{ value: string }>;
  provider: string;
  _raw: string;
  _json: Record<string, unknown>;
}

const REQUIRED_ENV_VARS = [
  'OAUTH2_CLIENT_AUTH_URL',
  'OAUTH2_CLIENT_TOKEN_URL',
  'OAUTH2_CLIENT_ID',
  'OAUTH2_CLIENT_SECRET',
  'OAUTH2_CLIENT_CALLBACKURL',
] as const;

@Injectable()
export class Oauth2Strategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(Oauth2Strategy.name);

  constructor() {
    const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
    if (missingVars.length > 0) {
      const logger = new Logger(Oauth2Strategy.name);
      logger.error(
        `Missing required environment variables: ${missingVars.join(', ')}`,
      );
      throw new Error(
        `OAuth2 strategy requires: ${missingVars.join(', ')}`,
      );
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

    // Override userProfile on this instance if userinfo URL is configured
    const userinfoUrl = process.env.OAUTH2_CLIENT_USERINFO_URL;
    if (userinfoUrl) {
      const oauth2 = (this as any)._oauth2;
      oauth2.useAuthorizationHeaderforGET(true);

      (this as any).userProfile = (
        accessToken: string,
        done: (err: Error | null, profile?: UserProfile) => void,
      ): void => {
        oauth2.get(userinfoUrl, accessToken, (err: Error | null, body: string) => {
          if (err) {
            this.logger.error('Failed to fetch userinfo:', err);
            return done(err);
          }

          try {
            const json = JSON.parse(body);
            // Use stable identifiers for username (never display name)
            // Fallback order: OIDC preferred_username > Gitea login > email > sub/id
            const username =
              json.preferred_username ||
              json.login ||
              json.email ||
              String(json.sub || json.id);
            const profile: UserProfile = {
              id: json.sub || json.id,
              username,
              displayName: json.name || json.full_name || json.preferred_username || username,
              email: json.email,
              emails: json.email ? [{ value: json.email }] : [],
              photos: (json.picture || json.avatar_url) ? [{ value: json.picture || json.avatar_url }] : [],
              provider: 'oauth2',
              _raw: body,
              _json: json,
            };
            done(null, profile);
          } catch (e) {
            this.logger.error('Failed to parse userinfo:', e);
            done(e as Error);
          }
        });
      };
    }
  }

  async validate(_accessToken: string, _refreshToken: string, profile: UserProfile) {
    this.logger.debug(`OAuth2 validate: ${profile?.username || profile?.email}`);
    return profile;
  }
}
