import { CustomConsoleLogger } from './logger';

describe('CustomConsoleLogger', () => {
  let logger: CustomConsoleLogger;

  beforeEach(() => {
    logger = new CustomConsoleLogger();
    jest.spyOn(global.console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log if context is not ignored', () => {
    const spy = jest.spyOn(logger, 'log');
    logger.log('Test message', 'MyContext');
    expect(spy).toHaveBeenCalled();
  });

  it('should not log if context is ignored', () => {
    const spy = jest.spyOn(logger, 'log');
    CustomConsoleLogger.contextsToIgnore.forEach((ctx) => {
      logger.log('Should not log', ctx);
      expect(spy).not.toHaveBeenCalledWith(expect.stringContaining('Should not log'));
    });
  });

  it('should log if context is undefined', () => {
    const spy = jest.spyOn(logger, 'log');
    logger.log('No context');
    expect(spy).toHaveBeenCalled();
  });
});