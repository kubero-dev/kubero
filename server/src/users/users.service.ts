import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
import * as crypto from 'crypto';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [] as User[];
  private logger = new Logger(UsersService.name);

  constructor() {
    if (process.env.KUBERO_USERS) {
      const u = Buffer.from(process.env.KUBERO_USERS, 'base64').toString(
        'utf-8',
      );
      const users = JSON.parse(u);
      users.forEach((user) => {
        let password = user.password;
        if (
          user.insecure &&
          user.insecure === true &&
          process.env.KUBERO_SESSION_KEY
        ) {
          this.logger.warn(
            'User with unencrypted Password detected: "' +
              user.username +
              '" - This feature is deprecated and will be removed in the future',
          );
          password = crypto
            .createHmac('sha256', process.env.KUBERO_SESSION_KEY)
            .update(password)
            .digest('hex');
        }

        this.users.push({
          userId: user.id,
          username: user.username,
          password: password,
          //password: user.password
        });
      });
    }
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
