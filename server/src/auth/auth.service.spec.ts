import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { ConfigService } from '../config/config.service';
import { AuditService } from '../audit/audit.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;
  let kubectl: any;
  let configService: any;
  let auditService: any;
  let jwtService: any;

  beforeEach(() => {
    usersService = {
      findOne: jest.fn(),
    };
    kubectl = {
      getKubernetesVersion: jest.fn().mockReturnValue('1.25'),
      getOperatorVersion: jest.fn().mockReturnValue('v1.0.0'),
    };
    configService = {
      getKuberoUIVersion: jest.fn().mockReturnValue('v2.0.0'),
      getBuildpipelineEnabled: jest.fn().mockReturnValue(true),
      getTemplateEnabled: jest.fn().mockReturnValue(true),
      checkAdminDisabled: jest.fn().mockReturnValue(false),
      getConsoleEnabled: jest.fn().mockReturnValue(true),
      getMetricsEnabled: jest.fn().mockReturnValue(true),
      getSleepEnabled: jest.fn().mockReturnValue(false),
    };
    auditService = {
      getAuditEnabled: jest.fn().mockReturnValue(true),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
      verify: jest.fn().mockReturnValue({}),
    };

    service = new AuthService(
      usersService,
      kubectl,
      configService,
      auditService,
      jwtService,
    );
    process.env.KUBERO_SESSION_KEY = 'testkey';
  });

  afterEach(() => {
    delete process.env.KUBERO_SESSION_KEY;
  });

  describe('validateUser', () => {
    it('should return user without password if password matches (sha256)', async () => {
      usersService.findOne.mockResolvedValue({
        userId: 1,
        username: 'test',
        password: 'hashed',
      });
      // Simuliere SHA256 Hash
      const crypto = require('crypto');
      const hash = crypto
        .createHmac('sha256', process.env.KUBERO_SESSION_KEY)
        .update('pass')
        .digest('hex');
      usersService.findOne.mockResolvedValueOnce({
        userId: 1,
        username: 'test',
        password: hash,
      });
      const result = await service.validateUser('test', 'pass');
      expect(result).toEqual({ userId: 1, username: 'test' });
    });

    it('should return user if bcrypt matches', async () => {
      usersService.findOne.mockResolvedValueOnce({
        userId: 2,
        username: 'test2',
        password: 'bcrypt-hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      const result = await service.validateUser('test2', 'pass');
      expect(result).toEqual({ userId: 2, username: 'test2' });
    });

    it('should return null if user not found', async () => {
      usersService.findOne.mockResolvedValueOnce(undefined);
      const result = await service.validateUser('nouser', 'pass');
      expect(result).toBeNull();
    });

    it('should throw if KUBERO_SESSION_KEY is not set', async () => {
      delete process.env.KUBERO_SESSION_KEY;
      usersService.findOne.mockResolvedValueOnce({
        userId: 1,
        username: 'test',
        password: 'hashed',
      });
      await expect(service.validateUser('test', 'pass')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('login', () => {
    it('should return access_token if user is valid', async () => {
      jest
        .spyOn(service, 'validateUser')
        .mockResolvedValueOnce({ userId: 1, username: 'test' });
      const result = await service.login('test', 'pass');
      expect(result).toEqual({ access_token: 'signed-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: 1,
        username: 'test',
        strategy: 'local',
      });
    });

    it('should throw if user is invalid', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValueOnce(null);
      await expect(service.login('test', 'wrong')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('loginOAuth2', () => {
    it('should sign and return token for OAuth2 user', async () => {
      usersService.findOne.mockResolvedValueOnce({
        userId: 3,
        username: 'oauthuser',
      });
      const result = await service.loginOAuth2('oauthuser');
      expect(result).toBe('signed-token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: 3,
        username: 'oauthuser',
        strategy: 'github',
      });
    });
  });

  describe('getSession', () => {
    it('should return session info', async () => {
      const result = await service.getSession(true);
      expect(result).toEqual({
        message: {
          isAuthenticated: true,
          version: 'v2.0.0',
          kubernetesVersion: '1.25',
          operatorVersion: 'v1.0.0',
          buildPipeline: true,
          templatesEnabled: true,
          auditEnabled: true,
          adminDisabled: false,
          consoleEnabled: true,
          metricsEnabled: true,
          sleepEnabled: false,
        },
        status: 200,
      });
    });
  });

  describe('getMethods', () => {
    it('should return auth methods', () => {
      jest.spyOn(ConfigService, 'getLocalauthEnabled').mockReturnValue(true);
      jest.spyOn(ConfigService, 'getGithubEnabled').mockReturnValue(false);
      jest.spyOn(ConfigService, 'getOauth2Enabled').mockReturnValue(true);
      const result = service.getMethods();
      expect(result).toEqual({
        local: true,
        github: false,
        oauth2: true,
      });
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      jwtService.verify.mockReturnValueOnce({ userId: 1 });
      const result = await service.validateToken('token');
      expect(result).toBe(true);
    });

    it('should return false for invalid token', async () => {
      jwtService.verify.mockImplementationOnce(() => {
        throw new Error('invalid');
      });
      const result = await service.validateToken('badtoken');
      expect(result).toBe(false);
    });
  });
});
