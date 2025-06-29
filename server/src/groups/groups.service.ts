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

  async create(name: string, description: string): Promise<any> {
    const groupData = {
      name,
      description,
    };
    return this.prisma.userGroup.create({
      data: groupData,
    });
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.userGroup.findUnique({
      where: { id },
    });
  }

  async update(id: string, groupData: any): Promise<any | null> {
    return this.prisma.userGroup.update({
      where: { id },
      data: groupData,
    });
  }

  async delete(id: string): Promise<any | null> {
    return this.prisma.userGroup.delete({
      where: { id },
    });
  }
} 
