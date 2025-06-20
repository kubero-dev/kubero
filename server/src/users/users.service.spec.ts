import { UsersService } from './users.service';
import { Logger } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    process.env.KUBERO_SESSION_KEY = 'testkey';
    process.env.KUBERO_USERS = Buffer.from(
      JSON.stringify([
        { id: 1, username: 'user1', password: 'pass1' },
        { id: 2, username: 'user2', password: 'pass2' },
      ])
    ).toString('base64');
    service = new UsersService();
  });

  afterEach(() => {
    delete process.env.KUBERO_USERS;
    delete process.env.KUBERO_SESSION_KEY;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a user by username', async () => {
    const user = await service.findOne('user1');
    expect(user).toBeDefined();
    expect(user.username).toBe('user1');
  });

  it('should find a user by id', async () => {
    const user = await service.findById(1);
    expect(user).toBeDefined();
    expect(user.userId).toBe(1);
  });

  it('should return all users', async () => {
    const users = await service.findAll();
    expect(users.length).toBe(2);
  });

  it('should find by username', async () => {
    const user = await service.findByUsername('user2');
    expect(user).toBeDefined();
    expect(user.username).toBe('user2');
  });

  it('should create a new user', async () => {
    const newUser = { userId: 3, username: 'user3', password: 'pass3' };
    await service.create(newUser);
    const user = await service.findById(3);
    expect(user).toBeDefined();
    expect(user.username).toBe('user3');
  });

  it('should update an existing user', async () => {
    const updated = await service.update(1, { password: 'newpass' });
    expect(updated).toBeDefined();
    expect(updated.password).toBe('newpass');
  });

  it('should return undefined when updating non-existing user', async () => {
    const updated = await service.update(999, { password: 'x' });
    expect(updated).toBeUndefined();
  });

  it('should delete a user', async () => {
    await service.delete(1);
    const user = await service.findById(1);
    expect(user).toBeUndefined();
  });

  it('should warn when deleting non-existing user', async () => {
    const loggerSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    await service.delete(999);
    expect(loggerSpy).toHaveBeenCalled();
    loggerSpy.mockRestore();
  });

  it('should reset all users', async () => {
    await service.reset();
    const users = await service.findAll();
    expect(users.length).toBe(0);
  });

  it('should count users', async () => {
    const count = await service.count();
    expect(count).toBe(2);
  });

  it('should check if username exists', async () => {
    expect(await service.exists('user1')).toBe(true);
    expect(await service.exists('notfound')).toBe(false);
  });
});