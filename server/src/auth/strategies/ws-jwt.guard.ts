import { CanActivate, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UsersService } from '../../users/users.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private logger = new Logger(WsJwtGuard.name);

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const client = context.switchToWs().getClient();
    const token = this.extractToken(client);

    if (!token) {
      this.logger.debug('No token provided, disconnecting client');
      client.disconnect();
      return false;
    }

    try {
      const decoded = this.jwtService.verify(token);
      if (!decoded || !decoded.username) {
        this.logger.debug('Token verification failed, disconnecting client');
        client.disconnect();
        return false;
      }
      return new Promise((resolve, reject) => {
        return this.usersService.findOne(decoded.username).then((user) => {
          if (user) {
            context.switchToWs().getClient().user = user;
            resolve(true);
          } else {
            this.logger.debug('User not found, disconnecting client');
            client.disconnect();
            reject(false);
          }
        });
      });
    } catch (ex) {
      this.logger.error('Token validation error', ex.message);
      client.disconnect();
      return false;
    }
  }

  private extractToken(client: any): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    return client.handshake.auth?.token || null;
  }
}
