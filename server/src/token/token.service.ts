import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, User as PrismaUser } from '@prisma/client';

@Injectable()
export class TokenService {
  private readonly prisma = new PrismaClient();
  private logger = new Logger(TokenService.name);

  constructor() {}
  async findAll(): Promise<any[]> {

    return this.prisma.token.findMany({
      select: {
        id: true,
        token: true,
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

  async create(tokenData: any, userId: string): Promise<any> {
    const { token, expiresAt } = tokenData;
    if (!token || !expiresAt || !userId) {
      throw new Error('Invalid token data');
    }
    const newToken = {
      token,
      expiresAt: new Date(expiresAt),
      user: {
        connect: { id: userId },
      },
    };
    return this.prisma.token.create({
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
  }

  async delete(id: string): Promise<any> {
    return this.prisma.token.delete({
      where: { id },
    });
  }
  
}
