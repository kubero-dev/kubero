import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, User as PrismaUser } from '@prisma/client';

@Injectable()
export class RolesService {
  private readonly prisma = new PrismaClient();
  private logger = new Logger(RolesService.name);

  constructor() {}

  async findAll(): Promise<any[]> {
    return this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          select: {
            id: true,
            resource: true,
            action: true,
          },
        },
      },
    });
  }
}
