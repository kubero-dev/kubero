import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { AuthService } from '../auth/auth.service';

describe('TokenService', () => {
  let service: TokenService;

  // Mock Prisma client or any DB dependencies inside TokenService
  const mockPrisma = {
    token: {
      findMany: jest.fn().mockResolvedValue([{ id: '1', name: 'token1' }]),
      create: jest.fn().mockResolvedValue({ id: '1', name: 'token1' }),
      delete: jest.fn().mockResolvedValue({ id: '1', deleted: true }),
    },
  };

  const mockAuthService = {
    // Add any methods used by TokenService if needed
    generateToken: jest.fn().mockResolvedValue('mocked-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: 'PrismaClient', useValue: mockPrisma },
        TokenService,
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    // @ts-ignore
    service['prisma'] = mockPrisma;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all tokens', async () => {
      const result = await service.findAll();
      expect(mockPrisma.token.findMany).toHaveBeenCalled();
      expect(result).toEqual([{ id: '1', name: 'token1' }]);
    });
  });

  describe('create', () => {
    it('should create a token', async () => {
      const result = await service.create(
        'token1',
        '2025-01-01',
        'u1',
        'test',
        'admin',
        [],
      );
      expect(mockPrisma.token.create).toHaveBeenCalled();
      expect(result).toEqual({
        expiresAt: '2025-01-01',
        name: 'token1',
        token: 'mocked-jwt-token',
      });
    });
  });

  describe('delete', () => {
    it('should delete a token by id', async () => {
      const result = await service.delete('1');
      expect(mockPrisma.token.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual({ id: '1', deleted: true });
    });
  });
});
