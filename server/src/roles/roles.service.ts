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

  async getPermissions(roleId: string): Promise<any[]> {
    this.logger.debug(`getPermissions for roleId: ${roleId}`);
    return this.prisma.role
      .findUnique({
        where: { id: roleId },
        select: {
          permissions: {
            select: {
              id: true,
              resource: true,
              action: true,
            },
          },
        },
      })
      .then((role) => role?.permissions || []);
  }

  async createRole(roleData: any): Promise<any> {
    //this.logger.debug(`createRole with data: ${JSON.stringify(roleData)}`);
    return this.prisma.role.create({
      data: {
        name: roleData.name,
        description: roleData.description,
        permissions: {
          create: roleData.permissions.map((p: any) => ({
            resource: p.resource,
            action: p.action,
          })),
        },
      },
      include: {
        permissions: true,
      },
    });
  }

  async deleteRole(roleId: string): Promise<any> {
    this.logger.debug(`deleteRole with roleId: ${roleId}`);
    if (!roleId) {
      throw new Error('Role ID is required');
    }
    return this.prisma.role.delete({
      where: { id: roleId },
    });
  }

  async updateRole(roleId: string, roleData: any): Promise<any> {
    //this.logger.debug(`updateRole with roleId: ${roleId} and data: ${JSON.stringify(roleData)}`);
    if (!roleId) {
      throw new Error('Role ID is required');
    }
    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        name: roleData.name,
        description: roleData.description,
        permissions: {
          deleteMany: {},
          create: roleData.permissions.map((p: any) => ({
            resource: p.resource,
            action: p.action,
          })),
        },
      },
      include: {
        permissions: true,
      },
    });
  }
}
