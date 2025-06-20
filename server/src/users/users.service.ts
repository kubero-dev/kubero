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

  async findById(userId: number): Promise<User | undefined> {
    return this.users.find((user) => user.userId === userId);
  }
  async findAll(): Promise<User[]> {
    return this.users;
  }
  async findByUsername(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
  async create(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }
  async update(userId: number, user: User): Promise<User | undefined> {
    const index = this.users.findIndex((u) => u.userId === userId);
    if (index === -1) {
      return undefined;
    }
    this.users[index] = { ...this.users[index], ...user };
    return this.users[index];
  }
  async delete(userId: number): Promise<void> {
    const index = this.users.findIndex((u) => u.userId === userId);
    if (index !== -1) {
      this.users.splice(index, 1);
    } else {
      this.logger.warn(`User with ID ${userId} not found for deletion.`);
    }
  }
  async reset(): Promise<void> {
    this.users.length = 0; // Clear the users array
    this.logger.log('Users reset successfully.');
  }
  async count(): Promise<number> {
    return this.users.length;
  }
  async exists(username: string): Promise<boolean> {
    return this.users.some((user) => user.username === username);
  }
}
