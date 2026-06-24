import { Test, TestingModule } from '@nestjs/testing';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';

describe('TokenController', () => {
  let controller: TokenController;
  let tokenService: TokenService;

  const mockTokenService = {
    findAll: jest.fn().mockResolvedValue([{ id: '1', user: { id: 'u1' } }]),
    create: jest.fn().mockResolvedValue({ id: '1', name: 'token1' }),
    delete: jest.fn().mockResolvedValue({ id: '1', deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenController],
      providers: [{ provide: TokenService, useValue: mockTokenService }],
    }).compile();

    controller = module.get<TokenController>(TokenController);
    tokenService = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTokens', () => {
    it('should return all tokens', async () => {
      const result = await controller.getTokens();
      expect(tokenService.findAll).toHaveBeenCalled();
      expect(result).toEqual([{ id: '1', user: { id: 'u1' } }]);
    });
  });

  describe('createToken', () => {
    it('should create a token for current user', async () => {
      const tokenData = { name: 'token1', expiresAt: '2025-01-01' };
      const req = {
        user: { userId: 'u1', username: 'test', role: 'admin', userGroups: [] },
      };
      const result = await controller.createToken(tokenData, req);
      expect(tokenService.create).toHaveBeenCalledWith(
        'token1',
        '2025-01-01',
        'u1',
        'test',
        'admin',
        [],
      );
      expect(result).toEqual({ id: '1', name: 'token1' });
    });

    it('should throw if missing data', async () => {
      await expect(controller.createToken({}, { user: {} })).rejects.toThrow();
    });
  });

  describe('deleteToken', () => {
    it('should delete token by id', async () => {
      const result = await controller.deleteToken('1');
      expect(tokenService.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual({ id: '1', deleted: true });
    });

    it('should throw if id missing', async () => {
      await expect(controller.deleteToken('')).rejects.toThrow();
    });
  });

  describe('getMyTokens', () => {
    it('should return tokens for current user', async () => {
      const req = { user: { userId: 'u1' } };
      const result = await controller.getMyTokens(req);
      expect(result).toEqual([{ id: '1', user: { id: 'u1' } }]);
    });

    it('should throw if userId missing', async () => {
      await expect(controller.getMyTokens({ user: {} })).rejects.toThrow();
    });
  });

  describe('deleteMyToken', () => {
    it('should delete token for current user and return filtered tokens', async () => {
      const req = { user: { userId: 'u1' } };
      const result = await controller.deleteMyToken('1', req);
      expect(tokenService.delete).toHaveBeenCalledWith('1');
    });

    it('should throw if id or userId missing', async () => {
      await expect(
        controller.deleteMyToken('', { user: { userId: 'u1' } }),
      ).rejects.toThrow();
      await expect(
        controller.deleteMyToken('1', { user: {} }),
      ).rejects.toThrow();
    });
  });
});
