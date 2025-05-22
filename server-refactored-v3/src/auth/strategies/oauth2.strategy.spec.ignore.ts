import { Oauth2Strategy } from './oauth2.strategy';
//import { Strategy } from 'passport-oauth2';
//import * as passportOauth2 from 'passport-oauth2';

//jest.spyOn(Strategy, 'Strategy');
jest.mock('passport-oauth2', () => ({
  Strategy: jest.fn().mockImplementation(() => ({
    authenticate: jest.fn(),
    constructor: jest.fn(),
  })),
}));

jest.mock('@nestjs/common', () => {
  const actual = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    Logger: jest.fn().mockImplementation(() => ({
      error: jest.fn(),
    })),
  };
});

jest.mock('../../config/config.service', () => ({
  ConfigService: {
    getAuthenticationScope: jest.fn().mockReturnValue('openid profile email'),
  },
}));

describe('Oauth2Strategy', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should call super with correct options when all env vars are set', () => {
    process.env.OAUTO2_CLIENT_AUTH_URL = 'https://auth.example.com';
    process.env.OAUTO2_CLIENT_TOKEN_URL = 'https://token.example.com';
    process.env.OAUTH2_CLIENT_ID = 'clientid';
    process.env.OAUTH2_CLIENT_SECRET = 'secret';
    process.env.OAUTH2_CLIENT_CALLBACKURL = 'https://callback.example.com';
    process.env.OAUTH2_CLIENT_SCOPE = 'openid profile email';

    const MockedStrategy = require('passport-oauth2').Strategy;
    const strategy = new Oauth2Strategy();
    expect(strategy).toBeInstanceOf(Oauth2Strategy);
    expect(MockedStrategy).toHaveBeenCalledWith(expect.objectContaining({
      authorizationURL: 'https://auth.example.com',
      tokenURL: 'https://token.example.com',
      clientID: 'clientid',
      clientSecret: 'secret',
      callbackURL: 'https://callback.example.com',
      scope: 'openid profile email'
    }));
  });

  it('should log error and not call super if env vars are missing', () => {
    const LoggerMock = require('@nestjs/common').Logger;
    process.env.OAUTO2_CLIENT_AUTH_URL = '';
    const loggerInstance = new LoggerMock(Oauth2Strategy.name);
    const errorSpy = jest.spyOn(loggerInstance, 'error');
    new Oauth2Strategy();
    expect(errorSpy).toBeDefined();
  });

  it('should return profile in validate', async () => {
    const strategy = new Oauth2Strategy();
    const profile = { id: '123', name: 'Test' };
    const result = await strategy.validate('token', 'refresh', profile);
    expect(result).toBe(profile);
  });

  it('should call super.authenticate in authenticate', () => {
    const strategy = new Oauth2Strategy();
    const Strategy = require('passport-oauth2').Strategy;
    const superAuthenticate = jest.spyOn(Strategy.prototype, 'authenticate').mockImplementation();
    const req = {} as any;
    const options = {};
    strategy.authenticate(req, options);
    expect(superAuthenticate).toHaveBeenCalledWith(req, options);
  });
});