import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();
//import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import axios from 'axios';

// This should be a real class/interface representing a user entity
export type User = any;
export type PartialPrismaUser = Partial<PrismaUser>; // Partial type for Prisma User to remove sensitive fields

@Injectable()
export class UsersService {
  private readonly prisma = new PrismaClient();
  private logger = new Logger(UsersService.name);

  constructor() {}

  async findOne(username: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findOneFull(username: string): Promise<PartialPrismaUser | null> {
    return this.prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        tokens: {
          select: {
            id: true,
            createdAt: true,
            expiresAt: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        userGroups: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  // Required for OAuth2 login
  async findOneOrCreate(
    username: string,
    email: string,
    provider: string,
    image: string,
  ): Promise<PartialPrismaUser> {
    let user = await this.findOneFull(username);
    if (!user) {
      this.logger.debug(
        `Oauth2 User ${username} not found, creating new user.`,
      );

      // Define default role
      const role = await this.prisma.role.findFirst({
        where: {
          name: process.env.DEFAULT_USER_ROLE || 'guest', // Default role if not specified
        },
      });
      if (!role) {
        this.logger.warn(
          `Default role not found: ${process.env.DEFAULT_USER_ROLE || 'guest'}`,
        );
        throw new Error(
          `Default role not found: ${process.env.DEFAULT_USER_ROLE || 'guest'}`,
        );
      }

      // Define default user group
      const defaultUserGroup = process.env.DEFAULT_USER_GROUP || 'everyone';
      const userGroupsData = await this.prisma.userGroup.findFirst({
        where: {
          name: defaultUserGroup,
        },
      });
      if (!userGroupsData) {
        this.logger.warn(`Default user group not found: ${defaultUserGroup}`);
        throw new Error(`Default user group not found: ${defaultUserGroup}`);
      }

      // Generate a random password (not most secure, but enough for a temporary password)
      const password = Math.random().toString(36).slice(-8); // Generate a random password
      const imageData = image
        ? await this.generateUserDataFromImageUrl(image)
        : null;

      user = await this.create({
        username,
        password,
        email,
        provider,
        image: imageData,
        role: role.id,
        userGroups: [userGroupsData.id],
        providerId: null, // Set providerId if needed
        providerData: null, // Set providerData if needed
      });
      this.logger.debug(`User ${username} created successfully.`);
    } else {
      this.logger.debug(`User ${username} found.`);
    }
    return user;
  }

  async findById(userId: string): Promise<PartialPrismaUser | null> {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        lastLogin: true,
        lastIp: true,
        provider: true,
        providerId: true,
        providerData: true,
        image: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        userGroups: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        lastLogin: true,
        lastIp: true,
        provider: true,
        providerId: true,
        providerData: true,
        image: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        userGroups: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        tokens: {
          select: {
            id: true,
            createdAt: true,
            expiresAt: true,
          },
        },
      },
    });
  }

  async findByUsername(username: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async create(user: any): Promise<PrismaUser> {
    //this.logger.debug('Creating user with data:', user);
    const { role, userGroups, tokens, ...cleanedData } = user;

    if (
      cleanedData.password &&
      typeof cleanedData.password === 'string' &&
      cleanedData.password.length > 0
    ) {
      cleanedData.password = bcrypt.hashSync(cleanedData.password, 10);
    } else {
      // If no password is provided, throw an error or handle accordingly
      this.logger.warn('Password is required for user creation.');
      throw new Error('Password is required for user creation.');
    }

    return this.prisma.user.create({
      data: {
        ...cleanedData,
        role: role && role ? { connect: { id: role } } : undefined,
        userGroups:
          userGroups && Array.isArray(userGroups)
            ? {
                connect: userGroups.map((g: any) => ({ id: g })),
              }
            : undefined,
      },
    });
  }

  async update(
    userId: string,
    user: any,
  ): Promise<PartialPrismaUser | undefined> {
    const {
      id,
      createdAt,
      updatedAt,
      role,
      userGroups,
      tokens,
      password,
      ...data
    } = user;

    // fix relations
    if (role && typeof role === 'string') {
      data.role = { connect: { id: role } };
    }
    if (userGroups && Array.isArray(userGroups)) {
      data.userGroups = {
        set: [],
        connect: userGroups.map((g: any) => ({ id: g.id || g })),
      };
    }

    if (Object.keys(data).length === 0) {
      this.logger.warn(
        `No valid fields provided for update on user with ID ${userId}.`,
      );
      return undefined;
    }

    try {
      return await this.prisma.user.update({
        omit: {
          password: true,
        },
        where: { id: userId },
        data,
      });
    } catch (error) {
      this.logger.warn(`User with ID ${userId} not updated.`);
      this.logger.debug(error);
      return undefined;
    }
  }

  async updatePassword(
    userId: string,
    newPassword: string,
  ): Promise<PrismaUser | undefined> {
    if (
      !newPassword ||
      typeof newPassword !== 'string' ||
      newPassword.length === 0
    ) {
      this.logger.warn('No valid new password provided for password update.');
      return undefined;
    }
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
      this.logger.debug(`Password updated for user with ID ${userId}.`);
      return user;
    } catch (error) {
      this.logger.debug(
        `Error updating password for user with ID ${userId}:`,
        error,
      );
      this.logger.warn(`User with ID ${userId} not found for password update.`);
      return undefined;
    }
  }

  async updateMyPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<PrismaUser | undefined> {
    if (
      !currentPassword ||
      !newPassword ||
      typeof currentPassword !== 'string' ||
      typeof newPassword !== 'string' ||
      newPassword.length < 8
    ) {
      this.logger.warn(
        'Invalid current or new password provided for password update.',
      );
      return undefined;
    }

    try {
      // First, get the user with their current password
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true },
      });

      if (!user) {
        this.logger.warn(
          `User with ID ${userId} not found for password update.`,
        );
        return undefined;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        this.logger.warn(
          `Invalid current password provided for user ${userId}.`,
        );
        //throw new Error('Current password is incorrect');
        throw new HttpException(
          `Error updating password: Current password is incorrect`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Hash and update new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      this.logger.debug(`Password updated for user with ID ${userId}.`);
      return updatedUser;
    } catch (error) {
      this.logger.debug(
        `Error updating password for user with ID ${userId}:`,
        error,
      );
      throw error;
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

  async listUsersByGroup(groupId: string): Promise<PrismaUser[]> {
    return this.prisma.user.findMany({
      where: {
        userGroups: {
          some: {
            id: groupId,
          },
        },
      },
    });
  }

  async findAllRoles(): Promise<any[]> {
    return this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateAvatar(
    userId: string,
    avatarFile: any,
  ): Promise<PrismaUser | undefined> {
    if (!avatarFile || !avatarFile.buffer) {
      this.logger.warn('No avatar file buffer provided.');
      return undefined;
    }
    // Store as base64 string in DB (for demo; in production, store in object storage or filesystem)
    const base64Image = `data:${avatarFile.mimetype};base64,${avatarFile.buffer.toString('base64')}`;
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { image: base64Image },
      });
    } catch (error) {
      this.logger.warn(`User with ID ${userId} not found for avatar update.`);
      this.logger.debug(error);
      return undefined;
    }
  }

  async getAvatar(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });
    return user ? user.image : null;
  }

  private async generateUserDataFromImageUrl(
    imageUrl: string,
  ): Promise<string> {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    if (response.status !== 200) {
      throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
    }
    const mimetype = response.headers['content-type'] || 'image/jpeg'; // Default to jpeg if not specified
    if (!mimetype.startsWith('image/')) {
      throw new Error(`Invalid image MIME type: ${mimetype}`);
    }

    const buffer = Buffer.from(response.data, 'binary');
    const base64Image = buffer.toString('base64');
    return `data:${mimetype};base64,${base64Image}`;
  }
  /*
  async getPermissions(userId: string,): Promise<{ action: string; resource: string }[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: {
          select: {
            permissions: {
              select: {
                action: true,
                resource: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.role || !user.role.permissions) {
      return [];
    }

    return user.role.permissions.map((p) => ({
      action: p.action,
      resource: p.resource,
    }));
  }
*/
}
