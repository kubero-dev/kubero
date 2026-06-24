import { Test, TestingModule } from '@nestjs/testing';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { RegistryService } from './registry.service';
import { ConfigService } from '../config/config.service';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import { KubernetesService } from '../kubernetes/kubernetes.service';

describe('RegistryService', () => {
  let service: RegistryService;
  let configService: ConfigService;
  let prismaMock = {
    registryUser: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };
  const registryConfigBase = {
    host: 'someservice',
    port: 5000,
    enabled: true,
    create: false,
    storage: '1Gi',
    storageClassName: null,
    subpath: '',
    account: {
      username: 'admin',
      password: 'password',
      hash: 'hash',
    },
  };
  const registryPullUser = {
    username: 'fake',
    password: '$2b$10$SVulDccp3nXVJJv7fNLYZOHqDW./xumFwMDX0MfH6X47dThPiWRLy', // password
    expiresAt: null,
    scope: {
      allowedScopes: [
        { type: 'repository', name: 'test/image', actions: ['pull'] },
      ],
    },
  };
  const fakePrivateKey =
    '{"kty":"EC","x":"fake","y":"fake","crv":"P-256","d":"fake"}';
  const fakePublicKey = '{"kty":"EC","x":"fake","y":"fake","crv":"P-256"}';
  const fakeRegistryLogin = {
    usename: 'fake',
    password: 'password',
    '.dockerconfigjson': JSON.stringify({
      auths: {
        someservice: {
          auth: Buffer.from('fake:password').toString('base64'),
        },
      },
    }),
  };
  let kubernetesMock = {
    upsertSecret: jest.fn(),
    getSecret: jest.fn().mockImplementation((secretName) => {
      switch (secretName) {
        case 'registry-jwt-pubkey':
          return {
            jwk: fakePublicKey,
          };
        case 'registry-jwt-privkey':
          return {
            privateKey: fakePrivateKey,
            publicKey: fakePublicKey,
          };
        case 'registry-login':
          return fakeRegistryLogin;
      }
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistryService,
        {
          provide: PrismaClient,
          useValue: prismaMock,
        },
        {
          provide: KubernetesService,
          useValue: kubernetesMock,
        },
      ],
    })
      .setLogger(new Logger())
      .compile();

    service = module.get<RegistryService>(RegistryService);
    process.env.KUBERO_BUILD_REGISTRY = 'someservice';
  });

  describe('onApplicationBootstrap', () => {
    it('should try to create private and public JWK when both are missing', async () => {
      //jest.clearAllMocks();
      let upsertSecretSpy = jest.spyOn(kubernetesMock, 'upsertSecret');
      let getSecretSpy = jest.spyOn(kubernetesMock, 'getSecret');
      getSecretSpy.mockImplementation((secretName) => {
        switch (secretName) {
          case 'registry-jwt-privkey':
            return null;
          case 'registry-jwt-pubkey':
            return null;
          case 'registry-login':
            return fakeRegistryLogin;
        }
      });
      await service.onApplicationBootstrap();

      expect(upsertSecretSpy).toHaveBeenNthCalledWith(
        1,
        'registry-jwt-privkey',
        expect.objectContaining({
          privateKey: expect.any(String),
          publicKey: expect.any(String),
        }),
      );
      expect(upsertSecretSpy).toHaveBeenNthCalledWith(
        2,
        'registry-jwt-pubkey',
        expect.objectContaining({
          jwk: expect.any(String),
        }),
      );
      jest.restoreAllMocks();
    });
    it('should create the public key for the registry when a private key is present', async () => {
      //jest.clearAllMocks();
      let upsertSecretSpy = jest.spyOn(kubernetesMock, 'upsertSecret');
      let getSecretSpy = jest.spyOn(kubernetesMock, 'getSecret');
      getSecretSpy.mockImplementation((secretName) => {
        switch (secretName) {
          case 'registry-jwt-privkey':
            return {
              privateKey: fakePrivateKey,
              publicKey: fakePublicKey,
            };
          case 'registry-jwt-pubkey':
            return null;
        }
      });
      await service.onApplicationBootstrap();
      expect(upsertSecretSpy).toHaveBeenCalledWith('registry-jwt-pubkey', {
        jwk: fakePublicKey,
      });
    });
  });

  describe('generateToken', () => {
    beforeEach(async () => {
      await service.onApplicationBootstrap();
    });

    it('should throw an exception when service does not match the registry host name', async () => {
      await expect(
        service.generateToken(
          'fake',
          'password',
          'wrongservice',
          'repository:test/image:pull',
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(prismaMock.registryUser.findFirst).toHaveBeenCalledTimes(0);
    });

    it('should throw an unauthorized exception when the user is not found', async () => {
      prismaMock.registryUser.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.generateToken(
          'fake',
          'password',
          'someservice',
          'repository:test/image:pull',
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(prismaMock.registryUser.findFirst).toHaveBeenCalled();
    });

    it('should throw an unauthorized exception when the user is expired', async () => {
      let expiredUser = {
        username: 'fake',
        password:
          '$2b$10$SVulDccp3nXVJJv7fNLYZOHqDW./xumFwMDX0MfH6X47dThPiWRLy', // password
        expiresAt: new Date(1991, 1, 1, 23, 59, 59),
        scope: [],
      };
      prismaMock.registryUser.findFirst.mockResolvedValueOnce(expiredUser);
      await expect(
        service.generateToken(
          'fake',
          'password',
          'someservice',
          'repository:test/image:pull',
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(prismaMock.registryUser.findFirst).toHaveBeenCalled();
    });

    var testTokenMismatch = async (
      permission: { type; name; action },
      requestedScope: string,
    ) => {
      const testUser = {
        username: 'fake',
        password:
          '$2b$10$SVulDccp3nXVJJv7fNLYZOHqDW./xumFwMDX0MfH6X47dThPiWRLy', // password
        expiresAt: null,
        scope: [permission],
      };
      prismaMock.registryUser.findFirst.mockResolvedValueOnce(testUser);

      const result = await service.generateToken(
        'fake',
        'password',
        'someservice',
        requestedScope,
      );

      expect(result).toBe('mock-jwt-token');
      expect(SignJWT).toHaveBeenCalledWith({ access: [] });
      expect(prismaMock.registryUser.findFirst).toHaveBeenCalled();
    };

    it('should return a JWT with empty scope when the image name in permissions and requestedScopes does not match', async () => {
      await testTokenMismatch(
        {
          type: 'repository',
          name: { kind: 'exact', name: 'test/image' },
          action: ['pull'],
        },
        'repository:test/otherimage:pull',
      );
    });

    it('should return a JWT with empty scope when the action in permissions and requestedScopes does not match', async () => {
      await testTokenMismatch(
        {
          type: 'repository',
          name: { kind: 'exact', name: 'test/image' },
          action: ['pull'],
        },
        'repository:test/image:push',
      );
    });

    it('should return a JWT with empty scope when the type in permissions and requestedScopes does not match', async () => {
      await testTokenMismatch(
        {
          type: 'repository',
          name: { kind: 'exact', name: 'test/image' },
          action: ['pull'],
        },
        'registry:test/image:pull',
      );
    });

    it('should return a JWT with correct scope when allowedScopes and requestedScopes match', async () => {
      let testUser = {
        username: 'fake',
        password:
          '$2b$10$SVulDccp3nXVJJv7fNLYZOHqDW./xumFwMDX0MfH6X47dThPiWRLy', // password
        expiresAt: null,
        scope: [
          { type: 'repository', name: 'test/image', actions: ['pull', 'push'] },
        ],
      };
      prismaMock.registryUser.findFirst.mockResolvedValueOnce(testUser);

      // action is intentionally swapped
      const result = await service.generateToken(
        'fake',
        'password',
        'someservice',
        `repository:test/image:push,pull`,
      );

      expect(result).toBe('mock-jwt-token');
      expect(SignJWT).toHaveBeenCalledWith({
        access: [
          { type: 'repository', name: 'test/image', actions: ['pull', 'push'] },
        ],
      });
      expect(prismaMock.registryUser.findFirst).toHaveBeenCalled();
    });
  });
});
