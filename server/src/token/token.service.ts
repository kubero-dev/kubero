import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TokenService {
  private readonly prisma = new PrismaClient();
  private logger = new Logger(TokenService.name);

  constructor(private authService: AuthService) {}
  async findAll(): Promise<any[]> {
    return this.prisma.token.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async create(
    name: string,
    expiresAt: string,
    userId: string,
    username: string,
    role: string,
    userGroups: any,
  ): Promise<{
    name: string;
    token: string;
    expiresAt: string;
  }> {
    if (!name || !expiresAt || !userId) {
      throw new Error('Invalid token data');
    }
    //create a new JWT Token
    const token = await this.authService.generateToken(
      userId,
      username,
      role,
      userGroups,
    );

    // transoform userGroups to a string
    const userGroupsString = userGroups
      .map((group: any) => group.name)
      .join(',');
    const newToken = {
      name: name || '', // Optional name field
      role: role || 'guest', // Default to 'user' if not provided
      groups: userGroupsString || '', // Store user groups as a string
      expiresAt: new Date(expiresAt),
      user: {
        connect: { id: userId },
      },
    };
    await this.prisma.token.create({
      data: newToken,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      name: name,
      token: token,
      expiresAt: expiresAt,
    };
  }

  async delete(id: string): Promise<any> {
    return this.prisma.token.delete({
      where: { id },
    });
  }
}
