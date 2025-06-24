import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, User as PrismaUser } from '@prisma/client';

@Injectable()
export class GroupsService {
  private readonly prisma = new PrismaClient();
  private logger = new Logger(GroupsService.name);

  constructor() {}
  async findAll(): Promise<any[]> {
    return this.prisma.userGroup.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
