import { UsersService } from './users.service';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import axios from 'axios';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: {
    user: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    role: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
    userGroup: {
      findFirst: jest.Mock;
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();

    prismaMock = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      role: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      userGroup: {
        findFirst: jest.fn(),
      },
    };

    // Mock bcrypt methods
    (mockedBcrypt.compare as jest.Mock).mockImplementation(() =>
      Promise.resolve(true),
    );
    (mockedBcrypt.hash as jest.Mock).mockImplementation(() =>
      Promise.resolve('hashedPassword'),
    );
    (mockedBcrypt.hashSync as jest.Mock).mockImplementation(
      () => 'hashedPassword',
    );

    service = new UsersService();
    // @ts-ignore
    service['prisma'] = prismaMock;
  });

  it('should find a user by username', async () => {
    const mockUser = { id: '1', username: 'user1' } as PrismaUser;
    prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
    const user = await service.findOne('user1');
    expect(user).toBe(mockUser);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { username: 'user1' },
    });
  });

  it('should find a user by id', async () => {
    const mockUser = { id: '1', username: 'user1' } as PrismaUser;
    prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
    const user = await service.findById('1');
    expect(user).toBe(mockUser);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        image: true,
        provider: true,
        providerId: true,
        providerData: true,
        isActive: true,
        lastLogin: true,
        lastIp: true,
        createdAt: true,
        updatedAt: true,
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
  });

  it('should find all users', async () => {
    const mockUsers = [
      { id: '1', username: 'user1' },
      { id: '2', username: 'user2' },
    ] as PrismaUser[];
    prismaMock.user.findMany.mockResolvedValueOnce(mockUsers);
    const users = await service.findAll();
    expect(users).toBe(mockUsers);
    expect(prismaMock.user.findMany).toHaveBeenCalled();
  });

  it('should create a user', async () => {
    const newUser = {
      username: 'user3',
      password: 'pass3',
    } as Partial<PrismaUser>;
    const createdUser = {
      id: '3',
      username: 'user3',
      password: 'pass3',
    } as PrismaUser;
    prismaMock.user.create.mockResolvedValueOnce(createdUser);
    const user = await service.create(newUser);
    expect(user).toBe(createdUser);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        username: 'user3',
        password: expect.any(String), // password will be hashed
      }),
    });
  });

  it('should update a user', async () => {
    const updatedUser = {
      id: '1',
      username: 'user1',
      password: 'newpass',
    } as PrismaUser;
    prismaMock.user.update.mockResolvedValueOnce(updatedUser);
    const user = await service.update('1', { username: 'user2' });
    expect(user).toEqual(updatedUser); // Use toEqual instead of toBe
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { username: 'user2' },
      omit: { password: true },
    });
  });

  it('should return undefined if update fails', async () => {
    prismaMock.user.update.mockRejectedValueOnce(new Error('Not found'));
    const user = await service.update('1', { password: 'fail' });
    expect(user).toBeUndefined();
  });

  it('should update password', async () => {
    const updatedUser = {
      id: '1',
      username: 'user1',
      password: 'newpass',
    } as PrismaUser;
    prismaMock.user.update.mockResolvedValueOnce(updatedUser);
    const user = await service.updatePassword('1', 'newpass');
    expect(user).toBe(updatedUser);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { password: expect.any(String) }, // password will be hashed
    });
  });

  it('should return undefined if updatePassword fails', async () => {
    prismaMock.user.update.mockRejectedValueOnce(new Error('Not found'));
    const user = await service.updatePassword('1', 'fail');
    expect(user).toBeUndefined();
  });

  it('should delete a user', async () => {
    prismaMock.user.delete.mockResolvedValueOnce(undefined as any);
    await expect(service.delete('1')).resolves.toBeUndefined();
    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should count users', async () => {
    prismaMock.user.count.mockResolvedValueOnce(2);
    const count = await service.count();
    expect(count).toBe(2);
    expect(prismaMock.user.count).toHaveBeenCalled();
  });

  it('should check if user exists', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: '1',
      username: 'user1',
    } as PrismaUser);
    expect(await service.exists('user1')).toBe(true);
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    expect(await service.exists('notfound')).toBe(false);
  });

  describe('findOneFull', () => {
    it('should find a user with full details including relations', async () => {
      const mockUser = {
        id: '1',
        username: 'user1',
        email: 'user1@example.com',
        tokens: [
          { id: 'token1', createdAt: new Date(), expiresAt: new Date() },
        ],
        role: { id: 'role1', name: 'admin', description: 'Administrator' },
        userGroups: [
          { id: 'group1', name: 'admins', description: 'Admin group' },
        ],
      };
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await service.findOneFull('user1');

      expect(result).toBe(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'user1' },
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
    });

    it('should return null if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      const result = await service.findOneFull('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findOneOrCreate', () => {
    it('should return existing user if found', async () => {
      const existingUser = {
        id: '1',
        username: 'existinguser',
        email: 'existing@example.com',
      };
      prismaMock.user.findUnique.mockResolvedValueOnce(existingUser);

      const result = await service.findOneOrCreate(
        'existinguser',
        'existing@example.com',
        'oauth2',
        'https://example.com/avatar.jpg',
      );

      expect(result).toBe(existingUser);
    });

    it('should create new user if not found', async () => {
      const mockRole = { id: 'role1', name: 'guest' };
      const mockUserGroup = { id: 'group1', name: 'everyone' };
      const newUser = { id: '2', username: 'newuser' };

      prismaMock.user.findUnique.mockResolvedValueOnce(null); // User not found
      prismaMock.role.findFirst.mockResolvedValueOnce(mockRole);
      prismaMock.userGroup.findFirst.mockResolvedValueOnce(mockUserGroup);
      prismaMock.user.create.mockResolvedValueOnce(newUser);

      // Mock axios for image processing
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/jpeg' },
      });

      const result = await service.findOneOrCreate(
        'newuser',
        'new@example.com',
        'oauth2',
        'https://example.com/avatar.jpg',
      );

      expect(result).toBe(newUser);
      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it('should throw error if default role not found', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.role.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.findOneOrCreate('newuser', 'new@example.com', 'oauth2', ''),
      ).rejects.toThrow('Default role not found');
    });

    it('should throw error if default user group not found', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.role.findFirst.mockResolvedValueOnce({
        id: 'role1',
        name: 'guest',
      });
      prismaMock.userGroup.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.findOneOrCreate('newuser', 'new@example.com', 'oauth2', ''),
      ).rejects.toThrow('Default user group not found');
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      const mockUser = { id: '1', username: 'testuser' };
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await service.findByUsername('testuser');

      expect(result).toBe(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });
  });

  describe('updateMyPassword', () => {
    it('should update password when current password is correct', async () => {
      const mockUser = { id: '1', password: 'hashedCurrentPassword' };
      const updatedUser = { id: '1', password: 'hashedNewPassword' };

      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValueOnce(
        'hashedNewPassword',
      );
      prismaMock.user.update.mockResolvedValueOnce(updatedUser);

      const result = await service.updateMyPassword(
        '1',
        'currentPass',
        'newPassword123',
      );

      expect(result).toBe(updatedUser);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'currentPass',
        'hashedCurrentPassword',
      );
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
    });

    it('should return undefined for invalid input parameters', async () => {
      const result1 = await service.updateMyPassword('1', '', 'newPassword123');
      const result2 = await service.updateMyPassword('1', 'currentPass', '');
      const result3 = await service.updateMyPassword(
        '1',
        'currentPass',
        'short',
      );

      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
      expect(result3).toBeUndefined();
    });

    it('should return undefined when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      const result = await service.updateMyPassword(
        '1',
        'currentPass',
        'newPassword123',
      );

      expect(result).toBeUndefined();
    });

    it('should throw HttpException when current password is incorrect', async () => {
      const mockUser = { id: '1', password: 'hashedCurrentPassword' };
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        service.updateMyPassword('1', 'wrongPassword', 'newPassword123'),
      ).rejects.toThrow(HttpException);
    });

    it('should propagate database errors', async () => {
      const mockUser = { id: '1', password: 'hashedCurrentPassword' };
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValueOnce(
        'hashedNewPassword',
      );
      prismaMock.user.update.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        service.updateMyPassword('1', 'currentPass', 'newPassword123'),
      ).rejects.toThrow('Database error');
    });
  });

  describe('listUsersByGroup', () => {
    it('should return users belonging to a specific group', async () => {
      const mockUsers = [
        { id: '1', username: 'user1' },
        { id: '2', username: 'user2' },
      ];
      prismaMock.user.findMany.mockResolvedValueOnce(mockUsers);

      const result = await service.listUsersByGroup('group1');

      expect(result).toBe(mockUsers);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {
          userGroups: {
            some: {
              id: 'group1',
            },
          },
        },
      });
    });
  });

  describe('findAllRoles', () => {
    it('should return all roles', async () => {
      const mockRoles = [
        { id: '1', name: 'admin', description: 'Administrator' },
        { id: '2', name: 'user', description: 'Regular user' },
      ];
      prismaMock.role.findMany.mockResolvedValueOnce(mockRoles);

      const result = await service.findAllRoles();

      expect(result).toBe(mockRoles);
      expect(prismaMock.role.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('updateAvatar', () => {
    it('should update user avatar successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg',
      };
      const updatedUser = {
        id: '1',
        image: 'data:image/jpeg;base64,ZmFrZS1pbWFnZS1kYXRh',
      };

      prismaMock.user.update.mockResolvedValueOnce(updatedUser);

      const result = await service.updateAvatar('1', mockFile);

      expect(result).toBe(updatedUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { image: 'data:image/jpeg;base64,ZmFrZS1pbWFnZS1kYXRh' },
      });
    });

    it('should return undefined when no file buffer provided', async () => {
      const result1 = await service.updateAvatar('1', null);
      const result2 = await service.updateAvatar('1', { buffer: null });

      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
    });

    it('should return undefined when update fails', async () => {
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg',
      };
      prismaMock.user.update.mockRejectedValueOnce(new Error('User not found'));

      const result = await service.updateAvatar('1', mockFile);

      expect(result).toBeUndefined();
    });
  });

  describe('getAvatar', () => {
    it('should return user avatar', async () => {
      const mockUser = { image: 'data:image/jpeg;base64,ZmFrZS1pbWFnZS1kYXRh' };
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await service.getAvatar('1');

      expect(result).toBe(mockUser.image);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { image: true },
      });
    });

    it('should return null when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      const result = await service.getAvatar('1');

      expect(result).toBeNull();
    });
  });

  describe('generateUserDataFromImageUrl', () => {
    it('should generate base64 image data from URL', async () => {
      const imageBuffer = Buffer.from('fake-image-data');
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: imageBuffer,
        headers: { 'content-type': 'image/jpeg' },
      });

      const result = await (service as any).generateUserDataFromImageUrl(
        'https://example.com/image.jpg',
      );

      expect(result).toBe(
        `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://example.com/image.jpg',
        {
          responseType: 'arraybuffer',
        },
      );
    });

    it('should throw error when image fetch fails', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 404,
        data: null,
        headers: {},
      });

      await expect(
        (service as any).generateUserDataFromImageUrl(
          'https://example.com/notfound.jpg',
        ),
      ).rejects.toThrow('Failed to fetch image from URL');
    });

    it('should throw error for invalid MIME type', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: Buffer.from('not-an-image'),
        headers: { 'content-type': 'text/plain' },
      });

      await expect(
        (service as any).generateUserDataFromImageUrl(
          'https://example.com/text.txt',
        ),
      ).rejects.toThrow('Invalid image MIME type');
    });

    it('should default to image/jpeg when no content-type header', async () => {
      const imageBuffer = Buffer.from('fake-image-data');
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: imageBuffer,
        headers: {},
      });

      const result = await (service as any).generateUserDataFromImageUrl(
        'https://example.com/image',
      );

      expect(result).toBe(
        `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
      );
    });
  });

  describe('create with error handling', () => {
    it('should throw error when no password provided', async () => {
      const userWithoutPassword = {
        username: 'testuser',
        email: 'test@example.com',
      };

      await expect(service.create(userWithoutPassword)).rejects.toThrow(
        'Password is required for user creation.',
      );
    });

    it('should throw error when empty password provided', async () => {
      const userWithEmptyPassword = {
        username: 'testuser',
        password: '',
        email: 'test@example.com',
      };

      await expect(service.create(userWithEmptyPassword)).rejects.toThrow(
        'Password is required for user creation.',
      );
    });
  });

  describe('updatePassword edge cases', () => {
    it('should return undefined for invalid password parameters', async () => {
      const result1 = await service.updatePassword('1', '');
      const result2 = await service.updatePassword('1', null as any);
      const result3 = await service.updatePassword('1', 123 as any);

      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
      expect(result3).toBeUndefined();
    });
  });

  describe('update edge cases', () => {
    it('should return undefined when no valid fields provided', async () => {
      const result = await service.update('1', {
        id: 'ignored',
        createdAt: 'ignored',
        updatedAt: 'ignored',
        password: 'ignored',
      });

      expect(result).toBeUndefined();
    });

    it('should handle role and userGroups relations correctly', async () => {
      const updatedUser = { id: '1', username: 'updated' };
      prismaMock.user.update.mockResolvedValueOnce(updatedUser);

      const updateData = {
        username: 'newusername',
        role: 'role123',
        userGroups: [{ id: 'group1' }, 'group2'],
      };

      const result = await service.update('1', updateData);

      expect(result).toBe(updatedUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        omit: { password: true },
        where: { id: '1' },
        data: {
          username: 'newusername',
          role: { connect: { id: 'role123' } },
          userGroups: {
            set: [],
            connect: [{ id: 'group1' }, { id: 'group2' }],
          },
        },
      });
    });
  });

  describe('delete error handling', () => {
    it('should handle deletion errors gracefully', async () => {
      prismaMock.user.delete.mockRejectedValueOnce(new Error('User not found'));

      // Should not throw, but handle gracefully
      await expect(service.delete('nonexistent')).resolves.toBeUndefined();
    });
  });
});
