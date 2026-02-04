type OAuthCallback = (err: Error | null, body: string | null) => void;

const createMockOAuth2 = () => ({
  useAuthorizationHeaderforGET: jest.fn(),
  get: jest.fn((_url: string, _token: string, callback: OAuthCallback) =>
    callback(null, '{}'),
  ),
});

// Mock passport-oauth2 Strategy
const mockOAuth2Instance = createMockOAuth2();
jest.mock('passport-oauth2', () => {
  return {
    Strategy: jest.fn().mockImplementation(function (this: any) {
      this._oauth2 = mockOAuth2Instance;
      this.name = 'oauth2';
    }),
  };
});

// Mock @nestjs/passport to return a simple base class
jest.mock('@nestjs/passport', () => ({
  PassportStrategy: () => {
    return class MockPassportStrategy {
      constructor() {
        (this as any)._oauth2 = mockOAuth2Instance;
        (this as any).name = 'oauth2';
      }
    };
  },
}));

jest.mock('@nestjs/common', () => {
  const actual = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    Logger: jest.fn().mockImplementation(() => ({
      error: jest.fn(),
      debug: jest.fn(),
    })),
    Injectable: () => (target: any) => target,
  };
});

jest.mock('../../config/config.service', () => ({
  ConfigService: {
    getAuthenticationScope: jest.fn().mockReturnValue('openid profile email'),
  },
}));

describe('Oauth2Strategy', () => {
  const OLD_ENV = process.env;

  const setRequiredEnvVars = () => {
    process.env.OAUTH2_CLIENT_AUTH_URL = 'https://auth.example.com';
    process.env.OAUTH2_CLIENT_TOKEN_URL = 'https://token.example.com';
    process.env.OAUTH2_CLIENT_ID = 'clientid';
    process.env.OAUTH2_CLIENT_SECRET = 'secret';
    process.env.OAUTH2_CLIENT_CALLBACKURL = 'https://callback.example.com';
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };
    // Reset the mock oauth2 instance
    mockOAuth2Instance.useAuthorizationHeaderforGET.mockClear();
    mockOAuth2Instance.get.mockClear();
    mockOAuth2Instance.get.mockImplementation(
      (_url: string, _token: string, callback: OAuthCallback) => callback(null, '{}'),
    );
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('constructor', () => {
    it('should create strategy when all env vars are set', () => {
      setRequiredEnvVars();

      const { Oauth2Strategy } = require('./oauth2.strategy');
      const strategy = new Oauth2Strategy();
      expect(strategy).toBeDefined();
    });

    it('should throw when required env vars are missing', () => {
      delete process.env.OAUTH2_CLIENT_AUTH_URL;
      const { Oauth2Strategy } = require('./oauth2.strategy');
      expect(() => new Oauth2Strategy()).toThrow(/OAuth2 strategy requires/);
    });

    it('should not set userProfile when USERINFO_URL is not configured', () => {
      setRequiredEnvVars();
      delete process.env.OAUTH2_CLIENT_USERINFO_URL;

      const { Oauth2Strategy } = require('./oauth2.strategy');
      const strategy = new Oauth2Strategy();
      expect(strategy.userProfile).toBeUndefined();
    });

    it('should set userProfile on instance when USERINFO_URL is configured', () => {
      setRequiredEnvVars();
      process.env.OAUTH2_CLIENT_USERINFO_URL = 'https://auth.example.com/userinfo';

      const { Oauth2Strategy } = require('./oauth2.strategy');
      const strategy = new Oauth2Strategy();
      expect(strategy.userProfile).toBeDefined();
      expect(typeof strategy.userProfile).toBe('function');
    });

    it('should call useAuthorizationHeaderforGET(true) when USERINFO_URL is set', () => {
      setRequiredEnvVars();
      process.env.OAUTH2_CLIENT_USERINFO_URL = 'https://auth.example.com/userinfo';

      const { Oauth2Strategy } = require('./oauth2.strategy');
      new Oauth2Strategy();
      expect(mockOAuth2Instance.useAuthorizationHeaderforGET).toHaveBeenCalledWith(true);
    });
  });

  describe('validate', () => {
    it('should return profile unchanged', async () => {
      setRequiredEnvVars();

      const { Oauth2Strategy } = require('./oauth2.strategy');
      const strategy = new Oauth2Strategy();
      const profile = { id: '123', username: 'testuser' };
      const result = await strategy.validate('token', 'refresh', profile);
      expect(result).toBe(profile);
    });
  });

  describe('userProfile', () => {
    beforeEach(() => {
      setRequiredEnvVars();
      process.env.OAUTH2_CLIENT_USERINFO_URL = 'https://auth.example.com/userinfo';
    });

    it('should call the correct userinfo URL', (done) => {
      mockOAuth2Instance.get.mockImplementation(
        (url: string, token: string, callback: OAuthCallback) => {
          expect(url).toBe('https://auth.example.com/userinfo');
          expect(token).toBe('test-access-token');
          callback(null, JSON.stringify({ sub: '123', name: 'Test' }));
        },
      );

      const { Oauth2Strategy } = require('./oauth2.strategy');
      const strategy = new Oauth2Strategy();

      strategy.userProfile('test-access-token', (err: any) => {
        expect(err).toBeNull();
        done();
      });
    });

    it('should parse OIDC userinfo response correctly', (done) => {
      mockOAuth2Instance.get.mockImplementation(
        (_url: string, _token: string, callback: OAuthCallback) => {
          callback(
            null,
            JSON.stringify({
              sub: 'user-123',
              preferred_username: 'testuser',
              name: 'Test User',
              email: 'test@example.com',
              picture: 'https://example.com/avatar.png',
            }),
          );
        },
      );

      const { Oauth2Strategy } = require('./oauth2.strategy');
      const strategy = new Oauth2Strategy();

      strategy.userProfile('access-token', (err: any, profile: any) => {
        expect(err).toBeNull();
        expect(profile).toMatchObject({
          id: 'user-123',
          username: 'testuser',
          displayName: 'Test User',
          email: 'test@example.com',
          provider: 'oauth2',
        });
        expect(profile.emails).toEqual([{ value: 'test@example.com' }]);
        expect(profile.photos).toEqual([{ value: 'https://example.com/avatar.png' }]);
        expect(profile._raw).toBeDefined();
        expect(profile._json).toBeDefined();
        done();
      });
    });

    it('should handle userinfo fetch errors', (done) => {
      mockOAuth2Instance.get.mockImplementation(
        (_url: string, _token: string, callback: OAuthCallback) => {
          callback(new Error('Network error'), null);
        },
      );

      const { Oauth2Strategy } = require('./oauth2.strategy');
      const strategy = new Oauth2Strategy();

      strategy.userProfile('access-token', (err: any, profile: any) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Network error');
        expect(profile).toBeUndefined();
        done();
      });
    });

    it('should handle invalid JSON response', (done) => {
      mockOAuth2Instance.get.mockImplementation(
        (_url: string, _token: string, callback: OAuthCallback) => {
          callback(null, 'not valid json');
        },
      );

      const { Oauth2Strategy } = require('./oauth2.strategy');
      const strategy = new Oauth2Strategy();

      strategy.userProfile('access-token', (err: any) => {
        expect(err).toBeInstanceOf(SyntaxError);
        done();
      });
    });

    it('should fallback to alternative field names (Gitea-style)', (done) => {
      mockOAuth2Instance.get.mockImplementation(
        (_url: string, _token: string, callback: OAuthCallback) => {
          callback(
            null,
            JSON.stringify({
              id: 456,
              login: 'giteauser',
              full_name: 'Gitea User',
              avatar_url: 'https://gitea.example.com/avatar/456',
            }),
          );
        },
      );

      const { Oauth2Strategy } = require('./oauth2.strategy');
      const strategy = new Oauth2Strategy();

      strategy.userProfile('access-token', (err: any, profile: any) => {
        expect(err).toBeNull();
        expect(profile.id).toBe(456);
        expect(profile.username).toBe('giteauser');
        expect(profile.displayName).toBe('Gitea User');
        expect(profile.emails).toEqual([]);
        expect(profile.photos).toEqual([{ value: 'https://gitea.example.com/avatar/456' }]);
        done();
      });
    });

    it('should use email as username fallback when login is missing', (done) => {
      mockOAuth2Instance.get.mockImplementation(
        (_url: string, _token: string, callback: OAuthCallback) => {
          callback(
            null,
            JSON.stringify({
              sub: 'user-789',
              email: 'user@example.com',
              name: 'Some User',
            }),
          );
        },
      );

      const { Oauth2Strategy } = require('./oauth2.strategy');
      const strategy = new Oauth2Strategy();

      strategy.userProfile('access-token', (err: any, profile: any) => {
        expect(err).toBeNull();
        expect(profile.username).toBe('user@example.com');
        expect(profile.displayName).toBe('Some User');
        done();
      });
    });

    it('should use id as username when no other identifiers available', (done) => {
      mockOAuth2Instance.get.mockImplementation(
        (_url: string, _token: string, callback: OAuthCallback) => {
          callback(
            null,
            JSON.stringify({
              id: 12345,
              name: 'Anonymous User',
            }),
          );
        },
      );

      const { Oauth2Strategy } = require('./oauth2.strategy');
      const strategy = new Oauth2Strategy();

      strategy.userProfile('access-token', (err: any, profile: any) => {
        expect(err).toBeNull();
        expect(profile.username).toBe('12345');
        expect(profile.displayName).toBe('Anonymous User');
        done();
      });
    });
  });
});
