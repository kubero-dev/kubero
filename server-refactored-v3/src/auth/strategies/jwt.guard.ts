import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    //console.log('JwtAuthGuard.canActivate');
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // Disabling authentication when no auth method is defined
    if (
      !process.env.KUBERO_USERS &&
      !process.env.GITHUB_CLIENT_SECRET &&
      !process.env.OAUTH2_CLIENT_SECRET
    ) {
      return true;
    }

    if (err || !user) {
      this.logger.debug('JwtAuthGuard.handleRequest Error', err, user, info);
      this.logger.error('Authentication failed: ' + info);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
