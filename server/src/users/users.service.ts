import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();
import * as crypto from 'crypto';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly prisma = new PrismaClient();
  private logger = new Logger(UsersService.name);

  constructor() {}

  async findOne(username: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(userId: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async findAll(): Promise<PrismaUser[]> {
    return this.prisma.user.findMany();
  }
  
  async findByUsername(username: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async create(user: Partial<PrismaUser>): Promise<PrismaUser> {
    // Remove null values to match Prisma's expectations
    const cleanedData = Object.fromEntries(
      Object.entries(user).filter(([_, value]) => value !== null)
    );
    return this.prisma.user.create({ 
      data: cleanedData as PrismaUser 
    });
  }
  
  async update(userId: string, user: Partial<PrismaUser>): Promise<PrismaUser | undefined> {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: user,
      });
    } catch (error) {
      this.logger.warn(`User with ID ${userId} not found for update.`);
      return undefined;
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<PrismaUser | undefined> {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { password: newPassword },
      });
    } catch (error) {
      this.logger.warn(`User with ID ${userId} not found for password update.`);
      return undefined;
    }
  }

  async delete(userId: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id: userId } });
    } catch (error) {
      this.logger.warn(`User with ID ${userId} not found for deletion.`);
    }
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  async exists(username: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    return !!user;
  }
}
