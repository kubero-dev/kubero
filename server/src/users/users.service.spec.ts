import { UsersService } from './users.service';
import { PrismaClient, User as PrismaUser } from '@prisma/client';

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
  };

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

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
      data: expect.objectContaining(newUser),
    });
  });

  it('should update a user', async () => {
    const updatedUser = {
      id: '1',
      username: 'user1',
      password: 'newpass',
    } as PrismaUser;
    prismaMock.user.update.mockResolvedValueOnce(updatedUser);
    const user = await service.update('1', { password: 'newpass' });
    expect(user).toBe(updatedUser);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { password: 'newpass' },
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
      data: { password: 'newpass' },
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
});
